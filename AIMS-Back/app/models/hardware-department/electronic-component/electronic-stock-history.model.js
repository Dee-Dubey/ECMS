const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project: Acevin Inventory Management System (AIMS)
 * Department: Hardware
 * Sub Section: Electronic-component
 * File Type: Mongoose Schema
 * File Name: stockHistory.js
 * 
 * Description:
 * This schema defines the structure for tracking stock movements of 
 * hardware components. Each record logs:
 *   - The component and related project(s)
 *   - Quantity changes and transaction type
 *   - Inventory handler and optional recipient ('issuedTo')
 *   - Supplier information and part number
 *   - Date of transaction and optional notes
 * 
 * Notes:
 * - 'componentId' references the 'Componet' model (note: model name typo retained if consistent).
 * - 'issuedTo' references the 'User' model for issued components.
 * - Deprecated/commented fields include linePrice, pricePerUnit, and original string IDs.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const stockHistorySchema = new Schema({
    componentId: { type: Schema.Types.ObjectId, ref: 'ElectronicComponent', required: true },
    projectName: { type: String, required: true },
    movedFromProjectName: { type: String },
    quantity: { type: Number, required: true },
    inventoryHandler: { type: String, required: true },
    issuedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    date: { type: String, required: true },
    transactionType: { type: String, required: true },
    supplierName: { type: Schema.ObjectId, ref: 'ElectronicSupplier' },
    supplierPartNo: { type: String },
    note: { type: String }
}, { 
    strict: false 
});

module.exports = mongoose.model('ElectronicStockHistory', stockHistorySchema, 'stockHistorys');
