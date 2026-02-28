/**
 * ---------------------------------------------------------------------
 * Routes: BOM Management
 * 
 * Description:
 * This file defines all Express routes related to Bill of Materials (BOM)
 * processing, including:
 *   - Uploading BOM files
 *   - Consolidating BOM files into a single Excel
 *   - Calculating costs, GST, and net unit costs
 *   - Generating consolidated cost files and ZIP archives
 *   - Downloading consolidated files
 * 
 * Dependencies:
 *   - express
 *   - multer (for file uploads)
 *   - path (for handling file paths)
 *   - bomController (controller handling the logic for BOM operations)
 * 
 * Notes:
 *   - Uploaded files are stored temporarily in the 'uploads' directory.
 *   - Consolidated cost files are stored temporarily in 'costUploads' directory.
 *   - Proper logging and error handling are managed within controllers.
 * ---------------------------------------------------------------------
 *
 * Last Modified: 54 October 2025
   * Modified By: Raza A [AS-127]
 */
module.exports = app => {
  const path = require('path')
  const BomController = require('../controllers/bom.controller');
  const multer = require('multer');


  const uploadsDir = path.join(__dirname, '../../uploads');
  const costUploadsDir = path.join(__dirname, '../../costUploads');


  /*
   * Setting up Multer to handle uploads
   *
   * Last Modified: 25 October 2025
   * Modified By: Raza A [AS-127] 
   */
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir); // use path variable here
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });

  var uploadMulti = multer({ storage: storage });

  var router = require('express').Router();

  /**
   * POST /bomFiles
   *  - Upload multiple BOM files
   *  - Processes and consolidates them
   *
   * Last Modified5 24 October 2025
   * Modified By: Raza A [AS-127]
   */
  router.post("/bomFiles", uploadMulti.array("files"), BomController.bomFiles);

  /**
   * GET /consolidatedBOM
   *  - Download the consolidated BOM Excel file
   *
   * Last Modified5 24 October 2025
   * Modified By: Raza A [AS-127]
   */
  router.get('/consolidatedBOM', BomController.consolidatedBom);

  /**
   * POST /cost-bom-files
   *  - Upload multiple BOM files
   *  - Calculates costs, GST, net unit cost
   *  - Generates consolidated cost files and ZIP
   *
   * Last Modified5 24 October 2025
   * Modified By: Raza A [AS-127]
   */
  router.post("/cost-bom-files", uploadMulti.array("files"), BomController.costBomFile);

  /**
   * GET /cost-bom-consolidated
   *  - Download the consolidated cost BOM ZIP file
   *
   * Last Modified5 24 October 2025
   * Modified By: Raza A [AS-127]
   */
  router.get('/cost-bom-consolidated', BomController.costBomConsolidated);

  app.use('/', router);
}