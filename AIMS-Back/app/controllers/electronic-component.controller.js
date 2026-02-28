const Manufacturer = require('../models/hardware-department/electronic-component/electronic-manufacturer.model');
const Category = require('../models/hardware-department/electronic-component/electronic-category.model');
const Supplier = require('../models/hardware-department/electronic-component/electronic-supplier.model');
const Project = require('../models/hardware-department/electronic-component/electronic-project.model');
const ShelfLocation = require('../models/hardware-department/electronic-component/electronic-shelf-location.model');
const Component = require('../models/hardware-department/electronic-component/electronic-component.model');
const StockHistory = require('../models/hardware-department/electronic-component/electronic-stock-history.model');

const User = require('../models/user/user.model');
const ExcelJs = require('exceljs');
const logger = require('../../logger')



// ================================= [ MANUFACTURER FUNCTIONS ]================================= //

/**
 * Create a new manufacturer
 * 
 * Description:
 * Receives manufacturer data from the request body, creates a new Manufacturer
 * document, and saves it to the database. Logs success or error messages and
 * sends an appropriate JSON response.
 * 
 * @param {*} req - Express request object containing manufacturer details
 * @param {*} res - Express response object to send success or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.createManufacturer = (req, res) => {
    var newManufacturer = new Manufacturer(req.body);
    newManufacturer.save().then((result) => {
        logger.info('New manufacturer created successfully')
        // console.log('New Manufacturer Data:', result);
        res.send(JSON.stringify({ message: 'New Manufacturer Created Successfully' }));
    }).catch((err) => {
        console.log(err);
        logger.error('Error creating manufacturer', { error: err })
        res.send(JSON.stringify({ error: err }));
    });
}



/**
 * Retrieve all manufacturers
 * 
 * Description:
 * Fetches the complete list of manufacturers from the database.
 * Logs the total count retrieved and returns the result as a JSON response.
 * Handles and logs any errors that occur during the query.
 * 
 * @param {*} req - Express request object
 * @param {*} res - Express response object to send the list or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getAllManufacturer = async (req, res) => {
    // Manufacturer.find().then((result) => {
    //     // console.log(result);
    //     logger.info('Successfully retrived all manufacturers', { count: result.length })
    //     res.send(JSON.stringify(result));
    // }).catch((err) => {
    //     console.log(err);
    //     logger.error('Error retriving manufacturer', { error: err })
    //     res.send(JSON.stringify({ message: err }));
    // })

    try {
        const manufacturers = await Manufacturer.find();

        // Build the id → name map
        const nameMap = {};
        manufacturers.forEach(m => {
            nameMap[m._id] = m.name;
        });

        logger.info("Fetched manufacturers & name map", {
            total: manufacturers.length
        });

        return res.status(200).json({
            list: manufacturers,  // full manufacturer list
            nameMap: nameMap      // _id → name mapping
        });

    } catch (err) {
        logger.error("Error fetching manufacturers", { error: err });
        return res.status(500).json({
            message: "Failed to fetch manufacturers",
            error: err.message
        });
    };
}



/**
 * Delete a manufacturer by name
 * 
 * Description:
 * Finds a manufacturer using the provided name query parameter and deletes it.
 * Returns the deleted document if successful or a 'not found' message if it doesn't exist.
 * All actions and errors are logged appropriately.
 * 
 * @param {*} req - Express request object (expects `name` in query)
 * @param {*} res - Express response object to send the deletion result or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.deleteManufacturer = (req, res) => {
    var manufacturer = req.query.name;
    Manufacturer.findOneAndDelete({ name: manufacturer }).then((result) => {
        // console.log(result);
        if (result) {
            logger.info('Manufacturer deleted successfully')
            res.send(JSON.stringify({ message: result }));
        } else {
            logger.warn('Manufacturer not found');
            res.send(JSON.stringify({ message: 'manufacturer not found' }));
        }
    }).catch((err) => {
        console.log(err);
        logger.error('Error deleting manufacturer', { error: err });
        res.send(JSON.stringify({ error: err }));
    })
}



/**
 * Update a manufacturer by ID
 * 
 * Description:
 * Updates the manufacturer document identified by the provided `_id` with new data from the request body.
 * Returns success if the update was applied, or a 'not found' message if no document exists with the given ID.
 * Errors during the update are logged and returned in the response.
 * 
 * @param {*} req - Express request object (expects `id` in query and updated fields in body)
 * @param {*} res - Express response object to send update status or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.updateManufacturer = (req, res) => {
    var id = req.query.id;
    var data = req.body;
    Manufacturer.findByIdAndUpdate(id, data).then((result) => {
        // console.log(result);
        if (result) {
            logger.info('Manufacturer updated successfully')
            res.send(JSON.stringify({ message: true }));
        } else {
            logger.warn('Manufacturer not found for update');
            res.send(JSON.stringify({ message: 'Manufacturer not found' }));
        }
    }).catch((err) => {
        logger.error('Error updating manufacturer')
        console.log(err);
        res.send(JSON.stringify({ error: err }));
    })
}



/**
 * Check if a manufacturer name already exists
 * 
 * Description:
 * Queries the database to see if a manufacturer with the given name exists.
 * Returns `true` if the name is available (not found) and `false` if it already exists.
 * Errors during the query are logged.
 * 
 * @param {*} req - Express request object (expects `name` in query)
 * @param {*} res - Express response object returning boolean status
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.checkManufacturerName = (req, res) => {
    const manufacturerName = req.query.name;
    // console.log('manufacturer name', manufacturerName)
    Manufacturer.findOne({
        name: manufacturerName
    }).then(result => {
        if (result == null || result == undefined) {
            logger.info('Manufacturer name not found');
            res.send(true)
        } else {
            logger.info('Manufacturer name exists');
            res.send(false)
        }
    }).catch(err => {
        logger.error('Error checking manufacturer name', { error: err });
        console.log(err)
    })
}



// ================================= [ CATEGORY FUNCTIONS ]================================= //

/**
 * Create a new category
 * 
 * Description:
 * Saves a new category document to the database using data from the request body.
 * Responds with a success message if creation succeeds, or an error object if it fails.
 * 
 * @param {*} req - Express request object containing category data in body
 * @param {*} res - Express response object returning success or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.createCategory = (req, res) => {
    var newCategory = new Category(req.body);
    newCategory.save().then((result) => {
        // console.log('New Category Data:', result);
        logger.info('New category created successfully');
        res.send(JSON.stringify({ message: 'New Category Created Successfully' }));
    }).catch((err) => {
        console.log(err);
        logger.error('Error creating new category', { error: err });
        res.send(JSON.stringify({ error: err }));
    });
}



/**
 * Get all categories
 * 
 * Description:
 * Retrieves all category documents from the database and sends them in the response.
 * Logs the total number of categories fetched. Returns an error message if the operation fails.
 * 
 * @param {*} req - Express request object
 * @param {*} res - Express response object containing category list or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getAllCategory = async (req, res) => {
    // Category.find().then((result) => {
    //     // console.log(result);
    //     logger.info('Fetched all categories', { categories: result.length });
    //     res.send(JSON.stringify(result));
    // }).catch((err) => {
    //     console.log(err);
    //     logger.error('Error fetching categories', { error: err });
    //     res.send(JSON.stringify({ message: err }));
    // })

    try {
        const categories = await Category.find();

        // Build the id → name map
        const nameMap = {};
        categories.forEach(cat => {
            nameMap[cat._id] = cat.name;
        });

        logger.info("Fetched categories & name map", {
            total: categories.length
        });

        return res.status(200).json({
            list: categories,        // full category list
            nameMap: nameMap         // id → name mapping
        });

    } catch (err) {
        logger.error("Error fetching categories", { error: err });
        return res.status(500).json({
            message: "Failed to fetch categories",
            error: err.message
        });
    }
}



/**
 * Delete a category by name
 * 
 * Description:
 * Finds a category by its name and deletes it from the database.
 * Logs the action and returns a success message if deleted, or a warning if not found.
 * Returns an error message if the operation fails.
 * 
 * @param {*} req - Express request object containing query parameter 'name'
 * @param {*} res - Express response object with deletion result or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.deleteCategory = (req, res) => {
    var category = req.query.name;
    Category.findOneAndDelete({ name: category })
        .then((result) => {
            if (result) {
                logger.info('Category deleted successfully');
                res.send(JSON.stringify({ message: result }));
            } else {
                logger.warn('Category not found for deletion');
                res.send(JSON.stringify({ message: 'Category not found' }));
            }
            // console.log(result);
        }).catch((err) => {
            logger.error('Error deleting category', { error: err });
            console.log(err);
            res.send(JSON.stringify({ error: err }));
        })
}



/**
 * Update a category by its _id
 * 
 * Description:
 * Finds a category using the provided _id and updates its data with the request body.
 * Logs the update action and returns a success response.
 * Returns an error response if the operation fails.
 * 
 * @param {*} req - Express request object containing query parameter 'id' and update data in body
 * @param {*} res - Express response object with update status or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.updateCategory = (req, res) => {
    var id = req.query.id;
    var data = req.body;
    Category.findByIdAndUpdate(id, data).then((result) => {
        // console.log(result);
        logger.info('Category updated successfully');
        res.send(JSON.stringify({ message: true }));
    }).catch((err) => {
        logger.error('Error updating category', { error: err });
        console.log(err);
        res.send(JSON.stringify({ error: err }));
    })
}



/**
 * Check if a category name already exists
 * 
 * Description:
 * Searches the database for a category with the provided name.
 * Returns `true` if the name is available (unique), `false` if it already exists.
 * Logs the check result and any errors encountered.
 * 
 * @param {*} req - Express request object with query parameter 'name'
 * @param {*} res - Express response object returning true/false
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.checkCategoryName = (req, res) => {
    console.log(req.query)
    const categoryName = req.query.name;
    // console.log('category name', categoryName)
    Category.findOne({
        name: categoryName
    }).then(result => {
        if (result == null || result == undefined) {
            logger.info('Category name is unique', { categoryName });
            res.send(true)
        } else {
            logger.info('Category name already exists', { categoryName });
            res.send(false)
        }
    }).catch(err => {
        logger.error('Error checking category name', { error: err });
        console.log(err)
    })
}



/**
 * Check if a category abbreviation is unique
 * 
 * Description:
 * Searches the database for a category with the given abbreviation.
 * Returns `true` if the abbreviation is available (unique), `false` if it already exists.
 * Logs the result and any errors encountered during the check.
 * 
 * @param {*} req - Express request object with query parameter 'abbreviationName'
 * @param {*} res - Express response object returning true/false
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.checkAbbreviatedName = (req, res) => {
    const abbreviationName = req.query.abbreviationName;
    Category.findOne({
        abbreviation: abbreviationName
    }).then(result => {
        if (result == null || result == undefined) {
            logger.info('Abbreviation name is unique', { abbreviationName });
            res.send(true)
        } else {
            logger.info('Abbreviation name already exists', { abbreviationName });
            res.send(false)
        }
    }).catch(err => {
        logger.error('Error checking abbreviation name', { error: err });
        console.log(err)
    })
}

// ================================= [ SUPPLIER FUNCTIONS ]================================= //

/**
 * Create a new supplier
 * 
 * Description:
 * Saves a new supplier record to the database using the request body.
 * Returns a success message if saved successfully, otherwise returns the error.
 * Logs the operation and any errors encountered.
 * 
 * @param {*} req - Express request object containing supplier data in body
 * @param {*} res - Express response object returning success or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.createSupplier = (req, res) => {
    var newSupplier = new Supplier(req.body);
    newSupplier.save().then((result) => {
        logger.info('New supplier created successfully');
        res.send(JSON.stringify({ message: 'New Supplier Created Successfully' }));
    }).catch((err) => {
        logger.error('Error creating new supplier', { error: err });
        res.send(JSON.stringify({ error: err }));
    });
}



/**
 * Retrieve all suppliers
 * 
 * Description:
 * Fetches all supplier records from the database.
 * Returns the list of suppliers as JSON.
 * Logs the total count and any errors encountered during the operation.
 * 
 * @param {*} req - Express request object
 * @param {*} res - Express response object returning suppliers or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getAllSupplier = async (req, res) => {
    try {
        const suppliers = await Supplier.find();

        // Build the id → name map
        const nameMap = {};
        suppliers.forEach(s => {
            nameMap[s._id] = s.name;
        });

        logger.info("Fetched suppliers & name map", {
            total: suppliers.length
        });

        return res.status(200).json({
            list: suppliers,   // full supplier list
            nameMap: nameMap   // _id → name mapping
        });

    } catch (err) {
        logger.error("Error fetching suppliers", { error: err });
        return res.status(500).json({
            message: "Failed to fetch suppliers",
            error: err.message
        });
    }
};



/**
 * Delete a supplier by name
 * 
 * Description:
 * Removes a supplier record from the database based on the provided name.
 * Returns the deleted record if successful, otherwise returns an error.
 * Logs success or failure of the deletion operation.
 * 
 * @param {*} req - Express request object containing supplier name in query
 * @param {*} res - Express response object returning deleted supplier or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.deleteSupplier = (req, res) => {
    var supplier = req.query.name;
    Supplier.findOneAndDelete({ name: supplier }).then((result) => {
        logger.info('Supplier deleted successfully');
        res.send(JSON.stringify({ message: result }));
    }).catch((err) => {
        console.log(err);
        logger.error('Error deleting supplier', { error: err });
        res.send(JSON.stringify({ error: err }));
    })
}



/**
 * Update a supplier by _id
 * 
 * Description:
 * Updates the supplier record identified by the provided _id with new data.
 * Returns a success message if the update is successful, otherwise returns an error.
 * Logs the outcome of the update operation.
 * 
 * @param {*} req - Express request object containing supplier _id in query and updated data in body
 * @param {*} res - Express response object returning status of the update
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.updateSupplier = (req, res) => {
    var id = req.query.id;
    var data = req.body;
    Supplier.findByIdAndUpdate(id, data).then((result) => {
        logger.info('Supplier updated successfully');
        res.send(JSON.stringify({ message: true }));
    }).catch((err) => {
        console.log(err);
        logger.error('Error updating supplier', { error: err });
        res.send(JSON.stringify({ error: err }));
    })
}



/**
 * Check if a supplier name already exists
 * 
 * Description:
 * Queries the Supplier collection to determine if the given supplier name is already used.
 * Returns `true` if the name is unique (not found), otherwise returns `false`.
 * Logs the result of the check and any errors encountered.
 * 
 * @param {*} req - Express request object containing supplier name in query
 * @param {*} res - Express response object returning boolean status of name uniqueness
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.checkSupplierName = (req, res) => {
    const supplierName = req.query.name;
    // console.log('supplier name', supplierName)
    Supplier.findOne({
        name: supplierName
    }).then(result => {
        if (result == null || result == undefined) {
            logger.info('Supplier name is unique', { supplierName });
            res.send(true)
        } else {
            logger.info('Supplier name already exists', { supplierName });
            res.send(false)
        }
    }).catch(err => {
        logger.error('Error checking supplier name', { error: err });
        console.log(err)
    })
}

// ================================= [ PROJECT FUNCTIONS ]================================= //

/**
 * Create a new project
 * 
 * Description:
 * Saves a new project document in the Project collection using request body data.
 * Returns a success message if saved successfully, otherwise returns the error.
 * Logs both successful creation and errors.
 * 
 * @param {*} req - Express request object containing project data in body
 * @param {*} res - Express response object returning success or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.createProject = (req, res) => {
    var newProject = new Project(req.body);
    newProject.save().then((result) => {
        logger.info('New project created successfully');
        res.send(JSON.stringify({ message: 'New Project Created Successfully' }));
    }).catch((err) => {
        console.log(err);
        logger.error('Error creating new project', { error: err });
        res.send(JSON.stringify({ error: err }));
    });
}



/**
 * Get all projects
 * 
 * Description:
 * Retrieves all project documents from the Project collection.
 * Logs the operation and returns the list of projects in JSON format.
 * If an error occurs, logs the error and returns it in the response.
 * 
 * @param {*} req - Express request object
 * @param {*} res - Express response object with projects or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getAllProject = async (req, res) => {
    // Project.find().then((result) => {
    //     logger.info('Fetched all projects');
    //     res.send(JSON.stringify(result));
    // }).catch((err) => {
    //     console.log(err);
    //     logger.error('Error fetching projects', { error: err });
    //     res.send(JSON.stringify({ message: err }));
    // })

    try {
        const projects = await Project.find();

        // Build the id → name map
        const nameMap = {};
        projects.forEach(proj => {
            nameMap[proj._id] = proj.name;
        });

        logger.info("Fetched projects & name map", {
            total: projects.length
        });

        return res.status(200).json({
            list: projects,     // full project list
            nameMap: nameMap    // _id → name mapping
        });

    } catch (err) {
        logger.error("Error fetching projects", { error: err });
        return res.status(500).json({
            message: "Failed to fetch projects",
            error: err.message
        });
    }
}



/**
 * Delete a project by name
 * 
 * Description:
 * Finds a project by its name and deletes it from the Project collection.
 * Logs success or failure and returns the deleted document or error in JSON format.
 * 
 * @param {*} req - Express request object containing query parameter 'name'
 * @param {*} res - Express response object with deleted project data or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.deleteProject = (req, res) => {
    var project = req.query.name;
    Project.findOneAndDelete({ name: project }).then((result) => {
        logger.info('Project deleted successfully');
        res.send(JSON.stringify({ message: result }));
    }).catch((err) => {
        console.log(err);
        logger.error('Error deleting project', { error: err });
        res.send(JSON.stringify({ error: err }));
    })
}



/**
 * Update a project by its _id
 * 
 * Description:
 * Updates the project document in the database using the provided _id and new data.
 * Logs success or failure and returns a JSON response indicating the operation result.
 * 
 * @param {*} req - Express request object containing query parameter 'id' and body with update data
 * @param {*} res - Express response object with success status or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.updateProject = (req, res) => {
    var id = req.query.id;
    var data = req.body;
    Project.findByIdAndUpdate(id, data).then((result) => {
        logger.info('Project updated successfully');
        res.send(JSON.stringify({ message: true }));
    }).catch((err) => {
        console.log(err);
        logger.error('Error updating project', { error: err });
        res.send(JSON.stringify({ error: err }));
    })
}



/**
 * Check if a project name already exists
 * 
 * Description:
 * Searches the database for a project with the given name. Returns `true` if the name is unique,
 * otherwise `false`. Logs actions and errors for monitoring.
 * 
 * @param {*} req - Express request object containing query parameter 'name'
 * @param {*} res - Express response object returning true/false or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.checkProjectName = (req, res) => {
    const projectName = req.query.name;
    // console.log('project name', projectName)
    Project.findOne({
        name: projectName
    }).then(result => {
        if (result == null || result == undefined) {
            logger.info('Project name is unique', { projectName });
            res.send(true)
        } else {
            logger.info('Project name already exists', { projectName });
            res.send(false)
        }
    }).catch(err => {
        console.log(err)
        logger.error('Error checking project name', { error: err });
        res.send(JSON.stringify({ error: 'Error checking project name' }));
    })
}



// ================================= [ SHELF LOCATION FUNCTIONS ]================================= //

/**
 * Create a new shelf location
 * 
 * Description:
 * Saves a new shelf location to the database. Logs success or error and returns a confirmation
 * message or error object to the client.
 * 
 * @param {*} req - Express request object containing shelf data in req.body
 * @param {*} res - Express response object returning success or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.createShelf = (req, res) => {

    var newShelfLocation = new ShelfLocation(req.body);

    newShelfLocation.save().then((result) => {
        logger.info('New shelf location created successfully');
        res.send(JSON.stringify({ message: 'New Shelf location Created Successfully' }));
    }).catch((err) => {
        console.log(err);
        logger.error('Error creating new shelf location', { error: err });
        res.send(JSON.stringify({ error: err }));
    });
}



/**
 * Fetch all shelf locations
 * 
 * Description:
 * Retrieves the complete list of shelf locations from the database. 
 * Logs the total count and returns the data or an error message to the client.
 * 
 * @param {*} req - Express request object
 * @param {*} res - Express response object returning array of shelves or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getAllShelf = async (req, res) => {
    // ShelfLocation.find().then((result) => {
    //     logger.info('Fetched all shelf locations', { shelfCount: result.length });
    //     res.send(JSON.stringify(result));
    // }).catch((err) => {
    //     console.log(err);
    //     logger.error('Error fetching shelf locations', { error: err });
    //     res.send(JSON.stringify({ message: err }));
    // })

    try {
        const shelves = await ShelfLocation.find();

        // Build shelf → box map
        const nameMap = {};
        shelves.forEach(shelf => {
            const shelfId = shelf._id;

            nameMap[shelfId] = {
                shelfName: shelf.shelfName,
                boxNames: {}
            };

            shelf.boxNames.forEach(box => {
                nameMap[shelfId].boxNames[box._id] = box.name;
            });
        });

        logger.info("Fetched shelves & name map", {
            total: shelves.length
        });

        return res.status(200).json({
            list: shelves,      // full shelf list
            nameMap: nameMap    // id → { shelfName, boxNames }
        });

    } catch (err) {
        logger.error("Error fetching shelf locations", { error: err });
        return res.status(500).json({
            message: "Failed to fetch shelf locations",
            error: err.message
        });
    }
}



/**
 * Delete a shelf location by name
 * 
 * Description:
 * Deletes a shelf location from the database based on the provided `shelfName`.
 * Logs the deletion result or any errors and returns a JSON response to the client.
 * 
 * @param {*} req - Express request object containing query parameter `shelfName`
 * @param {*} res - Express response object returning deletion result or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.deleteShelf = (req, res) => {
    var shelf = req.query.shelfName;
    ShelfLocation.findOneAndDelete({ shelfName: shelf }).then((result) => {
        logger.info('Shelf location deleted successfully');
        res.send(JSON.stringify({ message: result }));
    }).catch((err) => {
        logger.error('Error deleting shelf location', { error: err });
        console.log(err);
        res.send(JSON.stringify({ error: err }));
    })
}



/**
 * Update a shelf location by _id
 * 
 * Description:
 * Updates the details of a shelf location in the database based on its `_id`.
 * Logs success or error messages and returns a JSON response to indicate the result.
 * 
 * @param {*} req - Express request object containing query parameter `id` and updated data in `req.body`
 * @param {*} res - Express response object returning update result or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.updateShelf = (req, res) => {
    var id = req.query.id;
    var data = req.body;
    ShelfLocation.findByIdAndUpdate(id, data).then((result) => {
        logger.info('Shelf location updated successfully');
        res.send(JSON.stringify({ message: true }));
    }).catch((err) => {
        console.log(err);
        logger.error('Error updating shelf location', { id, error: err });
        res.send(JSON.stringify({ error: err }));
    })
}



/**
 * Check if a shelf name is unique
 * 
 * Description:
 * Checks the database to determine if a given shelf name already exists.
 * Returns `true` if the name is available, `false` if it already exists.
 * Logs the result or any errors encountered.
 * 
 * @param {*} req - Express request object containing query parameter `shelfName`
 * @param {*} res - Express respons
*/
exports.checkShelfName = (req, res) => {
    const shelfName = req.query.shelfName;
    // console.log('project name', shelfName)
    ShelfLocation.findOne({
        shelfName: shelfName
    }).then(result => {
        if (result == null || result == undefined) {
            logger.info('Shelf name is unique', { shelfName });
            res.send(true)
        } else {
            logger.info('Shelf name already exists', { shelfName });
            res.send(false)
        }
    }).catch(err => {
        logger.error('Error checking shelf name', { error: err });
        console.log(err)
    })
}



