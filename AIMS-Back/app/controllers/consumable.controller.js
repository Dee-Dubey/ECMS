
const consumableCategory = require('../models/admin-department/consumable/consumable-category.model.js');
const consumableSupplier = require('../models/admin-department/consumable/consumable-supplier.model.js');
const consumableLocation = require('../models/admin-department/consumable/consumable-location.model.js');
const consumableHistory = require('../models/admin-department/consumable/consumable-history.model.js');
const Item = require('../models/admin-department/consumable/consumable-item.model.js'); 4
const LineItem = require('../models/admin-department/consumable/consumable-line-item.model.js');
const Challan = require('../models/admin-department/consumable/consumable-challan.model.js');
const Bill = require('../models/admin-department/consumable/consumable-bill.model.js')

const logger = require('../../logger');



/** 
 * ========================================================================================================
 * Category section controller File
 * 
 */
/**
 * Get Consumable Category Name List
 * --------------------------------
 * This API retrieves all consumable category records from the database
 * and returns them in a structured format for frontend usage.
 *
 * The response includes:
 *  - A formatted list of category objects (id + name)
 *  - A map of categoryId → categoryName for quick lookup
 *
 * This API is typically used for:
 *  - Dropdown population
 *  - Fast ID-to-name resolution in the UI
 *
 * Response Structure:
 *  - success : Boolean indicating request status
 *  - message : Descriptive status message
 *  - count   : Total number of categories
 *  - data    :
 *      • list : Array of category objects
 *      • map  : Object mapping categoryId to categoryName
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Created On: 25 October 2025
 * Last Modified: 22 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.getConsumableCategoryNames = async (req, res) => {
    try {
        const categories = await consumableCategory
            .find({}, { categoryName: 1 })
            .lean();

        const list = categories.map(category => ({
            _id: category._id,
            categoryName: category.categoryName
        }));

        const map = {};
        for (const item of list) {
            map[item._id] = item.categoryName;
        }

        logger.info('Consumable category names fetched', {
            count: list.length
        });

        return res.status(200).json({
            success: true,
            message: 'Consumable category names fetched successfully',
            count: list.length,
            data: {
                list,
                map
            }
        });

    } catch (error) {
        logger.error('Failed to fetch consumable category names', {
            error: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch consumable category names'
        });
    }
};

/**
 * Create Consumable Category
 * -------------------------
 * This API creates a new consumable category record in the database
 * using the data provided in the request body.
 *
 * Typical Use Cases:
 *  - Adding a new consumable category from the admin panel
 *  - Managing consumable master data
 *
 * Expected Request Body:
 *  {
 *    "categoryName": "ABC Category",
 *    "contact": "1234567890",
 *    "email": "abc@category.com"
 *  }
 *
 * Response:
 *  - Success:
 *      { message: "Category is Added" }
 *
 *  - Error:
 *      { error: <error object> }
 *
 * @param {Object} req - Express request object containing category data in req.body
 * @param {Object} res - Express response object
 *
 * Created On: 25 October 2025
 * Last Modified: 22 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.createConsumableCategory = async (req, res) => {
    try {
        const categoryPayload = req.body;

        if (!categoryPayload || Object.keys(categoryPayload).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Consumable category data is required'
            });
        }

        const createdCategory = await consumableCategory.create(categoryPayload);

        logger.info('Consumable category created successfully', {
            categoryId: createdCategory._id
        });

        return res.status(201).json({
            success: true,
            message: 'Consumable category created successfully',
            data: createdCategory
        });

    } catch (error) {
        logger.error('Error creating consumable category', { error });

        // Duplicate key (unique category name / code)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Consumable category already exists',
                error: error.keyValue
            });
        }

        // Mongoose validation error
        if (error.name === 'ValidationError') {
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to create consumable category'
        });
    }
};

/**
 * Update Consumable Category
 * -------------------------
 * This API updates an existing consumable category record
 * in the database using the provided category ID.
 *
 * Expected Request:
 *  - Query Parameters:
 *      • id : MongoDB document ID of the consumable category
 *
 *  - Request Body:
 *      • JSON object containing category fields to be updated
 *
 * Response:
 *  - Success:
 *      { message: "successful updated" }
 *
 *  - Error:
 *      { message: <error object> }
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Created On: 25 October 2025
 * Last Modified: 22 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.updateConsumableCategory = (req, res) => {
    const id = req.params.id;   // 👈 FIX HERE
    const data = req.body;

    consumableCategory.findByIdAndUpdate(id, data, { new: true })
        .then(result => {
            res.json({
                success: true,
                message: 'Successfully updated',
                data: result
            });
            logger.info('Consumable category updated successfully', { id });
        })
        .catch(err => {
            logger.error('Error updating consumable category', { error: err });
            res.status(500).json({ message: err.message });
        });
};


/**
 * Delete Consumable Category
 * -------------------------
 * This API deletes a consumable category record from the database
 * using the category ID provided in the request query parameters.
 *
 * Expected Request:
 *  - Query Parameters:
 *      • id : MongoDB document ID of the consumable category
 *
 * Response:
 *  - Success:
 *      { message: true }
 *
 *  - Error:
 *      { error: <error object> }
 *
 * @param {Object} req - Express request object (expects category ID in query)
 * @param {Object} res - Express response object
 *
 * Created On: 25 October 2025
 * Last Modified: 22 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.deleteConsumableCategory = (req, res) => {
    var id = req.query.id;
    consumableCategory.findByIdAndDelete(id).then(result => {
        logger.info('Category deleted successfully');
        res.send(JSON.stringify({ message: true }));
    }).catch(err => {
        console.log(err);
        logger.error('Error deleting category', {
            error: err
        });
        res.send(JSON.stringify({ error: err }));
    });
}

/**
 * Check Consumable Category Name Availability
 * -------------------------------------------
 * This API checks whether a consumable category name already exists
 * in the `consumableCategory` collection.
 *
 * It is commonly used while:
 *  - Creating a new consumable category
 *  - Editing an existing category to avoid duplicate names
 *
 * Expected Request:
 *  - Query Parameters:
 *      • categoryName : Name of the consumable category to check
 *
 * Response:
 *  - Success:
 *      • true  → Category name is available (does NOT exist)
 *      • false → Category name already exists
 *
 *  - Error:
 *      • { error: <error object> }
 *
 * @param {Object} req - Express request object containing categoryName in query
 * @param {Object} res - Express response object
 *
 * Created On: 25 October 2025
 * Last Modified: 22 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.checkConsumableCategory = (req, res) => {
    consumableCategory.findOne(req.query).then(result => {
        // console.log(result)
        if (result === null || result === undefined) {
            logger.info('Category name not available');
            res.send(true);
        } else {
            logger.info('Category name available');
            res.send(false);
        }
    }).catch(err => {
        logger.error('Error checking category name', {
            error: err
        });
        console.log(err);
        res.send(JSON.stringify({ error: err }));
    })
}

/**
 * Check Consumable Category Name Availability (Edit Mode)
 * -------------------------------------------------------
 * This API checks whether a consumable category name already exists
 * in the `consumableCategory` collection while editing a category.
 *
 * This endpoint is typically used to:
 *  - Validate category name changes during edit operations
 *  - Prevent duplicate category names in the system
 *
 * Expected Request:
 *  - Query Parameters:
 *      • categoryName : New category name to validate
 *
 * Response:
 *  - Success:
 *      • true  → Category name is available for editing (does NOT exist)
 *      • false → Category name already exists
 *
 *  - Error:
 *      • { error: <error object> }
 *
 * @param {Object} req - Express request object containing categoryName in query
 * @param {Object} res - Express response object
 *
 * Created On: 25 October 2025
 * Last Modified: 22 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.checkConsumableEditCategory = (req, res) => {

    consumableCategory.findOne(req.query).then(result => {
        // console.log(result)
        if (result === null || result === undefined) {
            logger.info('Edit Category name not available');
            res.send(true);
        } else {
            logger.info('Edit Category name available');
            res.send(false);
        }
    }).catch(err => {
        logger.error('Error checking edit category name', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ error: err }));
    });
}



/** 
 * ========================================================================================================
 * Supplier section controller File
 * 
 */
