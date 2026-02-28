const fs = require('fs');
const path = require('path');
const xlsx = require('node-xlsx');
const logger = require('../../logger');
const archiver = require('archiver');

/**
 * ---------------------------------------------------------------------
 * Function: findIndexTrim
 * 
 * Description:
 * Finds the index of a value in an array after trimming whitespace
 * from the search value.
 * 
 * Parameters:
 * - array: Array of strings to search
 * - value: String to find (leading/trailing whitespace will be ignored)
 * 
 * Returns:
 * - Index of the matched value in the array
 * - -1 if no match is found
 * 
 * Example:
 *   const arr = ['apple', 'banana', 'cherry'];
 *   findIndexTrim(arr, ' banana '); // returns 1
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
function findIndexTrim(array, value) {
  return array.findIndex(entry => entry === value.trim());
}

const toNumber = (val) => Number(val) || 0;


/**
 * ---------------------------------------------------------------------
 * Function: bomFiles
 * 
 * Description:
 * This function processes multiple BOM (Bill of Materials) Excel files,
 * consolidates the component quantities, and generates a single
 * consolidated BOM Excel file.
 * 
 * Workflow:
 * 1. Parses the uploaded BOM files from the request body.
 * 2. Multiplies quantities by the number of systems specified in the request.
 * 3. Consolidates components by Manufacturer Part Number:
 *      - Adds up quantities and spare quantities if multiple entries exist.
 *      - Handles null or undefined spare quantities gracefully.
 * 4. Builds a final array of data including headers for Excel export.
 * 5. Generates a new consolidated Excel file using `node-xlsx`.
 * 6. Saves the file to the `uploads` directory and sends a success response.
 * 
 * Columns included in the consolidated BOM:
 *   ['Description', 'Designator', 'Required Quantity', 'Total Spare Quantity',
 *    'Total Quantity', 'Manufacturer Part Number', 'Manufacturer', 'Supplier',
 *    'Supplier Part Number', 'Cost', 'GST']
 * 
 * Notes:
 * - Uses `findIndexTrim` to dynamically locate column indices in the input files.
 * - Uses a `PartNumberList` to track unique manufacturer part numbers.
 * - Logs errors using `logger.error` and returns a structured error response.
 * - Assumes `xlsx`, `fs`, `path`, and `logger` are properly imported.
 * 
 * Parameters:
 * - req: Express request object, expects `numSystems` and `fileList` in `req.body`.
 * - res: Express response object, used to send success/error JSON responses.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
// exports.bomFiles = (req, res) => {
//   try {
//     let numberOfSystems = req.body.numSystems;
//     let fileListData = JSON.parse(req.body.fileList);
//     let ConsolidateData = {};
//     let fileName = []
//     // console.log('File list data--------', fileListData)

//     // my addition
//     ConsolidateData.heading = [
//       'Description',
//       'Designator',
//       'Required Quantity', 
//       'Total Spare Quantity', 
//       'Total Quantity', 
//       'Manufacturer Part Number', 
//       'Manufacturer', 
//       'File Names',
//       'Supplier', 
//       'Supplier Part Number', 
//       'Cost', 
//       'GST'];

//     let PartNumberList = [];
//     fileListData.forEach((file, index) => {
//       let fileData = xlsx.parse(path.join(__dirname, '../../uploads', fileListData[index].name));
//       // console.log('File Data----', fileData)

//       // fileName.push(file.name)
//       // console.log()
//       let fileQtyMultiplier = file.quantity;
//       let descriptionIndex;
//       let designatorIndex;
//       let quantityIndex;
//       let spareQuantityIndex;
//       let manufacturerPartNumberIndex;
//       let manufacturerIndex;
//       let supplierIndex;
//       let supplierPartNumberIndex;
//       let costIndex;
//       // console.log('file data of the 0 index-------', fileData[0].data)
//       fileData[0].data.forEach((data, index) => {
//         if (index === 0) {
//           // Storing the index of the heading
//           descriptionIndex = findIndexTrim(data, 'Description');
//           designatorIndex = findIndexTrim(data, 'Designator');
//           quantityIndex = findIndexTrim(data, 'Quantity');
//           spareQuantityIndex = findIndexTrim(data, 'Spare Quantity');
//           manufacturerPartNumberIndex = findIndexTrim(data, 'Manufacturer Part Number');
//           manufacturerIndex = findIndexTrim(data, 'Manufacturer');
//           supplierIndex = findIndexTrim(data, 'Supplier');
//           supplierPartNumberIndex = findIndexTrim(data, 'Supplier Part Number');
//           costIndex = findIndexTrim(data, 'Cost');
//           console.log('manufacturerPartNumberIndex----', manufacturerPartNumberIndex)
//         } else {
//           // check the multiple manufacturer part number
//           if (PartNumberList.includes(data[manufacturerPartNumberIndex])) {
//             // checking if the sparequantity is not equal to null and undefined
//             if (data[spareQuantityIndex] !== null && data[spareQuantityIndex] !== undefined) {
//               if (!ConsolidateData[`${data[manufacturerPartNumberIndex]}`][7].includes(file.name)) {
//                 console.log('moving in the new condition')
//                 ConsolidateData[`${data[manufacturerPartNumberIndex]}`][7].push(file.name)
//               }
//               ConsolidateData[`${data[manufacturerPartNumberIndex]}`][2] = ConsolidateData[`${data[manufacturerPartNumberIndex]}`][2] + ((data[quantityIndex] * fileQtyMultiplier) * numberOfSystems);
//               ConsolidateData[`${data[manufacturerPartNumberIndex]}`][3] = ConsolidateData[`${data[manufacturerPartNumberIndex]}`][3] + (data[spareQuantityIndex] * fileQtyMultiplier * numberOfSystems);
//               ConsolidateData[`${data[manufacturerPartNumberIndex]}`][4] = ConsolidateData[`${data[manufacturerPartNumberIndex]}`][4] + (((data[quantityIndex] + data[spareQuantityIndex]) * fileQtyMultiplier) * numberOfSystems);
//             } else {
//               console.log('consolidate data------',  ConsolidateData[7])
//               if (!ConsolidateData[`${data[manufacturerPartNumberIndex]}`][7].includes(file.name)) {
//                 console.log('moving in the new condition')
//                 ConsolidateData[`${data[manufacturerPartNumberIndex]}`][7].push(file.name)
//               }
//               // calculate the total quantity and total spare quantity if the spare quantity is null and undefined
//               ConsolidateData[`${data[manufacturerPartNumberIndex]}`][2] = ConsolidateData[`${data[manufacturerPartNumberIndex]}`][2] + ((data[quantityIndex] * fileQtyMultiplier * numberOfSystems));
//               ConsolidateData[`${data[manufacturerPartNumberIndex]}`][4] = ConsolidateData[`${data[manufacturerPartNumberIndex]}`][4] + ((data[quantityIndex] * fileQtyMultiplier * numberOfSystems));
//             }
//           } else if (data[manufacturerPartNumberIndex] === null || data[manufacturerPartNumberIndex] === undefined) {
//             // do nothing if the manufacturer part number is null and undefined
//           }
//           // check if the manufacturer quantity is unique or not available in the parameter list
//           else {
//             // check if the spare quantity is undefined and null
//             if (data[spareQuantityIndex] !== null && data[spareQuantityIndex] !== undefined) {
//               // My addition
//               let sortedArray = [
//               data[descriptionIndex],
//               data[designatorIndex], 
//               ((data[quantityIndex] * fileQtyMultiplier) * numberOfSystems), 
//               ((data[spareQuantityIndex] * fileQtyMultiplier) * numberOfSystems), 
//               ((data[quantityIndex] + data[spareQuantityIndex]) * fileQtyMultiplier) * numberOfSystems, 
//               data[manufacturerPartNumberIndex], 
//               data[manufacturerIndex],
//               [file.name],
//               data[supplierIndex], 
//               data[supplierPartNumberIndex], 
//               data[costIndex], 
//               0
//             ];
//               // console.log('sorted array', sortedArray)
//               ConsolidateData[`${data[manufacturerPartNumberIndex]}`] = sortedArray;
//               PartNumberList.push(data[manufacturerPartNumberIndex]);
//             } else {
//               // Giving the arrange data of for the complete calculated data
//               let sortedArray = [
//               data[descriptionIndex], 
//               data[designatorIndex], 
//               (data[quantityIndex] * fileQtyMultiplier * numberOfSystems), 
//               0, 
//               (data[quantityIndex] * fileQtyMultiplier * numberOfSystems), 
//               data[manufacturerPartNumberIndex], 
//               data[manufacturerIndex], 
//               [file.name ], 
//               data[supplierIndex], 
//               data[supplierPartNumberIndex], 
//               data[costIndex], 
//               0
//             ];
//               ConsolidateData[`${data[manufacturerPartNumberIndex]}`] = sortedArray;
//               PartNumberList.push(data[manufacturerPartNumberIndex]);
//             }
//           }
//         }
//       })
//     })

//     console.log('file name data consolidateData', ConsolidateData)
//     let allKeys = Object.keys(ConsolidateData);
//     // console.log(allKeys)
//     let finalData = [];
//     finalData[0] = ConsolidateData.heading;
//     allKeys.forEach((key) => {
//       if (key !== 'heading') {
//         finalData.push(ConsolidateData[key])
//       }
//     })
//     // Generated the excel file
//     console.log('final Daata------------------------', finalData)
//     finalData = finalData.map((row, index) => {
//       if(index === 0) return row;

//       if(Array.isArray(row[7])){
//         row[7] = row[7].join(', ')
//       }

//       return row
//     })
//     let consolidatedBuffer = xlsx.build([{ name: 'Consolidated BOM', data: finalData }]);
//     // let consolidatedBOMBFile = fs.writeFileSync(`${__dirname}/uploads/consolidateBOM.xlsx`, consolidatedBuffer);
//     const filePath = path.join(__dirname, '../../uploads/consolidateBOM.xlsx');
//     fs.writeFileSync(filePath, consolidatedBuffer);
//     res.send(JSON.stringify({ message: "File Consolidated Successfully", status: 1 }));

//   } catch (error) {
//     console.log(error)
//     // console.log('Error in processing BOM file', { error })
//     // logger.error('Error in processing BOM file', { error })
//     res.send(JSON.stringify({ error: 'Error processing the file', status: 0 }))
//   }
// }


exports.bomFiles = (req, res) => {
  try {
    const numberOfSystems = Number(req.body.numSystems) || 1;
    const fileListData = JSON.parse(req.body.fileList);

    const ConsolidateData = {};

    const HEADERS = [
      'Description',
      'Designator',
      'Required Quantity',
      'Total Spare Quantity',
      'Total Quantity',
      'Manufacturer Part Number',
      'Manufacturer',
      'File Names',
      'Supplier',
      'Supplier Part Number',
      'Cost',
      'GST'
    ];

    fileListData.forEach((file) => {
      const filePath = path.join(__dirname, '../../uploads', file.name);
      const sheetData = xlsx.parse(filePath)[0].data;

      const fileQtyMultiplier = Number(file.quantity) || 1;

      let col = {};

      sheetData.forEach((row, rowIndex) => {
        // HEADER ROW
        if (rowIndex === 0) {
          col = {
            description: findIndexTrim(row, 'Description'),
            designator: findIndexTrim(row, 'Designator'),
            quantity: findIndexTrim(row, 'Quantity'),
            spareQty: findIndexTrim(row, 'Spare Quantity'),
            mpn: findIndexTrim(row, 'Manufacturer Part Number'),
            manufacturer: findIndexTrim(row, 'Manufacturer'),
            supplier: findIndexTrim(row, 'Supplier'),
            supplierPart: findIndexTrim(row, 'Supplier Part Number'),
            cost: findIndexTrim(row, 'Cost')
          };
          return;
        }

        const mpn = row[col.mpn];
        if (!mpn) return;

        const qty = toNumber(row[col.quantity]) * fileQtyMultiplier * numberOfSystems;
        const spare = toNumber(row[col.spareQty]) * fileQtyMultiplier * numberOfSystems;

        if (!ConsolidateData[mpn]) {
          ConsolidateData[mpn] = {
            description: row[col.description],
            designator: row[col.designator],
            requiredQty: 0,
            spareQty: 0,
            totalQty: 0,
            mpn,
            manufacturer: row[col.manufacturer],
            fileNames: new Set(),
            supplier: row[col.supplier],
            supplierPartNumber: row[col.supplierPart],
            cost: row[col.cost],
            gst: 0
          };
        }

        const item = ConsolidateData[mpn];

        item.requiredQty += qty;
        item.spareQty += spare;
        item.totalQty += qty + spare;
        item.fileNames.add(file.name);
      });
    });

    // 🔹 Convert object → Excel rows
    const finalData = [
      HEADERS,
      ...Object.values(ConsolidateData).map(item => [
        item.description,
        item.designator,
        item.requiredQty,
        item.spareQty,
        item.totalQty,
        item.mpn,
        item.manufacturer,
        Array.from(item.fileNames).join(', '),
        item.supplier,
        item.supplierPartNumber,
        item.cost,
        item.gst
      ])
    ];

    const buffer = xlsx.build([{ name: 'Consolidated BOM', data: finalData }]);
    const outputPath = path.join(__dirname, '../../uploads/consolidateBOM.xlsx');

    fs.writeFileSync(outputPath, buffer);

    res.send({ message: 'File Consolidated Successfully', status: 1 });

  } catch (error) {
    console.error(error);
    res.send({ error: 'Error processing the file', status: 0 });
  }
};




/**
 * ---------------------------------------------------------------------
 * Function: consolidatedBom
 * 
 * Description:
 * Serves the consolidated BOM Excel file to the client for download and 
 * performs cleanup of the uploads directory after a delay.
 * 
 * Workflow:
 * 1. Constructs the file path to 'consolidateBOM.xlsx' in the uploads folder.
 * 2. Uses `res.download` to send the file to the client with a friendly filename.
 * 3. Logs errors if the download fails.
 * 4. Sets a 10-second timeout to clean up the uploads folder:
 *      - Removes all files and subdirectories recursively.
 *      - Recreates the uploads directory to ensure it's ready for future uploads.
 * 5. Logs any errors during cleanup without affecting the download response.
 * 
 * Notes:
 * - Ensures that temporary files do not accumulate in the uploads folder.
 * - Uses structured logging via `logger.error` for troubleshooting.
 * - Any error in sending the file or cleaning up will return a JSON error response.
 * 
 * Parameters:
 * - req: Express request object
 * - res: Express response object
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.consolidatedBom = (req, res) => {
  try {
    let filePath = path.join(__dirname, '../../uploads/consolidateBOM.xlsx');
    res.download(filePath, 'ConsolidatedBOM.xlsx', (err) => {
      if (err) {
        // console.log('Error in downloading the file', {err})
        logger.error('Error in downloding the file', { err })
        res.send(JSON.stringify({ error: 'Error Handling the file', status: 0 }))
      }
      setTimeout(() => {
        try {
          fs.rmSync(path.join(__dirname, '../../uploads'), { recursive: true, force: true });
          fs.mkdirSync(path.join(__dirname, '../../uploads'));
        } catch (cleanupError) {
          // console.log('Error in cleaning upp the upload directory', {cleanupError})
          logger.error('Error in cleaning upp the upload directory', { cleanupError })
        }
      }, 10000)
    });
  } catch (error) {
    // console.log('Error in handling the consolidation BOM Download', {error})
    logger.error('Error in handling the consolidation BOM Download', { error })
    res.send(JSON.stringify({ error: 'Error handling download request', status: 0 }))
  }
}



/**
 * ---------------------------------------------------------------------
 * Function: costBomFile
 * 
 * Description:
 * Processes a consolidated BOM file along with individual BOM files to
 * calculate cost, GST, net unit cost, and total amounts per component.
 * Generates updated Excel files and zips them for download.
 * 
 * Workflow:
 * 1. Reads the consolidated BOM and individual BOM files from request body.
 * 2. Parses each Excel file using `node-xlsx`.
 * 3. Builds a PartNumberCostObject mapping Manufacturer Part Numbers
 *    to their Cost and GST rates from the consolidated BOM.
 * 4. Updates consolidated BOM with:
 *      - Net Unit Cost
 *      - Total Cost
 *      - Total GST
 *      - Total Cost + GST
 * 5. Updates individual BOM files using the cost mapping, calculating
 *    totals according to system quantity multipliers and spare quantities.
 * 6. Saves all calculated files to `costUploads`.
 * 7. Creates a ZIP archive containing all calculated files.
 * 8. Returns success response once the ZIP archive is finalized.
 * 
 * Notes:
 * - Uses dynamic column indexing with `findIndexTrim`.
 * - Handles null or undefined quantities and spare quantities gracefully.
 * - Logs progress and errors with `logger`.
 * - Assumes `xlsx`, `fs`, `path`, `archiver`, and `logger` are imported.
 * 
 * Parameters:
 * - req: Express request object, expects `fileList`, `consolidatedFile`, and `numberOfSystems`.
 * - res: Express response object, used to send success/error JSON responses.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.costBomFile = (req, res) => {
  try {
    let fileListData = JSON.parse(req.body.fileList);
    let consolidatedBOMFile = JSON.parse(req.body.consolidatedFile);
    let numofSystems = JSON.parse(req.body.numberOfSystems);
    // ConsolidateData.heading = ['Description', 'Designator', 'Quantity', 'Manufacturer Part Number', 'Manufacturer', 'Supplier', 'Supplier Part Number', 'Cost'];
    let PartNumberCostObject = {};
    // let consolidatedFileData = xlsx.parse(`${__dirname}/uploads/${consolidatedBOMFile}`);
    const filePath = path.join(__dirname, '../../uploads', consolidatedBOMFile);
    let consolidatedFileData = xlsx.parse(filePath);
    let descriptionIndex;
    let designatorIndex;
    let quantityIndex;
    let manufacturerPartNumberIndex;
    let manufacturerIndex;
    let supplierIndex;
    let supplierPartNumberIndex;
    let costIndex;
    let gstIndex;
    // spare quantity index
    let spareQuantityIndex

    // Consolidated BOM File Calculations
    consolidatedFileData[0].data.forEach((entry, index) => {
      if (index === 0) {
        descriptionIndex = findIndexTrim(entry, 'Description');
        designatorIndex = findIndexTrim(entry, 'Designator');
        quantityIndex = findIndexTrim(entry, 'Total Quantity');
        spareQuantityIndex = findIndexTrim(entry, 'Total Spare Quantity');
        manufacturerPartNumberIndex = findIndexTrim(entry, 'Manufacturer Part Number');
        manufacturerIndex = findIndexTrim(entry, 'Manufacturer');
        supplierIndex = findIndexTrim(entry, 'Supplier');
        supplierPartNumberIndex = findIndexTrim(entry, 'Supplier Part Number');
        costIndex = findIndexTrim(entry, 'Cost');
        gstIndex = findIndexTrim(entry, 'GST');
        entry.push('Net Unit Cost');
        entry.push('Total Cost');
        entry.push('Total GST');
        entry.push('Total Cost + GST');
      } else {
        PartNumberCostObject[`${entry[manufacturerPartNumberIndex]}`] = [entry[costIndex], entry[gstIndex]];
        let tc = entry[costIndex] * entry[quantityIndex];
        let gst = (tc / 100) * entry[gstIndex];
        let tcg = tc + gst;
        let nuc = tcg / (entry[quantityIndex] - entry[spareQuantityIndex]);
        entry.push(nuc);
        entry.push(tc);
        entry.push(gst);
        entry.push(tcg)
      }
    })
    let consolidatedBuffer = xlsx.build(consolidatedFileData);
    // let consolidatedFile = fs.writeFileSync(`${__dirname}/costUploads/consolidateBOM.xlsx`, consolidatedBuffer);
    const costFilePath = path.join(__dirname, '../../costUploads/consolidateBOM.xlsx');
    fs.writeFileSync(costFilePath, consolidatedBuffer);
    // BOM File Calculations
    fileListData.forEach((file, index) => {
      if (fileListData[index].name !== consolidatedBOMFile) {
        // let fileData = xlsx.parse(`${__dirname}/uploads/${fileListData[index].name}`);
        const bomPath = path.join(__dirname, '../../uploads', fileListData[index].name);
        let fileData = xlsx.parse(bomPath);
        let fileQty = fileListData[index].quantity;
        let descriptionIndex;
        let designatorIndex;
        let quantityIndex;
        let spareQuantityIndex;
        let manufacturerPartNumberIndex;
        let manufacturerIndex;
        let supplierIndex;
        let supplierPartNumberIndex;
        let costIndex;
        fileData[0].data.forEach((entry, index) => {
          if (index === 0) {
            descriptionIndex = findIndexTrim(entry, 'Description');
            designatorIndex = findIndexTrim(entry, 'Designator');
            quantityIndex = findIndexTrim(entry, 'Quantity');
            spareQuantityIndex = findIndexTrim(entry, 'Spare Quantity');
            manufacturerPartNumberIndex = findIndexTrim(entry, 'Manufacturer Part Number');
            manufacturerIndex = findIndexTrim(entry, 'Manufacturer');
            supplierIndex = findIndexTrim(entry, 'Supplier');
            supplierPartNumberIndex = findIndexTrim(entry, 'Supplier Part Number');
            entry.push('Cost')
            entry.push('GST');
            entry.push('Total Quantity');
            entry.push('Net Unit Cost');
            entry.push('Total Cost');
            entry.push('Total GST');
            entry.push('Total Cost + GST');
          } else {
            if (PartNumberCostObject[entry[manufacturerPartNumberIndex]]) {
              if (entry[quantityIndex] === 0) {
              } else if (entry[spareQuantityIndex] !== undefined && entry[spareQuantityIndex] !== null) {
                let tc = (entry[quantityIndex] + entry[spareQuantityIndex]) * fileQty * numofSystems * PartNumberCostObject[entry[manufacturerPartNumberIndex]][0];
                let costRate = PartNumberCostObject[entry[manufacturerPartNumberIndex]][0]

                let gstRate = PartNumberCostObject[entry[manufacturerPartNumberIndex]][1]
                let gst = (tc / 100) * gstRate;
                let tcg = tc + gst;
                let nuc = tcg / ((entry[quantityIndex] * fileQty) * numofSystems);
                entry.push(costRate);
                entry.push(gstRate);
                entry.push((entry[quantityIndex] + entry[spareQuantityIndex]) * fileQty * numofSystems);
                entry.push(nuc);
                entry.push(tc);
                entry.push(gst);
                entry.push(tcg);
              } else {
                let tc = entry[quantityIndex] * fileQty * numofSystems * PartNumberCostObject[entry[manufacturerPartNumberIndex]][0];
                let costRate = PartNumberCostObject[entry[manufacturerPartNumberIndex]][0];
                let gstRate = PartNumberCostObject[entry[manufacturerPartNumberIndex]][1];
                let gst = (tc / 100) * gstRate;
                let tcg = tc + gst;
                let nuc = tcg / (entry[quantityIndex] * fileQty * numofSystems);
                entry.push(costRate)
                entry.push(gstRate)
                entry.push(entry[quantityIndex] * fileQty * numofSystems);
                entry.push(nuc);
                entry.push(tc);
                entry.push(gst);
                entry.push(tcg);
              }
            }
          }
        });
        let calculatedBuffer = xlsx.build(fileData);
        // let calculatedFile = fs.writeFileSync(`${__dirname}/costUploads/${fileListData[index].name}`, calculatedBuffer);
        const calcFilePath = path.join(__dirname, '../../costUploads', fileListData[index].name);
        fs.writeFileSync(calcFilePath, calculatedBuffer);
      } else {

      }
    });


    const output = fs.createWriteStream(path.join(__dirname, '../../uploads/Cost_Consolidated.zip'));
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });

    output.on('close', function () {
      // console.log(`Archive has been finalized and the output file descriptor has closed.`);
      // console.log(`${archive.pointer()} total bytes`);
      logger.info(`Archive has been finalized and the output file descriptor has closed.`);
      logger.info(`${archive.pointer()} total bytes`);
    });

    archive.on('error', function (err) {
      throw err;
    });

    // Pipe the archive data to the output file
    archive.pipe(output);

    // Append files from a directory, recursively
    const folderPath = path.join(__dirname, '../../costUploads');
    archive.directory(folderPath, false);

    // Finalize the archive (i.e., finalize the ZIP file)
    archive.finalize().then(() => {
      res.send(JSON.stringify({ message: "File Consolidated Successfully", status: 1 }));
    });

  } catch (error) {
    // console.log('Error processing cost bom file', error)
    logger.error('Error processing cost BOM file', { error })
    res.send(JSON.stringify({ error: 'Error processing the file', status: 0 }))
  }
}



/**
 * ---------------------------------------------------------------------
 * Function: costBomConsolidated
 * 
 * Description:
 * Serves the consolidated cost BOM ZIP file for download and performs
 * cleanup of temporary directories (`uploads` and `costUploads`) after a delay.
 * 
 * Workflow:
 * 1. Constructs the file path to 'Cost_Consolidated.zip' in the uploads folder.
 * 2. Uses `res.download` to send the ZIP file to the client.
 * 3. Logs errors if the download fails and returns JSON error response.
 * 4. Sets a 10-second timeout to clean up the temporary directories:
 *      - Removes all files and subdirectories recursively in `uploads` and `costUploads`.
 *      - Recreates the directories to ensure they are ready for future use.
 * 5. Logs any errors during cleanup without affecting the download response.
 * 
 * Notes:
 * - Ensures that temporary files do not accumulate on the server.
 * - Uses structured logging via `logger.error` for troubleshooting.
 * - Any error in sending the file or cleaning up will return a JSON error response.
 * 
 * Parameters:
 * - req: Express request object
 * - res: Express response object
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.costBomConsolidated = (req, res) => {
  try {
    let filePath = path.join(__dirname, '../../uploads/Cost_Consolidated.zip');
    res.download(filePath, 'Cost_Consolidated.zip', (err) => {
      if (err) {
        logger.error('Error in downloading file', { err })
        // console.log('Error downloading file', err)
        res.send(JSON.stringify({ error: 'Error downloading the file', status: 0 }))
      }
      setTimeout(() => {
        try {
          fs.rmSync(path.join(__dirname, '../../uploads'), { recursive: true, force: true });
          fs.rmSync(path.join(__dirname, '../../costUploads'), { recursive: true, force: true });
          fs.mkdirSync(path.join(__dirname, '../../uploads'));
          fs.mkdirSync(path.join(__dirname, '../../costUploads'));

        } catch (cleanupError) {
          logger.error('Error handling cost Bom file', { cleanupError })
          // console.log('Error cleaning up directories', cleanupError)
        }
      }, 10000)

    });
  } catch (error) {
    // console.log('Error handling cost bom download', error)
    logger.error('Error handling cost BOM download', { error })
    res.send(JSON.stringify({ error: 'Error handling cost bom download', status: 0 }))
  }
}