//========================================[Dashboard COMPONENT FUNCTIONS]=======================================//

/**
 * Create a new component with stock history
 * 
 * Description:
 * - Generates a unique component ID based on the category abbreviation and sequence.
 * - Saves the new component to the database.
 * - Creates stock history entries for each stock detail provided.
 * - Updates the category sequence ID after successful component creation.
 * - Handles errors at each step and logs all actions.
 * 
 * @param {*} req - Express request object containing:
 *   - updatedComponent: Component details including category, stock details
 *   - supplierDetails: Supplier information for stock history
 * @param {*} res - Express response object returning success or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.createComponentDash = (req, res) => {
    let componentId
    Category.findOne({ _id: req.body.updatedComponent.categoryName })
        .then(category => {
            console.log('create category ', category)
            if (!category) {
                logger.warn('Category not found', { categoryId: req.body.updatedComponent.categoryName });
                return res.send(JSON.stringify({ error: 'Category is not found' }))
            }
            category.sequenceId += 1
            incrementSeqId = category.sequenceId
            let formattedSequenceId = category.sequenceId.toString().padStart(4, '0');
            componentId = `${category.abbreviation}-${formattedSequenceId}`;
            // console.log(componentId)

            const newComponent = new Component({
                id: componentId,
                ...req.body.updatedComponent
            })


            return newComponent.save().then(result => {
                req.body.updatedComponent.stockDetails.forEach(items => {
                    logger.info('Processing stock details', { items });
                    var newStockHistory = new StockHistory({
                        componentId: result._id.toString(),
                        projectName: items.projectName,
                        quantity: items.quantity,
                        inventoryHandler: items.modifier,
                        issuedTo: null,
                        date: items.modifiedDate,
                        transactionType: 'create',
                        supplierName: req.body.supplierDetails.supplierName,
                        supplierPartNo: req.body.supplierDetails.supplierPartNo,
                        linePrice: items.linePrice,
                        pricePerUnit: items.pricePerUnit,
                        note: null

                    });
                    newStockHistory.save()
                        .then(result => {
                            console.log('Stock History result', result);
                            logger.info('Stock History created successfully', { result });
                            res.send(JSON.stringify({ message: 'New Component and Stock History is created successfully' }));
                        }).catch(err => {
                            console.log('Stock History', err);
                            logger.error('Error creating Stock History', { error: err });
                            newComponent.deleteOne({
                                _id: result._id.toString()
                            })
                            res.send(JSON.stringify({ error: err }))
                        })
                })

                return category.save().then(result => {
                    logger.info('Category updated successfully');
                    // console.log('save category detail', result)
                })
            })

        }).catch(err => {
            console.log(err);
            logger.error('Error creating component', { error: err });
            res.send(JSON.stringify({ error: err }))
        })
}



/**
 * Check if a Component ID is unique
 * 
 * Description:
 * - Queries the database to check if a component with the given ID already exists.
 * - Returns `true` if the ID is unique (not found), `false` if it already exists.
 * - Logs the action and any errors encountered.
 * 
 * @param {*} req - Express request object containing query parameter `id` for the component
 * @param {*} res - Express response object returning `true`/`false` or an error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.checkComponentId = (req, res) => {
    // console.log(req.query.id)
    Component.findOne({
        id: req.query.id
    }).then(result => {
        if (result === null || result === undefined) {
            logger.info('Component ID is unique');
            res.send(true)
        } else {
            logger.info('Component ID already exists');
            res.send(false)
        }
    }).catch(err => {
        console.log(err)
        logger.error('Error checking component ID', { error: err });
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * Check if a Manufacturer Part Number is unique
 * 
 * Description:
 * - Queries the database to see if a component with the given manufacturer part number already exists.
 * - Returns `true` if the part number is unique (not found), `false` if it already exists.
 * - Logs all actions and errors for traceability.
 * 
 * @param {*} req - Express request object containing query parameter `manufacturerPartNo`
 * @param {*} res - Express response object returning `true`/`false` or an error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.checkManufacturerPartNo = (req, res) => {
    // console.log(req.query.manufacturerPartNo);
    Component.findOne({
        manufacturerPartNumber: req.query.manufacturerPartNo
    }).then(result => {
        if (result === null || result === undefined) {
            logger.info('Manufacturer part number is unique');
            res.send(true)
        } else {
            logger.info('Manufacturer part number already exists');
            res.send(false)
        }
    }).catch(err => {
        logger.error('Error checking manufacturer part number', { error: err });
        console.log(err);
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * Update a component's details
 * 
 * Description:
 * - Updates an existing component in the database using its `_id`.
 * - The updated data is taken from `req.body`.
 * - Returns `{ message: true }` on successful update.
 * - Logs both success and error events for traceability.
 * 
 * @param {*} req - Express request object containing `id` as query param and updated data in body
 * @param {*} res - Express response object returning success status or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.updateComponentDash = (req, res) => {
    // console.log(req.query.id, req.body)
    var id = req.query.id;
    var data = req.body;
    Component.findByIdAndUpdate(id, { $set: data }, { new: true }).then(result => {
        logger.info('Component updated successfully');
        res.send(JSON.stringify({ message: true }))
    }).catch(err => {
        console.log(err);
        logger.error('Error updating component', { error: err });
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * Delete a component by name
 * 
 * Description:
 * - Deletes a component from the database using the `name` query parameter.
 * - Returns the deleted document on success.
 * - Logs both success and error events for traceability.
 * 
 * @param {*} req - Express request object containing `name` as query parameter
 * @param {*} res - Express response object returning deleted component or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.deleteComponentDash = (req, res) => {
    var component = req.query.name;
    Component.findOneAndDelete({ name: component }).then(result => {
        logger.info('Component deleted successfully');
        res.send(JSON.stringify({ message: result }))
    }).catch(err => {
        console.log(err)
        logger.error('Error deleting component', { error: err });
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * Get unique Manufacturer Part Numbers (Batch Numbers) based on filter conditions
 * 
 * Description:
 * - Filters components based on optional criteria: category, manufacturer, supplier, project.
 * - Returns a list of unique batch numbers from matching components' stockDetails.
 * - Logs both the fetch attempt and any errors for traceability.
 * 
 * @param {*} req - Express request object containing filter data in `req.body`
 * @param {*} res - Express response object returning array of batch numbers or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getBatchNumberByFilter = (req, res) => {
    // console.log('this is the bactch number detail',req.body);
    let filter = req.body;
    if (filter.category === '') delete filter.category;
    if (filter.manufacturer === '') delete filter.manufacturer;
    if (filter.supplier === '') delete filter.supplier;
    if (filter.project === '') delete filter.project;

    let query = {}
    if (filter.category) query.categoryName = filter.category;
    if (filter.manufacturer) query.manufacturer = filter.manufacturer;
    if (filter.supplier) query.supplierName = filter.supplier;
    if (filter.project) query['stockDetails.projectName'] = filter.project;

    logger.info('Fetching batch numbers with filters');

    Component.find(query, 'stockDetails.batchNo').then(component => {
        let batchNumber = component.flatMap(component => component.stockDetails.map(stock => stock.batchNo));
        batchNumber = batchNumber.filter((item, index) => batchNumber.indexOf(item) === index);
        logger.info('Batch numbers fetched successfully');
        res.send(batchNumber)
    })
        .catch(err => {
            console.log(err)
            logger.error('Error fetching batch numbers', { error: err });
            res.send(JSON.stringify({ error: err }));

        })
}



/**
 * POST: Add a new project entry for a component
 * 
 * Description:
 * - Saves a new stock history record for a component using data from `req.body.stockHistory`.
 * - Updates the component document with the new component data from `req.body.component`.
 * - If updating the component fails after saving the stock history, the newly created stock history is deleted to maintain consistency.
 * - Logs all major actions and errors for traceability.
 * 
 * @param {*} req - Express request object containing:
 *   - stockHistory: Object with stock transaction details
 *   - component: Object with updated component details (_id must be present)
 * @param {*} res - Express response object returning success or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.postAddNewProject = (req, res) => {

    var newStockHistory = new StockHistory(req.body.stockHistory)
    newStockHistory.save().then(result => {

        Component.findByIdAndUpdate(req.body.component._id, req.body.component).then(result => {
            logger.info('Component and stock history saved successfully');
            res.send(JSON.stringify({ message: 'component and stock history save sucessfully' }))
        }).catch(err => {
            logger.error('Error updating component after saving stock history');
            console.log(err);
            newStockHistory.deleteOne({
                _id: result._id.toString()
            })
            res.send(JSON.stringify({ error: err }))
        })
    }).catch(err => {
        logger.error('Error saving stock history', {
            error: err
        });
        console.log('Error to save  in the stock history', err)
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * POST: Add stock details to an existing project
 * 
 * Description:
 * - Saves a new stock history record for an existing component using `req.body.stockHistory`.
 * - Updates the existing component with the latest details from `req.body.component`.
 * - If component update fails after saving stock history, the newly added stock history is removed to maintain consistency.
 * - Logs all key actions and errors for debugging and traceability.
 * 
 * @param {*} req - Express request object containing:
 *   - stockHistory: Object with new stock transaction details
 *   - component: Object with updated component details (_id must be present)
 * @param {*} res - Express response object returning success or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.postExistingProject = (req, res) => {

    var newStockHistory = new StockHistory(req.body.stockHistory)
    newStockHistory.save().then(result => {

        Component.findByIdAndUpdate(req.body.component._id, req.body.component)
            .then(result => {
                logger.info('Component and stock details updated successfully');
                res.send(JSON.stringify({ message: 'component and stockDetails updated sucessfully' }))
            }).catch(err => {
                logger.error('Error updating component after saving stock history', {
                    error: err
                });
                console.log(err);
                newStockHistory.deleteOne({
                    _id: result._id.toString()
                })
                res.send(JSON.stringify({ error: 'component and stockDetails update is failed' }))
            })
    }).catch(err => {
        console.log(err);
        logger.error('Error saving stock history', {
            error: err
        });
        res.send(JSON.stringify({ error: 'stockDetails update is failed' }))
    })
}



/**
 * POST: Add issued stock component data
 * 
 * Description:
 * - Saves a new stock history record for an issued component using `req.body.stockHistory`.
 * - Updates the existing component with the latest details from `req.body.component`.
 * - If the component update fails after saving stock history, the newly added stock history record is removed to maintain data consistency.
 * - Logs all key actions and errors for monitoring and debugging.
 * 
 * @param {*} req - Express request object containing:
 *   - stockHistory: Object with the issued stock transaction details
 *   - component: Object with updated component details (_id must be present)
 * @param {*} res - Express response object returning success or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.postIssuedStockComponent = async (req, res) => {
    try {
        const { stockHistory } = req.body;

        if (!stockHistory || !stockHistory.componentId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request: componentId is required'
            });
        }

        const issueQty = Number(stockHistory.quantity);

        if (issueQty <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Issue quantity must be greater than 0'
            });
        }

        // Fetch latest component from DB (CRITICAL)
        const component = await Component.findById(stockHistory.componentId);

        if (!component) {
            return res.status(404).json({
                success: false,
                message: 'Component not found'
            });
        }

        // Check stock availability
        if (component.totalQuantity < issueQty) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock available'
            });
        }
        
        // Update total quantity safely
        component.totalQuantity = Number(component.totalQuantity) - issueQty;
        console.log(component.stockDetails)
        console.log(stockHistory.projectName)
        // Update project-wise stockDetails
        for (let i = 0; i < component.stockDetails.length; i++) {
            
            if (component.stockDetails[i].projectName.toString() === stockHistory.projectName.toString()) {
                component.stockDetails[i].quantity = Number(component.stockDetails[i].quantity) - issueQty;
                component.stockDetails[i].modifier = stockHistory.inventoryHandler;
                component.stockDetails[i].modifiedDate = new Date();
            }
        }

        // Save stock history
        const newStockHistory = new StockHistory(stockHistory);
        await newStockHistory.save();

        // Save updated component
        const updatedComponent = await component.save();

        return res.status(200).json({
            success: true,
            message: 'Component issued successfully',
            data: updatedComponent
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Failed to issue component',
            error: err.message
        });
    }
};


// exports.postIssuedStockComponent = (req, res) => {

//     var newStockHistory = new StockHistory(req.body.stockHistory)
//     newStockHistory.save().then(result => {
//         Component.findByIdAndUpdate(req.body.component._id, req.body.component)
//             .then(result => {
//                 logger.info('Component and stock details updated successfully');
//                 res.send(JSON.stringify({ message: 'component and stockDetails updated sucessfully' }))
//             }).catch(err => {
//                 console.log(err);
//                 logger.error('Error updating component after saving stock history', {
//                     error: err
//                 });
//                 newStockHistory.deleteOne({
//                     _id: result._id.toString()
//                 })
//                 res.send(JSON.stringify({ error: 'component and stockDetails update is failed' }))
//             })
//     }).catch(err => {
//         console.log(err);
//         logger.error('Error saving stock history', {
//             error: err
//         });
//         res.send(JSON.stringify({ error: 'stockDetails update is failed' }))
//     })
// }


exports.postReturnStockComponent = async (req, res) => {
    try {
        const { stockHistory } = req.body;

        // ===== 1. BASIC VALIDATION =====
        if (!stockHistory) {
            return res.status(400).json({
                success: false,
                message: 'Stock history payload is required'
            });
        }

        const {
            componentId,
            projectName,
            quantity,
            inventoryHandler,
            issuedTo,
            note
        } = stockHistory;

        if (!componentId) {
            return res.status(400).json({
                success: false,
                message: 'componentId is required'
            });
        }

        const returnQty = Number(quantity);

        if (!returnQty || returnQty <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Return quantity must be greater than 0'
            });
        }

        // ===== 2. FETCH LATEST COMPONENT (SOURCE OF TRUTH) =====
        const component = await Component.findById(componentId);

        if (!component) {
            return res.status(404).json({
                success: false,
                message: 'Component not found'
            });
        }

        // ===== 3. UPDATE TOTAL QUANTITY (RETURN = ADD STOCK) =====
        component.totalQuantity =
            Number(component.totalQuantity) + returnQty;

        // ===== 4. UPDATE PROJECT-WISE STOCK DETAILS =====
        
        for (let i = 0; i < component.stockDetails.length; i++) {
            const stockDetail = component.stockDetails[i];
            if (stockDetail.projectName.toString() === projectName.toString()) {
                stockDetail.quantity = Number(stockDetail.quantity || 0) + returnQty;
                stockDetail.modifier = inventoryHandler;
                stockDetail.modifiedDate = new Date();
            }
        }

        // ===== 5. SAVE RETURN HISTORY =====
        const newStockHistory = new StockHistory({
            componentId,
            projectName,
            quantity: returnQty,
            inventoryHandler,
            issuedTo,
            supplierName: null,
            supplierPartNo: null,
            date: new Date(),
            transactionType: 'returned',
            note
        });

        const savedHistory = await newStockHistory.save();

        // ===== 6. SAVE UPDATED COMPONENT =====
        const updatedComponent = await component.save();

        // ===== 7. SUCCESS RESPONSE =====
        return res.status(200).json({
            success: true,
            message: 'Component returned successfully',
            data: {
                component: updatedComponent,
                stockHistory: savedHistory
            }
        });

    } catch (err) {
        console.error('postReturnStockComponent Error:', err);

        return res.status(500).json({
            success: false,
            message: 'Internal server error while returning component',
            error: err.message
        });
    }
};





// future developement task
// exports.postConsumeStockComponent = async (req, res) => {
//     try {
//         const { stockHistory } = req.body;

//         // ===== 1. BASIC VALIDATION =====
//         if (!stockHistory) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Stock history payload is required'
//             });
//         }

//         const {
//             componentId,
//             projectName,
//             quantity,
//             inventoryHandler,
//             issuedTo,
//             note
//         } = stockHistory;

//         if (!componentId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'componentId is required'
//             });
//         }

//         const consumeQty = Number(quantity);

//         if (!consumeQty || consumeQty <= 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Consumed quantity must be greater than 0'
//             });
//         }

//         // ===== 2. FETCH COMPONENT (SOURCE OF TRUTH) =====
//         const component = await Component.findById(componentId);

//         if (!component) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Component not found'
//             });
//         }

//         // ===== 3. VALIDATE TOTAL STOCK =====
//         if (Number(component.totalQuantity) < consumeQty) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Insufficient total stock'
//             });
//         }

//         // ===== 4. FIND PROJECT STOCK =====
//         let projectStockFound = false;

//         for (let i = 0; i < component.stockDetails.length; i++) {
//             const stockDetail = component.stockDetails[i];

//             if (stockDetail.projectName.toString() === projectName.toString()) {

//                 projectStockFound = true;

//                 if (Number(stockDetail.quantity || 0) < consumeQty) {
//                     return res.status(400).json({
//                         success: false,
//                         message: 'Insufficient stock for selected project'
//                     });
//                 }

//                 // Deduct project stock
//                 stockDetail.quantity =
//                     Number(stockDetail.quantity) - consumeQty;

//                 stockDetail.modifier = inventoryHandler;
//                 stockDetail.modifiedDate = new Date();
//             }
//         }

//         if (!projectStockFound) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Project stock not found'
//             });
//         }

//         // ===== 5. DEDUCT TOTAL STOCK =====
//         component.totalQuantity =
//             Number(component.totalQuantity) - consumeQty;

//         // ===== 6. SAVE STOCK HISTORY =====
//         const newStockHistory = new StockHistory({
//             componentId,
//             projectName,
//             quantity: consumeQty,
//             inventoryHandler,
//             issuedTo,
//             supplierName: null,
//             supplierPartNo: null,
//             date: new Date(),
//             transactionType: "consumed",
//             note
//         });

//         const savedHistory = await newStockHistory.save();

//         // ===== 7. SAVE UPDATED COMPONENT =====
//         const updatedComponent = await component.save();

//         return res.status(200).json({
//             success: true,
//             message: 'Component consumed successfully',
//             data: {
//                 component: updatedComponent,
//                 stockHistory: savedHistory
//             }
//         });

//     } catch (err) {
//         console.error('postConsumeStockComponent Error:', err);

//         return res.status(500).json({
//             success: false,
//             message: 'Internal server error while consuming component',
//             error: err.message
//         });
//     }
// };


exports.postConsumedComponent = async (req, res) => {
    try {
        const { stockHistory } = req.body;

        if (!stockHistory) {
            return res.status(400).json({
                success: false,
                message: "Stock history payload is required"
            });
        }

        const {
            componentId,
            projectName,
            quantity,
            inventoryHandler,
            issuedTo,
            note
        } = stockHistory;

        if (!componentId || !projectName) {
            return res.status(400).json({
                success: false,
                message: "componentId and projectName are required"
            });
        }

        const consumeQty = Number(quantity);

        if (!consumeQty || consumeQty <= 0) {
            return res.status(400).json({
                success: false,
                message: "Consumed quantity must be greater than 0"
            });
        }

        // ===== FETCH COMPONENT =====
        const component = await Component.findById(componentId);

        if (!component) {
            return res.status(404).json({
                success: false,
                message: "Component not found"
            });
        }

        // ===== VALIDATE TOTAL STOCK =====
        // if (Number(component.totalQuantity) < consumeQty) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Insufficient total stock"
        //     });
        // }

        // ===== FIND PROJECT STOCK =====
        let projectFound = false;

        for (let i = 0; i < component.stockDetails.length; i++) {
            const stockDetail = component.stockDetails[i];

            if (stockDetail.projectName.toString() === projectName.toString()) {

                // projectFound = true;

                // if (Number(stockDetail.quantity || 0) < consumeQty) {
                //     return res.status(400).json({
                //         success: false,
                //         message: "Insufficient stock for selected project"
                //     });
                // }

                // Deduct project quantity
                // stockDetail.quantity =
                //     Number(stockDetail.quantity) - consumeQty;

                // Mirror what frontend tried to do
                stockDetail.modifier = inventoryHandler;
                stockDetail.modifiedDate = new Date();
            }
        }

        // if (!projectFound) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Project stock not found"
        //     });
        // }

        // ===== DEDUCT TOTAL QUANTITY =====
        // component.totalQuantity =
        //     Number(component.totalQuantity) - consumeQty;

        // ===== SAVE HISTORY =====
        const newHistory = new StockHistory({
            componentId,
            projectName,
            quantity: consumeQty,
            inventoryHandler,
            issuedTo,
            supplierName: null,
            supplierPartNo: null,
            date: new Date(),
            transactionType: "consumed",
            note
        });

        await newHistory.save();

        // ===== SAVE COMPONENT =====
        const updatedComponent = await component.save();

        return res.status(200).json({
            success: true,
            message: "Component consumed successfully",
            data: updatedComponent
        });

    } catch (err) {
        console.error("postIssuedComponent Error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};


/**
 * POST: Update component notification quantity
 * 
 * Description:
 * - Updates the notification quantity (or other relevant fields) of a component using `req.body`.
 * - The component is identified by `_id` in `req.body`.
 * - Logs the update action and any errors encountered.
 * 
 * @param {*} req - Express request object containing the component data to update (must include `_id`)
 * @param {*} res - Express response object returning success or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.postNotificationQuantity = (req, res) => {
    console.log(req.body)
    Component.findByIdAndUpdate(req.body._id, req.body).then(result => {
        console.log('component', result)
        logger.info('Notification qty updated successfully');
        res.send(JSON.stringify({ message: 'Notification qty updated sucessfully' }))
    }).catch(err => {
        logger.error('Error updating component', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ error: 'component and stockDetails update is failed' }))
    })
}



/**
 * GET: Fetch stock history data filtered by 'issuedTo'
 * 
 * Description:
 * - Retrieves all stock history records where the `issuedTo` field matches the specified user.
 * - Logs the retrieval action and any errors encountered.
 * 
 * @param {*} req - Express request object containing `req.body.user` (the user to filter by)
 * @param {*} res - Express response object returning the filtered stock history or an error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getStockHistoryByIssuedTo = (req, res) => {
    StockHistory.find({ issuedTo: req.body.user }).then(history => {
        logger.info('Fetched stock history by issued to');
        // console.log(history)
        res.send(history)
    }).catch(err => {
        logger.error('Error fetching stock history by issued to', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ Error: err }))
    })
}



/**
 * GET: Fetch stock history data using filter conditions
 * 
 * Description:
 * - Retrieves stock history records that match the fields specified in `req.body`.
 * - Flexible filtering: any combination of StockHistory fields can be used.
 * - Logs the retrieval action and any errors encountered.
 * 
 * @param {*} req - Express request object containing filter conditions in `req.body`
 * @param {*} res - Express response object returning the filtered stock history or an error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getStockHistoryByFilter = (req, res) => {
    // console.log(req.body)
    StockHistory.find(req.body).then(history => {
        // console.log(history)
        logger.info('Fetched stock history by filter');
        res.send(history)
    }).catch(err => {
        logger.error('Error fetching stock history by filter', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ Error: err }))
    })
}



/**
 * GET: Fetch stock history for a specific issued user
 * 
 * Description:
 * - Accepts `issuedUser` as a query parameter (employeeCode).
 * - Finds the corresponding user and retrieves all stock history entries issued to them.
 * - Populates the `componentId` field to include component details in the response.
 * - Returns a JSON array of stock history or an error message if the user is not found or on server error.
 * 
 * @param {*} req - Express request object containing query parameter `issuedUser`
 * @param {*} res - Express response object returning stock history data or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getStockHistoryFromIssuedUser = async (req, res) => {
    try {
        let employeeCode = req.query.issuedUser;

        // Find the user based on employeeCode
        const user = await User.findOne({ employeeCode });

        if (!user) {
            logger.warn('User not found', { employeeCode });
            return res.json({ error: 'User is not found' });
        }

        // Find stock history entries for the user and populate componentId
        const stockHistory = await StockHistory.find({ issuedTo: user._id }).populate('componentId');
        logger.info('Fetched stock history for user');
        // console.log(stockHistory);
        res.json(stockHistory);
    } catch (err) {
        logger.error('Internal server error fetching stock history for user', {
            error: err
        });
        console.error(err);
        res.json({ error: 'Internal Server Error' });
    }
}



/**
 * GET: Fetch components based on filter with pagination
 * 
 * Description:
 * - Accepts filter criteria in `req.body` (category, manufacturer, supplier, project, batchNo).
 * - Supports pagination via query parameters `page` and `limit`.
 * - Builds a dynamic query based on provided filters.
 * - Fetches components sorted by `_id` in descending order.
 * - Returns a JSON object containing:
 *      - `components`: array of matching component documents
 *      - `totalPages`: total number of pages available
 *      - `currentPage`: current page number
 *      - `filter`: applied filter criteria
 * - Logs actions and handles errors gracefully.
 * 
 * @param {*} req - Express request object containing filters in body and pagination in query
 * @param {*} res - Express response object returning filtered components and pagination info
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getComponentByFilter = (req, res) => {
    // console.log('component request body', req.body)
    // console.log('comp request query', req.query)
    let filter = req.body;
    let currentPage = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (currentPage - 1) * limit;
    // console.log("filter:", filter);
    if (filter.category === '') delete filter.category;
    if (filter.manufacturer === '') delete filter.manufacturer;
    if (filter.supplier === '') delete filter.supplier;
    if (filter.project === '') delete filter.project;
    if (filter.batchNo === '') delete filter.batchNo;
    let query = {}
    if (filter.category) query.categoryName = filter.category;
    if (filter.manufacturer) query.manufacturer = filter.manufacturer;
    if (filter.supplier) query.supplierName = filter.supplier;
    if (filter.project) query['stockDetails.projectName'] = filter.project;
    if (filter.batchNo) query['stockDetails.batchNo'] = filter.batchNo;

    logger.info('Fetching components by filter', { query, currentPage, limit });

    Component.find(query)
        .sort({ _id: -1 }) // Sort the entire dataset in descending order by _id
        .skip(skip)
        .limit(limit)
        .then(components => {
            // console.log("componentinventory:", components);
            return Component.countDocuments(query).then(count => ({ components, count }))


        }).then(({ components, count }) => {
            let totalPages = Math.ceil(count / limit);
            let response = {
                components: components, // it reverse the component data 
                totalPages: totalPages,
                currentPage: currentPage,
                filter: filter // Preserving filter criteria in the response
            };

            res.send(response)

        })
        .catch(err => {
            logger.error('Error fetching components by filter', {
                error: err
            });
            console.log(err);
            res.send(JSON.stringify({ error: err }));
        })
}



/**
 * POST: Move a component from one project to another
 * 
 * Description:
 * - Creates a new `StockHistory` entry reflecting the project transfer.
 * - Updates the corresponding `Component` document with new stock/project details.
 * - Handles success and error scenarios with proper logging.
 * 
 * @param {*} req - Express request object containing:
 *                   - `stockHistory`: object with stock movement details
 *                   - `component`: updated component object
 * @param {*} res - Express response object returning success or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.postMovedComponent = (req, res) => {

    let newStockHistory = new StockHistory(req.body.stockHistory)
    newStockHistory.save().then(result => {

        Component.findByIdAndUpdate(req.body.component._id, req.body.component)
            .then(result => {
                logger.info('Component and stock details updated successfully');
                res.send(JSON.stringify({ message: 'component and stockDetails updated sucessfully' }))
            }).catch(err => {
                console.log(err);
                logger.error('Error updating component after saving stock history', {
                    error: err
                });
                res.send(JSON.stringify({ error: 'component and stockDetails update is failed' }))
            })
    }).catch(err => {
        logger.error('Error saving stock history', {
            error: err
        });
        console.log(err)
    })
}



/**
 * POST: Update component location details
 * 
 * Description:
 * - Updates the `Component` document with new location data using its `_id`.
 * - Logs success or failure of the update operation.
 * 
 * @param {*} req - Express request object containing updated component data in `req.body`
 * @param {*} res - Express response object returning success or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.updateLocationDetail = (req, res) => {

    Component.findByIdAndUpdate(req.body._id, req.body).then(result => {
        logger.info('Location detail updated successfully');
        res.send(JSON.stringify({ message: 'Location Detail updated sucessfully' }))
    }).catch(err => {
        console.log(err);
        logger.error('Error updating location detail', {
            error: err
        });
        res.send(JSON.stringify({ error: 'Location Detail update is failed' }))
    })
}



/**
 * GET: Fetch the list of all project names
 * 
 * Description:
 * - Retrieves all `Project` documents from the database.
 * - Returns an object mapping each project's `_id` to its `name`.
 * - Logs the success or failure of the fetch operation.
 * 
 * @param {*} req - Express request object
 * @param {*} res - Express response object returning the project name mapping or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getProjectNameList = (req, res) => {
    Project.find().then(result => {
        let resultObject = {};
        result.forEach(element => {
            let id = element._id;
            resultObject[id] = element.name
        })
        logger.info('Fetched project names');
        res.send(resultObject)
    }).catch(err => {
        console.log(err)
        logger.error('Error fetching project names', {
            error: err
        });
        res.send(JSON.stringify({ error: err }))
    })
}



/**
/**
 * GET: Fetch the list of all category names
 * 
 * Description:
 * - Retrieves all `Category` documents from the database.
 * - Returns an object mapping each category's `_id` to its `name`.
 * - Logs the success or failure of the fetch operation.
 * 
 * @param {*} req - Express request object
 * @param {*} res - Express response object returning the category name mapping or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getCategoryNameList = (req, res) => {
    Category.find().then(result => {
        let resultObject = {}
        result.forEach(element => {
            let id = element._id
            resultObject[id] = element.name
        })
        logger.info('Fetched category names');
        res.send(resultObject)
    }).catch(err => {
        logger.error('Error fetching category names', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * GET: Fetch the list of all supplier names
 * 
 * Description:
 * - Retrieves all `Supplier` documents from the database.
 * - Returns an object mapping each supplier's `_id` to its `name`.
 * - Logs the success or failure of the fetch operation.
 * 
 * @param {*} req - Express request object
 * @param {*} res - Express response object returning the supplier name mapping or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getSupplierNameList = (req, res) => {
    Supplier.find().then(result => {
        let resultObject = {}
        result.forEach(element => {
            let id = element._id
            resultObject[id] = element.name
        })
        logger.info('Fetched supplier names');
        // console.log(resultObject)
        res.send(resultObject)
    }).catch(err => {
        console.log(err)
        logger.error('Error fetching supplier names', {
            error: err
        });
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * GET: Fetch the list of all manufacturer names
 * 
 * Description:
 * - Retrieves all `Manufacturer` documents from the database.
 * - Returns an object mapping each manufacturer's `_id` to its `name`.
 * - Logs success or error for tracking and debugging purposes.
 * 
 * @param {*} req - Express request object
 * @param {*} res - Express response object returning the manufacturer name mapping or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getManufacturerNameList = (req, res) => {
    Manufacturer.find().then(result => {
        let resultObject = {}
        result.forEach(element => {
            let id = element._id
            resultObject[id] = element.name
        })
        logger.info('Fetched manufacturer names');
        // console.log(resultObject)
        res.send(resultObject)
    }).catch(err => {
        console.log(err)
        logger.error('Error fetching manufacturer names', {
            error: err
        });
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * GET: Fetch shelf location list
 * 
 * Description:
 * - Retrieves all `ShelfLocation` documents from the database.
 * - Returns an object mapping each shelf's `_id` to:
 *      - `shelfName`: Name of the shelf
 *      - `boxNames`: Object mapping each box's `_id` to its `name`
 * - Logs success or error for tracking and debugging purposes.
 * 
 * @param {*} req - Express request object
 * @param {*} res - Express response object returning the shelf-location mapping or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getShelfLocationList = (req, res) => {
    ShelfLocation.find().then(result => {

        let resultObject = {}
        result.forEach(shelf => {
            let id = shelf._id
            resultObject[id] = { shelfName: shelf.shelfName, boxNames: {} }
            shelf.boxNames.forEach(box => {
                // console.log(box)
                resultObject[id].boxNames[box._id] = box.name
            })
        })
        logger.info('Fetched shelf location list');
        // console.log(resultObject)
        res.send(resultObject)
    }).catch(err => {
        console.log(err)
        logger.error('Error fetching shelf location list', {
            error: err
        });
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * GET: Fetch stock history by component ID
 * 
 * Description:
 * - Retrieves all `StockHistory` records associated with a specific component ID.
 * - Populates `supplierName` and `issuedTo` fields for detailed reference.
 * - Logs the operation success or failure for monitoring.
 * 
 * @param {*} req - Express request object containing `filter` query parameter (component ID)
 * @param {*} res - Express response object returning stock history array or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.getStockHistoryByCompId = (req, res) => {
    StockHistory.find({ componentId: req.query.filter }).populate('supplierName').populate('issuedTo').then(stockHistory => {
        // console.log('Deepak cnjdnfjen', stockHistory)
        logger.info('Fetched stock history by component id');
        res.send(stockHistory)
    }).catch(err => {
        logger.error('Error fetching stock history by component id', {
            error: err
        });
        console.log(err)
        res.send(JSON.stringify({ error: err }))
    })
}



/**
 * POST: Check uploaded component data via CSV
 * 
 * Description:
 * - Processes uploaded CSV data containing stock/component details.
 * - For each stock history entry in CSV, finds matching `StockHistory` records in the database.
 * - Populates `componentId` for each matched stock history to get detailed component information.
 * - Checks that component fields (`manufacturerPartNumber`, `package`, `description`, `categoryName`, `manufacturer`) match the CSV entry.
 * - Collects all matching components in `componentsArray` and returns them in response.
 * - Logs the operation success and any errors for monitoring.
 * 
 * @param {*} req - Express request object containing CSV data in `req.body`
 * @param {*} res - Express response object returning matched components array or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.checkUploadComponentCSV = async (req, res) => {
    console.log('Checking uploaded CSV file', req.body.length);
    logger.info('Checking uploaded CSV file', { length: req.body.length });

    try {
        const stockHistoriesData = req.body;
        const componentsArray = [];
        const uniqueComponentIds = new Set();

        for (const stockHistory of stockHistoriesData) {
            // Find matching stock history records
            const componentStockHistories = await StockHistory.find({
                projectName: stockHistory.projectName,
                quantity: stockHistory.quantity,
                supplierName: stockHistory.supplierName
            }).populate('componentId');

            // console.log('component stock History',componentStockHistories)

            for (const componentStockHistory of componentStockHistories) {
                const component = componentStockHistory.componentId;
                // if (component && !uniqueComponentIds.has(component._id.toString())) {
                if (component) {
                    const isMatch = component.manufacturerPartNumber === stockHistory.manufacturerPartNumber
                        && component.package === stockHistory.package
                        && component.description === stockHistory.description
                        && component.categoryName.toString() === stockHistory.categoryName.toString()
                        && component.manufacturer.toString() === stockHistory.manufacturer.toString();

                    if (isMatch) {
                        // componentsArray.push(component);
                        componentsArray.push(componentStockHistory);
                        // uniqueComponentIds.add(component._id.toString());
                    }
                }
            }
        }

        console.log('Component Array', componentsArray);
        console.log('Component Array Length', componentsArray.length);

        logger.info('Component array processed', {
            count: componentsArray.length
        });

        res.json({
            message: "Components checked successfully",
            components: componentsArray
        });
    } catch (error) {
        logger.error('Error checking components', {
            error: error
        });
        console.error("Error checking components:", error);
        res.status(500).json({ error: error.message });
    }
};



/**
 * POST: Upload component data via CSV file
 * 
 * Description:
 * - Processes uploaded CSV data containing component and stock details.
 * - Aggregates stock quantities per project to avoid duplicates.
 * - Checks if a component with the same `manufacturerPartNumber` already exists:
 *    - If it exists, updates `stockDetails` and total quantity, and creates corresponding `StockHistory` records.
 *    - If it doesn't exist, generates a new `componentId` using category abbreviation and sequenceId, creates the component, and saves stock history.
 * - Updates the category sequenceId for newly created components.
 * - Logs important operations and errors for tracking.
 * - Returns a success message after all components are processed.
 * 
 * @param {*} req - Express request object containing CSV data in `req.body.components`
 * @param {*} res - Express response object with success or error message
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.uploadComponentCSVFile = async (req, res) => {
    // console.log('upload csv file',req.body)
    logger.info('Uploading component CSV file');

    try {
        let components = req.body.components;

        for (let component of components) {
            let stockDetailsHistory = [];
            let stockDetailMap = {};

            for (let stock of component.stockDetails) {
                stockDetailsHistory.push(stock);

                let projectName = stock.projectName;
                if (stockDetailMap[projectName]) {
                    stockDetailMap[projectName].quantity += stock.quantity;
                } else {
                    stockDetailMap[projectName] = { ...stock };
                }
            }

            const aggregatedStockDetails = Object.values(stockDetailMap);
            component.stockDetails = aggregatedStockDetails;

            const existingComponent = await Component.findOne({
                manufacturerPartNumber: component.manufacturerPartNumber,
                projectName: component.projectName
            });

            if (existingComponent) {
                for (let stock of component.stockDetails) {
                    // console.log('stock', stock)
                    const existingStock = existingComponent.stockDetails.find(s => s.projectName.toString() === stock.projectName.toString());
                    // console.log('existingStock', existingStock);
                    if (existingStock) {
                        existingStock.quantity += stock.quantity
                        existingStock.notificationQuantity = stock.notificationQuantity
                    } else {
                        existingComponent.stockDetails.push(stock)
                    }
                }

                existingComponent.totalQuantity += component.totalQuantity
                await existingComponent.save()

                for (let stock of stockDetailsHistory) {
                    let newStockHistory = new StockHistory({
                        componentId: existingComponent._id.toString(),
                        projectName: stock.projectName,
                        quantity: stock.quantity,
                        inventoryHandler: stock.modifier,
                        issuedTo: null,
                        date: stock.modifiedDate,
                        transactionType: 'add',
                        supplierName: stock.supplierName,
                        supplierPartNo: stock.supplierPartNo,
                        note: null
                    })

                    try {
                        await newStockHistory.save()
                    } catch (err) {
                        console.log(err)
                        logger.error('Error saving stock history', {
                            componentId: existingComponent._id.toString(),
                            error: err.message,
                            stack: err.stack
                        });
                        return res.send(JSON.stringify({ error: err }));
                    }
                }
                logger.info('Component and stock history updated successfully');
                // console.log('Component and stock history updated successfully', existingComponent);
                continue;
            }

            // const category = await Category.findOne({ _id: component.categoryName });


            // category.sequenceId += 1;
            // const incrementSeqId = category.sequenceId;
            const category = await Category.findOneAndUpdate(
                { _id: component.categoryName },
                { $inc: { sequenceId: 1 } },
                { new: true }
            );
            if (!category) {
                return res.send(JSON.stringify({ error: 'Category is not found' }));
            }
            const incrementSeqId = category.sequenceId;
            const formattedSequenceId = incrementSeqId.toString().padStart(4, '0');
            let componentId = `${category.abbreviation}-${formattedSequenceId}`;

            // console.log(component);
            const newComponent = new Component({
                creator: component.creator,
                package: component.package,
                description: component.description,
                id: componentId,
                totalQuantity: component.totalQuantity,
                stockDetails: component.stockDetails,
                manufacturer: component.manufacturer,
                manufacturerPartNumber: component.manufacturerPartNumber,
                categoryName: component.categoryName,
                notificationQuantity: component.notificationQuantity,
                comment: component.comment
            });

            const savedComponent = await newComponent.save();
            await category.save();

            for (const stock of stockDetailsHistory) {
                const newStockHistory = new StockHistory({
                    componentId: savedComponent._id.toString(),
                    projectName: stock.projectName,
                    quantity: stock.quantity,
                    inventoryHandler: stock.modifier,
                    issuedTo: null,
                    date: stock.modifiedDate,
                    transactionType: 'create',
                    supplierName: stock.supplierName,
                    supplierPartNo: stock.supplierPartNo,
                    note: null
                });

                try {
                    await newStockHistory.save();
                } catch (err) {
                    logger.error('Error saving new stock history', {
                        error: err
                    });
                    console.log(err);
                    await newComponent.deleteOne({ _id: savedComponent._id });
                    category.sequenceId -= 1;
                    await category.save();
                    return res.send(JSON.stringify({ error: err }));
                }
            }

            console.log('Component and stock history saved successfully', savedComponent);
            logger.info('Component and stock history saved successfully');
        }

        res.send(JSON.stringify({ message: 'Components File Uploaded Successfully', status: 'success' }));


    }
    // Respond with the updated components
    // res.status(200).send({ success: true, components });
    catch (err) {
        logger.error('Error uploading component CSV file', {
            error: err
        });
        console.log(err);
        res.status(500).send({ success: false, message: 'An error occurred', error: err });
    }
};



/**
 * POST: Export project data to CSV file
 * 
 * Description:
 * - Fetches all components associated with the selected project (`req.body.selectedProject`).
 * - For each component, fetches its stock history records filtered by the selected project.
 * - Populates `issuedTo` field in the stock history to get user details.
 * - Aggregates components with their respective stock history into a single JSON response.
 * - Handles errors if:
 *    - No components are found for the project.
 *    - There is an issue fetching stock history or components.
 * - Returns a JSON response containing components and their stock histories for CSV export.
 * 
 * @param {*} req - Express request object containing `selectedProject` in body
 * @param {*} res - Express response object with JSON of components and stock histories or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.exportProjectCSVFile = async (req, res) => {
    logger.info('Exporting project data by CSV file', { selectedProject: req.body.selectedProject });
    const { selectedProject, checkChoice } = req.body;
    console.log('selected project', selectedProject)
    console.log('check choice', checkChoice)
    try {

        const components = await Component.find({
            'stockDetails.projectName': selectedProject
        }).populate('stockDetails.projectName')
            .populate('stockDetails.locationDetail.shelfName')
            .populate('manufacturer')
            .populate('categoryName')
            .lean();

        if (!components.length) {
            return res.status(404).json({ error: 'No data found' });
        }

        const workbook = new ExcelJs.Workbook();
        console.log('workbook', workbook);
        const componentSheet = workbook.addWorksheet('components');

        componentSheet.columns = [
            { header: 'Manufacturer Part No', key: 'mpn', width: 25 },
            { header: 'Manufacturer', key: 'manufacturer', width: 20 },
            { header: 'Description', key: 'description', width: 30 },
            { header: 'Package', key: 'package', width: 15 },
            { header: 'Project', key: 'project', width: 20 },
            { header: 'Quantity', key: 'quantity', width: 12 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Shelf', key: 'shelf', width: 15 },
            { header: 'Box', key: 'box', width: 15 },
            { header: 'Comment', key: 'comment', width: 30 }
        ]

        let historySheet;
        if (checkChoice) {
            historySheet = workbook.addWorksheet('Stock History')
            historySheet.columns = [
                { header: 'MPN', key: 'mpn', width: 25 },
                { header: 'Transaction Type', key: 'type', width: 20 },
                { header: 'Quantity', key: 'quantity', width: 10 },
                { header: 'Handler', key: 'handler', width: 20 },
                { header: 'Issued To', key: 'issuedTo', width: 25 },
                { header: 'Supplier', key: 'supplier', width: 20 },
                { header: 'Supplier Part No', key: 'supplierPart', width: 20 },
                { header: 'Note', key: 'note', width: 30 },
                { header: 'Date', key: 'date', width: 20 }
            ]
        }

        for (const component of components) {
            for (const stock of component.stockDetails) {

                if (stock.projectName._id.toString() !== selectedProject) continue;

                // ===== RESOLVE BOX NAME =====
                let boxName = '';

                const shelf = stock.locationDetail?.shelfName;
                const boxId = stock.locationDetail?.boxNames;

                if (shelf && boxId && Array.isArray(shelf.boxNames)) {
                    const box = shelf.boxNames.find(
                        b => b._id.toString() === boxId.toString()
                    );
                    boxName = box?.name || '--';
                }

                componentSheet.addRow({
                    mpn: component.manufacturerPartNumber || '--',
                    manufacturer: component.manufacturer?.name || '--',
                    description: component.description || '--',
                    package: component.package || '--',
                    project: stock.projectName?.name || '--',
                    quantity: stock.quantity ?? 0,
                    category: component.categoryName?.name || '--',
                    shelf: stock.locationDetail?.shelfName?.shelfName || '--',
                    box: boxName,
                    comment: component.comment || '--'
                });

                if (checkChoice) {
                    const histories = await StockHistory
                        .find({
                            componentId: component._id,
                            projectName: selectedProject
                        }).populate('issuedTo').populate('supplierName').lean();

                    histories.forEach(h => {
                        historySheet.addRow({
                            mpn: component?.manufacturerPartNumber || '--',
                            type: h?.transactionType || '--',
                            quantity: h?.quantity || '--',
                            handler: h?.inventoryHandler || '--',
                            issuedTo: `${h?.issuedTo?.employeeCode || '--'} ${h?.issuedTo?.loginId || '--'}`.trim(),
                            supplier: h?.supplierName?.name || '--',
                            supplierPart: h?.supplierPartNo || '--',
                            note: h?.note || '--',
                            date: h?.date ? new Date(h.date).toLocaleDateString('en-IN') : '--'
                        });
                    });
                }
            }
        }



        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=components.xlsx'
        )

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log('error', error)
    }
};



/**
 * POST: Search components with pagination
 * 
 * Description:
 * - Accepts a search text in `req.body.searchText`.
 * - Performs a case-insensitive search on multiple fields: `creator`, `manufacturerPartNumber`, `package`, `description`, `id`, and `comment`.
 * - Supports pagination via query parameters `page` and `limit`. Defaults: page = 1, limit = 10.
 * - Returns matching components along with total pages and current page in the response.
 * - Handles errors and logs them.
 * 
 * Example Response:
 * {
 *   components: [...], // array of matching component documents
 *   totalPages: 5,
 *   currentPage: 1
 * }
 * 
 * @param {*} req - Express request object containing `searchText` in body and optional `page` and `limit` in query
 * @param {*} res - Express response object with search results or error
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.searchComponents = (req, res) => {
    let searchQuery = req.body.searchText;
    let searchRegex = new RegExp(searchQuery, 'i');

    let currentPage = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (currentPage - 1) * limit;

    Component.find({
        $or: [
            { creator: searchRegex },
            { manufacturerPartNumber: searchRegex },
            { package: searchRegex },
            { description: searchRegex },
            { id: searchRegex },
            { comment: searchRegex }
        ]
    })
        .skip(skip)
        .limit(limit)
        .then(components => {
            return Component.countDocuments({
                $or: [
                    { creator: searchRegex },
                    { manufacturerPartNumber: searchRegex },
                    { package: searchRegex },
                    { description: searchRegex },
                    { id: searchRegex },
                    { comment: searchRegex }
                ]
            }).then(count => ({ components, count }));
        })
        .then(({ components, count }) => {
            let totalPages = Math.ceil(count / limit);
            let response = {
                components: components,
                totalPages: totalPages,
                currentPage: currentPage
            };
            logger.info('Search components result');
            res.send(response);
        })
        .catch(err => {
            console.log(err);
            logger.error('Error searching components', {
                error: err
            });
            res.send(JSON.stringify({ error: err }));
        });
};



/**
 * Filter stock history by transaction type
 * 
 * Description:
 * - Filters `StockHistory` documents for a given `componentId` and one or two transaction types.
 * - Accepts in `req.body`:
 *   - `componentId`: ID of the component to filter by.
 *   - `transactionType1`: first transaction type (required).
 *   - `transactionType2`: second transaction type (optional).
 * - Populates `supplierName` and `issuedTo` references.
 * - Returns an array of filtered stock history records.
 * - Logs errors if query fails.
 * 
 * Example `req.body`:
 * {
 *   componentId: "64f123abcd...",
 *   transactionType1: "create",
 *   transactionType2: "add"
 * }
 * 
 * Response:
 * [
 *   {
 *     componentId: "...",
 *     projectName: "...",
 *     quantity: 10,
 *     transactionType: "create",
 *     supplierName: {...},
 *     issuedTo: {...},
 *     ...
 *   },
 *   ...
 * ]
 * 
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 */
exports.filterStockHistoryByTransactionType = (req, res) => {
    // console.log('Check hisotry fileter working ', req.body);
    const queryConditions = {
        componentId: req.body.componentId,
        $or: [
            { transactionType: req.body.transactionType1 },
            { transactionType: req.body.transactionType2 }
        ]
    };
    StockHistory.find(queryConditions)
        .populate('supplierName')
        .populate('issuedTo')
        .then(stockHistory => {
            // console.log(stockHistory)
            res.send(stockHistory)
        }).catch(err => {
            logger.error('Error filtering stock history by transaction type', {
                error: err
            });
            console.log(err)
        })
}