/**
 * Get Consumable Supplier Names
 * --------------------------------
 * This API retrieves all consumable supplier records from the database
 * and returns them in both list and key-value map formats for flexible
 * frontend consumption.
 *
 * Database Operation:
 *  - Fetches all documents from the consumableSupplier collection
 *  - Uses `.lean()` for optimized read performance
 *
 * Response Structure:
 *  - success : Boolean indicating request status
 *  - message : API response message
 *  - count   : Total number of suppliers found
 *  - data    :
 *      • list : Array of suppliers [{ _id, supplierName }]
 *      • map  : Object mapping supplierId → supplierName
 *
 * Process Flow:
 *  1. Fetch all consumable suppliers from the database.
 *  2. Handle case when no suppliers are found.
 *  3. Format supplier data into a list structure.
 *  4. Generate an ID-to-name map from the supplier list.
 *  5. Log successful retrieval with record count.
 *  6. Return structured success response.
 *  7. Log and handle unexpected errors gracefully.
 *
 * @route   GET /consumable/supplier
 * @access  Public / Authorized (as per middleware)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Last Modified: 23 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.getConsumableSupplier = async (req, res) => {
    try {
        const suppliers = await consumableSupplier.find().lean();

        if (!suppliers.length) {
            logger.warn('No Consumable suppliers found in the database');
            return res.status(404).json({
                success: false,
                message: 'No Consumable suppliers found',
                count: 0,
                data: [],
            });
        }

        // Send full supplier data
        const formattedSuppliers = suppliers;

        logger.info('Fetched Consumable suppliers successfully', {
            count: formattedSuppliers.length,
        });

        return res.status(200).json({
            success: true,
            message: 'Consumable suppliers retrieved successfully',
            count: formattedSuppliers.length,
            data: formattedSuppliers,   // 👈 now sending full data
        });

    } catch (error) {
        logger.error('Error fetching Consumable suppliers', {
            error: error.message,
            stack: error.stack,
        });

        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while fetching Consumable suppliers',
        });
    }
};

/**
 * POST: Add a new Consumable Supplier
 *
 * Description:
 * - Creates a new Consumable supplier document in the database.
 * - Logs success or error for monitoring.
 *
 * Request Body Example:
 * {
 *   "supplierName": "ABC Suppliers",
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
exports.createConsumableSupplier = async (req, res) => {
    try {
        const newSupplier = new consumableSupplier(req.body);
        const result = await newSupplier.save();

        logger.info('Supplier added successfully', { supplierId: result._id });

        return res.status(201).json({
            success: true,
            message: 'Supplier added successfully',
            data: result
        });

    } catch (err) {
        logger.error('Error adding supplier', { error: err });

        // Mongoose validation error
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(err.errors).map(e => e.message)
            });
        }

        // Duplicate key error (unique index)
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Supplier already exists'
            });
        }

        // Fallback: internal server error
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * PUT: Update Consumable Supplier
 *
 * Description:
 * - Updates supplier details in the Consumable database 
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
exports.updateConsumableSupplier = async (req, res) => {

    const { id } = req.params;

    try {

        const updatedSupplier = await consumableSupplier.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedSupplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        logger.info('Consumable supplier updated successfully', { id });

        return res.status(200).json({
            success: true,
            message: 'Supplier updated successfully',
            data: updatedSupplier
        });

    } catch (err) {

        logger.error('Error updating consumable supplier', { error: err });

        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Supplier name already exists'
            });
        }

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * DELETE: Remove Consumable Supplier
 *
 * Description:
 * - Deletes a supplier record from the consumable database 
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
exports.deleteConsumableSupplier = (req, res) => {
    var id = req.query.id;
    consumableSupplier.findByIdAndDelete(id).then(result => {
        logger.info('Supplier deleted successfully');
        res.send(JSON.stringify({ message: true }));
    }).catch(err => {
        console.log(err);
        logger.error('Error deleting supplier', {
            error: err
        });
        res.send(JSON.stringify({ error: err }));
    });
}

/**
 * GET: Check Consumable Supplier name availability
 *
 * Description:
 * - This endpoint checks whether a supplier name already exists in the `consumableSupplier` collection.
 * - Returns `true` if the supplierName is not used (available), otherwise `false`.
 *
 * Request:
 * - Query Parameters: e.g., { supplierName: <supplierName> }
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
exports.checkConsumableSupplier = (req, res) => {
    consumableSupplier.findOne(req.query).then(result => {
        // console.log(result)
        if (result === null || result === undefined) {
            logger.info('Supplier name not available');
            res.send(true);
        } else {
            logger.info('Supplier name available');
            res.send(false);
        }
    }).catch(err => {
        logger.error('Error checking supplier name', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ error: err }));
    })
}

/**
 * GET: Check consumable Supplier name for edit
 *
 * Description:
 * - This endpoint checks whether a supplier name already exists in the `consumableSupplier` collection when editing.
 * - Returns `true` if the supplierName is not used (available for editing), otherwise `false`.
 *
 * Request:
 * - Query Parameters: e.g., { supplierName: <supplierName> }
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
exports.checkConsumableEditSupplier = (req, res) => {

    consumableSupplier.findOne(req.query).then(result => {
        // console.log(result)
        if (result === null || result === undefined) {
            logger.info('Edit Supplier name not available');
            res.send(true);
        } else {
            logger.info('Edit Supplier name available');
            res.send(false);
        }
    }).catch(err => {
        logger.error('Error checking edit supplier name', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ error: err }));
    });
}



/** 
 * ========================================================================================================
 * Location section controller File
 * 
 */
