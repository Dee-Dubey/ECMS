
const logger = require('../../logger');
const AMC = require('../models/amc/amc.model'); // adjust path as per your project structure
const AMCHistory = require('../models/amc/amc-history.model');
const ElectronicComponent = require('../models/hardware-department/electronic-component/electronic-component.model');
const ITInventory = require('../models/it-department/it-inventory/it-inventory.model');
const ServiceProvider = require('../models/amc/serviceProvider.model');
const { Departments } = require('../../constants/department');
const { TransactionTypes, ServiceStatus } = require('../../constants/amcHistory')

/* ---------------------------------------------------------------------
 * Function: addToGroup
 *
 * Description:
 * Adds an asset object into a grouped array based on department.
 * If a group for the given department does not exist, a new group
 * object is created and appended to the grouped array.
 *
 * Parameters:
 * - groupedArray: Array of group objects in the format
 *     [{ department: string, assets: Array }]
 * - department: Name of the department to group the asset under
 * - asset: Asset object to insert into the department's assets list
 *
 * Returns:
 * - Updated groupedArray with the asset added to the correct department
 *
 * Example:
 *   const list = [];
 *   addToGroup(list, 'IT', { id: 1, name: 'Laptop' });
 *   addToGroup(list, 'HR', { id: 2, name: 'Printer' });
 *   addToGroup(list, 'IT', { id: 3, name: 'Keyboard' });
 *   // Result:
 *   // [
 *   //   { department: 'IT', assets: [{id:1}, {id:3}] },
 *   //   { department: 'HR', assets: [{id:2}] }
 *   // ]
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
function addToGroup(groupedArray, department, asset) {
  let group = groupedArray.find(g => g.department === department);
  if (!group) {
    group = { department, assets: [] };
    groupedArray.push(group);
  }
  group.assets.push(asset);
};

/* ---------------------------------------------------------------------
 * Function: createAMC
 *
 * Description:
 * Handles the creation of a new AMC (Annual Maintenance Contract).
 * Saves AMC details, links AMC to multiple asset models, and performs
 * rollback in case of conflicts or failures to maintain data integrity.
 *
 * Workflow:
 *  1. Create a new AMC with status 'Active'
 *  2. Loop through covered assets and:
 *      - Verify if the asset exists
 *      - Ensure it is not already enrolled in another AMC
 *      - Link asset to the newly created AMC
 *  3. If any asset is already enrolled OR not found:
 *      - Undo all linked updates
 *      - Delete the AMC and return an error response
 *  4. If success:
 *      - Create AMC history entry
 *      - Return AMC, linked assets, and history details
 *
 * Parameters (req.body):
 *  - coveredAssets: Array of asset IDs to bind under AMC
 *  - Other AMC-related fields (cost, invoiceNumber, payment details, etc.)
 *
 * Success Response (201):
 *  {
 *    message: 'AMC created successfully and linked to assets',
 *    status: 1,
 *    data: { amc, history, linkedAssets }
 *  }
 *
 * Failure Response:
 *  - 400: Some assets already enrolled or not found (rollback executed)
 *  - 500: AMC creation failed or history creation failed (rollback executed)
 *
 * Notes:
 * - Supports both ElectronicComponent and ITInventory asset models
 * - Ensures rollback to avoid partial AMC effect
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.createAMC = async (req, res) => {
  try {
    const { coveredAssets = [] } = req.body;

    const newAMC = new AMC({ ...req.body, status: 'Active' });
    const savedAMC = await newAMC.save();

    console.log('rew.body', req.body)
    const alreadyEnrolled = [];
    const updatedAssets = [];
    const notFoundAssets = [];

    for (const assetId of coveredAssets) {
      let foundAsset = null;

      // ElectronicComponent
      foundAsset = await ElectronicComponent.findById(assetId);
      if (foundAsset) {
        console.log('foundAsset.amc', foundAsset.amc)
        if (foundAsset.amc) {
          console.log('enter in the code')
          alreadyEnrolled.push({ id: assetId, model: 'ElectronicComponent' });
          continue;
        }
        await ElectronicComponent.findByIdAndUpdate(assetId, { amc: savedAMC._id });
        updatedAssets.push({ id: assetId, model: 'ElectronicComponent' });
        continue;
      }

      // Inventory
      foundAsset = await ITInventory.findById(assetId);
      if (foundAsset) {
        if (foundAsset.amc) {
          alreadyEnrolled.push({ id: assetId, model: 'ITInventory' });
          continue;
        }
        await ITInventory.findByIdAndUpdate(assetId, { amc: savedAMC._id });
        updatedAssets.push({ id: assetId, model: 'ITInventory' });
        continue;
      }

      // If not found in any model
      notFoundAssets.push(assetId);
    }

    // Step 3: Handle already enrolled or missing assets
    if (alreadyEnrolled.length > 0 || notFoundAssets.length > 0) {
      // Undo all linked updates and AMC
      for (const { id } of updatedAssets) {
        await ElectronicComponent.updateOne({ _id: id }, { $unset: { amc: "" } });
        await ITInventory.updateOne({ _id: id }, { $unset: { amc: "" } });
      }
      await AMC.findByIdAndDelete(savedAMC._id);

      return res.status(400).json({
        message: 'AMC creation failed. Some assets already enrolled or not found.',
        alreadyEnrolled,
        notFoundAssets,
        status: 0
      });
    }

    // Step 4: Create AMC history
    const amcHistoryData = {
      amcID: savedAMC._id,
      // transactionType: 'create',
      transactionType: TransactionTypes.CREATE,
      serviceDetails: null,
      serviceNumber: null,
      serviceStatus: null,
      servicedAssets: [],
      cost: savedAMC.cost || null,
      billNo: savedAMC.billNO || null,
      estimatedCost: savedAMC.cost || null,
      invoiceNumber: savedAMC.invoiceNumber || null,
      paymentMode: savedAMC.paymentMode || null,
      paymentInfo: savedAMC.paymentInfo || null,
      additionalNotes: savedAMC.additionalNotes || null,
    };
    let savedHistory;

    try {
      savedHistory = await AMCHistory.create(amcHistoryData);
    } catch (historyError) {
      console.error('AMCHistory creation failed:', historyError);

      for (const { id } of updatedAssets) {
        await ElectronicComponent.updateOne({ _id: id }, { $unset: { amc: "" } });
        await ITInventory.updateOne({ _id: id }, { $unset: { amc: "" } });
      }
      await AMC.findByIdAndDelete(savedAMC._id);

      return res.status(500).json({
        message: 'AMC creation failed while saving history. Rollback completed.',
        status: 0,
        error: historyError.message,
      });
    }

    // Step 5: Success
    res.status(201).json({
      message: 'AMC created successfully and linked to assets',
      status: 1,
      data: {
        amc: savedAMC,
        history: savedHistory,
        linkedAssets: updatedAssets
      }
    });

  } catch (error) {
    console.error('Error during AMC creation:', error);
    res.status(500).json({
      message: 'AMC creation failed',
      status: 0,
      error: error.message
    });
  }
};

/* ---------------------------------------------------------------------
 * Function: getAllAMCs
 *
 * Description:
 * Retrieves a paginated list of AMC (Annual Maintenance Contract)
 * records with optional status-based filtering (Active / Expired).
 * Supports pagination through query parameters and returns total
 * record count along with page metadata.
 *
 * Workflow:
 *  1. Extract pagination values (page, limit)
 *  2. Build filter object if status query is provided
 *  3. Count total AMC records based on filter
 *  4. Fetch AMC documents (without populate) in descending order
 *     of creation date
 *  5. Return paginated response with metadata
 *
 * Query Parameters:
 *  - page (optional): Page number (default = 1)
 *  - limit (optional): Number of records per page (default = 10)
 *  - status (optional): AMC status filter (e.g., "Active" / "Expired")
 *
 * Success Response (200):
 *  {
 *    message: "AMC records fetched successfully",
 *    status: 1,
 *    data: [...],
 *    page,
 *    limit,
 *    totalRecords,
 *    totalPages
 *  }
 *
 * Error Response (500):
 *  {
 *    message: "Internal Server Error",
 *    status: 0,
 *    error: error.message
 *  }
 *
 * Notes:
 * - Uses `.lean()` for performance optimization by returning plain JS objects
 * - Does NOT populate referenced associations to keep response lightweight
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.getAllAMCs = async (req, res) => {
  try {
    // Pagination inputs
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Status filter (Active / Expired)
    const status = req.query.status;
    const filter = {};

    if (status) {
      filter.status = status; // { status: "Active" }
    }

    // Count total records
    const totalRecords = await AMC.countDocuments(filter);

    // Fetch paginated data WITHOUT populate
    const amcData = await AMC.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log('AMC data', amcData)

    return res.status(200).json({
      message: "AMC records fetched successfully",
      status: 1,
      data: amcData,
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit)
    });

  } catch (error) {
    console.error("Error fetching AMC records:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: 0,
      error: error.message
    });
  }
};

/* ---------------------------------------------------------------------
 * Function: getAMCById
 *
 * Description:
 * Retrieves a single AMC (Annual Maintenance Contract) by its ID and
 * returns grouped asset details based on their category. Assets are
 * dynamically grouped rather than stored in fixed category buckets.
 *
 * Workflow:
 *  1. Extract AMC ID from request parameters
 *  2. Fetch AMC using the provided ID
 *  3. If AMC not found, return 404 response
 *  4. Loop through AMC.coveredAssets and:
 *      - Search asset in ElectronicComponent model
 *      - Search asset in ITInventory model
 *      - Group assets based on department using addToGroup()
 *  5. Return AMC details with transformed `coveredAssets`
 *     (grouped by department for easier frontend rendering)
 *
 * Parameters:
 *  - req.params.id: MongoDB ObjectID of the AMC to retrieve
 *
 * Success Response (200):
 *  {
 *    message: "AMC fetched successfully",
 *    status: 1,
 *    data: {
 *      ...amc,
 *      coveredAssets: [
 *        { department: 'Electronic Component', assets: [...] },
 *        { department: 'IT Department', assets: [...] }
 *      ]
 *    }
 *  }
 *
 * Error Response:
 *  - 404: AMC not found
 *  - 500: Internal server error
 *
 * Notes:
 * - Uses `.lean()` for faster read performance
 * - addToGroup() ensures department grouping without duplication
 * - Returned structure is optimized for UI display
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.getAMCById = async (req, res) => {
  try {
    const { id } = req.params;

    const amc = await AMC.findById(id).lean();
    if (!amc) {
      return res.status(404).json({
        message: 'AMC not found',
        status: 0,
        data: null
      });
    }

    // Array of objects instead of fixed buckets
    const groupedAssets = [];

    for (const assetId of amc.coveredAssets || []) {

      // 1. Try Electronic Component
      let asset = await ElectronicComponent.findById(assetId)
        .select('_id id categoryName manufacturerPartNumber footPrint')
        .lean();

      if (asset) {
        // addToGroup(groupedAssets, 'Electronic Component', asset);
        addToGroup(groupedAssets, Departments.ELECTRONIC, asset);
        continue;
      }

      // 2. Try IT Inventory
      asset = await ITInventory.findById(assetId)
        .select('_id code categoryName subCategoryName manufacturer serialNo')
        .lean();

      if (asset) {
        // addToGroup(groupedAssets, 'IT Department', asset);
        addToGroup(groupedAssets, Departments.IT, asset);
        continue;
      }
    }

    return res.status(200).json({
      message: 'AMC fetched successfully',
      status: 1,
      data: {
        ...amc,
        coveredAssets: groupedAssets
      }
    });

  } catch (error) {
    console.error('Error fetching AMC by ID:', error);
    return res.status(500).json({
      message: 'Internal Server Error',
      status: 0,
      error: error.message
    });
  }
};

/* ---------------------------------------------------------------------
 * Function: getAMCAvailableAssets
 *
 * Description:
 * Retrieves all assets linked to a specific AMC that are currently
 * available for service. Assets already linked to an open service entry
 * are excluded. The final response groups assets by department to make
 * UI rendering simpler.
 *
 * Workflow:
 *  1. Extract AMC ID from request params and fetch corresponding AMC document
 *  2. Fetch AMC History entries where service status = "open"
 *  3. Build a blacklist (Set) of assets currently under service
 *  4. Iterate through AMC.coveredAssets and:
 *      - Skip if the asset exists in the blacklist
 *      - Check ElectronicComponent collection
 *      - Check ITInventory collection
 *      - Group items using addToGroup() to avoid duplicate departments
 *  5. Return only assets that are NOT included in ongoing services
 *
 * Parameters:
 *  - req.params.id → AMC MongoDB ObjectID
 *
 * Success Response (200):
 *  {
 *    status: 1,
 *    message: "Available AMC assets fetched successfully",
 *    data: {
 *      ...amc,
 *      coveredAssets: [
 *        { department: "Electronic Component", assets: [...] },
 *        { department: "IT Department", assets: [...] }
 *      ]
 *    }
 *  }
 *
 * Error Response:
 *  - 404: AMC not found
 *  - 500: Internal Server Error
 *
 * Notes:
 * - Uses Set for efficient lookup of "open service" assets
 * - Uses `.lean()` for improved read performance
 * - Ensures returned assets are service-eligible only
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
// exports.getAMCAvailableAssets = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const amc = await AMC.findById(id).lean();
//     if (!amc) {
//       return res.status(404).json({ status: 0, message: "AMC not found" });
//     }

//     // 1) Get only open service entries
//     const openServiceEntries = await AMCHistory.find({
//       amcID: id,
//       serviceStatus: ServiceStatus.OPEN
//     }).select("servicedAssets").lean();

//     console.log('--------------------------open', openServiceEntries)

//     // 2) Build blacklist of assets currently in service
//     const openAssets = new Set();
//     for (const h of openServiceEntries) {
//       for (const a of h.servicedAssets) {
//         openAssets.add(a.toString());
//       }
//     }

//     // 3) Build grouped assets
//     const groupedAssets = [];

//     for (const assetId of amc.coveredAssets) {
//       if (openAssets.has(assetId.toString())) continue;

//       // Electronic Component
//       let asset = await ElectronicComponent.findById(assetId)
//         .select("_id id categoryName manufacturerPartNumber footPrint")
//         .lean();

//       if (asset) {
//         addToGroup(groupedAssets, Departments.ELECTRONIC, asset);
//         continue;
//       }

//       // IT Inventory
//       asset = await ITInventory.findById(assetId)
//         .select("_id code categoryName subCategoryName manufacturer serialNo")
//         .lean();

//       if (asset) {
//         addToGroup(groupedAssets, Departments.IT, asset);
//       }
//     }

//     return res.status(200).json({
//       status: 1,
//       message: "Available AMC assets fetched successfully",
//       data: { ...amc, coveredAssets: groupedAssets }
//     });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ status: 0, message: "Internal Server Error", error: err.message });
//   }
// };

/* ---------------------------------------------------------------------
 * Function: updateAMC
 *
 * Description:
 * Updates an existing AMC (Annual Maintenance Contract) and synchronizes
 * the assigned assets accordingly. Newly added assets are linked to the
 * AMC, while removed assets are detached from it. The update ensures
 * consistency between AMC document and asset models.
 *
 * Workflow:
 *  1. Fetch AMC by ID from request params
 *  2. Extract new coveredAssets array from request body
 *  3. Compare old vs new assets to determine:
 *      - removedAssets → assets no longer associated with AMC
 *      - addedAssets   → assets newly assigned to AMC
 *  4. Remove AMC reference from removedAssets across all asset models
 *  5. Add AMC reference to addedAssets across all asset models
 *  6. Update AMC document fields in DB
 *  7. Return success response
 *
 * Parameters:
 *  - req.params.id → AMC MongoDB ObjectID
 *  - req.body.coveredAssets → Array of asset IDs assigned to AMC
 *  - req.body → Any other AMC fields being updated
 *
 * Success Response (200):
 *  {
 *    message: "AMC updated successfully",
 *    data: []
 *  }
 *
 * Error Response:
 *  - 404: AMC not found
 *  - 500: Failed to update AMC record
 *
 * Notes:
 * - Ensures synchronization between AMC and each mapped asset model
 * - Uses $unset to remove AMC reference from assets no longer linked
 * - Uses $set to update AMC reference in newly added assets
 * - Conversion to string is used to prevent mismatch in ObjectId equality
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.updateAMC = async (req, res) => {
  try {
    const { id } = req.params; // AMC ID
    const newCoveredAssets = req.body.coveredAssets || []; // Array of asset IDs

    // 1. Fetch the existing AMC
    const oldAMC = await AMC.findById(id);
    if (!oldAMC) {
      return res.status(404).json({ message: "AMC not found" });
    }

    const oldAssetIds = oldAMC.coveredAssets || [];
    console.log('old assets', oldAssetIds)

    // 2. Determine removed + newly added assets
    const removedAssets = oldAssetIds.filter(x => !newCoveredAssets.includes(x.toString()));
    const addedAssets = newCoveredAssets.filter(x => !oldAssetIds.map(a => a.toString()).includes(x));

    // 3. Iterate every registered Asset model

    console.log('removed Asset', removedAssets)
    console.log('added Asset', addedAssets)

    // Remove AMC reference from OLD assets
    if (removedAssets.length) {
      await ElectronicComponent.updateMany(
        { _id: { $in: removedAssets } },
        { $unset: { amc: "" } }
      );
      await ITInventory.updateMany(
        { _id: { $in: removedAssets } },
        { $unset: { amc: "" } }
      );
    }

    // Add AMC reference to NEW assets
    if (addedAssets.length) {
      await ElectronicComponent.updateMany(
        { _id: { $in: addedAssets } },
        { $set: { amc: id } }
      );
      await ITInventory.updateMany(
        { _id: { $in: addedAssets } },
        { $set: { amc: id } }
      );
    }

    console.log('new covered asset', newCoveredAssets)

    // 4. Update AMC document itself
    const updateData = {
      ...req.body,
      coveredAssets: newCoveredAssets
    };

    const updatedAMC = await AMC.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "AMC updated successfully",
      data: []
    });

  } catch (error) {
    console.error("Error updating AMC:", error);
    res.status(500).json({
      message: "Failed to update AMC record",
      error: error.message
    });
  }
};

/* ---------------------------------------------------------------------
 * Function: initiateService
 *
 * Description:
 * Initiates a new service under an existing AMC (Annual Maintenance
 * Contract) and creates a corresponding entry in AMC History. A unique
 * service number is generated based on asset code and timestamp. Only
 * assets that are part of the AMC can be selected for the service.
 *
 * Workflow:
 *  1. Validate that AMC exists based on amcID
 *  2. Validate that all servicedAssets belong to AMC.coveredAssets
 *  3. Generate a unique service number using assetCode + date + time
 *  4. Create a new AMCHistory entry with transactionType = "service initiated"
 *  5. Respond with saved history record
 *
 * Request Body (req.body):
 *  - amcID (required): AMC ObjectID
 *  - serviceDetails (optional): Details about the service request
 *  - servicedAssets (optional): Array of asset IDs to be serviced
 *  - invoiceNumber (optional)
 *  - estimatedCost (optional)
 *  - billNo (optional)
 *  - additionalNotes (optional)
 *
 * Success Response (201):
 *  {
 *    message: "Service initiated and logged in AMC history",
 *    status: 1,
 *    data: { ...savedHistory }
 *  }
 *
 * Error Response:
 *  - 404: AMC not found
 *  - 400: One or more servicedAssets not under AMC
 *  - 500: Failed to initiate service
 *
 * Notes:
 * - “serviceNumber” follows format → <ASSET_CODE>-DDMMYY-HHMMSS
 * - servicedAssets remain active until service is closed
 * - This method only logs service creation; does not update AMC itself
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.initiateService = async (req, res) => {
  try {
    const { amcID, invoiceNumber, serviceDetails, servicedAssets = [], estimatedCost, billNo, additionalNotes } = req.body;
    console.log('--------Service Assets----------', servicedAssets);

    // 1. Validate AMC existence
    const amc = await AMC.findById(amcID);
    console.log('-------AMC---------', amc)
    if (!amc) {
      return res.status(404).json({
        message: 'AMC not found',
        status: 0
      });
    }

    // 2. Validate servicedAssets are part of AMC's coveredAssets
    if (servicedAssets.length > 0) {
      const coveredAssetIds = amc.coveredAssets.map(id => id.toString());
      const invalidAssets = servicedAssets.filter(id => !coveredAssetIds.includes(id));
      if (invalidAssets.length > 0) {
        return res.status(400).json({
          message: 'selected assets are not covered under this AMC',
          status: 0,
          invalidAssets
        });
      }
    }

    const assetCode = amc.assetsCode
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, 0);
    const mm = String(now.getMonth() + 1).padStart(2, 0);
    const yy = String(now.getFullYear()).slice(-2)
    const hh = String(now.getHours()).padStart(2, 0);
    const min = String(now.getMinutes()).padStart(2, 0);
    const ss = String(now.getSeconds()).padStart(2, 0);
    const formattedDate = `${dd}${mm}${yy}`;
    const formattedTime = `${hh}${min}${ss}`;

    const serviceNumber = `${assetCode}-${formattedDate}-${formattedTime}`;

    // 2. Prepare AMC History entry
    const historyEntry = {
      amcID,
      // transactionType: 'service initiated',
      transactionType: TransactionTypes.SERVICE_INITIATE,
      serviceDetails: serviceDetails || null,
      serviceNumber: serviceNumber, // you can auto-increment or set later if needed
      // serviceStatus: 'Open',
      serviceStatus: ServiceStatus.OPEN,
      servicedAssets: servicedAssets || [], // array of asset ObjectIds
      estimatedCost: estimatedCost || null,
      invoiceNumber: invoiceNumber || null,
      billNo: billNo || null,
      paymentMode: null,
      paymentInfo: null,
      additionalNotes: additionalNotes || null
    };

    // 3. Create AMC history record
    const savedHistory = await AMCHistory.create(historyEntry);

    // 4. Response
    res.status(201).json({
      message: 'Service initiated and logged in AMC history',
      status: 1,
      data: savedHistory
      // data: []
    });

  } catch (error) {
    console.error('Error initiating service:', error);
    res.status(500).json({
      message: 'Failed to initiate service',
      status: 0,
      error: error.message
    });
  }
};

/* ---------------------------------------------------------------------
 * Function: getAMCAvailableAssets
 *
 * Description:
 * Returns only those AMC-linked assets that are currently available for
 * new service or repair. Assets engaged in an open service/repair cycle
 * (initiated but not yet closed) are excluded. Final data is grouped by
 * department for easier UI rendering.
 *
 * Workflow:
 *  1. Fetch AMC by ID
 *  2. Retrieve history entries where transactionType = 
 *        ["service initiated", "Repair initiated"]  → potential active services
 *  3. Retrieve history entries where transactionType = 
 *        ["service closed", "repair closed"] → completed services
 *  4. Identify truly active service numbers = (initiated − closed)
 *  5. Build a blacklist of assets in those active services
 *  6. Compare with AMC.coveredAssets to extract available assets
 *  7. Fetch ElectronicComponent and ITInventory data for available assets
 *  8. Group assets by department using addToGroup() and return response
 *
 * Route Params:
 *  - req.params.id → AMC MongoDB ObjectID
 *
 * Success Response (200):
 *  {
 *    status: 1,
 *    message: "Available AMC assets fetched successfully",
 *    data: {
 *      ...amc,
 *      coveredAssets: [
 *        { department: "Electronic Component", assets: [...] },
 *        { department: "IT Department", assets: [...] }
 *      ]
 *    }
 *  }
 *
 * Error Response:
 *  - 404: AMC not found
 *  - 500: Internal Server Error
 *
 * Notes:
 * - Prevents duplicate exclusion by matching "serviceNumber" instead of asset IDs only
 * - Uses Promise.all() to fetch both asset models concurrently for performance
 * - Returned asset list represents ONLY service-eligible assets
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */

