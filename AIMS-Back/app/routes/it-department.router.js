/**
 * ---------------------------------------------------------------------
 * Routes: IT Department / IT Inventory Management
 * 
 * Description:
 * This file defines all Express routes related to IT inventory management,
 * including:
 *   - CRUD operations for IT categories, subcategories, suppliers, and manufacturers
 *   - Fetching inventory data and filters
 *   - Managing inventory components (create, update, search)
 *   - Issuing and returning inventory stock
 *   - Uploading CSV/XLSX files for inventory
 *   - Fetching IT stock history and assigned user data
 *   - Exporting inventory data to CSV
 * 
 * Route Prefix: '/itinventory'
 * 
 * Dependencies:
 *   - express
 *   - ITDepartmentController (controller handling all IT inventory logic)
 * 
 * Notes:
 *   - Routes support GET, POST, PUT, and DELETE operations as required.
 *   - Logging and error handling are managed inside controller methods.
 * ---------------------------------------------------------------------
 */
module.exports = app => {


  const ITDepartmentController = require('../controllers/it-inventory.controller');
  var router = require('express').Router();//IT Inventory Section 

  console.log('IT INVENTORY ROUTER LOADED');
  //GET: fetch the IT project name
  router.get('/ITSubCategoryName', ITDepartmentController.getITSubCategoryNameList)

  //GET: Fetch the category name
  router.get('/ITCategoryName', ITDepartmentController.getITCategoryNameList);

  //GET: Fetch the Supplier name
  router.get('/ITSupplierName', ITDepartmentController.getITSupplierNameList);

  //GET: Fetch the manufacturer name
  router.get('/ITManufacturerName', ITDepartmentController.getITManufacturerNameList);



  // Post: Post the data of subcategory
  router.post('/subcategory', ITDepartmentController.postSubCategory);

  // Edit: Edit the data of the subcategory 
  router.put('/subcategory', ITDepartmentController.updateSubCategory);

  //Delete: Delete the data of subcategory
  router.delete('/subcategory', ITDepartmentController.deleteSubcategory)

  // Post: Post the data of supplier
  router.post('/invenSupplier', ITDepartmentController.postInventorySupplier)

  // Edit: Edit the data of inventory supplier
  router.put('/invenSupplier', ITDepartmentController.updateInventorySupplier)

  // Delete: Delete the data of inventory supplier
  router.delete('/invenSupplier', ITDepartmentController.deleteInventorySupplier)


  // Post: Post the data of manufacturer
  router.post('/invenManufacturer', ITDepartmentController.postInventoryManufacturer)

  // Edit: Edit the data of inventory manufacturer
  router.put('/invenManufacturer', ITDepartmentController.updateInventoryManufacturer)

  // Delete: Delete the data of inventory manufacturer
  router.delete('/invenManufacturer', ITDepartmentController.deleteInventoryManufacturer)


  // Get: Check the subcategory name
  router.get('/checkSubCategoryName', ITDepartmentController.checkSubCategoryName)


  // Get: Check the editSubcategory name
  router.get('/checkEditSubCategoryName', ITDepartmentController.checkEditSubCategoryName)


  // Get: check the manufacturer name 
  router.get('/checkManufacturer', ITDepartmentController.checkInventoryManufacturerName)

  // Get: check the edit manufacturer name
  router.get('/checkEditManufacturer', ITDepartmentController.checkInventoryEditManufacturerName)


  // Get: check the supplier name 
  router.get('/checkSupplier', ITDepartmentController.checkInventorySupplier)

  // Get: check the edit supplier name
  router.get('/checkEditSupplier', ITDepartmentController.checkInventoryEditSupplier);

  // Create the Inventorycomponent 
  router.post('/dash-inventory', ITDepartmentController.createInventoryDash);

  // update the Inventory by Id
  router.put('/dash-inventory', ITDepartmentController.updateInventoryDash);

  // Get All Inventories based on filter
  router.post('/inventories', ITDepartmentController.getInventoryByFilter);

  //Check IT Category Name
  router.get('/checkItCategoryName', ITDepartmentController.checkInventoryCategoryName);

  //POST IT CATEGORY
  router.post('/invenCategory', ITDepartmentController.postItcategory);

  // Getting the list of all  IT manufacturers
  // router.get('/invenCategory', ITDepartmentController.getAllInvenCategory);

  router.get('/checkEditItCategoryName', ITDepartmentController.checkInventoryEditCategoryName)

  //EDIT THE IT CATEGORY
  router.put('/invenCategory', ITDepartmentController.updateInventoryCategory)

  //Check abbreviated name for subcategory
  // router.get('/subcategory/check/abbreviation', ITDepartmentController.checkITAbbreviatedName)

  //GET IT STOCK HISTORY BY INVENTORY ID
  router.get('/invenStockHistory', ITDepartmentController.getITStockHistoryByInventoryId);

  //POST ISSUE INVENTORY DATA
  router.post('/issuedInventory', ITDepartmentController.postIssuedStockInventory);

  //POST Return INVENTORY DATA
  router.post('/returnedInventory', ITDepartmentController.postReturnedStockInventory);

  //Get Issued Data in Inventory
  router.get('/issuedData', ITDepartmentController.getITIssuedDataByInventoryId);

  //POSt Inventory Status
  router.post('/updateStatus', ITDepartmentController.postUpdateStatus);

  //POST: upload the component csv and xlsx file
  router.post('/uploadInventory', ITDepartmentController.uploadInventoryCSVFile);

  //POST: Search the component
  router.post('/searchInventory', ITDepartmentController.searchInventoryData);

  //GET: Assigned user data in IT-Inventory FOR PARTICULAR USER
  router.get('/ITAssignedUserData', ITDepartmentController.getITAssignedUserData);

  //GET: sTOCK HISTORY IN IT-INVENTORY
  router.get('/stockHistoryByUser', ITDepartmentController.getUserITStockHistory)

  //GET: Summary for IT-Inventory
  router.get('/summary', ITDepartmentController.getITStockSummary);

  //Export IT Asset csv file
  router.post('/export/asset', ITDepartmentController.exportAssetCSVFile)


  app.use('/itinventory', router);
}