/**
 * Get Consumable Location Names
 * --------------------------------
 * This API retrieves all consumable location records from the database
 * and returns them in both list and key-value map formats to support
 * flexible frontend usage and fast lookups.
 *
 * Database Operation:
 *  - Fetches all documents from the consumableLocation collection
 *  - Uses `.lean()` for improved read performance
 *
 * Response Structure:
 *  - success : Boolean indicating request status
 *  - message : API response message
 *  - count   : Total number of locations found
 *  - data    :
 *      • list : Array of locations [{ _id, locationName }]
 *      • map  : Object mapping locationId → locationName
 *
 * Process Flow:
 *  1. Fetch all consumable locations from the database.
 *  2. Handle scenario when no locations are found.
 *  3. Format location data into a simplified list structure.
 *  4. Generate an ID-to-name map for quick lookup.
 *  5. Log successful retrieval with record count.
 *  6. Return structured success response.
 *  7. Log and handle unexpected errors gracefully.
 *
 * @route   GET /consumable/location-name
 * @access  Public / Authorized (as per middleware)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Last Modified: 23 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.getConsumableLocationNameList = async (req, res) => {
    try {

        const location = await consumableLocation.find().lean();

        if (!location.length) {
            logger.warn('No Consumable location found in the database');
            return res.status(404).json({
                success: false,
                message: 'No Consumable location found',
                count: 0,
                data: {
                    list: [],
                    map: {}
                }
            });
        }

        // ✅ INCLUDE shelfLocation
        const formattedLocation = location.map(m => ({
            _id: m._id,
            locationName: m.locationName,
            shelfLocation: m.shelfLocation   // 👈 ADDED
        }));

        // ✅ Include shelfLocation in map also
        const locationMap = formattedLocation.reduce((acc, curr) => {
            acc[curr._id] = {
                locationName: curr.locationName,
                shelfLocation: curr.shelfLocation
            };
            return acc;
        }, {});

        logger.info('Fetched Consumable location names successfully', {
            count: formattedLocation.length
        });

        return res.status(200).json({
            success: true,
            message: 'Consumable location names fetched successfully',
            count: formattedLocation.length,
            data: {
                list: formattedLocation,
                map: locationMap
            }
        });

    } catch (error) {

        logger.error('Error fetching Consumable location names', {
            error: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while fetching Consumable location names'
        });
    }
};


/**
 * POST: Add a new Consumable Location
 *
 * Description:
 * - Creates a new Consumable location document in the database.
 * - Logs success or error for monitoring.
 *
 * Request Body Example:
 * {
 *   "locationName": "ABC location",
 *   "contact": "1234567890",
 *   "email": "abc@location.com"
 * }
 *
 * Response:
 * - Success: { message: "Location is Added" }
 * - Error: { error: <error object> }
 *
 * @param {*} req - Express request object containing location data in req.body
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.createConsumableLocation = async (req, res) => {
    try {
        const newLocation = new consumableLocation(req.body);
        const result = await newLocation.save();

        logger.info('Location added successfully', { locationId: result._id });

        return res.status(201).json({
            success: true,
            message: 'Location added successfully',
            data: result
        });

    } catch (err) {
        logger.error('Error adding location', { error: err });

        // Mongoose validation error
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(err.errors).map(e => e.message)
            });
        }

        // Duplicate key error (unique index)
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Location already exists'
            });
        }

        // Fallback: internal server error
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }

}

/**
 * PUT: Update Consumable Location
 *
 * Description:
 * - Updates location details in the Consumable database 
 *   using the provided location ID.
 * - Logs both successful updates and any errors encountered.
 *
 * Request:
 * - Query Parameter: ?locationId=<locationId>
 * - Body: JSON object containing location fields to update
 *
 * Response:
 * - Success: { message: true }
 * - Error: { error: <error object> }
 *
 * @param {*} req - Express request object (expects locationId in query and updated data in body)
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.updateConsumableLocation = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
        const updatedLocation = await consumableLocation.findByIdAndUpdate(
            id,
            data,
            {
                new: true,          // return updated document
                runValidators: true // enforce schema rules
            }
        );

        // No document found
        if (!updatedLocation) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        logger.info('Consumable location updated successfully', { id });

        return res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            data: updatedLocation
        });

    } catch (err) {
        logger.error('Error updating consumable location', { error: err });

        // Duplicate key (unique constraint)
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Location already exists'
            });
        }

        // Validation error
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(err.errors).map(e => e.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }

}

/**
 * DELETE: Remove Consumable Location
 *
 * Description:
 * - Deletes a location record from the consumable database 
 *   using the location ID provided in the query.
 * - Logs both successful deletions and any errors encountered.
 *
 * Request:
 * - Query Parameter: ?locationId=<locationId>
 *
 * Response:
 * - Success: { message: true }
 * - Error: { error: <error object> }
 *
 * @param {*} req - Express request object (expects locationId in query)
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.deleteConsumableLocation = (req, res) => {
    var id = req.query.id;
    consumableLocation.findByIdAndDelete(id).then(result => {
        logger.info('Location deleted successfully');
        res.send(JSON.stringify({ message: true }));
    }).catch(err => {
        console.log(err);
        logger.error('Error deleting location', {
            error: err
        });
        res.send(JSON.stringify({ error: err }));
    });
}

/**
 * GET: Check Consumable Location name availability
 *
 * Description:
 * - This endpoint checks whether a location name already exists in the `consumableLocation` collection.
 * - Returns `true` if the locationName is not used (available), otherwise `false`.
 *
 * Request:
 * - Query Parameters: e.g., { locationName: <locationName> }
 *
 * Response:
 * - Success:
 *   - `true` → Location name is available
 *   - `false` → Location name already exists
 * - Error:
 *   - `{ error: <error object> }`
 *
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.checkConsumableLocation = async (req, res) => {

    const { locationName, shelfLocation } = req.query;

    try {
        const existing = await consumableLocation.findOne({
            locationName,
            shelfLocation   // ✅ now checking both
        });

        if (!existing) {
            res.send(true);
            logger.info('Location name not available');
        } else {
            res.send(false);
            logger.info('location name available');
        }

    } catch (err) {
        logger.error('Error checking location name', { error: err });
        res.status(500).json({ error: err });
    }
};

/**
 * GET: Check consumable Location name for edit
 *
 * Description:
 * - This endpoint checks whether a location name already exists in the `consumableLocation` collection when editing.
 * - Returns `true` if the locationName is not used (available for editing), otherwise `false`.
 *
 * Request:
 * - Query Parameters: e.g., { locationName: <locationName> }
 *
 * Response:
 * - Success:
 *   - `true` → Location name is available for editing
 *   - `false` → location name already exists
 * - Error:
 *   - `{ error: <error object> }`
 *
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.checkConsumableEditLocation = async (req, res) => {

    const { locationName, shelfLocation } = req.query;

    try {
        const existing = await consumableLocation.findOne({
            locationName,
            shelfLocation
        });

        if (!existing) {
            res.send(true);
            logger.info('Edit Location name not available');
        } else {
            res.send(false);
            logger.info('Edit Location name available');
        }

    } catch (err) {
        logger.error('Error checking edit location name', { error: err });
        res.status(500).json({ error: err });
    }
};



/** 
 * ========================================================================================================
 * Item name section controller File
 * 
 */
