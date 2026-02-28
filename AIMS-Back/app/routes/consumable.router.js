
module.exports = app => {

    const consumableController = require('../controllers/consumable.controller');
    var router = require('express').Router();



    /** 
     * ========================================================================================================
     * Category section Rest API
     * 
     */ 
    // GET: Fetch the consumable category name
    router.get('/categoryName', consumableController.getConsumableCategoryNames);

    // Post: Post the data of consumable category
    router.post('/category', consumableController.createConsumableCategory);

    // Edit: Edit the data of consumable category
    router.put('/category/:id', consumableController.updateConsumableCategory);

    // Delete: Delete the data of consumable category
    router.delete('/consumableCategory', consumableController.deleteConsumableCategory);

    // GET: check the consumable category name 
    router.get('/checkCategory', consumableController.checkConsumableCategory);

    // GET: check the edit consumable category name
    router.get('/checkEditCategory', consumableController.checkConsumableEditCategory);



    /** 
     * ========================================================================================================
     * Supplier section Rest API
     * 
     */
    // GET: Fetch the Supplier name
    router.get('/supplierName', consumableController.getConsumableSupplier);

    // Post: Post the data of supplier
    router.post('/supplier', consumableController.createConsumableSupplier);

    // Edit: Edit the data of inventory supplier
    router.put('/supplier/:id', consumableController.updateConsumableSupplier);

    // Delete: Delete the data of inventory supplier
    router.delete('/consumableSupplier', consumableController.deleteConsumableSupplier);

    // GET: check the supplier name 
    router.get('/checkSupplier', consumableController.checkConsumableSupplier);

    // GET: check the edit supplier name
    router.get('/checkEditSupplier', consumableController.checkConsumableEditSupplier);



    /** 
     * ========================================================================================================
     * Location section Rest API
     * 
     */
    //GET: Fetch the location name
    router.get('/locationName', consumableController.getConsumableLocationNameList);

    // Post: Post the data of location
    router.post('/location', consumableController.createConsumableLocation);

    // Edit: Edit the data of inventory location
    router.put('/location/:id', consumableController.updateConsumableLocation);

    // Delete: Delete the data of inventory location
    router.delete('/consumableLocation', consumableController.deleteConsumableLocation);

    // GET: check the location name 
    router.get('/checkLocation', consumableController.checkConsumableLocation);

    // GET: check the edit location name
    router.get('/checkEditLocation', consumableController.checkConsumableEditLocation);



    /** 
     * ========================================================================================================
     * Item name section Rest API
     * 
     */
    // POST: create item name 
    router.post('/create-item', consumableController.createItem);

    // GET: Get item name list
    router.get('/fetch-item', consumableController.fetchItems);

    // PUT: Update item name
    router.put('/update-item/:id', consumableController.updateItem);

    // GET BY ID: Get item name by ID
    router.get('/fetch-item/:id', consumableController.getItemById);



    /** 
     * ========================================================================================================
     * Challan number section Rest API
     * 
     */
    // POST: create challan number
    router.post('/challan-entry', consumableController.challanEntry);

    // GET: Get challan number
    router.get('/challan', consumableController.fetchChallan);

    // GET: Get challan number by ID
    router.get('/challan/:id', consumableController.fetchChallanById);

    // PUT: Update challan number by ID
    router.put('/challan/:id', consumableController.updateChallanById);



    /** 
     * ========================================================================================================
     * Bill number section Rest API
     * 
     */
    // POST: create bill number
    router.post('/bill-entry', consumableController.billEntry);

    // // GET: Get bill number
    // router.get('/bill', consumableController.fetchBill);

    // // GET: Get bill number by ID
    // router.get('/bill/:id', consumableController.fetchBillById);

    // // PUT: Update bill number by ID
    // router.put('/bill/:id', consumableController.updateBillById);





    //GET: Consumable data
    router.get('/consumableData', consumableController.getConsumableData);

    //POST: Search the component
    router.post('/searchConsumable', consumableController.searchConsumableData);



    //GET: consume stock history
    router.get('/consumableStockHistory', consumableController.getStockHistoryByConsumableId);

    //POST: Create the consumable component 
    router.post('/consumable-create', consumableController.createConsumableData);

    //PUT: update the consumable by Id
    router.put('/consumable-update-modify', consumableController.updateConsumableModifyData);

    //PUT: update the consumable by Id
    router.put('/consumable-update-addAssets', consumableController.updateConsumableAddAssetsData);

    //PUT: update the consumable by Id
    router.put('/consumable-update-consumeAssets', consumableController.updateConsumableConsumeAssetsData);

    //GET: consumable stock history by ID
    router.get('/consumableHistory', consumableController.getConsumableHistoryByInventoryId);

    //POST: Export consumable Asset csv file
    router.post('/export/asset', consumableController.exportAssetCSVFile)


    app.use('/consumable', router);

}