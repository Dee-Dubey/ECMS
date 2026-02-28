const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project: Acevin Inventory Management System (AIMS)
 * Department: Hardware
 * Sub Section: Electronic-component
 * File Type: Mongoose Schema
 * File Name: component.js
 * 
 * Description:
 * This sub-schema defines the structure for tracking stock details of individual components. 
 * It stores project-level stock records, quantity updates, modification history, and physical storage locations.
 * 
 * Notes:
 * - 'projectName' references the related project under which the stock is used or allocated.
 * - 'locationDetail' provides information about the storage shelf and box.
 * - 'notificationQuantity' can be used to trigger low-stock alerts.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const stock = new Schema({

    projectName: { type: Schema.Types.ObjectId, ref: 'ElectronicProject', required: true },
    quantity: { type: Number, required: true },
    modifier: { type: String, required: true },
    modifiedDate: { type: String, required: true },
    locationDetail: {
        shelfName: { type: Schema.Types.ObjectId, ref: 'ElectronicShelfLocation' },
        boxNames: {
            type: Schema.Types.ObjectId
        }
    },
    notificationQuantity: { type: Number },
}, { 
    strict: false 
});

/**
 * ---------------------------------------------------------------------
 * Project: Acevin Inventory Management System (AIMS)
 * Department: Hardware
 * Sub Section: Electronic-component
 * File Type: Mongoose Schema
 * File Name: component.js
 * 
 * Description:
 * This schema defines the structure for electronic components in the hardware department. Each component includes:
 *   - Creator and identification details
 *   - Manufacturer and category references
 *   - Total quantity tracking
 *   - Embedded stock details per project (via the 'stock' sub-schema)
 *   - Optional comment field for additional notes
 * 
 * Notes:
 * - 'stockDetails' is an array of sub documents that store project-specific stock information, including quantity, modifier, modification date, and location.
 * - The commented 'notificationQuantity' can be enabled if system-wide stock alerts are implemented.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const componentSchema = new Schema({
    amc: {type: Schema.Types.ObjectId, ref: 'AMC'},
    creator: { type: String, required: true },
    manufacturerPartNumber: { type: String, required: true },
    package: { type: String, required: true },
    description: { type: String, required: true },
    id: { type: String, required: true },
    totalQuantity: { type: Number, required: true },
    stockDetails: [stock],
    manufacturer: { type: Schema.Types.ObjectId, ref: 'ElectronicManufacturer', required: true },
    categoryName: { type: Schema.Types.ObjectId, ref: 'ElectronicCategory', required: true },
    comment: { type: String },
}, { 
    strict: false
});

module.exports = mongoose.model('ElectronicComponent', componentSchema);