/**
 * Create Consumable Item
 * --------------------------------
 * This API creates a new consumable item record after validating
 * the associated consumable category and request payload.
 *
 * Expected Request:
 *  - Request Body:
 *      • category  : MongoDB ObjectId of the consumable category (required)
 *      • itemName  : Name of the consumable item (must be unique)
 *      • Other item-related fields as per Item schema
 *
 * Validation Rules:
 *  - Category ID must exist in the consumableCategory collection
 *  - itemName must be unique
 *  - Request body must satisfy schema validation
 *
 * Process Flow:
 *  1. Read category ID from request body.
 *  2. Validate existence of the referenced category.
 *  3. Create a new item document using request data.
 *  4. Save the item to the database.
 *  5. Return created item with success response.
 *  6. Handle duplicate item name conflicts.
 *  7. Handle schema validation and unexpected errors.
 *
 * Response Codes:
 *  - 201 : Item created successfully
 *  - 404 : Category not found
 *  - 409 : Duplicate item name
 *  - 400 : Validation error
 *  - 500 : Internal server error
 *
 * @route   POST /consumable/item
 * @access  Authorized (as per middleware)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Last Modified: 23 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.createItem = async (req, res) => {
    try {

        const { category, itemName } = req.body;

        /* ================= CATEGORY CHECK ================= */

        const categoryExists = await consumableCategory.findById(category);

        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        /* ================= ITEM DUPLICATE CHECK ================= */

        const existingItem = await Item.findOne({
            itemName: { $regex: new RegExp(`^${itemName}$`, 'i') }
        });

        if (existingItem) {
            return res.status(409).json({
                success: false,
                message: 'Item name already exists, Try using a unique name.'
            });
        }

        /* ================= CREATE ITEM ================= */

        const newItem = new Item(req.body);
        const savedItem = await newItem.save();

        return res.status(201).json({
            success: true,
            message: 'Item created successfully',
            data: savedItem
        });

    } catch (error) {

        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Item with this name already exists'
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


/**
 * Fetch Consumable Items
 * --------------------------------
 * This API retrieves all consumable item records from the database
 * and returns them as a list for frontend consumption.
 *
 * Database Operation:
 *  - Fetches all documents from the Item collection
 *  - Uses `.lean()` for optimized read performance
 *
 * Response Behavior:
 *  - Returns an empty array when no items are found (not treated as an error)
 *
 * Process Flow:
 *  1. Query the database for all consumable items.
 *  2. Convert Mongoose documents to plain objects using lean().
 *  3. Return item list with success response.
 *  4. Gracefully handle empty data scenarios.
 *  5. Handle and log unexpected errors.
 *
 * Response Codes:
 *  - 200 : Items fetched successfully (with or without data)
 *  - 500 : Failed to fetch items due to server error
 *
 * @route   GET /consumable/item
 * @access  Authorized / Public (as per middleware)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Last Modified: 23 January 2026
 * Modified By: Raza A [AS-127]
 */
const mongoose = require('mongoose');

exports.fetchItems = async (req, res) => {
    try {

        // 1️⃣ Get all items first (without populate)
        let items = await Item.find().lean();

        // 2️⃣ Separate valid ObjectId locations
        const validLocationIds = items
            .map(item => item.location)
            .filter(loc => mongoose.Types.ObjectId.isValid(loc));

        // 3️⃣ Fetch matching locations
        const locations = await mongoose.model('consumableLocation')
            .find({ _id: { $in: validLocationIds } })
            .lean();

        // 4️⃣ Create location map
        const locationMap = {};
        locations.forEach(loc => {
            locationMap[loc._id.toString()] = loc.locationName;
        });

        // 5️⃣ Attach safe locationName
        items = items.map(item => ({
            ...item,
            location: mongoose.Types.ObjectId.isValid(item.location) ? { locationName: locationMap[item.location] || '-' } : { locationName: item.location } // old string remains
        }));

        // 6️⃣ Populate category normally (since category data is clean)
        items = await Item.populate(items, {
            path: 'category',
            select: 'categoryName'
        });

        return res.status(200).json({
            success: true,
            message: 'Items fetched successfully',
            data: items
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch items'
        });
    }
};


/**
 * Update Consumable Item
 * --------------------------------
 * This API updates an existing consumable item record based on
 * the provided item ID and update payload.
 *
 * Expected Request:
 *  - Path Params:
 *      • id : MongoDB ObjectId of the item to be updated (required)
 *
 *  - Request Body:
 *      • Any updatable item fields as defined in the Item schema
 *        (itemName, category, quantity, unit, price, etc.)
 *
 * Validation Rules:
 *  - Item ID must be a valid MongoDB ObjectId
 *  - itemName must remain unique
 *  - Update payload must satisfy schema validation rules
 *
 * Process Flow:
 *  1. Read item ID from request parameters.
 *  2. Read update data from request body.
 *  3. Update item using findByIdAndUpdate with validation enabled.
 *  4. Return updated item document on success.
 *  5. Handle item-not-found scenario.
 *  6. Handle duplicate key, validation, and cast errors.
 *  7. Handle unexpected server errors gracefully.
 *
 * Response Codes:
 *  - 200 : Item updated successfully
 *  - 404 : Item not found
 *  - 409 : Duplicate item name
 *  - 400 : Validation or invalid data error
 *  - 500 : Failed to update item
 *
 * @route   PUT /consumable/item/:id
 * @access  Authorized (as per middleware)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Last Modified: 23 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.updateItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const updateData = req.body;

        const updatedItem = await Item.findByIdAndUpdate(
            itemId,
            updateData,
            {
                new: true,          // return updated document
                runValidators: true // enforce schema rules on update
            }
        );

        // 3. Item not found
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Item updated successfully',
            data: updatedItem
        });

    } catch (error) {
        console.error(error);

        // Duplicate key (unique itemName)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Item with this name already exists'
            });
        }

        // Validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors
            });
        }

        // Cast error (extra safety)
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to update item'
        });
    }
};

/**
 * Get Consumable Item By ID
 * --------------------------------
 * This API retrieves a single consumable item record from the database
 * using the provided item ID.
 *
 * Expected Request:
 *  - Path Params:
 *      • id : MongoDB ObjectId of the item (required)
 *
 * Database Operation:
 *  - Fetches item document from the Item collection
 *  - Uses `.lean()` for optimized read performance
 *
 * Process Flow:
 *  1. Read item ID from request parameters.
 *  2. Query database for the specified item.
 *  3. Handle item-not-found scenario.
 *  4. Return item data on successful retrieval.
 *  5. Handle unexpected server errors.
 *
 * Response Codes:
 *  - 200 : Item retrieved successfully
 *  - 404 : Item not found
 *  - 500 : Internal server error
 *
 * @route   GET /consumable/item/:id
 * @access  Authorized / Public (as per middleware)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Last Modified: 23 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.getItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await Item.findById(id).lean();

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: item
        });

    } catch (error) {
        // 5. Unexpected error
        console.error('getItemById error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};



/** 
 * ========================================================================================================
 * Challan section controller File
 * 
 */
/**
 * Create Challan Entry With Items
 * --------------------------------
 * This API creates a new challan record along with its associated
 * line items in a single transactional flow.
 *
 * Expected Request:
 *  - Request Body:
 *      • items        : Array of line items (required, minimum one item)
 *      • supplier     : Supplier reference/details
 *      • companyName  : Company name associated with challan
 *      • Other challan-related fields as per Challan schema
 *
 * Database Operations:
 *  - Creates a challan document in the Challan collection
 *  - Inserts related line items into the LineItem collection
 *  - Updates challan document with associated item references
 *
 * Validation Rules:
 *  - At least one item must be provided in the request
 *
 * Process Flow:
 *  1. Extract items and challan data from request body.
 *  2. Validate presence of at least one line item.
 *  3. Create challan record without items.
 *  4. Enrich line items with challan reference and shared metadata.
 *  5. Bulk insert line items into database.
 *  6. Update challan with references to inserted line items.
 *  7. Return challan ID and item count on success.
 *  8. Handle unexpected errors gracefully.
 *
 * Response Codes:
 *  - 201 : Challan and items created successfully
 *  - 400 : Invalid request (no items provided)
 *  - 500 : Failed to create challan
 *
 * @route   POST /consumable/challan
 * @access  Authorized (as per middleware)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Last Modified: 23 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.challanEntry = async (req, res) => {
    try {

        const { items = [], ...rest } = req.body;

        if (!items.length) {
            return res.status(400).json({
                success: false,
                message: 'Challan must contain at least one item'
            });
        }

        const savedChallan = await Challan.create(rest);

        const formattedItems = items.map(item => ({
            ...item,
            challanNumber: savedChallan._id,
            supplier: savedChallan.supplier,
            companyName: savedChallan.companyName
        }));

        const savedItems = await LineItem.insertMany(formattedItems);
        
        const bulkInventoryOps = savedItems.map(item => ({
            updateOne: {
                filter: { _id: item.itemName },
                update: {
                    $inc: {totalIntake: item.quantity }
                }
            }
        }))

        console.log('bulk inventory ops', bulkInventoryOps)

        await Item.bulkWrite(bulkInventoryOps)

        await Challan.findByIdAndUpdate(
            savedChallan._id,
            { $push: { items: { $each: savedItems.map(i => i._id) } } }
        );

        return res.status(201).json({
            success: true,
            message: 'Challan and items saved successfully',
            data: {
                challanId: savedChallan._id,
                itemCount: savedItems.length
            }
        });

    } catch (err) {

        console.error('Challan Entry Error:', err);

        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Challan number already exists'
            });
        }

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(err.errors).map(e => e.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Fetch All Challans With Items
 * --------------------------------
 * This API retrieves all challan records from the database along with
 * their associated line items.
 *
 * Database Operations:
 *  - Fetches all challan documents from the Challan collection
 *  - Populates related line items from the LineItem collection
 *  - Sorts populated items by creation date in descending order
 *
 * Response Behavior:
 *  - Returns an empty array when no challans are found
 *  - Empty results are treated as a successful response
 *
 * Process Flow:
 *  1. Query database for all challan records.
 *  2. Populate associated line items for each challan.
 *  3. Apply sorting on populated items (latest first).
 *  4. Return challan list with success response.
 *  5. Handle unexpected server errors gracefully.
 *
 * Response Codes:
 *  - 200 : Challans fetched successfully (with or without data)
 *  - 500 : Failed to fetch challans
 *
 * @route   GET /consumable/challan
 * @access  Authorized (as per middleware)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Last Modified: 23 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.fetchChallan = async (req, res) => {
    try {

        // 🔥 Only fetch challans without billNumber
        const challans = await Challan.find({
            $or: [
                { billNumber: { $exists: false } },
                { billNumber: null }
            ]
        })
            .populate({
                path: 'items',
                options: { sort: { createdAt: -1 } }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Available challans fetched successfully',
            data: challans
        });

    } catch (error) {
        console.error('Fetch Challans Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch challans',
            error: error.message
        });
    }
};

/**
 * Fetch Challan By ID With Items
 * --------------------------------
 * This API retrieves a single challan record from the database
 * using the provided challan ID along with its associated line items.
 *
 * Expected Request:
 *  - Path Params:
 *      • id : MongoDB ObjectId of the challan (required)
 *
 * Database Operations:
 *  - Fetches challan document from the Challan collection
 *  - Populates associated line items from the LineItem collection
 *  - Sorts populated items by creation date (latest first)
 *
 * Validation Rules:
 *  - Challan ID must be provided
 *  - Challan ID must be a valid MongoDB ObjectId
 *
 * Process Flow:
 *  1. Read challan ID from request parameters.
 *  2. Validate challan ID presence.
 *  3. Query database for the specified challan.
 *  4. Populate related line items with sorting applied.
 *  5. Handle challan-not-found scenario.
 *  6. Return challan data on successful retrieval.
 *  7. Handle invalid ID format and unexpected errors.
 *
 * Response Codes:
 *  - 200 : Challan fetched successfully
 *  - 400 : Missing or invalid challan ID
 *  - 404 : Challan not found
 *  - 500 : Failed to fetch challan
 *
 * @route   GET /consumable/challan/:id
 * @access  Authorized (as per middleware)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Last Modified: 23 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.fetchChallanById = async (req, res) => {
    try {
        const { id: challanId } = req.params;

        if (!challanId) {
            return res.status(400).json({
                success: false,
                message: 'Challan ID is required'
            });
        }

        const challan = await Challan.findById(challanId).populate({
            path: 'items',
            options: { sort: { createdAt: -1 } }
        });

        if (!challan) {
            return res.status(404).json({
                success: false,
                message: 'Challan not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Challan fetched successfully',
            data: challan
        });

    } catch (error) {
        console.error('Fetch Challan By ID Error:', error);

        // Invalid ObjectId case
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid challan ID format'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch challan',
            error: error.message
        });
    }
};

/**
 * Update Challan By ID With Item Synchronization
 * ----------------------------------------------
 * This API updates an existing challan record and synchronizes its
 * associated line items by handling create, update, and delete
 * operations in a controlled transactional-like flow.
 *
 * Expected Request:
 *  - Path Params:
 *      • id : MongoDB ObjectId of the challan to be updated (required)
 *
 *  - Request Body:
 *      • items : Array of line items (existing and/or new)
 *          - Existing items must include `_id`
 *          - New items must omit `_id`
 *      • Other updatable challan fields
 *        (supplier, companyName, dates, totals, etc.)
 *
 * Database Operations:
 *  - Updates challan fields in the Challan collection
 *  - Updates existing line items in the LineItem collection
 *  - Creates new line items when `_id` is not provided
 *  - Deletes removed line items no longer associated with the challan
 *
 * Synchronization Rules:
 *  - Existing items missing from incoming payload are deleted
 *  - Items with `_id` are updated
 *  - Items without `_id` are created and linked to the challan
 *  - Challan item references are fully rebuilt after synchronization
 *
 * Rollback Strategy:
 *  - Tracks created, deleted, and updated items
 *  - On failure:
 *      • Newly created items are removed
 *      • Deleted items are restored
 *      • Original challan state is restored
 *  - Ensures data consistency in partial failure scenarios
 *
 * Process Flow:
 *  1. Validate challan existence by ID.
 *  2. Backup original challan and item state.
 *  3. Update challan-level fields.
 *  4. Determine items to create, update, and delete.
 *  5. Apply item-level changes sequentially.
 *  6. Rebuild challan item references.
 *  7. Commit changes or rollback on failure.
 *
 * Response Codes:
 *  - 200 : Challan updated successfully
 *  - 404 : Challan not found
 *  - 500 : Update failed, rollback attempted
 *
 * @route   PUT /consumable/challan/:id
 * @access  Authorized (as per middleware)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Last Modified: 23 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.updateChallanById = async (req, res) => {
    let createdItems = [];
    let deletedItemsBackup = [];
    let updatedItemsBackup = [];
    let originalChallan;

    try {
        const challanId = req.params.id;
        const { items = [], ...challanUpdates } = req.body;

        const challan = await Challan.findById(challanId);
        if (!challan) {
            return res.status(404).json({
                success: false,
                message: 'Challan is not found'
            })
        }

        originalChallan = challan

        const existingItemIds = challan.items.map(id => id.toString());

        Object.assign(challan, challanUpdates)
        await challan.save();

        const itemsToUpdate = items.filter(i => i._id);
        const itemsToCreate = items.filter(i => !i._id);
        const incomingItemIds = itemsToUpdate.map(i => i._id.toString());

        const itemsToDelete = existingItemIds.filter(id => !incomingItemIds.includes(id));

        if (itemsToDelete.length > 0) {
            deletedItemsBackup = LineItem.find({ _id: { $in: itemsToDelete } })
            await LineItem.deleteMany({ _id: { $in: itemsToDelete } })
        }

        for (const item of itemsToUpdate) {
            const existingItem = await LineItem.findById(item._id);
            updatedItemsBackup.push(existingItem);

            item.challanNumber = challan._id
            item.supplier = challan.supplier,
                item.companyName = challan.companyName
            console.log('item', item)
            await LineItem.findByIdAndUpdate(item._id, item);
        }

        if (itemsToCreate.length > 0) {
            const payload = itemsToCreate.map(item => ({
                ...item,
                challanNumber: challan._id,
                supplier: challan.supplier,
                companyName: challan.companyName
            }));

            console.log('PAYLOAD', payload)
            const createdItems = await LineItem.insertMany(payload);
        }

        challan.items = [
            ...incomingItemIds,
            ...createdItems.map(i => i._id)
        ]

        await challan.save()

    } catch (error) {
        console.log('Update Challan failed rolling Back', error);

        try {
            if (createdItems.length > 0) {
                await LineItem.deleteMany({
                    _id: { $in: createdItems.map(i => i._id) }
                })
            }

            if (deletedItemsBackup.length > 0) {
                await LineItem.insertMany(deletedItemsBackup);
            }

            await Challan.findByIdAndUpdate(originalChallan._id, originalChallan)

        } catch (error) {
            console.log('Roll back process is failed')
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to update challan. Rollback attempted.',
            error: error.message
        });
    }

}



/** 
 * ========================================================================================================
 * Bill section controller File
 * 
 */
/** */
exports.billEntry = async (req, res) => {

    console.log('------', req.body);

    try {

        const {
            BillDate,
            billNumber,
            challanIds = [],
            items = [],
            supplier,
            companyName,
            GSTNumber,
            totalQuantity,
            totalBaseAmount,
            totalGSTAmount,
            totalAmount
        } = req.body;

        /* ================= BASIC VALIDATION ================= */

        if (!BillDate || !billNumber) {
            return res.status(400).json({
                success: false,
                message: 'Bill Date and Bill Number are required'
            });
        }

        if (!challanIds.length && !items.length) {
            return res.status(400).json({
                success: false,
                message: 'Either Challan or Items must be provided'
            });
        }

        /* =====================================================
           🔥 NEW: SUPPLIER VALIDATION FOR MULTIPLE CHALLANS
        ====================================================== */

        if (challanIds.length && supplier) {

            const challans = await Challan.find({
                _id: { $in: challanIds }
            }).select('supplier challanNumber');

            const mismatchedChallans = challans.filter(
                c => c.supplier.toString() !== supplier
            );

            if (mismatchedChallans.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected challan belongs to different supplier',
                    mismatchedData: mismatchedChallans.map(c => ({
                        challanNumber: c.challanNumber,
                        supplier: c.supplier
                    }))
                });
            }
        }

        /* ================= CREATE ITEMS (CASE 2 & 3) ================= */

        let savedItems = [];

        if (items.length) {

            const formattedItems = items.map(item => ({
                ...item,
                supplier,
                companyName
            }));

            savedItems = await LineItem.insertMany(formattedItems);
        }

        /* ================= CREATE BILL ================= */

        const newBill = await Bill.create({
            BillDate,
            billNumber,
            challanNumber: challanIds.length ? challanIds : [],
            items: savedItems.length ? savedItems.map(i => i._id) : [],
            supplier,
            companyName,
            GSTNumber,
            totalQuantity,
            totalBaseAmount,
            totalGSTAmount,
            totalAmount
        });

        /* ================= UPDATE CHALLAN WITH BILL ID ================= */

        if (challanIds.length) {
            await Challan.updateMany(
                { _id: { $in: challanIds } },
                { $set: { billNumber: newBill._id } }
            );
        }

        return res.status(201).json({
            success: true,
            message: 'Bill saved successfully',
            data: {
                billId: newBill._id,
                challanCount: challanIds.length,
                itemCount: savedItems.length
            }
        });

    } catch (err) {

        console.error('Bill Entry Error:', err);

        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Bill number already exists'
            });
        }

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(err.errors).map(e => e.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/** */
exports.fetchBill = async (req, res) => {

}

/** */
exports.fetchBillById = async (req, res) => {

}

/** */
exports.updateChallanById = async (req, res) => {

}








/**
 * Create Consumable Data
 * -------------------------------
 * This API creates and stores a new consumable inventory record
 * based on data submitted from the frontend form.
 *
 * Expected Request Body:
 *  - billNumber     : String (Bill / Invoice number)
 *  - supplierList   : String (Supplier name)
 *  - categoryList   : String (Consumable category name)
 *  - locationList   : String (Shelf / Location code)
 *  - quantity       : Number (Must be greater than 0)
 *  - amount         : Number (Price per unit)
 *  - totalAmount    : Number (Total price)
 *
 * Response Structure:
 *  - success : Boolean indicating request status
 *  - message : Success or error message
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Created On: 22 January 2026
 * Last Modified: 22 January 2026
 * Modified By: Raza A [AS-127]
 */
// exports.createConsumableData = async (req, res) => {

//     try {
//         const {date ,billNumber, challanNumber, supplierList, categoryList, locationList, quantity, GST, GSTPercentage, amount, totalAmount } = req.body;

//         // Basic validation
//         if (!quantity || quantity <= 0) {
//             return res.status(400).json({ success: false, message: "Quantity must be greater than 0" });
//         }

//         const consumable = new consumableCreate({
//             date,
//             billNumber,
//             challanNumber,
//             supplierList,
//             categoryList,
//             locationList,
//             quantity,
//             GST,
//             GSTPercentage,
//             amount,
//             totalAmount
//         });

//         await consumable.save();

//         return res.status(201).json({ success: true, message: "Consumable saved successfully" });

//     } catch (err) {
//         console.error("Create consumable error:", err);

//         return res.status(500).json({ success: false, message: "Failed to save consumable", error: err.message });
//     }

// };

exports.createConsumableData = async (req, res) => {
    try {
        const {
            date,
            referenceType,
            billNumber,
            challanNumber,
            supplierList,
            categoryList,
            locationList,
            quantity,
            GST,
            GSTPercentage,
            amount,
            totalAmount
        } = req.body;

        // Basic validations
        if (!referenceType || !['Bill Number', 'Challan Number'].includes(referenceType)) {
            return res.status(400).json({
                success: false,
                message: 'Document type must be Bill Number or Challan Number'
            });
        }

        if (referenceType === 'Bill Number' && !billNumber) {
            return res.status(400).json({
                success: false,
                message: 'Bill number is required for Bill Number type'
            });
        }

        if (referenceType === 'Challan Number' && !challanNumber) {
            return res.status(400).json({
                success: false,
                message: 'Challan number is required for Challan Number type'
            });
        }

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than 0'
            });
        }

        const consumable = new consumableCreate({
            date,
            referenceType,
            billNumber: referenceType === 'Bill Number' ? billNumber : null,
            challanNumber: referenceType === 'Challan Number' ? challanNumber : null,
            supplierList,
            categoryList,
            locationList,
            quantity,
            GST,
            GSTPercentage,
            amount,
            totalAmount
        });

        await consumable.save();

        return res.status(201).json({
            success: true,
            message: 'Consumable saved successfully'
        });

    } catch (err) {
        console.error('Create consumable error:', err);

        return res.status(500).json({
            success: false,
            message: 'Failed to save consumable',
            error: err.message
        });
    }
};

