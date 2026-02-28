/**
 * ---------------------------------------------------------------------
 * Routes: Hardware Department Management
 * 
 * Description:
 * This file defines all Express routes for managing hardware department 
 * operations, including:
 *   - CRUD operations for Manufacturer, Category, Supplier, Project, Shelf
 *   - Component management (create, update, delete, check IDs)
 *   - Stock management (issue, move, notification quantity, location updates)
 *   - Stock history retrieval and filtering
 *   - CSV/XLSX upload, validation, and export
 *   - Fetching lists for dropdowns (project, category, supplier, manufacturer, shelf)
 * 
 * Route Prefix: '/hardware'
 * 
 * Dependencies:
 *   - express
 *   - hardwareDepartmentController (controller handling business logic)
 * 
 * Notes:
 *   - Each route corresponds to a specific controller method.
 *   - Logging and error handling are managed inside the controller methods.
 *   - Routes support both GET and POST as per requirement.
 * ---------------------------------------------------------------------
 */
module.exports = app => {
  const HardwareDepartmentController = require('../controllers/electronic-component.controller');


  var router = require('express').Router();

  // Creating a manufacturer
  router.post('/manufacturer', HardwareDepartmentController.createManufacturer);

  // Getting the list of all manufacturers
  router.get('/manufacturer', HardwareDepartmentController.getAllManufacturer);

  // Deleting a manufacturer
  router.delete('/manufacturer', HardwareDepartmentController.deleteManufacturer);

  // Update a manufacturer 
  router.put('/manufacturer', HardwareDepartmentController.updateManufacturer);

  // Check the manufacturer name 
  router.get('/manufacturer/check/name', HardwareDepartmentController.checkManufacturerName)


  // Creating a category
  router.post('/category', HardwareDepartmentController.createCategory);

  // Getting the list of all manufacturers
  router.get('/category', HardwareDepartmentController.getAllCategory);

  // Deleting a category
  router.delete('/category', HardwareDepartmentController.deleteCategory);

  // Update a category 
  router.put('/category', HardwareDepartmentController.updateCategory);

  // Check the category name 
  router.get('/category/check/name', HardwareDepartmentController.checkCategoryName)

  // Check the category abbreviation name 
  router.get('/category/check/abbreviation', HardwareDepartmentController.checkAbbreviatedName)


  // Creating a supplier
  router.post('/supplier', HardwareDepartmentController.createSupplier);

  // Getting the list of all suppliers
  router.get('/supplier', HardwareDepartmentController.getAllSupplier);

  // Deleting a supplier
  router.delete('/supplier', HardwareDepartmentController.deleteSupplier);

  // Update a supplier 
  router.put('/supplier', HardwareDepartmentController.updateSupplier);

  // Check the supplier name 
  router.get('/supplier/check/name', HardwareDepartmentController.checkSupplierName)



  // Creating a project
  router.post('/project', HardwareDepartmentController.createProject);

  // Getting the list of all projects
  router.get('/project', HardwareDepartmentController.getAllProject);

  // Deleting a project
  router.delete('/project', HardwareDepartmentController.deleteProject);

  // Update a project 
  router.put('/project', HardwareDepartmentController.updateProject);

  // Check the supplier name 
  router.get('/project/check/name', HardwareDepartmentController.checkProjectName)



  // Creating a shelf
  router.post('/shelf', HardwareDepartmentController.createShelf);

  // Getting the list of all shelf
  router.get('/shelf', HardwareDepartmentController.getAllShelf);

  // Deleting a shelf
  router.delete('/shelf', HardwareDepartmentController.deleteShelf);

  // Update a shelf 
  router.put('/shelf', HardwareDepartmentController.updateShelf);

  // Check the supplier name 
  router.get('/shelf/check/name', HardwareDepartmentController.checkShelfName)



  // Create the component 
  router.post('/dash-component', HardwareDepartmentController.createComponentDash);


  // Fetch the component data
  //  router.get('/dash-component', HardwareDepartmentController.getAllComponetDash);

  // update the component by Id
  router.put('/dash-component', HardwareDepartmentController.updateComponentDash);

  // delete the components by name
  router.delete('/dash-component', HardwareDepartmentController.deleteComponentDash);

  // check component id 
  router.get('/checkComponentId', HardwareDepartmentController.checkComponentId);

  // check manufacturer part number
  router.get('/checkmanufacturerpartNo', HardwareDepartmentController.checkManufacturerPartNo)

  // Get All Batch Numbers Numbers Based on filter
  router.post('/batchNo', HardwareDepartmentController.getBatchNumberByFilter)

  // Get All Components based on filter
  router.post('/components', HardwareDepartmentController.getComponentByFilter);

  //POST: Add the new project data by using component _id
  router.post('/new-project', HardwareDepartmentController.postAddNewProject)

  //POST: Add in existing project data by using component _id
  router.post('/existingProject', HardwareDepartmentController.postExistingProject)

  //POST: Add the issued stock
  router.post('/issuedComponent', HardwareDepartmentController.postIssuedStockComponent);
  router.post('/returnComponent', HardwareDepartmentController.postReturnStockComponent);
  router.post('/consumedComponent', HardwareDepartmentController.postConsumedComponent);

  //POST: Add the notification quantity
  router.post('/notificationQuantity', HardwareDepartmentController.postNotificationQuantity);

  //GET: Fetch all the stock history by issued To
  router.post('/stockHistory', HardwareDepartmentController.getStockHistoryByIssuedTo);

  // GET: Fetch all the stock history of the issued person
  router.get('/stockHistory', HardwareDepartmentController.getStockHistoryFromIssuedUser)

  //POST: Add the stock history and update the components 
  router.post('/movedComponent', HardwareDepartmentController.postMovedComponent)

  //POST: Update location detail 
  router.post('/locationDetail', HardwareDepartmentController.updateLocationDetail);

  //GET: fetch the project name
  router.get('/projectName', HardwareDepartmentController.getProjectNameList)

  //GET: Fetch the category name
  router.get('/categoryName', HardwareDepartmentController.getCategoryNameList);

  //GET: Fetch the Supplier name
  router.get('/supplierName', HardwareDepartmentController.getSupplierNameList);

  //GET: Fetch the manufacturer name
  router.get('/manufacturerName', HardwareDepartmentController.getManufacturerNameList);

  //GET: Fetch the stock history data by component id
  router.get('/stockhisotry', HardwareDepartmentController.getStockHistoryByCompId);

  //GET: Fetch the shelf location name
  router.get('/shelfLocationName', HardwareDepartmentController.getShelfLocationList);

  //POST: upload the component csv and xlsx file
  router.post('/upload', HardwareDepartmentController.uploadComponentCSVFile)

  //POST: Check upload component csv file 
  router.post('/checkUpload', HardwareDepartmentController.checkUploadComponentCSV)

  //POST: Export the Project wise CSV file
  router.post('/export', HardwareDepartmentController.exportProjectCSVFile)


  //POST: Fetch all the stock history by issued To
  router.post('/stockHistory', HardwareDepartmentController.getStockHistoryByIssuedTo);

  //POST: Fetch all the stock history by Filter
  router.post('/stockHistoryFilter', HardwareDepartmentController.getStockHistoryByFilter);

  //POST: Search the component
  router.post('/searchedComponent', HardwareDepartmentController.searchComponents)


  // Filter stock history by transaction type 
  router.post('/filterHistoryByTransactionType', HardwareDepartmentController.filterStockHistoryByTransactionType)

  
  app.use('/hardware', router);
}