exports.getAMCAvailableAssets = async (req, res) => {
  try {
    const { id } = req.params;

    const amc = await AMC.findById(id).lean();
    if (!amc) return res.status(404).json({ status: 0, message: "AMC not found" });

    // 1) All service initiated or repair initiated (potentially active)
    const openStarts = await AMCHistory.find({
      amcID: id,
      transactionType: { $in: [TransactionTypes.SERVICE_INITIATE, TransactionTypes.REPAIR_INITIATE] }
    }).select("serviceNumber servicedAssets").lean();

    // 2) All service closed or repair closed (finished)
    const closedEntries = await AMCHistory.find({
      amcID: id,
      transactionType: { $in: [TransactionTypes.CLOSE_SERVICE, TransactionTypes.CLOSE_REPAIR] }
    }).select("serviceNumber").lean();

    // console.log('open Start', openStarts)

    const closedSet = new Set(closedEntries.map(s => s.serviceNumber));

    const activeServices = openStarts.filter(s => !closedSet.has(s.serviceNumber));

    const openAssets = new Set();
    for (const svc of activeServices) {
      for (const asset of svc.servicedAssets) {
        openAssets.add(asset.toString());
      }
    }

    // 5) From AMC coveredAssets → filter out active ones
    const availableAssetIDs = amc.coveredAssets.filter(
      assetId => !openAssets.has(assetId.toString())
    );

    const notAvailableAssetIDs = amc.coveredAssets.filter(
      assetId => openAssets.has(assetId.toString())
    );

    const flatAvailableIDs = notAvailableAssetIDs.map(id => id.toString());

    console.log('availableAssetIDs', availableAssetIDs)
    // 6) Fetch ACtual Data
    const [availableEC, availableIT] = await Promise.all([
      ElectronicComponent.find({ _id: { $in: availableAssetIDs } })
        .select("_id id categoryName manufacturerPartNumber footPrint"),
      ITInventory.find({ _id: { $in: availableAssetIDs } })
        .select("_id code categoryName subCategoryName manufacturer serialNo")
    ]);
    const [coveredEC, coveredIT] = await Promise.all([
      ElectronicComponent.find({ _id: { $in: amc.coveredAssets } })
        .select("_id id categoryName manufacturerPartNumber footPrint"),
      ITInventory.find({ _id: { $in: amc.coveredAssets } })
        .select("_id code categoryName subCategoryName manufacturer serialNo")
    ]);

    // 7) Build output
    const available = [];
    const covered = [];
    // for (const e of electronic) addToGroup(groupedAssets, "Electronic Component", e);
    for (const e of availableEC) addToGroup(available, Departments.ELECTRONIC, e);
    for (const i of availableIT) addToGroup(available, Departments.IT, i);
    for (const ce of coveredEC) addToGroup(covered, Departments.ELECTRONIC, ce);
    for (const ci of coveredIT) addToGroup(covered, Departments.IT, ci);

    let data = {
        ...amc,
        availableAsset: available,
        coveredAssets: covered,
        availableAssetIDs: flatAvailableIDs   

  }

    console.log('AMC --------------------------------------------', data)

  return res.status(200).json({
    status: 1,
    message: "Available AMC assets fetched successfully",
    data: {
      ...amc,
      availableAsset: available,
      coveredAssets: covered,
      availableAssetIDs: flatAvailableIDs  
    }
  });

} catch (err) {
  console.error(err);
  return res.status(500).json({
    status: 0,
    message: "Internal Server Error",
    error: err.message
  });
}
};