/**
 * Get Consumable Data
 * ----------------------------
 * This API retrieves all consumable inventory records
 * from the database and returns them to the frontend.
 *
 * Response Structure:
 *  - success : Boolean indicating request status
 *  - count   : Total number of consumable records
 *  - data    : Array of consumable inventory objects
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Created On: 22 January 2026
 * Last Modified: 22 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.getConsumableData = async (req, res) => {
    try {
        // Fetch all consumable consumable records
        // Sorted by latest created first
        const consumables = await consumableCreate.find().sort({ createdAt: -1 });

        // Send success response
        return res.status(200).json({
            success: true,
            count: consumables.length,
            data: consumables
        });

    } catch (err) {
        console.error("Get consumable data error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch consumable data",
            error: err.message
        });
    }
};

/**
 * Update Consumable Data
 * --------------------------------
 * This API updates an existing consumable inventory record
 * based on the provided consumable ID.
 *
 * Expected Request:
 *  - Query Params:
 *      • id : MongoDB document ID of the consumable
 *
 *  - Request Body:
 *      • Any updatable consumable fields
 *        (billNumber, supplierList, categoryList,
 *         locationList, quantity, amount, totalAmount, etc.)
 *
 * Process Flow:
 *  1. Read consumable ID from query parameters.
 *  2. Read updated fields from request body.
 *  3. Log request details for auditing and debugging.
 *  4. Update the consumable record using `findByIdAndUpdate`.
 *     - `{ new: true }` returns the updated document.
 *  5. Send updated record back to the frontend.
 *  6. Handle and log errors if update fails.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Last Modified: 23 january 2026
 * Modified By: Raza A [AS-127]
 */
