const ITStockHistory = require('../models/it-department/it-inventory/it-stock-history.model');
const SubCategory = require('../models/it-department/it-inventory/it-subcategory.model');
const ITSupplier = require('../models/it-department/it-inventory/it-supplier.model');
const ITManufacturer = require('../models/it-department/it-inventory/it-manufacturer.model');
const ItInventory = require('../models/it-department/it-inventory/it-inventory.model')
const InCategory = require('../models/it-department/it-inventory/it-category.model');
const User = require('../models/user/user.model');
const logger = require('../../logger')


// ================================= [ IT INVENTORY SECTION ]================================= //

/**
 * Check if an inventory category name is available for editing
 * 
 * This function checks whether a given category name already exists in the database.
 * It is useful when editing a category to ensure the new name does not conflict with existing names.
 * 
 * Steps:
 * 1. Extract the category name from the query parameters (`req.query.name`).
 * 2. Use `findOne` to search for an existing category with the same name.
 * 3. If no category is found (`result === null`), the name is available.
 * 4. Respond with a JSON object `{ isUnique: true }` if available, `{ isUnique: false }` if not.
 * 5. Log any errors and respond with an error message if the query fails.
 * 
 * @param {*} req - HTTP request object containing the category name in query
 * @param {*} res - HTTP response object used to send the result of the check
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.checkInventoryEditCategoryName = (req, res) => {
    const categoryName = req.query.name;

    InCategory.findOne({ name: categoryName }).then(result => {
        logger.info('Checked inventory category name');
        res.json({ isUnique: result === null });
    }).catch(err => {
        console.log(err)
        logger.error('Error checking inventory category name', { error: err });
        res.send(JSON.stringify({ error: err }))
    })

}



/**
 * Update IT Inventory Category
 * 
 * This function updates an existing inventory category in the database.
 * 
 * Steps:
 * 1. Extract the category ID from the query parameters (`req.query.id`).
 * 2. Extract the updated data from the request body (`req.body`).
 * 3. Use `findByIdAndUpdate` to update the category document in MongoDB.
 * 4. On success, log the update and send a success message in the response.
 * 5. On failure, log the error and send the error details in the response.
 * 
 * @param {*} req - HTTP request object containing the category ID and updated data
 * @param {*} res - HTTP response object used to send success or error messages
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.updateInventoryCategory = (req, res) => {
    let id = req.query.id
    let data = req.body


    InCategory.findByIdAndUpdate(id, data)
        .then((result => {
            logger.info('Inventory category updated successfully');
            res.send(JSON.stringify({ message: 'successful updated' }))
        })).catch(err => {
            console.log(err);
            logger.error('Error updating inventory category', { error: err });
            res.send(JSON.stringify({ message: err }))
        })

}



/**
 * POST: Add a new IT Inventory subcategory
 *
 * Description:
 * - Creates a new `SubCategory` document using the data from `req.body`.
 * - Returns a success message if the subcategory is added successfully.
 * - Logs errors and returns an error message if saving fails.
 *
 * Example `req.body`:
 * {
 *   name: "Laptops",
 *   categoryId: "64f123abcd...",  // ID of the parent category
 *   description: "All laptop models in inventory"
 * }
 *
 * Response on success:
 * {
 *   message: "Sub-category is Added"
 * }
 *
 * Response on failure:
 * {
 *   error: {...}
 * }
 *
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.postSubCategory = async (req, res) => {
    try {
        const { prefix, suffix, subCategoryName } = req.body;
        if (!prefix || !suffix) {
            return res.status(400).json({ message: 'Prefix and suffix are required', status: 0 });
        }

        const existing = await SubCategory.findOne({ prefix, suffix, });
        if (existing) {
            return res.status(409).json({
                message: 'Sub-category with the same prefix and suffix already exists',
                status: 1
            });
        }
        const newSubCategory = new SubCategory(req.body);
        await newSubCategory.save();
        logger.info('Sub-category added successfully');
        return res.status(201).json({ message: 'Sub-category added successfully', status: 2 });
    } catch (error) {
        logger.error('Error adding sub-category', { error });
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal Server Error', error, status: 0 });
    }
};



/**
 * POST: Add a new IT Inventory Supplier
 *
 * Description:
 * - Creates a new IT supplier document in the database.
 * - Logs success or error for monitoring.
 *
 * Request Body Example:
 * {
 *   "name": "ABC Suppliers",
 *   "contact": "1234567890",
 *   "email": "abc@suppliers.com"
 * }
 *
 * Response:
 * - Success: { message: "Supplier is Added" }
 * - Error: { error: <error object> }
 *
 * @param {*} req - Express request object containing supplier data in req.body
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
// exports.postInventorySupplier = (req, res) => {
//     // console.log(req.body)
//     var newITSupplier = new ITSupplier(req.body)
//     newITSupplier.save().then(result => {
//         logger.info('Supplier added successfully');
//         res.send(JSON.stringify({ message: "Supplier is Added" }))
//     }).catch(err => {
//         logger.error('Error adding supplier', {
//             error: err
//         });
//         console.log(err)
//         res.send(JSON.stringify({ error: err }))
//     })
// }

exports.postInventorySupplier = async (req, res) => {
    try {

        const supplier = new ITSupplier(req.body);
        await supplier.save();

        res.json({ message: true });
        logger.info('Supplier added successfully');
    } catch (err) {
        logger.error('Error adding supplier', {
            error: err
        });
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Supplier already exists' });
        }

        res.status(500).json({ error: err });
    }
};




/**
 * POST: Add a new IT Inventory Manufacturer
 *
 * Description:
 * - Creates a new IT manufacturer document in the database.
 * - Logs the success or error for monitoring.
 *
 * Request Body Example:
 * {
 *   "name": "XYZ Manufacturer",
 *   "contact": "9876543210",
 *   "email": "xyz@manufacturer.com"
 * }
 *
 * Response:
 * - Success: { message: "Manufacturer is Added" }
 * - Error: { error: <error object> }
 *
 * @param {*} req - Express request object containing manufacturer data in req.body
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.postInventoryManufacturer = (req, res) => {
    // console.log(req.body)
    var newITManufacturer = new ITManufacturer(req.body)
    newITManufacturer.save().then(result => {
        logger.info('Manufacturer added successfully');
        res.send(JSON.stringify({ message: "Manufacturer is Added" }))
    }).catch(err => {
        console.log(err)
        logger.error('Error adding manufacturer', {
            error: err
        });
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * PUT: Update IT Inventory Sub-category
 *
 * Description:
 * - Updates an existing IT Inventory sub-category record in the database
 *   using the provided subcategory ID and request body data.
 * - Logs the success or failure of the update operation.
 *
 * Request:
 * - Query Parameter: ?subcategoryId=<subcategoryId>
 * - Body Example:
 *   {
 *     "subCategoryName": "Updated Name",
 *     "abbreviatedName": "UPD",
 *     "categoryId": "6720cabc12f4d..."
 *   }
 *
 * Response:
 * - Success: { message: true }
 * - Error: { error: <error object> }
 *
 * @param {*} req - Express request object (includes subcategoryId in query and updated data in body)
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.updateSubCategory = async (req, res) => {
    try {
        console.log('Request body', req.body)
        const id = req.query.subcategoryId;
        if (!id) {
            console.log('issue on the ID')
            return res.status(400).json({ message: 'Subcategory ID is required', status: 0 });
        }

        const updated = await SubCategory.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ message: 'Sub-category not found', status: 0 });
        }
        logger.info('Sub-category updated successfully');
        return res.status(200).json({ message: 'Sub-category updated successfully', status: 2 });
    } catch (error) {
        logger.error('Error updating sub-category', { error });
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal Server Error', error, status: 0 });
    }
};



/**
 * DELETE: Remove IT Inventory Sub-category
 *
 * Description:
 * - Deletes an existing sub-category from the IT Inventory database 
 *   based on the provided subcategory ID.
 * - Logs success or failure of the deletion process.
 *
 * Request:
 * - Query Parameter: ?subcategoryId=<subcategoryId>
 *
 * Response:
 * - Success: { message: true }
 * - Error: { error: <error object> }
 *
 * @param {*} req - Express request object (expects subcategoryId in query)
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.deleteSubcategory = (req, res) => {
    var id = req.query.subcategoryId
    SubCategory.findByIdAndDelete(id).then(result => {
        logger.info('Sub-category deleted successfully');
        res.send(JSON.stringify({ message: true }));
    }).catch(err => {
        console.log(err)
        logger.error('Error deleting sub-category', {
            error: err
        });
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * PUT: Update IT Inventory Supplier
 *
 * Description:
 * - Updates supplier details in the IT Inventory database 
 *   using the provided supplier ID.
 * - Logs both successful updates and any errors encountered.
 *
 * Request:
 * - Query Parameter: ?supplierId=<supplierId>
 * - Body: JSON object containing supplier fields to update
 *
 * Response:
 * - Success: { message: true }
 * - Error: { error: <error object> }
 *
 * @param {*} req - Express request object (expects supplierId in query and updated data in body)
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.updateInventorySupplier = (req, res) => {
    var id = req.query.supplierId
    var data = req.body
    ITSupplier.findByIdAndUpdate(id, data).then(result => {
        logger.info('Supplier updated successfully', {
            supplierId: id
        });
        res.send(JSON.stringify({ message: true }));
    }).catch(err => {
        console.log(err)
        logger.error('Error updating supplier', {
            error: err
        });
        res.send(JSON.stringify({ error: err }))
    })
}

exports.updateInventorySupplier = async (req, res) => {

  try {

    const id = req.query.supplierId;
    await ITSupplier.findByIdAndUpdate(id, req.body, { new: true });

    res.json({ message: true });
    logger.info('Supplier updated successfully')
  } catch (err) {

    logger.error('Error updating supplier', { error: err });
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Supplier already exists' });
    }

    res.status(500).json({ error: err });
  }
};




/**
 * DELETE: Remove IT Inventory Supplier
 *
 * Description:
 * - Deletes a supplier record from the IT Inventory database 
 *   using the supplier ID provided in the query.
 * - Logs both successful deletions and any errors encountered.
 *
 * Request:
 * - Query Parameter: ?supplierId=<supplierId>
 *
 * Response:
 * - Success: { message: true }
 * - Error: { error: <error object> }
 *
 * @param {*} req - Express request object (expects supplierId in query)
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.deleteInventorySupplier = (req, res) => {
    var id = req.query.supplierId
    ITSupplier.findByIdAndDelete(id).then(result => {
        logger.info('Supplier deleted successfully');
        res.send(JSON.stringify({ message: true }));
    }).catch(err => {
        console.log(err);
        logger.error('Error deleting supplier', {
            error: err
        });
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * PUT: Update IT Inventory Manufacturer
 *
 * Description:
 * - Updates an existing manufacturer record in the IT Inventory database
 *   using the manufacturer ID provided in the query.
 * - Logs both successful updates and any errors that occur.
 *
 * Request:
 * - Query Parameter: ?manufacturerId=<manufacturerId>
 * - Body: JSON containing the updated manufacturer fields
 *
 * Response:
 * - Success: { message: true }
 * - Error: { error: <error object> }
 *
 * @param {*} req - Express request object (expects manufacturerId in query and updated data in body)
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.updateInventoryManufacturer = (req, res) => {
    var id = req.query.manufacturerId
    var data = req.body
    ITManufacturer.findByIdAndUpdate(id, data).then(result => {
        logger.info('Manufacturer updated successfully');
        res.send(JSON.stringify({ message: true }));
    }).catch(err => {
        console.log(err)
        logger.error('Error updating manufacturer', {
            error: err
        });
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * DELETE: Remove IT Inventory Manufacturer
 *
 * Description:
 * - Deletes a specific manufacturer record from the IT Inventory database
 *   based on the provided manufacturer ID.
 * - Logs success and error details for audit and debugging purposes.
 *
 * Request:
 * - Query Parameter: ?manufacturerId=<manufacturerId>
 *
 * Response:
 * - Success: { message: true }
 * - Error: { error: <error object> }
 *
 * @param {*} req - Express request object (expects manufacturerId in query)
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.deleteInventoryManufacturer = (req, res) => {
    var id = req.query.manufacturerId
    ITManufacturer.findByIdAndDelete(id).then(result => {
        logger.info('Manufacturer deleted successfully');
        res.send(JSON.stringify({ message: true }));
    }).catch(err => {
        logger.error('Error deleting manufacturer', {
            error: err
        });
        console.log(err);
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * GET: Check if a Sub-Category name already exists in the database
 *
 * Description:
 * - This endpoint verifies whether a given sub-category name exists.
 * - It uses the query parameters from the request to search in the `SubCategory` collection.
 * - Returns `true` if the name is unique (not found), otherwise `false`.
 *
 * Request:
 * - Query Parameters: { name: <subCategoryName> }
 *
 * Response:
 * - Success:
 *   - `true` → Sub-category name is available (not found in DB)
 *   - `false` → Sub-category name already exists
 * - Error:
 *   - `{ error: <error object> }`
 *
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.checkSubCategoryName = (req, res) => {
    // console.log("checked:", req.body);
    SubCategory.findOne(req.query).then(result => {
        // console.log(result)
        if (result === null || result === undefined) {
            logger.info('Sub-category name check result');
            res.send(true)
        } else {
            res.send(false)
        }
    }).catch(err => {
        logger.error('Error checking sub-category name', {
            error: err
        });
        console.log(err);
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * GET: Check if an edited Sub-Category name is unique in the database
 *
 * Description:
 * - This endpoint is used when updating a sub-category to ensure the new name
 *   does not conflict with existing names in the `SubCategory` collection.
 * - It uses the query parameters from the request to search in the database.
 * - Returns `true` if the name is available (unique), otherwise `false`.
 *
 * Request:
 * - Query Parameters: { name: <subCategoryName> }
 *
 * Response:
 * - Success:
 *   - `true` → The edited sub-category name is available (not found in DB)
 *   - `false` → The edited sub-category name already exists
 * - Error:
 *   - `{ error: <error object> }`
 *
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.checkEditSubCategoryName = (req, res) => {

    SubCategory.findOne(req.query).then(result => {
        console.log(result)
        if (result === null || result === undefined) {
            logger.info('Edit sub-category name not available');
            res.send(true)
        } else {
            logger.info('Edit sub-category name available');
            res.send(false)
        }
    }).catch(err => {
        logger.error('Error checking edit sub-category name', {
            error: err
        });
        console.log(err);
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * GET: Check if an IT Inventory Manufacturer name exists in the database
 *
 * Description:
 * - This endpoint checks whether a manufacturer name already exists in the `ITManufacturer` collection.
 * - Uses query parameters from the request to perform the search.
 * - Returns `true` if the manufacturer name is available (unique), otherwise `false`.
 *
 * Request:
 * - Query Parameters: e.g., { name: <manufacturerName> }
 *
 * Response:
 * - Success:
 *   - `true` → Manufacturer name is available
 *   - `false` → Manufacturer name already exists
 * - Error:
 *   - `{ error: <error object> }`
 *
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.checkInventoryManufacturerName = (req, res) => {
    // console.log(req.query)
    ITManufacturer.findOne(req.query).then(result => {
        console.log(result)
        if (result === null || result === undefined) {
            logger.info('manufacturer name not available');
            res.send(true)
        } else {
            logger.info('manufacturer name  available');
            res.send(false)
        }
    }).catch(err => {
        logger.error('Error checking manufacturer name', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * GET: Check if an IT Inventory Manufacturer name is available for editing
 *
 * Description:
 * - This endpoint checks whether a manufacturer name already exists in the `ITManufacturer` collection.
 * - Used specifically when editing an existing manufacturer to ensure uniqueness.
 * - Returns `true` if the name is not used by any other document (available), otherwise `false`.
 *
 * Request:
 * - Query Parameters: e.g., { name: <manufacturerName> }
 *
 * Response:
 * - Success:
 *   - `true` → Manufacturer name is available for edit
 *   - `false` → Manufacturer name already exists
 * - Error:
 *   - `{ error: <error object> }`
 *
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.checkInventoryEditManufacturerName = (req, res) => {
    // console.log(req.query)
    ITManufacturer.findOne(req.query).then(result => {
        // console.log(result)
        if (result === null || result === undefined) {
            logger.info('Edit manufacturer name not available');
            res.send(true)
        } else {
            logger.info('Edit manufacturer name available');
            res.send(false)
        }
    }).catch(err => {
        logger.error('Error checking edit manufacturer name', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * GET: Check IT Inventory Supplier name availability
 *
 * Description:
 * - This endpoint checks whether a supplier name already exists in the `ITSupplier` collection.
 * - Returns `true` if the name is not used (available), otherwise `false`.
 *
 * Request:
 * - Query Parameters: e.g., { name: <supplierName> }
 *
 * Response:
 * - Success:
 *   - `true` → Supplier name is available
 *   - `false` → Supplier name already exists
 * - Error:
 *   - `{ error: <error object> }`
 *
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.checkInventorySupplier = (req, res) => {
    ITSupplier.findOne(req.query).then(result => {
        // console.log(result)
        if (result === null || result === undefined) {
            logger.info('Suppier name not available');
            res.send(true)
        } else {
            logger.info('Suppier name available');
            res.send(false)
        }
    }).catch(err => {
        logger.error('Error checking supplier name', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * GET: Check IT Inventory Supplier name for edit
 *
 * Description:
 * - This endpoint checks whether a supplier name already exists in the `ITSupplier` collection when editing.
 * - Returns `true` if the name is not used (available for editing), otherwise `false`.
 *
 * Request:
 * - Query Parameters: e.g., { name: <supplierName> }
 *
 * Response:
 * - Success:
 *   - `true` → Supplier name is available for editing
 *   - `false` → Supplier name already exists
 * - Error:
 *   - `{ error: <error object> }`
 *
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.checkInventoryEditSupplier = (req, res) => {

    ITSupplier.findOne(req.query).then(result => {
        // console.log(result)
        if (result === null || result === undefined) {
            logger.info('Edit Suppier name not available');
            res.send(true)
        } else {
            logger.info('Edit Suppier name available');
            res.send(false)
        }
    }).catch(err => {
        logger.error('Error checking edit supplier name', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * GET: Check IT Inventory Category name
 *
 * Description:
 * - This endpoint checks whether a category name already exists in the `InCategory` collection.
 * - Returns `true` if the category name is not used (unique), otherwise `false`.
 *
 * Request:
 * - Query Parameters: e.g., { name: <categoryName> }
 *
 * Response:
 * - Success:
 *   - `{ isUnique: true }` → Category name is available
 *   - `{ isUnique: false }` → Category name already exists
 * - Error:
 *   - `{ error: <error object> }`
 *
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.checkInventoryCategoryName = (req, res) => {
    const categoryName = req.query.name;
    // console.log("category name:", categoryName);
    InCategory.findOne({ name: categoryName }).then(result => {
        // console.log(result)
        logger.info('Inventory category name check result', {
            isUnique: result === null
        });
        res.json({ isUnique: result === null });
    }).catch(err => {
        logger.error('Error checking inventory category name', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ error: err }))
    })


}



/**
 * POST: Add a new IT Inventory category
 *
 * Description:
 * - This endpoint creates a new category in the `InCategory` collection.
 *
 * Request:
 * - Body: JSON object representing the category data (e.g., { name: "Laptops" })
 *
 * Response:
 * - Success: `{ message: 'success' }`
 * - Error: `{ error: <error object> }`
 *
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.postItcategory = (req, res) => {
    // console.log('categories', req.body)
    let newInvenCtegory = new InCategory(req.body)

    newInvenCtegory.save().then(result => {
        // console.log(result)
        logger.info('Inventory category added successfully', {
            categoryId: result._id
        });
        res.send(JSON.stringify({ message: 'success' }))
    }).catch(err => {
        logger.error('Error adding inventory category', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ error: err }))
    })
}



exports.createInventoryDash = async (req, res) => {

    // MOVE THESE OUTSIDE THE TRY BLOCK
    let subcategory = null;
    let originalSeq = null;
    let createdInventoryIDs = [];
    let createdStockIDs = [];

    try {
        const quantity = parseInt(req.query.quantity, 10);
        if (!quantity || quantity <= 0) {
            return res.status(400).send({ error: "Quantity must be a valid number" });
        }
        const inv = req.body;
        const { subCategoryName, serialNo } = inv;
        if (!Array.isArray(serialNo) || serialNo.length !== quantity) {
            return res.status(400).send({
                error: "Serial number count must match quantity"
            });
        }

        // Load subcategory
        subcategory = await SubCategory.findById(subCategoryName);
        if (!subcategory) {
            return res.status(404).send({ error: "Subcategory not found" });
        }

        const prefix = subcategory.prefix || "";
        const abbr = subcategory.abbreviatedName || "";
        const suffix = subcategory.suffix || "";
        const padding = subcategory.range || 3;

        originalSeq = subcategory.sequenceId;
        let currentSeq = originalSeq;

        // Create items
        for (let i = 0; i < quantity; i++) {
            currentSeq++;
            const padded = String(currentSeq).padStart(padding, "0");
            const finalCode = `${prefix}${abbr}${padded}${suffix}`;

            let newInv = new ItInventory({
                ...inv,
                code: finalCode,
                serialNo: serialNo[i]
            });

            const savedInv = await newInv.save();
            createdInventoryIDs.push(savedInv._id);

            let history = new ITStockHistory({
                inventoryId: savedInv._id.toString(),
                code: finalCode,
                transactionType: "create",
                status: inv.status,
                inventoryHandler: inv.creator,
                date: new Date(),
            });

            const savedHistory = await history.save();
            createdStockIDs.push(savedHistory._id);
        }

        // Update sequence only after all success
        subcategory.sequenceId = currentSeq;
        await subcategory.save();

        return res.send({
            message: "Multiple inventory items created successfully",
            count: createdInventoryIDs.length
        });

    } catch (err) {
        console.error("Error occurred, starting rollback:", err);

        // SAFE ROLLBACK
        try {
            if (createdStockIDs.length) {
                await ITStockHistory.deleteMany({ _id: { $in: createdStockIDs } });
            }

            if (createdInventoryIDs.length) {
                await ItInventory.deleteMany({ _id: { $in: createdInventoryIDs } });
            }

            if (subcategory && originalSeq !== null) {
                subcategory.sequenceId = originalSeq;
                await subcategory.save();
            }

        } catch (rollbackErr) {
            console.error("Rollback FAILED — DB may be inconsistent:", rollbackErr);
        }

        return res.status(500).send({
            error: "Operation failed. All created items have been rolled back.",
            details: err.message
        });
    }
};



/**
 * PUT: Update IT Inventory Dash
 * This function updates an existing IT inventory item in the database.
 * 
 * Steps:
 * 1. Retrieve the inventory ID from the request query parameters.
 * 2. Retrieve the updated data from the request body.
 * 3. Log the update request for debugging and auditing purposes.
 * 4. Use `findByIdAndUpdate` to update the inventory item in the database.
 *    - The `new: true` option returns the updated document.
 * 5. Log the updated inventory item.
 * 6. Send the updated inventory item as the response.
 * 7. Catch and log any errors, sending an error response if update fails.
 * 
 * @param {*} req - HTTP request object, expects `id` in query and updated fields in body
 * @param {*} res - HTTP response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.updateInventoryDash = (req, res) => {
    // console.log("update IT inventory:", req.query);
    const inventoryId = req.query.id;
    const updateData = req.body;
    logger.info('Updating IT inventory dash', {
        query: req.query,
        updateData: req.body
    });
    ItInventory.findByIdAndUpdate(inventoryId, updateData, { new: true }).then(updateInventory => {
        logger.debug('Updated inventory item', {
            inventoryId: updateInventory
        });
        console.log("updated inventory", updateInventory)
        res.send(JSON.stringify(updateInventory))
    }).catch(err => {
        logger.error('Error updating inventory item', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * GET: Fetch IT Inventory items based on filter criteria
 * 
 * This function retrieves IT inventory items from the database according to 
 * the filter criteria provided in the request body. Supports pagination
 * via query parameters `page` and `limit`.
 * 
 * Steps:
 * 1. Extract filter criteria from `req.body`.
 * 2. Extract pagination parameters `page` and `limit` from query parameters.
 *    - Default page = 1, limit = 10
 *    - Calculate `skip` for MongoDB pagination.
 * 3. Remove any empty fields from the filter to avoid invalid queries.
 * 4. Build the MongoDB query object based on available filter fields:
 *    - categoryName, subCategoryName, manufacturer
 * 5. Query the `ItInventory` collection with:
 *    - Sorting by `_id` descending (most recent first)
 *    - Pagination using `.skip(skip).limit(limit)`
 *    - Populating references: manufacturer, supplier, categoryName, subCategoryName
 * 6. Count total documents matching the filter for pagination info.
 * 7. Construct the response object including:
 *    - `inventoryItems` - the fetched inventory items
 *    - `totalPages` - total number of pages based on count and limit
 *    - `currentPage` - current page number
 *    - `filter` - the applied filter criteria
 * 8. Send the response as JSON.
 * 9. Catch and log any errors and send an error response if fetching fails.
 * 
 * @param {*} req - HTTP request object
 *                    - Body: filter criteria { category, subcategory, manufacturer }
 *                    - Query: pagination { page, limit }
 * @param {*} res - HTTP response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.getInventoryByFilter = (req, res) => {
    // console.log("request body", req.body)
    let filter = req.body;
    let currentPage = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (currentPage - 1) * limit;
    // Remove empty filter fields
    if (!filter.category) delete filter.category;
    if (!filter.subcategory) delete filter.subcategory;
    if (!filter.manufacturer) delete filter.manufacturer;
    // Build the query object
    let query = {};
    if (filter.category) query.categoryName = (filter.category);
    if (filter.subcategory) query.subCategoryName = (filter.subcategory);
    if (filter.manufacturer) query.manufacturer = (filter.manufacturer);
    // Find inventory items based on the query and populate references
    ItInventory.find(query)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate('manufacturer')
        .populate('supplier')
        .populate('categoryName')
        .populate('subCategoryName')
        .then(inventoryItems => {
            return ItInventory.countDocuments(query).then(count => {
                console.log("Total Documents Count:", count);
                logger.info('Fetched inventory items by filter', {
                    totalDocuments: count
                });
                return { inventoryItems, count };
            });
        })
        .then(({ inventoryItems, count }) => {
            // Calculate total number of pages
            let totalPages = Math.ceil(count / limit);
            // Construct response object
            let response = {
                inventoryItems, // Include the fetched inventory items
                totalPages, // Include the total number of pages
                currentPage, // Include the current page number
                filter // Include the filter criteria in the response
            };
            logger.info('Inventory filter response', {
                response
            });
            // Send response
            res.send(response);
        })
        .catch(err => {
            console.log(err);
            logger.error('Error fetching inventory by filter', {
                error: err
            });
            res.send(JSON.stringify({ error: err }));
        });
};



/**
 * GET: Fetch IT Stock History by Inventory ID
 * 
 * This function retrieves the stock history of a specific IT inventory item
 * based on the provided inventory ID. It also populates references for
 * better readability of related data.
 * 
 * Steps:
 * 1. Extract the `inventoryId` filter from the query parameters.
 * 2. Log the request for tracking and debugging.
 * 3. Query the `ITStockHistory` collection to find all stock history records
 *    that match the given inventory ID.
 * 4. Populate the following references:
 *    - `inventoryId` to include inventory details
 *    - `issuedTo` to include the user or entity to whom the stock was issued
 * 5. Send the retrieved stock history data as a JSON response with HTTP status 200.
 * 6. Catch and log any errors that occur during the query and send the error as JSON.
 * 
 * @param {*} req - HTTP request object
 *                    - Query: { filter: inventoryId }
 * @param {*} res - HTTP response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.getITStockHistoryByInventoryId = (req, res) => {
    const filter = req.query.filter;

    // console.log("IT stock inventory----", req.body);
    console.log("filter query:", filter);
    logger.info('Fetching IT stock history by inventory ID', {
        inventoryId: filter
    });
    ITStockHistory.find({ inventoryId: filter })
        .populate('inventoryId')
        .populate('issuedTo').then(ITStockHistory => {
            console.log('data', ITStockHistory)
            logger.info('Fetched IT stock history');
            res.status(200).json(ITStockHistory);
        }).catch(err => {
            console.log(err);
            logger.error('Error fetching IT stock history', {
                error: err
            });
            res.status(200).json(err);

        })
};



/**
 * POST: Handle returned stock in IT Inventory
 * 
 * This function records a returned stock transactionType for an IT inventory item
 * and updates the corresponding inventory details.
 * 
 * Steps:
 * 1. Extract `inventory` and `stock` data from the request body.
 * 2. Create a new IT stock history record with transactionType, status,
 *    quantity, handler, issue details, and note.
 * 3. Save the stock history record in `ITStockHistory`.
 * 4. Upon successful save, update the corresponding inventory item in `ItInventory`:
 *    - Update fields based on the returned stock.
 *    - Mark the inventory transactionType as 'returned'.
 * 5. Save the updated inventory record and send a JSON response containing:
 *    - A success message
 *    - The newly created stock history record
 *    - The updated inventory record
 * 6. If updating the inventory fails:
 *    - Roll back the previously saved stock history record
 *    - Log errors and send a JSON error response
 * 7. If saving the stock history fails initially, log the error and send an internal server error response.
 * 
 * @param {*} req - HTTP request object
 *                    - Body: { inventory: {}, stock: {} }
 * @param {*} res - HTTP response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.postReturnedStockInventory = (req, res) => {
    console.log("IT Returned body", req.body);
    const { inventory, stock } = req.body
    const newITStockHistory = new ITStockHistory({
        inventoryId: stock.inventoryId,
        transactionType: stock.transactionType,
        status: stock.status,
        inventoryHandler: stock.inventoryHandler,
        quantity: stock.quantity,
        code: inventory.code,
        issuedTo: stock.issuedTo,
        date: stock.date,
        note: stock.note
    });
    newITStockHistory.save()
        .then(result => {
            console.log("IT stock history result", result);
            logger.info('Saved new IT stock history');
            // Update the inventory
            ItInventory.findByIdAndUpdate(inventory._id, inventory)
                .then(ITInventoryResult => {
                    ITInventoryResult.transactionType = 'returned';
                    console.log("inventory result for update", ITInventoryResult);
                    logger.info('Updated inventory with returned stock');
                    ITInventoryResult.save()
                    res.send(JSON.stringify({
                        message: 'Inventory and stockDetails updated successfully',
                        stockHistoryResult: result,
                        inventoryResult: ITInventoryResult
                    }));
                })
                .catch(err => {
                    console.error("Error updating inventory:", err);
                    logger.error('Error processing returned stock inventory', {
                        error: err
                    });
                    // Rollback by deleting the previously saved stock history record
                    newITStockHistory.deleteOne({ _id: result._id.toString() })
                        .then(() => {
                            res.send(JSON.stringify({
                                error: 'Inventory and stockDetails update failed, rolled back the stock history record'
                            }));
                        })
                        .catch(deleteErr => {
                            logger.error('Error rolling back stock history record', {
                                error: deleteErr
                            });
                            console.error("Error rolling back stock history record:", deleteErr);
                            res.send.json({
                                error: 'Inventory and stockDetails update failed, and rollback failed as well'
                            });
                        });
                });
        })
        .catch(error => {
            console.error("Error saving IT Stock History:", error);
            logger.error('Internal server error in returned section')
            res.send(JSON.stringify({ error: 'Internal server error' }));
        });
}



/**
 * POST: Process issued stock in IT Inventory
 * 
 * This function records an issued stock transactionType for an IT inventory item
 * and updates the corresponding inventory details.
 * 
 * Steps:
 * 1. Extract `inventory` and `stock` data from the request body.
 * 2. Create a new IT stock history record with transactionType, status,
 *    quantity, handler, issuedTo, date, and note.
 * 3. Save the stock history record in `ITStockHistory`.
 * 4. Upon successful save, update the corresponding inventory item in `ItInventory`:
 *    - Update fields based on the issued stock.
 *    - Mark the inventory transactionType as 'issue'.
 * 5. Save the updated inventory record and send a JSON response containing:
 *    - A success message
 *    - The newly created stock history record
 *    - The updated inventory record
 * 6. If updating the inventory fails:
 *    - Roll back the previously saved stock history record
 *    - Log errors and send a JSON error response
 * 7. If saving the stock history fails initially, log the error and return a 500 internal server error response.
 * 
 * @param {*} req - HTTP request object
 *                    - Body: { inventory: {}, stock: {} }
 * @param {*} res - HTTP response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.postIssuedStockInventory = (req, res) => {
    logger.info('Processing issued stock inventory', {
        requestBody: req.body
    });
    const { inventory, stock } = req.body
    const newITStockHistory = new ITStockHistory({
        inventoryId: stock.inventoryId,
        transactionType: stock.transactionType,
        status: stock.status,
        inventoryHandler: stock.inventoryHandler,
        quantity: stock.quantity,
        code: inventory.code,
        issuedTo: stock.issuedTo,
        date: stock.date,
        note: stock.note
    });
    newITStockHistory.save()
        .then(result => {
            logger.info('Saved new IT stock history');
            // Update the inventory
            ItInventory.findByIdAndUpdate(inventory._id, inventory)
                .then(ITInventoryResult => {
                    ITInventoryResult.transactionType = 'issue';
                    // console.log("inventory result for update", ITInventoryResult);
                    ITInventoryResult.save()
                    res.send(JSON.stringify({
                        message: 'Inventory and stockDetails updated successfully',
                        stockHistoryResult: result,
                        inventoryResult: ITInventoryResult
                    }));
                })
                .catch(err => {
                    console.error("Error updating inventory:", err);
                    logger.error('Error processing issued stock inventory', {
                        error: err
                    });
                    // Rollback by deleting the previously saved stock history record
                    newITStockHistory.deleteOne({ _id: result._id.toString() })
                        .then(() => {
                            res.send(JSON.stringify({
                                error: 'Inventory and stock details update failed, rolled back the stock history record'
                            }));
                        })
                        .catch(deleteErr => {
                            logger.error('Error rolling back stock history record', {
                                error: deleteErr
                            });
                            console.error("Error rolling back stock history record:", deleteErr);
                            res.send.json({
                                error: 'Inventory and stockDetails update failed, and rollback failed as well'
                            });
                        });
                });
        })
        .catch(error => {
            console.error("Error saving IT Stock History:", error);
            logger.error('Error in issued section saving IT Stock History')
            res.status(500).json({ error: 'Internal server error' });
        });
}



/**
 * GET: Retrieve issued stock data for a specific IT inventory item
 * 
 * This function fetches all stock history records where the transactionType is 'issue'
 * for a given inventory ID.
 * 
 * Steps:
 * 1. Extract `inventoryId` from the request query parameters.
 * 2. Query `ITStockHistory` for records with:
 *    - `inventoryId` matching the provided ID
 *    - `transactionType` equal to 'issue'
 * 3. If successful, return the list of issued stock history records.
 * 4. If an error occurs, log the error and return it in the response.
 * 
 * @param {*} req - HTTP request object
 *                    - Query: { id: inventoryId }
 * @param {*} res - HTTP response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.getITIssuedDataByInventoryId = (req, res) => {
    const inventoryId = req.query.id; // Extract the inventory ID from the query parameters
    ITStockHistory.find({ inventoryId: inventoryId, transactionType: 'issue' }).then(ITStockHistory => {
        logger.info('Fetched issued inventory data');
        res.send(ITStockHistory);
    }).catch(err => {
        logger.error('Error fetching issued data by inventory ID', {
            error: err
        });
        console.log(err)
        res.send(err)
    })
}



/**
 * POST: Update the status of a specific IT inventory item
 * 
 * This function updates the `status` field of an inventory item in the database.
 * 
 * Steps:
 * 1. Extract `inventoryId` and new `status` from the request body.
 * 2. Use `findByIdAndUpdate` to update the inventory item's status.
 *    - `new: true` ensures the updated document is returned.
 * 3. If the inventory item is not found, return a 404 response.
 * 4. If successful, log the update and return a success message.
 * 5. If an error occurs, log the error and return it in the response.
 * 
 * @param {*} req - HTTP request object
 *                    - Body: { inventoryId: string, status: string }
 * @param {*} res - HTTP response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.postUpdateStatus = (req, res) => {
    const { inventoryId, status } = req.body;
    // Update inventory status using Mongoose
    ItInventory.findByIdAndUpdate(inventoryId, { status }, { new: true })
        .then(updatedInventory => {
            if (!updatedInventory) {
                logger.warn('Inventory item not found for status update', {
                    inventoryId
                });
                return res.status(404).json({ error: 'Inventory item not found' });
            }
            logger.info('Updated inventory status successfully', {
                inventoryId
            });
            res.send(JSON.stringify({ message: 'Inventory item, stock history, and subcategory updated successfully' }));
        })
        .catch(err => {
            logger.error('Error updating inventory status', {
                error: err
            });
            res.send(JSON.stringify({ error: err }));
        });
}



exports.getITSupplierNameList = async (req, res) => {
  try {

    const suppliers = await ITSupplier.find().lean();

    if (!suppliers.length) {
      logger.warn('No IT suppliers found in the database');

      return res.status(200).json({
        success: true,
        message: 'No IT suppliers found',
        count: 0,
        data: {
          list: [],
          map: {}
        }
      });
    }

    // Return consistent property name: supplierName
    const formattedSuppliers = suppliers.map(s => ({
      _id: s._id,
      supplierName: s.supplierName,
      contact: s.contact || '',
      email: s.email || '',
      address: s.address || '',
      type: s.type || 'Local'
    }));

    const supplierMap = formattedSuppliers.reduce((acc, curr) => {
      acc[curr._id] = curr.supplierName;
      return acc;
    }, {});

    logger.info('Fetched IT supplier names successfully', {
      count: formattedSuppliers.length
    });

    return res.status(200).json({
      success: true,
      message: 'IT supplier names retrieved successfully',
      count: formattedSuppliers.length,
      data: {
        list: formattedSuppliers,
        map: supplierMap
      }
    });

  } catch (error) {

    logger.error('Error fetching IT supplier names', {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching IT supplier names'
    });
  }
};



exports.getITManufacturerNameList = async (req, res) => {
    try {
        // Fetch all manufacturers with lean for performance
        const manufacturers = await ITManufacturer.find().lean();

        // Handle empty result set
        if (!manufacturers.length) {
            logger.warn('No IT manufacturers found in the database');
            return res.status(200).json({
                success: true,
                message: 'No IT manufacturers found',
                count: 0,
                data: {
                    list: [],
                    map: {}
                }
            });
        }

        // Format manufacturer data
        const formattedManufacturers = manufacturers.map(m => ({
            _id: m._id,
            name: m.manufacturerName
        }));

        // Create a key-value map for quick lookup
        const manufacturerMap = formattedManufacturers.reduce((acc, curr) => {
            acc[curr._id] = curr.name;
            return acc;
        }, {});

        // Log success with metadata
        logger.info('Fetched IT manufacturer names successfully', {
            count: formattedManufacturers.length
        });

        // Send structured success response
        return res.status(200).json({
            success: true,
            message: 'IT manufacturer names fetched successfully',
            count: formattedManufacturers.length,
            data: {
                list: formattedManufacturers,
                map: manufacturerMap
            }
        });
    } catch (error) {
        // Log error with full details
        logger.error('Error fetching IT manufacturer names', {
            error: error.message,
            stack: error.stack
        });

        // Send clean error response to client
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while fetching IT manufacturer names'
        });
    }
};



exports.getITSubCategoryNameList = async (req, res) => {
    try {
        // Fetch all subcategories
        const subcategories = await SubCategory.find().populate('categoryName').lean();

        // Handle case when no data found
        if (!subcategories.length) {
            logger.warn('No IT subcategories found in the database');
            return res.status(200).json({
                success: true,
                message: 'No IT subcategories found',
                count: 0,
                data: [],
            });
        }

        // Format data into two structures: list & map
        const formattedSubcategories = subcategories
        // .map(sub => ({
        //     _id: sub._id,
        //     name: sub.subCategoryName,
        //     category: sub.categoryName
        // }));

        const subCategoryMap = formattedSubcategories.reduce((acc, curr) => {
            acc[curr._id] = curr.subCategoryName;
            return acc;
        }, {});

        // Log success with count
        logger.info('Fetched IT subcategory names successfully', {
            count: formattedSubcategories.length,
        });

        // Send structured response
        return res.status(200).json({
            success: true,
            message: 'IT subcategory names fetched successfully',
            count: formattedSubcategories.length,
            data: {
                list: formattedSubcategories,
                map: subCategoryMap,
            },
        });
    } catch (error) {
        // Log internal error details for debugging
        logger.error('Error fetching IT subcategory names', {
            error: error.message,
            stack: error.stack,
        });

        // Send safe client-facing response
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while fetching IT subcategory names',
        });
    }
};



exports.getITCategoryNameList = async (req, res) => {
    try {
        // Fetch all categories
        const categories = await InCategory.find().lean();

        // Handle empty result
        if (!categories.length) {
            logger.warn('No IT categories found in the database');
            return res.status(200).json({
                success: true,
                message: 'No IT categories found',
                count: 0,
                data: [],
            });
        }

        // Build a structured response with both `_id` and `name`
        const formattedCategories = categories.map(cat => ({
            _id: cat._id,
            name: cat.name,
        }));

        // Optionally create a key-value map (if still needed)
        const categoryMap = formattedCategories.reduce((acc, curr) => {
            acc[curr._id] = curr.name;
            return acc;
        }, {});

        // Log success
        logger.info('Fetched IT category names successfully', {
            count: formattedCategories.length,
        });

        // Send response
        return res.status(200).json({
            success: true,
            message: 'IT category names fetched successfully',
            count: formattedCategories.length,
            data: {
                list: formattedCategories,
                map: categoryMap,
            },
        });
    } catch (error) {
        // Log detailed error info
        logger.error('Error fetching IT category names', {
            error: error.message,
            stack: error.stack,
        });

        // Send clean error response
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while fetching IT category names',
        });
    }
};



/**
 * POST: Upload IT Inventory CSV
 * 
 * This function processes an array of IT inventory items from the request body
 * and performs the following operations for each item:
 * 
 * 1. Fetch the corresponding subcategory using the subCategoryName ID.
 *    - If the subcategory does not exist, return an error response.
 * 2. Increment the subcategory's sequenceId and format it to generate a unique inventory code.
 * 3. Create a new ItInventory document with the provided inventory details and the generated code.
 * 4. Save the new ItInventory document to the database.
 * 5. Update and save the subcategory with the incremented sequenceId.
 * 6. Create a corresponding ITStockHistory document to track the inventory creation transactionType.
 * 7. Save the ITStockHistory document.
 *    - If saving fails, rollback the newly created inventory and subcategory changes.
 * 8. Repeat the above steps for all inventory items in the CSV array.
 * 9. Log all major steps and errors for monitoring and debugging.
 * 10. Return a JSON response indicating success or failure of the upload operation.
 * 
 * @param {*} req - HTTP request object containing CSV inventory data in the body
 * @param {*} res - HTTP response object used to send success or error messages
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.uploadInventoryCSVFile = async (req, res) => {
    try {
        let ITInventories = req.body;
        logger.info('Processing IT inventory upload', { itemCount: ITInventories.length });
        for (let ITInventory of ITInventories) {
            const subCategory = await SubCategory.findOne({ _id: ITInventory.subCategoryName });

            if (!subCategory) {
                logger.warn('Subcategory not found');
                return res.json({ error: 'Subcategory not found' });
            }
            subCategory.sequenceId += 1;
            let incrementedSequenceId = subCategory.sequenceId;
            let formattedSequenceId = incrementedSequenceId.toString().padStart(4, '0');
            let inventoryId = `${subCategory.abbreviatedName}-${formattedSequenceId}`;
            // Create new ITInventory document
            const newITInventory = new ItInventory({
                code: inventoryId,
                creator: ITInventory.creator,
                status: ITInventory.status,
                transactionType: ITInventory.transactionType,
                categoryName: ITInventory.categoryName,
                subCategoryName: ITInventory.subCategoryName,
                manufacturer: ITInventory.manufacturer,
                supplier: ITInventory.supplier,
                amount: ITInventory.amount,
                quantity: ITInventory.quantity,
                modelNo: ITInventory.modelNo,
                serialNo: ITInventory.serialNo,
                purchaseDate: ITInventory.purchaseDate,
                warrantyDate: ITInventory.warrantyDate,
                inputVoltage: ITInventory.inputVoltage,
                key: ITInventory.key,
                subscriptionStart: ITInventory.subscriptionStart,
                subscriptionEnd: ITInventory.subscriptionEnd,
                cpu: ITInventory.cpu,
                ram: ITInventory.ram,
                drive: ITInventory.drive,
                systemConfig: ITInventory.systemConfig,
                licenseInEff: ITInventory.licenseInEff,
                msEffect: ITInventory.msEffect,
                ipAddress: ITInventory.ipAddress,
                internetAccess: ITInventory.internetAccess,
                softwareInstalled: ITInventory.softwareInstalled,
                lastUse: ITInventory.lastUse,
                description: ITInventory.description,
            });
            // Save the new ITInventory document
            const savedITInventory = await newITInventory.save();
            // Save the updated SubCategory with incremented sequenceId
            await subCategory.save();
            // Create new ITStockHistory document
            const newITStockHistory = new ITStockHistory({
                inventoryId: savedITInventory._id.toString(),
                transactionType: savedITInventory.transactionType,
                status: savedITInventory.status,
                inventoryHandler: savedITInventory.creator,
                code: savedITInventory.code,
                issuedTo: null,
                quantity: savedITInventory.quantity,
                date: ITInventory.modifiedDate,
                note: null
            });
            try {
                await newITStockHistory.save();
                logger.info('IT stock history saved');
            } catch (err) {
                logger.error('Error saving IT stock history', {
                    error: err
                });
                console.log('IT Stock History Error', err);
                await ItInventory.deleteOne({ _id: savedComponent._id });
                subCategory.sequenceId -= 1;
                await subCategory.save();
                return res.send(JSON.stringify({ error: err }));
            }
        }
        logger.info('IT inventory file uploaded successfully');
        // Return success message
        res.json({ message: 'IT Inventory File Uploaded Successfully', status: 'success' });
    } catch (error) {
        logger.error('Error uploading inventory', {
            error: error
        });
        res.json({ error: 'Internal Server Error' });
    }
};



/**
 * POST: Search Inventory in IT-Inventory
 * 
 * This function allows searching IT inventory items based on a search text.
 * It performs a case-insensitive search across multiple fields, including:
 *   - code, creator, description, serialNo, inputVoltage, key, modelNo
 *   - cpu, ram, drive, systemConfig, licenseInEff, msEffect
 *   - ipAddress, softwareInstalled, internetAccess, lastUse
 * 
 * Pagination is supported using query parameters:
 *   - page: current page number (default is 1)
 *   - limit: number of items per page (default is 10)
 * 
 * Steps:
 * 1. Construct a case-insensitive regex from the search text.
 * 2. Query the ItInventory collection to find documents matching any of the fields.
 * 3. Apply pagination using skip and limit.
 * 4. Populate references for categoryName, subCategoryName, manufacturer, and supplier.
 * 5. Count the total number of matching documents to calculate total pages.
 * 6. Construct a response object including:
 *    - fetched inventory items
 *    - totalPages
 *    - currentPage
 * 7. Log the search operation and send the response as JSON.
 * 8. Catch and log any errors during the search and respond with an error message.
 * 
 * @param {*} req - HTTP request object containing search text and pagination query params
 * @param {*} res - HTTP response object used to send search results or errors
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.searchInventoryData = (req, res) => {
    let searchCriteria = req.body.searchInventoryText;
    let searchRegex = new RegExp(searchCriteria, 'i');
    let currentPage = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (currentPage - 1) * limit;
    ItInventory.find({
        $or: [
            { code: searchRegex },
            { creator: searchRegex },
            { description: searchRegex },
            { serialNo: searchRegex },
            { inputVoltage: searchRegex },
            { key: searchRegex },
            { modelNo: searchRegex },
            { cpu: searchRegex },
            { ram: searchRegex },
            { drive: searchRegex },
            { systemConfig: searchRegex },
            { licenseInEff: searchRegex },
            { msEffect: searchRegex },
            { ipAddress: searchRegex },
            { softwareInstalled: searchRegex },
            { internetAccess: searchRegex },
            { lastUse: searchRegex }
        ]
    })
        .skip(skip)
        .limit(limit)
        .populate('categoryName')
        .populate('subCategoryName')
        .populate('manufacturer')
        .populate('supplier')
        .then(inventories => {
            // Count total documents matching the search query
            return ItInventory.countDocuments({
                $or: [
                    { code: searchRegex },
                    { creator: searchRegex },
                    { description: searchRegex },
                    { serialNo: searchRegex },
                    { inputVoltage: searchRegex },
                    { key: searchRegex },
                    { modelNo: searchRegex },
                    { cpu: searchRegex },
                    { ram: searchRegex },
                    { drive: searchRegex },
                    { systemConfig: searchRegex },
                    { licenseInEff: searchRegex },
                    { msEffect: searchRegex },
                    { ipAddress: searchRegex },
                    { softwareInstalled: searchRegex },
                    { lastUse: searchRegex }
                ]
            }).then(count => ({ inventories, count }));
        })
        .then(({ inventories, count }) => {
            // Calculate total number of pages
            let totalPages = Math.ceil(count / limit);
            // Construct the response object
            let response = {
                inventories: inventories, // Include the fetched inventory items
                totalPages: totalPages, // Total number of pages
                currentPage: currentPage // Current page number
            };
            logger.info('Searched IT inventory data');
            // Send the response
            res.status(200).json(response);
        })
        .catch(err => {
            logger.error('Error searching IT inventory data', {
                error: err
            });
            res.send(JSON.stringify({ error: err }));
        });
}



/**
 * GET: Fetch IT Assigned User Data
 * 
 * This function retrieves all IT inventory items that have been issued to a specific user.
 * 
 * Steps:
 * 1. Extract the `issuedUser` parameter (employee code) from the query string.
 * 2. Search for the user in the `User` collection using the provided employee code.
 * 3. If the user does not exist, log a warning and return an error response.
 * 4. If the user exists, query the `ItInventory` collection to find all inventory items
 *    where the `user` field matches the user's ID and the `transactionType` type is 'issue'.
 * 5. Populate the `user` reference to include user details in the result.
 * 6. Log the successful retrieval and send the stock history data as JSON.
 * 7. Catch and log any errors that occur during the process and return a 500 error response.
 * 
 * @param {*} req - HTTP request object containing `issuedUser` query parameter
 * @param {*} res - HTTP response object used to send the assigned inventory data or errors
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.getITAssignedUserData = async (req, res) => {
    try {
        let employeeCode = req.query.issuedUser;
        // Find the user based on employeeCode
        const user = await User.findOne({ employeeCode });
        if (!user) {
            logger.warn('User not found', { employeeCode });
            return res.json({ error: 'User is not found' });
        }
        // Find stock history entries for the user and populate componentId
        const stockHistory = await ItInventory.find({ user: user._id, transactionType: 'issue' }).populate('user');
        logger.info('Fetched IT stock history for user');

        res.json(stockHistory);
    } catch (err) {
        logger.error('Error fetching IT assigned user data', {
            error: err
        });
        console.error(err);
        res.json({ error: 'Internal Server Error' });
    }
}



/**
 * GET: Fetch IT Stock History for a Specific Issued User
 * 
 * This function retrieves all IT stock history records for a user who has been issued inventory.
 * 
 * Steps:
 * 1. Extract the `issuedUser` parameter (employee code) from the query string.
 * 2. Search for the user in the `User` collection using the provided employee code.
 * 3. If the user does not exist, log a warning and return an error response.
 * 4. If the user exists, query the `ITStockHistory` collection to find all records 
 *    where the `issuedTo` field matches the user's ID.
 * 5. Populate the `inventoryId` reference to include the corresponding inventory item details.
 * 6. Log the successful retrieval and send the stock history data as JSON.
 * 7. Catch and log any errors that occur during the process and return a 500 error response.
 * 
 * @param {*} req - HTTP request object containing `issuedUser` query parameter
 * @param {*} res - HTTP response object used to send the user's IT stock history data or errors
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.getUserITStockHistory = async (req, res) => {
    try {
        let employeeCode = req.query.issuedUser;
        // Find the user based on employeeCode
        const user = await User.findOne({ employeeCode });
        if (!user) {
            logger.warn('User not found', { employeeCode });
            return res.json({ error: 'User is not found' });
        }
        // Find stock history entries for the user and populate componentId
        const stockHistory = await ITStockHistory.find({ issuedTo: user._id }).populate('inventoryId');
        logger.info('Fetched user IT stock history');
        // console.log(stockHistory)
        res.json(stockHistory);
    } catch (err) {
        logger.error('Error fetching user IT stock history', {
            error: err
        });
        res.json({ error: 'Internal Server Error' });
    }
}



/**
 * GET: Fetch IT Stock Summary
 * 
 * This function generates a summary of IT inventory across all subcategories.
 * For each subcategory, it calculates counts of assets based on their status
 * and transactionType type, such as working, issued, scrap, dead, repairable, under repair/AMC, 
 * and under maintenance/AMC. It also calculates in-stock assets.
 * 
 * Steps:
 * 1. Retrieve all subcategories from the database.
 * 2. Initialize an empty summary object.
 * 3. For each subcategory:
 *    a. Fetch all inventory items belonging to that subcategory.
 *    b. Skip subcategories with no inventory items.
 *    c. Initialize counters for each asset status/type.
 *    d. Iterate through the inventory items to increment relevant counters.
 *    e. Calculate in-stock assets (total - issued - scrap).
 *    f. Push the subcategory summary into the summary object under its category.
 *    g. Log processing details for debugging.
 * 4. Convert the summary object to an array for frontend compatibility.
 * 5. Return the final summarized stock data as JSON.
 * 6. Catch and log any errors occurring at any stage and return a 500 response if necessary.
 * 
 * @param {*} req - HTTP request object
 * @param {*} res - HTTP response object used to send summarized stock data or errors
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.getITStockSummary = async (req, res) => {
    try {
        let subCategories = await SubCategory.find();
        let summary = {};
        for (let subCategory of subCategories) {
            try {
                let assets = await ItInventory.find({
                    categoryName: subCategory.categoryName,
                    subCategoryName: subCategory._id
                });
                if (assets.length > 0) {
                    let categoryKey = subCategory.categoryName.toString();
                    if (!summary[categoryKey]) {
                        summary[categoryKey] = {
                            category: subCategory.categoryName,
                            subCategories: []
                        };
                    }
                    // Initialize counters for asset types
                    let totalAssets = assets.length;
                    let workingAssets = 0;
                    let issuedAssets = 0;
                    let scrapAssets = 0;
                    let deadAssets = 0;
                    let repairableAssets = 0;
                    let underRepairAsset = 0;
                    let underRepairAMCAsset = 0;
                    let underMaintenanceAsset = 0;
                    let underMaintenanceAMCAsset = 0;
                    // Count the assets based on transactionType and status
                    assets.forEach(asset => {
                        if (asset.status === 0) {
                            workingAssets++;
                        }
                        if (asset.transactionType === 'issue') {
                            issuedAssets++;
                        }
                        if (asset.status === 1) {
                            deadAssets++;
                        }
                        if (asset.status === 2) {
                            repairableAssets++;
                        }
                        if (asset.status === 3) {
                            scrapAssets++;
                        }
                        if (asset.status === 4) {
                            underRepairAsset++;
                        }
                        if (asset.status === 5) {
                            underRepairAMCAsset++;
                        }
                        if (asset.status === 6) {
                            underMaintenanceAsset++;
                        }
                        if (asset.status === 7) {
                            underMaintenanceAMCAsset++;
                        }
                    });
                    // Calculate in-stock assets
                    let inStockAssets = totalAssets - issuedAssets - scrapAssets;
                    // Push the calculated data into the summary object
                    summary[categoryKey].subCategories.push({
                        subCategory: subCategory._id.toString(),
                        totalAssets: totalAssets,
                        workingAssets: workingAssets,
                        inStockAssets: inStockAssets,
                        scrapAssets: scrapAssets,
                        deadAssets: deadAssets,
                        repairableAssets: repairableAssets,
                        underRepairAsset: underRepairAsset,
                        underRepairAMCAsset: underRepairAMCAsset,
                        underMaintenanceAsset: underMaintenanceAsset,
                        underMaintenanceAMCAsset: underMaintenanceAMCAsset,
                        issuedAssets: issuedAssets
                    });
                    logger.info('Subcategory Processed Successfully')
                    logger.debug('Processed subcategory', {
                        subCategoryId: subCategory._id.toString(),
                        categoryName: subCategory.categoryName,
                        totalAssets,
                        workingAssets,
                        issuedAssets,
                        inStockAssets,
                        scrapAssets,
                        deadAssets,
                        repairableAssets,
                        underRepairAsset,
                        underRepairAMCAsset,
                        underMaintenanceAsset,
                        underMaintenanceAMCAsset
                    });
                }
            } catch (err) {
                logger.error('Error processing subcategory', {
                    error: err
                });
            }
        }
        let formattedSummary = Object.values(summary);
        logger.info('IT stock summary generated', {
            totalCategories: Object.keys(summary).length
        });
        // Send the final summary to the frontend
        res.json(formattedSummary);
    } catch (err) {
        logger.error('Error fetching IT stock summary', {
            error: err
        });
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
};



/**
 * Export IT Assets as CSV
 * 
 * This function fetches IT inventory assets based on the provided category 
 * and optional subcategory, and sends the data to the client. The intention 
 * is to allow exporting the inventory data as a CSV file.
 * 
 * Steps:
 * 1. Extract `category` and `subCategory` from the request body.
 * 2. Build a query object with the category. 
 *    - If subCategory is provided and not empty, include it in the query.
 * 3. Fetch inventory items from the database that match the query.
 * 4. Send the fetched assets as a response.
 * 5. Log successful export or any errors encountered.
 * 
 * @param {*} req - HTTP request object containing category and optional subCategory
 * @param {*} res - HTTP response object used to send inventory data or errors
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.exportAssetCSVFile = (req, res) => {
    console.log('', req.body)
    let category = req.body.category
    let subCategory = req.body.subCategory

    let query = {
        categoryName: category.toString(),
    };

    if (subCategory && subCategory.trim() !== '') {
        query.subCategoryName = subCategory.toString();
    }

    ItInventory.find(query).then(assets => {
        res.send(assets)
        logger.info('Export data successfully sended')
    }).catch(err => {
        logger.error('asset error', err)
        res.send(JSON.stringify({ error: err }));
    })

}