/* ---------------------------------------------------------------------
 * Function: getOpenOnlyServiceByID
 *
 * Description:
 * Returns service and repair entries that are currently open under a
 * specific AMC. It eliminates records that have already been closed, even
 * if they were once marked as open. This distinguishes *truly active*
 * ongoing service/repair jobs for the AMC.
 *
 * Workflow:
 *  1. Validate AMC ID from request body
 *  2. Retrieve all service numbers (SN) with serviceStatus = "Open"
 *  3. Retrieve service numbers with serviceStatus = "Closed" among them
 *  4. Determine "open-only" SN = openSN − closedSN
 *  5. Fetch AMC history entries matching open-only SN values
 *  6. Separate results into:
 *       - serviceInitiated → transactionType = "service initiated"
 *       - repairInitiated  → transactionType = "Repair initiated"
 *  7. Return structured response
 *
 * Request Body (req.body):
 *  - id → AMC MongoDB ObjectID (required)
 *
 * Success Response (200):
 *  {
 *    status: 1,
 *    serviceInitiated: [...],
 *    repairInitiated: [...]
 *  }
 *
 * Error Response:
 *  - 400: AMC ID missing
 *  - 500: Internal Server Error
 *
 * Notes:
 * - The logic prevents false positives where a record was once open but later closed
 * - Uses distinct() to optimize DB reads on serviceNumber instead of scanning full documents
 * - No AMC document or asset updates are performed here — purely a read endpoint
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.getOpenOnlyServiceByID = async (req, res) => {
  try {
    const amcID = req.body.id;

    if (!amcID) {
      return res.status(400).json({ status: 0, message: "AMC ID is required" });
    }

    // STEP 1: get all open SNs (any type)
    const openSN = await AMCHistory.distinct("serviceNumber", {
      amcID,
      serviceStatus: ServiceStatus.OPEN
    });

    if (openSN.length === 0) {
      return res.status(200).json({
        status: 1,
        serviceInitiated: [],
        repairInitiated: []
      });
    }

    // STEP 2: find closed SNs among them
    const closedSN = await AMCHistory.distinct("serviceNumber", {
      amcID,
      serviceStatus: ServiceStatus.CLOSE,
      serviceNumber: { $in: openSN }
    });

    // STEP 3: filter only open-only
    const openOnlySN = openSN.filter(sn => !closedSN.includes(sn));

    if (openOnlySN.length === 0) {
      return res.status(200).json({
        status: 1,
        serviceInitiated: [],
        repairInitiated: []
      });
    }

    // STEP 4: now fetch data FOR BOTH TYPES using openOnlySN
    const allRecords = await AMCHistory.find({
      amcID,
      serviceStatus: ServiceStatus.OPEN,
      serviceNumber: { $in: openOnlySN }
    });

    // STEP 5: separate by type
    // const serviceInitiated = allRecords.filter(r => r.transactionType === "service initiated");
    // const repairInitiated = allRecords.filter(r => r.transactionType === "Repair initiated");
    const serviceInitiated = allRecords.filter(r => r.transactionType === TransactionTypes.SERVICE_INITIATE);
    const repairInitiated = allRecords.filter(r => r.transactionType === TransactionTypes.REPAIR_INITIATE);

    return res.status(200).json({
      status: 1,
      serviceInitiated,
      repairInitiated
    });

  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

/* ---------------------------------------------------------------------
 * Function: getOpenOnlyServices
 *
 * Description:
 * Retrieves only those AMC history records where a service or repair
 * is actively open — meaning it was initiated but has not yet been
 * closed. Supports pagination and filtering by transactionType.
 *
 * Workflow:
 *  1. Validate transactionType from request body
 *  2. Fetch all AMCHistory entries with matching transactionType
 *  3. Build a map of serviceNumber → bitwise status flags:
 *        - OPEN   → 1
 *        - CLOSED → 2
 *  4. Determine open-only SN = serviceNumbers where status = 1
 *  5. Apply pagination on open-only serviceNumbers
 *  6. Fetch final AMCHistory records for paginated serviceNumbers
 *  7. Return results with pagination metadata
 *
 * Request Body:
 *  - transactionType (required) → "service initiated" / "Repair initiated"
 *  - currentPageNo (optional, default = 1)
 *  - pageLimit (optional, default = 10)
 *
 * Success Response (200):
 *  {
 *    status: 1,
 *    data: [...],
 *    totalPages,
 *    currentPageNo
 *  }
 *
 * Error Response:
 *  - 400: transactionType missing
 *  - 500: Internal server error
 *
 * Notes:
 * - Bitwise status comparison avoids repeated DB scans for open/closed state
 * - openOnlySN ensures only truly active services are returned
 * - Response includes AMC name via populate("amcID", "amcName")
 * - Does not modify AMC or asset state — read-only endpoint
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.getOpenOnlyServices = async (req, res) => {
  try {
    const { transactionType, currentPageNo = 1, pageLimit = 10 } = req.body;

    if (!transactionType) {
      return res.status(400).json({ error: "transactionType is required" });
    }

    // Fetch basic service history
    const allHistory = await AMCHistory.find({
      serviceStatus: { $in: [ServiceStatus.OPEN, ServiceStatus.CLOSE] }
    }).select("serviceNumber serviceStatus amcID");

    if (!allHistory || allHistory.length === 0) {
      return res.status(200).json({
        status: 1,
        data: [],
        // totalRecords: 0,
        totalPages: 0,
        currentPageNo
      });
    }

    console.log('history--------------', allHistory)
    // Build serviceNumber open/close map
    const statusMap = Object.create(null);

    allHistory.forEach(h => {
      const sn = h.serviceNumber;
      const status = h.serviceStatus.toLowerCase();
      let current = statusMap[sn] || 0;

      if (status === "open") current |= 1;
      if (status === "close") current |= 2;

      statusMap[sn] = current;
    });

    // Filter only OPEN but not CLOSED
    const openOnlySN = Object.keys(statusMap).filter(sn => statusMap[sn] === 1);

    if (openOnlySN.length === 0) {
      return res.status(200).json({
        status: 1,
        data: [],
        // totalRecords: 0,
        totalPages: 0,
        currentPageNo
      });
    }
    /** PAGINATION **/
    const skip = (currentPageNo - 1) * pageLimit;

    const totalRecords = openOnlySN.length;
    const totalPages = Math.ceil(totalRecords / pageLimit);

    // Slice SNs based on pagination
    const paginatedSN = openOnlySN.slice(skip, skip + pageLimit);

    // Fetch full documents for paginated serviceNumbers only
    const records = await AMCHistory.find({
      transactionType,
      // serviceStatus: "Open",
      serviceStatus: ServiceStatus.OPEN,
      serviceNumber: { $in: paginatedSN }
    }).populate("amcID", "amcName");

    console.log('record', records)

    return res.status(200).json({
      status: 1,
      data: records,
      // totalRecords,
      totalPages,
      currentPageNo
    });

  } catch (error) {
    console.error("Error in getOpenOnlyServices:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ---------------------------------------------------------------------
 * Function: getOpenServiceByNumber
 *
 * Description:
 * Retrieves a single AMC service/repair record using its serviceNumber
 * and returns all associated serviced assets grouped by department.
 * Useful for displaying full details of a specific open service entry.
 *
 * Workflow:
 *  1. Extract serviceNumber from request body
 *  2. Fetch AMCHistory record matching the given serviceNumber
 *  3. Loop through servicedAssets and:
 *        - Check ElectronicComponent model
 *        - Check ITInventory model
 *        - Group results via addToGroup()
 *  4. Replace the raw servicedAssets list with grouped structure
 *  5. Return updated service history payload
 *
 * Request Body:
 *  - serviceNumber (required): Unique identifier of the service entry
 *
 * Success Response (200):
 *  {
 *    status: 1,
 *    data: {
 *      ...service,
 *      servicedAssets: [
 *        { department: "Electronic Component", assets: [...] },
 *        { department: "IT Department", assets: [...] }
 *      ]
 *    }
 *  }
 *
 * Error Response:
 *  - 500: Internal Server Error
 *
 * Notes:
 * - No AMC lookup required — serviceNumber uniquely identifies the record
 * - Grouped assets make frontend mapping and filtering easier
 * - Endpoint is read-only and performs no database updates
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.getOpenServiceByNumber = async (req, res) => {
  try {
    // const { amcID, serviceNumber } = req.body;
    const { serviceNumber } = req.body;
    const service = await AMCHistory.findOne({
      serviceNumber
    }).lean();
    const groupedAssets = [];
    for (const assetId of service.servicedAssets) {
      // Electronic Component
      let asset = await ElectronicComponent.findById(assetId)
        .select("_id id categoryName manufacturerPartNumber footPrint")
        .lean();

      if (asset) {
        // addToGroup(groupedAssets, "Electronic Component", asset);
        addToGroup(groupedAssets, Departments.ELECTRONIC, asset);
        continue;
      }

      // IT Inventory
      asset = await ITInventory.findById(assetId)
        .select("_id code categoryName subCategoryName manufacturer serialNo")
        .lean();

      if (asset) {
        // addToGroup(groupedAssets, "IT Department", asset);
        addToGroup(groupedAssets, Departments.IT, asset);
      }
    }

    return res.status(200).json({
      status: 1,
      data: { ...service, servicedAssets: groupedAssets } || null
    });

  } catch (err) {
    return res.status(500).json({
      status: 0,
      error: err.message
    });
  }
};

/* ---------------------------------------------------------------------
 * Function: updateHistoryByNumber
 *
 * Description:
 * Updates an existing AMC history record based on the unique
 * serviceNumber. Allows modifying metadata such as invoice number,
 * estimated cost, service details, additional notes, and serviced assets.
 *
 * Workflow:
 *  1. Extract serviceNumber and update fields from request body
 *  2. Find an AMCHistory record matching serviceNumber and update it
 *     using atomic $set (findOneAndUpdate)
 *  3. If no record exists, return 404
 *  4. On success, return the updated history document
 *
 * Request Body:
 *  - serviceNumber (required) → Unique identifier of the service history
 *  - invoiceNumber (optional)
 *  - estimatedCost (optional)
 *  - serviceDetails (optional)
 *  - additionalNotes (optional)
 *  - servicedAssets (optional) → Array of asset ObjectIDs
 *
 * Success Response (200):
 *  {
 *    status: 1,
 *    message: "History data is successfully update by service Number",
 *    data: { ...updatedHistory }
 *  }
 *
 * Error Response:
 *  - 404: No history found for provided serviceNumber
 *  - 500: Internal Server Error
 *
 * Notes:
 * - Does NOT alter AMC data or asset linkage — only history metadata
 * - `$set` ensures only provided fields are updated, nothing else modified
 * - If a field is missing from request, a default empty string/array is saved
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.updateHistoryByNumber = async (req, res) => {
  try {
    const { serviceNumber, invoiceNumber, estimatedCost, serviceDetails, additionalNotes, servicedAssets = [] } = req.body;

    const newHistory = await AMCHistory.findOneAndUpdate({ serviceNumber: serviceNumber }, {
      $set: {
        invoiceNumber: invoiceNumber || '',
        estimatedCost: estimatedCost || '',
        serviceDetails: serviceDetails || '',
        additionalNotes: additionalNotes || '',
        servicedAssets: servicedAssets || []
      }
    }, { new: true })

    // 4. Handle "not found"
    if (!newHistory) {
      return res.status(404).json({
        status: 0,
        message: `No history found for serviceNumber: ${serviceNumber}`
      });
    }

    console.log('new History', newHistory)

    return res.status(200).json({
      status: 1,
      message: 'History data is successfully update by service Number',
      data: newHistory
    });

  } catch (err) {
    return res.status(500).json({
      status: 0,
      error: err.message
    });
  }
};

/* ---------------------------------------------------------------------
 * Function: closeService
 *
 * Description:
 * Closes an ongoing AMC service entry by creating a new history record
 * with transactionType = "service closed". The function does not modify
 * the original initiation entry but appends a closure entry to maintain
 * a chronological audit trail.
 *
 * Workflow:
 *  1. Validate AMC existence using amcID
 *  2. Fetch initiated service using amcID + serviceNumber
 *  3. If found, construct a "service closed" history object using:
 *       - new details from request body
 *       - original values from initiated service (invoiceNo, estimatedCost, billNo)
 *  4. Insert closure record into AMCHistory
 *  5. Respond with success payload and saved history document
 *
 * Request Body:
 *  - amcID (required)
 *  - serviceNumber (required)
 *  - serviceDetails (optional)
 *  - cost (optional)
 *  - paymentInfo (optional)
 *  - paymentMode (optional)
 *  - additionalNotes (optional)
 *
 * Success Response (201):
 *  {
 *    message: "Service closed successfully and recorded in AMC history",
 *    status: 1,
 *    data: { ...savedHistory }
 *  }
 *
 * Error Response:
 *  - 404: AMC not found
 *  - 404: Initiated service not found
 *  - 500: Failed to close service
 *
 * Notes:
 * - This method does NOT update the original service initiated record
 * - A closure entry is always written separately to preserve timeline history
 * - servicedAssets is intentionally set to [] as closure does not require asset list
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.closeService = async (req, res) => {
  try {
    const { amcID, serviceNumber, serviceDetails, cost, paymentInfo, paymentMode, additionalNotes } = req.body;

    const amc = await AMC.findById(amcID);
    if (!amc) {
      return res.status(404).json({
        message: 'AMC not found',
        status: 0
      });
    }

    const initiatedService = await AMCHistory.findOne({
      amcID,
      serviceNumber,
      // transactionType: 'service initiated',
      // serviceStatus: 'Open'
    });

    if (!initiatedService) {
      return res.status(404).json({
        message: 'No open service found for the given service number',
        status: 0
      });
    }

    const closedHistory = {
      amcID,
      // transactionType: 'service closed',
      transactionType: TransactionTypes.CLOSE_SERVICE,
      serviceDetails: serviceDetails || null,
      serviceNumber,
      // serviceStatus: 'Closed',
      serviceStatus: ServiceStatus.CLOSE,
      servicedAssets: [],
      cost: cost || null,
      billNo: initiatedService.billNo || null,
      estimatedCost: initiatedService.estimatedCost || null,
      invoiceNumber: initiatedService.invoiceNumber || null,
      paymentMode: paymentMode || null,
      paymentInfo: paymentInfo || null,
      additionalNotes: additionalNotes || null
    };

    const savedHistory = await AMCHistory.create(closedHistory);

    res.status(201).json({
      message: 'Service closed successfully and recorded in AMC history',
      status: 1,
      data: savedHistory
    });

  } catch (error) {
    console.error('Error closing service:', error);
    res.status(500).json({
      message: 'Failed to close service',
      status: 0,
      error: error.message
    });
  }
};

/* ---------------------------------------------------------------------
 * Function: initiateRepair
 *
 * Description:
 * Creates a new repair initiation entry under an AMC and logs it into
 * AMC history. A unique serviceNumber is generated based on assetCode
 * and timestamp. Repair initiation is treated as an independent workflow
 * similar to service initiation but tracked separately via transactionType.
 *
 * Workflow:
 *  1. Validate AMC existence using amcID
 *  2. Validate selected assets belong to AMC.coveredAssets
 *  3. Generate unique serviceNumber: <ASSET_CODE>-DDMMYY-HHMMSS
 *  4. Prepare AMCHistory entry with:
 *       - transactionType = "Repair initiated"
 *       - serviceStatus = "Open"
 *       - selected assets and optional metadata
 *  5. Insert record into AMCHistory database
 *  6. Return created repair initiation history record
 *
 * Request Body:
 *  - amcID (required)
 *  - servicedAssets (optional) → Array of asset ObjectIDs
 *  - serviceDetails (optional)
 *  - invoiceNumber (optional)
 *  - estimatedCost (optional)
 *  - billNo (optional)
 *  - additionalNotes (optional)
 *
 * Success Response (201):
 *  {
 *    message: "Service initiated and logged in AMC history",
 *    status: 1,
 *    data: { ...savedHistory }
 *  }
 *
 * Error Response:
 *  - 404: AMC not found
 *  - 400: One or more servicedAssets are not covered under AMC
 *  - 500: Failed to initiate repair
 *
 * Notes:
 * - servicedAssets remain unavailable for new service/repair until closed
 * - Logic and history structure mirror service initiation but tracked separately
 * - This call does NOT modify AMC document — only logs history
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.initiateRepair = async (req, res) => {
  try {
    const { amcID, invoiceNumber, serviceDetails, servicedAssets = [], estimatedCost, billNo, additionalNotes } = req.body;

    // 1. Validate AMC existence
    const amc = await AMC.findById(amcID);
    if (!amc) {
      return res.status(404).json({
        message: 'AMC not found',
        status: 0
      });
    }

    // 2. Validate servicedAssets are part of AMC's coveredAssets
    if (servicedAssets.length > 0) {
      const coveredAssetIds = amc.coveredAssets.map(id => id.toString());
      const invalidAssets = servicedAssets.filter(id => !coveredAssetIds.includes(id));

      if (invalidAssets.length > 0) {
        return res.status(400).json({
          message: 'selected assets are not covered under this AMC',
          status: 0,
          invalidAssets
        });
      }
    }

    const assetCode = amc.assetsCode
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, 0);
    const mm = String(now.getMonth() + 1).padStart(2, 0);
    const yy = String(now.getFullYear()).slice(-2)
    const hh = String(now.getHours()).padStart(2, 0);
    const min = String(now.getMinutes()).padStart(2, 0);
    const ss = String(now.getSeconds()).padStart(2, 0);
    const formattedDate = `${dd}${mm}${yy}`;
    const formattedTime = `${hh}${min}${ss}`;

    const serviceNumber = `${assetCode}-${formattedDate}-${formattedTime}`;

    // 2. Prepare AMC History entry
    const historyEntry = {
      amcID,
      // transactionType: 'Repair initiated',
      transactionType: TransactionTypes.REPAIR_INITIATE,
      serviceDetails: serviceDetails || null,
      serviceNumber: serviceNumber, // you can auto-increment or set later if needed
      // serviceStatus: 'Open',
      serviceStatus: ServiceStatus.OPEN,
      servicedAssets: servicedAssets || [], // array of asset ObjectIds
      estimatedCost: estimatedCost || null,
      invoiceNumber: invoiceNumber || null,
      billNo: billNo || null,
      paymentMode: null,
      paymentInfo: null,
      additionalNotes: additionalNotes || null
    };

    // 3. Create AMC history record
    const savedHistory = await AMCHistory.create(historyEntry);

    // 4. Response
    res.status(201).json({
      message: 'Service initiated and logged in AMC history',
      status: 1,
      data: savedHistory
    });

  } catch (error) {
    console.error('Error initiating service:', error);
    res.status(500).json({
      message: 'Failed to initiate service',
      status: 0,
      error: error.message
    });
  }
};

/* ---------------------------------------------------------------------
 * Function: closeRepair
 *
 * Description:
 * Closes an ongoing AMC repair entry by creating a new record in
 * AMCHistory with transactionType = "Repair closed". The function does
 * not update the original repair initiation entry but instead appends
 * a closure record to preserve a complete timeline of actions.
 *
 * Workflow:
 *  1. Validate AMC existence using amcID
 *  2. Find the repair initiation entry using:
 *        amcID + serviceNumber + transactionType + serviceStatus = "Open"
 *  3. If no open repair exists, return 404
 *  4. Build a new closure entry using:
 *        - new values from request body
 *        - inherited values from the initiation entry
 *  5. Insert the new AMCHistory closure record
 *  6. Respond with saved closure result
 *
 * Request Body:
 *  - amcID (required)
 *  - serviceNumber (required)
 *  - serviceDetails (optional)
 *  - cost (optional)
 *  - paymentInfo (optional)
 *  - paymentMode (optional)
 *  - additionalNotes (optional)
 *
 * Success Response (201):
 *  {
 *    message: "Service closed successfully and recorded in AMC history",
 *    status: 1,
 *    data: { ...savedHistory }
 *  }
 *
 * Error Response:
 *  - 404: AMC not found
 *  - 404: Repair not found or not open
 *  - 500: Failed to close repair
 *
 * Notes:
 * - Closure record does NOT replace the original repair initiation record
 * - servicedAssets is saved as [] during closure because only initiation
 *   determines which assets were involved
 * - Maintains a complete audit trail for every repair lifecycle
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.closeRepair = async (req, res) => {
  try {
    const { amcID, serviceNumber, serviceDetails, cost, paymentInfo, paymentMode, additionalNotes } = req.body;

    const amc = await AMC.findById(amcID);
    if (!amc) {
      return res.status(404).json({
        message: 'AMC not found',
        status: 0
      });
    }

    const initiatedService = await AMCHistory.findOne({
      amcID,
      serviceNumber,
      // transactionType: TransactionTypes.SERVICE_INITIATE,
      // serviceStatus: ServiceStatus.OPEN
    });

    if (!initiatedService) {
      return res.status(404).json({
        message: 'No open service found for the given service number',
        status: 0
      });
    }

    const closedHistory = {
      amcID,
      // transactionType: 'Repair closed',
      transactionType: TransactionTypes.CLOSE_REPAIR,
      serviceDetails: serviceDetails || null,
      serviceNumber,
      // serviceStatus: 'Closed',
      serviceStatus: ServiceStatus.CLOSE,
      servicedAssets: [],
      cost: cost || null,
      billNo: initiatedService.billNo || null,
      estimatedCost: initiatedService.estimatedCost || null,
      invoiceNumber: initiatedService.invoiceNumber || null,
      paymentMode: paymentMode || null,
      paymentInfo: paymentInfo || null,
      additionalNotes: additionalNotes || null
    };

    const savedHistory = await AMCHistory.create(closedHistory);

    res.status(201).json({
      message: 'Service closed successfully and recorded in AMC history',
      status: 1,
      data: savedHistory
    });

  } catch (error) {
    console.error('Error closing service:', error);
    res.status(500).json({
      message: 'Failed to close service',
      status: 0,
      error: error.message
    });
  }
};

/* ---------------------------------------------------------------------
 * Function: extendedAMC
 *
 * Description:
 * Extends an existing AMC contract by updating its validity period and
 * commercial details, while also recording the extension event in the
 * AMC History. The extension is treated as a separate lifecycle event
 * (transactionType = "extended") for complete audit tracking.
 *
 * Workflow:
 *  1. Validate AMC existence using amcID
 *  2. Create an AMCHistory entry with:
 *       - transactionType = "extended"
 *       - serviceStatus = "Closed" (since no service work is opened)
 *  3. Update AMC fields including:
 *       startDate, endDate, cost, frequency, billNo,
 *       amcType, additionalNotes, paymentMode, paymentInfo
 *  4. If AMC update fails, rollback history entry
 *  5. If successful, return updated AMC and history log
 *
 * Request Body:
 *  - amcID (required)
 *  - startDate (required)
 *  - endDate (required)
 *  - cost (optional)
 *  - frequency (optional)
 *  - billNo (optional)
 *  - amcType (optional)
 *  - additionalNotes (optional)
 *  - paymentMode (optional)
 *  - paymentInfo (optional)
 *
 * Success Response (200):
 *  {
 *    message: "AMC successfully extended and logged in history",
 *    status: 1,
 *    data: {
 *      updatedAMC,
 *      historyEntry
 *    }
 *  }
 *
 * Error Response:
 *  - 404: AMC not found
 *  - 500: AMC update failed (history rollback)
 *  - 500: Internal Server Error
 *
 * Notes:
 * - Extension does not create or modify any service/repair entries
 * - History log ensures contract lifecycle traceability beyond service events
 * - Uses transactional rollback logic to preserve database consistency
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.extendedAMC = async (req, res) => {
  console.log('i am running extended')
  try {
    const {
      amcID,
      startDate,
      endDate,
      invoiceNumber,
      cost,
      frequency,
      billNo,
      amcType,
      additionalNotes,
      paymentMode,
      paymentInfo
    } = req.body;

    console.log(amcID)
    // 1. Validate AMC existence
    const amc = await AMC.findById(amcID);
    console.log(amc)
    if (!amc) {
      return res.status(404).json({
        message: 'AMC not found',
        status: 0
      });
    }

    // 2. Create AMC History entry first
    const historyEntry = {
      amcID,
      transactionType: TransactionTypes.EXTEND,
      serviceDetails: null,
      serviceNumber: null,
      serviceStatus: null,
      // serviceStatus: ServiceStatus.CLOSE,
      servicedAssets: [],
      estimatedCost: null,
      invoiceNumber: invoiceNumber || null,
      cost: cost || null,
      billNo: billNo || null,
      paymentMode: paymentMode || null,
      paymentInfo: paymentInfo || null,
      additionalNotes: additionalNotes || null
    };

    const newHistory = await AMCHistory.create(historyEntry);

    // 3. Update AMC — only editable fields
    const updateData = {
      startDate: startDate,
      endDate: endDate,
      invoiceNumber: invoiceNumber,
      cost: cost,
      frequency: frequency,
      billNo: billNo,
      amcType: amcType,
      additionalNotes: additionalNotes,
      paymentMode: paymentMode,
      paymentInfo: paymentInfo
    };

    // 4. Try updating AMC using findByIdAndUpdate
    const updatedAMC = await AMC.findByIdAndUpdate(amcID, updateData, {
      new: true,
      runValidators: true
    });

    // 5. Handle failed update → rollback history
    if (!updatedAMC) {
      await AMCHistory.findByIdAndDelete(newHistory._id);
      return res.status(500).json({
        message: 'AMC update failed. Rolled back history entry.',
        status: 0
      });
    }

    // 6. Success response
    res.status(200).json({
      message: 'AMC successfully extended and logged in history',
      status: 1,
      data: {
        updatedAMC,
        historyEntry: newHistory
      }
    });

  } catch (error) {
    console.error('Error extending AMC:', error);
    res.status(500).json({
      message: 'Failed to extend AMC',
      status: 0,
      error: error.message
    });
  }
};

/* ---------------------------------------------------------------------
 * Function: createServiceProvider
 *
 * Description:
 * Creates a new service provider record. Before inserting, the function
 * checks whether a provider with the same details already exists to
 * prevent duplicate entries in the database.
 *
 * Workflow:
 *  1. Extract request payload
 *  2. Check if a provider with the same details already exists
 *  3. If exists → return 409 (conflict)
 *  4. If not → create a new ServiceProvider document
 *  5. Return success response with the newly created record
 *
 * Request Body:
 *  - Any required or optional fields defined in the ServiceProvider schema
 *
 * Success Response (201):
 *  {
 *    message: "Created successfully",
 *    data: { ...newProvider }
 *  }
 *
 * Error Response:
 *  - 409: Service Provider already exists
 *  - 500: Internal Server Error
 *
 * Notes:
 * - Uses full payload matching search as duplicate check
 * - Payload must match structure of the ServiceProvider model
 * - No update or history logs are triggered here — simple insert operation
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.createServiceProvider = async (req, res) => {
  try {
    const payload = req.body;
    console.log('console payload', req.body)
    const existing = await ServiceProvider.findOne(payload);
    if (existing) return res.status(409).json({ message: 'Service Provider already exists' });

    const newProvider = await ServiceProvider.create(payload);
    res.status(201).json({ message: 'Created successfully', data: newProvider });
  } catch (err) {
    res.status(500).json({
      status: 0,
      error: err.message
    });
  }
};

/* ---------------------------------------------------------------------
 * Function: getAllServiceProviders
 *
 * Description:
 * Fetches the complete list of service providers from the database.
 * This endpoint is used for displaying provider lists in tables,
 * dropdowns, or selection forms.
 *
 * Workflow:
 *  1. Query ServiceProvider collection without filters
 *  2. Return all provider records as response
 *
 * Request Body:
 *  - None
 *
 * Success Response (200 / 201):
 *  {
 *    message: "Created successfully",
 *    data: [ ...serviceProviders ]
 *  }
 *
 * Error Response:
 *  - 500: Internal Server Error
 *
 * Notes:
 * - Simple list API with no pagination and no filters
 * - Response status code currently uses 201, but 200 is more standard
 *   for fetch/read operations (recommended change but optional)
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.getAllServiceProviders = async (req, res) => {
  try {
    console.log('service provider is running')
    const serviceProvider = await ServiceProvider.find()
    res.status(201).json({ message: 'Created successfully', data: serviceProvider });
  } catch (error) {
    res.status(500).json({
      status: 0,
      error: error.message
    });
  }
};

/* ----------------------------------------------------------------------
 * Function: fetchFilteredInventory
 *
 * Description:
 * Returns inventory items that match department-based filters and are
 * not currently enrolled in any AMC. Supports filtering by manufacturer,
 * category, subcategory, and manufacturer part number (for Electronic
 * Components). Response includes only assets eligible for AMC assignment.
 *
 * Workflow:
 *  1. Validate department in request body
 *  2. Build filter object dynamically based on optional fields
 *  3. Depending on the department:
 *        - Query ITInventory (filters: categoryName, subCategoryName, manufacturer)
 *        - Query ElectronicComponent (filters: categoryName, manufacturer,
 *          manufacturerPartNumber with regex search)
 *  4. Exclude assets already linked to AMC using:
 *        { amc: null } OR { amc: { $exists: false } }
 *  5. Return filtered, AMC-free asset list
 *
 * Request Body:
 *  - department (required) → 'IT Department' | 'Electronic Component'
 *  - category (optional)
 *  - subcategory (optional)
 *  - manufacturer (optional)
 *  - manufacturerPartNumber (optional, only for Electronic Component)
 *
 * Success Response (200):
 *  {
 *    message: "Filtered data fetched",
 *    status: 1,
 *    count: <number>,
 *    data: [ ...results ]
 *  }
 *
 * Error Response:
 *  - 404: Department missing or blank
 *  - 500: Internal Server Error
 *
 * Notes:
 * - Returns only inventory items NOT enrolled in AMC (AMC-free assets)
 * - More departments (Testing Equipment, Fixed Assets, Consumable) can be
 *   added to the same pattern in the future
 * - Uses projection to return lean data for faster UI rendering
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.updateServiceProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const newProvider = await ServiceProvider.findByIdAndUpdate(id, { $set: payload })
    res.status(201).json({ message: 'Created successfully', data: newProvider });
  } catch (err) {
    res.status(500).json({
      status: 0,
      error: err.message
    });
  }
}

/* ---------------------------------------------------------------------
 * Function: fetchFilteredInventory
 *
 * Description:
 * Returns inventory items that match department-based filters and are
 * not currently enrolled in any AMC. Supports filtering by manufacturer,
 * category, subcategory, and manufacturer part number (for Electronic
 * Components). Response includes only assets eligible for AMC assignment.
 *
 * Workflow:
 *  1. Validate department in request body
 *  2. Build filter object dynamically based on optional fields
 *  3. Depending on the department:
 *        - Query ITInventory (filters: categoryName, subCategoryName, manufacturer)
 *        - Query ElectronicComponent (filters: categoryName, manufacturer,
 *          manufacturerPartNumber with regex search)
 *  4. Exclude assets already linked to AMC using:
 *        { amc: null } OR { amc: { $exists: false } }
 *  5. Return filtered, AMC-free asset list
 *
 * Request Body:
 *  - department (required) → 'IT Department' | 'Electronic Component'
 *  - category (optional)
 *  - subcategory (optional)
 *  - manufacturer (optional)
 *  - manufacturerPartNumber (optional, only for Electronic Component)
 *
 * Success Response (200):
 *  {
 *    message: "Filtered data fetched",
 *    status: 1,
 *    count: <number>,
 *    data: [ ...results ]
 *  }
 *
 * Error Response:
 *  - 404: Department missing or blank
 *  - 500: Internal Server Error
 *
 * Notes:
 * - Returns only inventory items NOT enrolled in AMC (AMC-free assets)
 * - More departments (Testing Equipment, Fixed Assets, Consumable) can be
 *   added to the same pattern in the future
 * - Uses projection to return lean data for faster UI rendering
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.fetchFilteredInventory = async (req, res) => {
  try {
    const query = req.body
    if (!query.department || query.department.trim() === "") {
      return res.status(404).json({
        message: 'Department not found',
        status: 0,
        data: []
      })
    }
    console.log('filter fetched', query)
    const filter = {};
    if (query.manufacturer) filter.manufacturer = query.manufacturer;
    if (query.category) filter.category = query.category;
    if (query.subcategory) filter.subcategory = query.subcategory;
    if (query.manufacturerPartNumber) filter.manufacturerPartNumber = query.manufacturerPartNumber

    let results = []

    // if (query.department === 'IT Department') {
    if (query.department === Departments.IT) {
      projection = {
        categoryName: 1,
        subCategoryName: 1,
        code: 1
      }
      results = await ITInventory.find({
        ...(filter.category && { categoryName: filter.category }),
        ...(filter.subcategory && { subCategoryName: filter.subcategory }),
        ...(filter.manufacturer && { manufacturer: filter.manufacturer }),
        $or: [
          { amc: null },
          { amc: { $exists: false } }
        ]
      }, projection);

      // } else if (query.department === 'Electronic Component') {
    } else if (query.department === Departments.ELECTRONIC) {
      projection = {
        categoryName: 1,
        manufacturerPartNumber: 1,
        id: 1
      }
      results = await ElectronicComponent.find({
        ...(filter.category && { categoryName: filter.category }),
        ...(filter.manufacturer && { manufacturer: filter.manufacturer }),
        ...(filter.manufacturerPartNumber && { manufacturerPartNumber: { $regex: filter.manufacturerPartNumber, $options: 'i' } }),
        $or: [
          { amc: null },
          { amc: { $exists: false } }
        ]
      }, projection);

      console.log('fiteched results', results)

    }
    // else if (query.department === 'Testing Equipment') {

    // } else if (query.department === 'Fixed Assets') {

    // } else if (query.department === 'Consumable') {

    // }
    // console.log('esults', results, results.length)
    return res.status(200).json({
      message: "Filtered data fetched",
      status: 1,
      count: results.length,
      data: results
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: 'Server error',
      status: 0,
      error: err.message
    })
  }

};

/* ---------------------------------------------------------------------
 * Function: getAMCHistory
 *
 * Description:
 * Retrieves the complete history log of an AMC, including all service,
 * repair, extension, and closure events. The results are returned in
 * reverse chronological order (latest first) to match typical UI
 * timeline representation.
 *
 * Workflow:
 *  1. Validate amcID from request params
 *  2. Fetch all AMCHistory entries that belong to the AMC
 *  3. Sort records in descending order of creation date
 *  4. Return history list with record count
 *
 * Route Params:
 *  - amcID (required) → AMC MongoDB ObjectID
 *
 * Success Response (200):
 *  {
 *    status: 1,
 *    message: "AMC history fetched successfully",
 *    count: <number>,
 *    data: [ ...history ]
 *  }
 *
 * Error Response:
 *  - 400: AMC ID missing
 *  - 500: Server error
 *
 * Notes:
 * - Returns the entire history across all transaction types:
 *   "service initiated", "service closed",
 *   "Repair initiated", "Repair closed",
 *   "extended", etc.
 * - Order guarantees user sees the latest event first
 * - Pure read-only endpoint — does not modify AMC or history records
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.getAMCHistory = async (req, res) => {
  try {
    const { amcID } = req.params;
    const { filter } = req.query;

    if (!amcID) {
      return res.status(400).json({
        status: 0,
        message: "AMC ID is required"
      });
    }

    let query = { amcID };

    if (filter && filter.toLowerCase() !== 'all') {
      query.transactionType = filter
    }

    console.log('query', query)

    const history = await AMCHistory.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      status: 1,
      message: "AMC history fetched successfully",
      count: history.length,
      data: history
    });

  } catch (error) {
    console.error("Error fetching AMC history:", error);

    return res.status(500).json({
      status: 0,
      message: "Server error",
      error: error.message
    });
  }
};