exports.updateConsumableModifyData = (req, res) => {
    console.log("update consumable:", req.query);
    const consumableId = req.query.id;
    const updateData = req.body;
    logger.info('Updating consumable data dash', {
        query: req.query,
        updateData: req.body
    });
    consumableCreate.findByIdAndUpdate(consumableId, updateData, { new: true }).then(updateConsumable => {
        logger.debug('Updated consumable item', { consumableId: updateConsumable });
        console.log("updated consumable", updateConsumable)
        res.send(JSON.stringify(updateConsumable))
    }).catch(err => {
        logger.error('Error updating consumable item', { error: err });
        console.log(err)
        res.send(JSON.stringify({ error: err }))
    });
}

/**
 * Update Consumable Data
 * --------------------------------
 * This API updates an existing consumable record
 * based on the provided consumable ID.
 *
 * Expected Request:
 *  - Query Params:
 *      • id : MongoDB document ID of the consumable
 *
 *  - Request Body:
 *      • Any updatable consumable fields
 *        (billNumber, supplierList, categoryList,
 *         locationList, quantity, amount, totalAmount, etc.)
 *
 * Process Flow:
 *  1. Read consumable ID from query parameters.
 *  2. Read updated fields from request body.
 *  3. Log request details for auditing and debugging.
 *  4. Update the consumable record using `findByIdAndUpdate`.
 *     - `{ new: true }` returns the updated document.
 *  5. Send updated record back to the frontend.
 *  6. Handle and log errors if update fails.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Last Modified: 23 january 2026
 * Modified By: Raza A [AS-127]
 */
