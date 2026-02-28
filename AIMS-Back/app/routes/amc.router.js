module.exports = (app) => {
  const path = require('path');
  const AMCController = require('../controllers/amc.controller');
  const router = require('express').Router();

  /**
   * AMC Routes
   * --------------------------------------
   * Base URL: /api/amc
   * Last Modified: 6 November 2025
   * Modified By: Deepak [Refactor for RESTful consistency]
   */


  // Service Provider (master data)
  router.post('/service-provider', AMCController.createServiceProvider); // Add or register service provider
  router.get('/service-provider', AMCController.getAllServiceProviders); // Get list of providers
  router.put('/:id/service-provider', AMCController.updateServiceProvider); // update list of providers

  // AMC CRUD Operations
  router.post('/', AMCController.createAMC);            // Create a new AMC
  router.get('/', AMCController.getAllAMCs);            // Get all AMCs
  router.get('/:id', AMCController.getAMCById);         // Get AMC by ID
  router.put('/:id', AMCController.updateAMC);          // Update AMC details
  // router.delete('/:id', AMCController.deleteAMC);       // Delete AMC (optional)

  // Service Operations
  router.post('/service/initiate', AMCController.initiateService);
  router.post('/service/close', AMCController.closeService);
  router.get('/:id/available-assets', AMCController.getAMCAvailableAssets);
  router.post('/open-service-by-id', AMCController.getOpenOnlyServiceByID);
  router.post('/service-data-by-number', AMCController.getOpenServiceByNumber);
  router.post('/open-services', AMCController.getOpenOnlyServices);
  router.put('/service/update', AMCController.updateHistoryByNumber);

  // Repair Operations
  router.post('/repair/initiate', AMCController.initiateRepair);
  router.post('/repair/close', AMCController.closeRepair);

  
  router.post('/inventory-filter', AMCController.fetchFilteredInventory)

  router.get('/:amcID/history', AMCController.getAMCHistory);

  router.post('/extend', AMCController.extendedAMC);

  // Mounting the router
  app.use('/api/amc', router);
};
