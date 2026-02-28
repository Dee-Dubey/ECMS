const { MongoClient, ObjectId } = require("mongodb");

// ====== CONFIG ======
const OLD_DB_URI = "mongodb://127.0.0.1:27017";
const NEW_DB_URI = "mongodb://127.0.0.1:27017";
const OLD_DB_NAME = "Acevin-IMS-LOCAL";
const NEW_DB_NAME = "Acevin-IMS-NEW";

// Collection mapping: OLD -> NEW
const collectionMap = {
  components: "electroniccomponents",
  cpcategories: "electroniccategories",
  cpmanufacturers: "electronicmanufacturers",
  cpprojects: "electronicprojects",
  cpshelflocations: "electronicshelflocations",
  cpsuppliers: "electronicsuppliers",
  incategories: "itcategories",
  inmanufacturers: "itmanufacturers",
  insubcategories: "itsubcategories",
  insuppliers: "itsuppliers",
  ITStockHistorys: "itstockhistories",
  itinventories: "itinventories",
  stockHistorys: "stockHistorys",
  users: "users"
};

function computeView({ manage = 0, issue = 0, returnVal = 0, oldView = 0 }) {
  return manage || issue || returnVal ? 1 : oldView;
}

function sanitizeObjectId(value) {
  if (!value) return null;
  if (ObjectId.isValid(value)) return new ObjectId(value);
  return null;
}

// ====== USERS RIGHTS TRANSFORM (IMPORTANT) ======
function transformUserRights(oldRights = {}) {
  // ===== IT INVENTORY =====
  const invManage = oldRights?.inventory?.manage ?? 0;
  const invIssue = oldRights?.inventory?.issue ?? 0;
  const invReturn = oldRights?.inventory?.return ?? 0;
  const invOldView = oldRights?.inventory?.view ?? 0;

  const invView = computeView({
    manage: invManage,
    issue: invIssue,
    returnVal: invReturn,
    oldView: invOldView
  });

  // ===== COMPONENT (ELECTRONIC DEVICE) =====
  const compManage = oldRights?.component?.manage ?? 0;
  const compIssue = oldRights?.component?.issue ?? 0;
  const compReturn = oldRights?.component?.return ?? 0;
  const compOldView = oldRights?.component?.view ?? 0;

  const compView = computeView({
    manage: compManage,
    issue: compIssue,
    returnVal: compReturn,
    oldView: compOldView
  });

  // ===== CONSUMABLE =====
  const conManage = oldRights?.consumable?.manage ?? 0;
  const conIssue = oldRights?.consumable?.issue ?? 0;
  const conReturn = oldRights?.consumable?.return ?? 0;
  const conOldView = oldRights?.consumable?.view ?? 0;

  const conView = computeView({
    manage: conManage,
    issue: conIssue,
    returnVal: conReturn,
    oldView: conOldView
  });

  return {
    hrDepartment: {
      user: {
        manage: oldRights?.user ?? 0
      }
    },
    ITDepartment: {
      ITInventory: {
        view: invView,
        manage: invManage,
        issue: invIssue,
        return: invReturn
      }
    },
    hardwareDepartment: {
      electronicDevice: {
        view: compView,
        manage: compManage,
        issue: compIssue,
        return: compReturn,
        BOM: 0
      }
    },
    adminDepartment: {
      consumableAsset: {
        view: conView,
        manage: conManage,
        issue: conIssue,
        return: conReturn
      }
    }
  };
}

async function migrateCollection(oldDb, newDb, oldName, newName) {
  console.log(`Migrating: ${oldName} -> ${newName}`);

  const oldCollection = oldDb.collection(oldName);
  const newCollection = newDb.collection(newName);

  const cursor = oldCollection.find({});
  let count = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    let newDoc = { ...doc };

    // Special transformation for users collecti
    if (oldName === "users") {
      newDoc.rights = transformUserRights(doc.rights);
      delete newDoc.type;
    }

    if (oldName === "components") {
      newDoc.package = doc.footPrint ?? null;
      delete newDoc.footPrint;

      // ---- SANITIZE stockDetails ----
      if (Array.isArray(newDoc.stockDetails)) {
        newDoc.stockDetails = newDoc.stockDetails.map(sd => {
          if (!sd.locationDetail) return sd;

          return {
            ...sd,
            locationDetail: {
              ...sd.locationDetail,
              shelfName: sanitizeObjectId(sd.locationDetail.shelfName),
              boxNames: sanitizeObjectId(sd.locationDetail.boxNames)
            }
          };
        });
      }
    }
    await newCollection.insertOne(newDoc);
    count++;
  }

  console.log(`Completed ${oldName}: ${count} documents migrated`);
}

async function runMigration() {
  const oldClient = new MongoClient(OLD_DB_URI);
  const newClient = new MongoClient(NEW_DB_URI);

  try {
    await oldClient.connect();
    await newClient.connect();

    console.log("Connected to both databases");

    const oldDb = oldClient.db(OLD_DB_NAME);
    const newDb = newClient.db(NEW_DB_NAME);

    for (const [oldCollection, newCollection] of Object.entries(collectionMap)) {
      const exists = await oldDb.listCollections({ name: oldCollection }).hasNext();

      if (!exists) {
        console.log(`Skipping ${oldCollection} (not found in old DB)`);
        continue;
      }

      await migrateCollection(oldDb, newDb, oldCollection, newCollection);
    }

    console.log("FULL MIGRATION COMPLETED SUCCESSFULLY");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await oldClient.close();
    await newClient.close();
  }
}

runMigration();