exports.updateConsumableAddAssetsData = (req, res) => {
    console.log("update consumable:", req.query);
    const consumableId = req.query.id;
    const updateData = req.body;
    logger.info('Updating consumable data dash', {
        query: req.query,
        updateData: req.body
    });
    consumableCreate.findByIdAndUpdate(consumableId, updateData, { new: true }).then(updateConsumable => {
        logger.debug('Updated consumable item', { consumableId: updateConsumable });
        console.log("updated consumable", updateConsumable)
        res.send(JSON.stringify(updateConsumable))
    }).catch(err => {
        logger.error('Error updating consumable item', { error: err });
        console.log(err)
        res.send(JSON.stringify({ error: err }))
    });
}

/**
 * Update Consumable Data
 * --------------------------------
 * This API updates an existing consumable record
 * based on the provided consumable ID.
 *
 * Expected Request:
 *  - Query Params:
 *      • id : MongoDB document ID of the consumable
 *
 *  - Request Body:
 *      • Any updatable consumable fields
 *        (billNumber, supplierList, categoryList,
 *         locationList, quantity, amount, totalAmount, etc.)
 *
 * Process Flow:
 *  1. Read consumable ID from query parameters.
 *  2. Read updated fields from request body.
 *  3. Log request details for auditing and debugging.
 *  4. Update the consumable record using `findByIdAndUpdate`.
 *     - `{ new: true }` returns the updated document.
 *  5. Send updated record back to the frontend.
 *  6. Handle and log errors if update fails.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * Last Modified: 23 january 2026
 * Modified By: Raza A [AS-127]
 */
exports.updateConsumableConsumeAssetsData = (req, res) => {
    console.log("update consumable:", req.query);
    // const consumableId = req.query.id;
    // const updateData = req.body;
    // logger.info('Updating consumable data dash', {
    //     query: req.query,
    //     updateData: req.body
    // });
    // consumableCreate.findByIdAndUpdate(consumableId, updateData, { new: true }).then(updateConsumable => {
    //     logger.debug('Updated consumable item', { consumableId: updateConsumable });
    //     console.log("updated consumable", updateConsumable)
    //     res.send(JSON.stringify(updateConsumable))
    // }).catch(err => {
    //     logger.error('Error updating consumable item', { error: err });
    //     console.log(err)
    //     res.send(JSON.stringify({ error: err }))
    // });
}

/**
 * GET: Fetch Consumable History by Inventory ID
 * 
 * This function retrieves the stock history of a specific Consumable inventory item
 * based on the provided inventory ID. It also populates references for
 * better readability of related data.
 * 
 * Steps:
 * 1. Extract the `consumableId` filter from the query parameters.
 * 2. Log the request for tracking and debugging.
 * 3. Query the `consumableHistory` collection to find all stock history records
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
exports.getConsumableHistoryByInventoryId = (req, res) => {
    const filter = req.query.filter;

    console.log("Consumable stock ----------", req.body);
    console.log("filter query:", filter);
    logger.info('Fetching Consumable stock history by inventory ID', { consumableId: filter });
    consumableHistory.find({ consumableId: filter }).populate('consumableId').then(consumableHistory => {
        console.log('data', consumableHistory);
        logger.info('Fetched Consumable stock history');
        res.status(200).json(consumableHistory);
    }).catch(err => {
        console.log(err);
        logger.error('Error fetching Consumable stock history', {
            error: err
        });
        res.status(200).json(err);
    });
};

/**
 * Export Consumable Assets as CSV
 *
 * This function says consumable inventory assets based on the provided
 * category, supplier, and selected date range, and returns the filtered
 * data to the client. The returned data can be used to generate and export
 * a CSV file on the frontend.
 *
 * Steps:
 * 1. Extract `category`, `supplier`, `startDate`, and `endDate` from the request body.
 * 2. Build a MongoDB query object using the category (mandatory).
 *    - If `supplier` is provided and not empty, include it in the query.
 *    - If both `startDate` and `endDate` are provided, apply a date range filter.
 * 3. Fetch consumable inventory records from the database that match the query.
 * 4. Send the filtered asset data to the client.
 * 5. Log successful export or any errors encountered during the process.
 *
 * @param {Object} req - HTTP request object containing filter parameters
 * @param {Object} req.body.category - Consumable category (required)
 * @param {Object} req.body.supplier - Supplier name (optional)
 * @param {Object} req.body.startDate - Start date for filtering records (required with endDate)
 * @param {Object} req.body.endDate - End date for filtering records (required with startDate)
 * @param {Object} res - HTTP response object used to send data or error responses
 *
 * Last Modified: 28 January 2026
 * Modified By: Raza A [AS-127]
 */
exports.exportAssetCSVFile = async (req, res) => {
    console.log('', req.body)

    try {
        // 1. Extract filters from request body
        const { category, supplier, startDate, endDate } = req.body;

        // 2. Validate: Category OR Supplier is required
        if (!category && !supplier) {
            return res.status(400).send({
                message: 'Please select either Category or Supplier'
            });
        }

        // 3. Validate: Date range is mandatory
        if (!startDate || !endDate) {
            return res.status(400).send({
                message: 'Please select both Start Date and End Date'
            });
        }

        // 4. Build dynamic MongoDB query
        const query = {};

        // Apply category filter if user selected category
        if (category && category.trim() !== '') {
            query.categoryList = category.toString();
        }

        // Apply supplier filter if user selected supplier
        if (supplier && supplier.trim() !== '') {
            query.supplierList = supplier.toString();
        }

        // 5. Apply date range filter (mandatory)
        query.createdAt = {
            $gte: new Date(startDate + 'T00:00:00.000Z'),
            $lte: new Date(endDate + 'T23:59:59.999Z')
        };

        // 6. Fetch filtered data
        const assets = await consumableCreate.find(query);

        // 7. Send response
        console.log('----------------', assets);
        res.send(assets);

        // 8. Log success
        logger.info('Consumable assets exported successfully', {
            category: category || null,
            supplier: supplier || null,
            startDate,
            endDate
        });

    } catch (err) {
        // 9. Handle errors
        logger.error('Error exporting consumable assets', err);
        res.status(500).send({ error: err });
    }


}




/**
 * POST: Search consumable
 * 
 * This function allows searching consumable items based on a search text.
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
exports.searchConsumableData = (req, res) => {
    // let searchCriteria = req.body.searchInventoryText;
    // let searchRegex = new RegExp(searchCriteria, 'i');
    // let currentPage = parseInt(req.query.page) || 1;
    // let limit = parseInt(req.query.limit) || 10;
    // let skip = (currentPage - 1) * limit;
    // ItInventory.find({
    //     $or: [
    //         { code: searchRegex },
    //         { creator: searchRegex },
    //         { description: searchRegex },
    //         { serialNo: searchRegex },
    //         { inputVoltage: searchRegex },
    //         { key: searchRegex },
    //         { modelNo: searchRegex },
    //         { cpu: searchRegex },
    //         { ram: searchRegex },
    //         { drive: searchRegex },
    //         { systemConfig: searchRegex },
    //         { licenseInEff: searchRegex },
    //         { msEffect: searchRegex },
    //         { ipAddress: searchRegex },
    //         { softwareInstalled: searchRegex },
    //         { internetAccess: searchRegex },
    //         { lastUse: searchRegex }
    //     ]
    // })
    //     .skip(skip)
    //     .limit(limit)
    //     .populate('categoryName')
    //     .populate('subCategoryName')
    //     .populate('manufacturer')
    //     .populate('supplier')
    //     .then(inventories => {
    //         // Count total documents matching the search query
    //         return ItInventory.countDocuments({
    //             $or: [
    //                 { code: searchRegex },
    //                 { creator: searchRegex },
    //                 { description: searchRegex },
    //                 { serialNo: searchRegex },
    //                 { inputVoltage: searchRegex },
    //                 { key: searchRegex },
    //                 { modelNo: searchRegex },
    //                 { cpu: searchRegex },
    //                 { ram: searchRegex },
    //                 { drive: searchRegex },
    //                 { systemConfig: searchRegex },
    //                 { licenseInEff: searchRegex },
    //                 { msEffect: searchRegex },
    //                 { ipAddress: searchRegex },
    //                 { softwareInstalled: searchRegex },
    //                 { lastUse: searchRegex }
    //             ]
    //         }).then(count => ({ inventories, count }));
    //     })
    //     .then(({ inventories, count }) => {
    //         // Calculate total number of pages
    //         let totalPages = Math.ceil(count / limit);
    //         // Construct the response object
    //         let response = {
    //             inventories: inventories, // Include the fetched inventory items
    //             totalPages: totalPages, // Total number of pages
    //             currentPage: currentPage // Current page number
    //         };
    //         logger.info('Searched Consumable data');
    //         // Send the response
    //         res.status(200).json(response);
    //     })
    //     .catch(err => {
    //         logger.error('Error searching Consumable data', {
    //             error: err
    //         });
    //         res.send(JSON.stringify({ error: err }));
    //     });
}

/**
 * GET: Fetch Admin Stock History by consumable ID
 * 
 * This function retrieves the stock history of a specific Admin consumable item
 * based on the provided consumable ID. It also populates references for
 * better readability of related data.
 * 
 * Steps:
 * 1. Extract the `consumableId` filter from the query parameters.
 * 2. Log the request for tracking and debugging.
 * 3. Query the `consumableStockHistory` collection to find all stock history records
 *    that match the given consumable ID.
 * 4. Populate the following references:
 *    - `consumableId` to include consumable details
 *    - `issuedTo` to include the user or entity to whom the stock was issued
 * 5. Send the retrieved stock history data as a JSON response with HTTP status 200.
 * 6. Catch and log any errors that occur during the query and send the error as JSON.
 * 
 * @param {*} req - HTTP request object
 *                    - Query: { filter: consumableId }
 * @param {*} res - HTTP response object
 *   
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
*/
exports.getStockHistoryByConsumableId = (req, res) => {
    const filter = req.query.filter;

    console.log("filter query:", filter);
    logger.info('Fetching stock history by consumable ID', { consumableId: filter });
    consumableStockHistory.find({ consumableId: filter })
        .populate('consumableId')
        .populate('issuedTo').then(consumableStockHistory => {
            console.log('data', consumableStockHistory)
            logger.info('Fetched Consumable stock history');
            res.status(200).json(consumableStockHistory);
        }).catch(err => {
            console.log(err);
            logger.error('Error fetching Consumable stock history', {
                error: err
            });
            res.status(200).json(err);

        })
};
