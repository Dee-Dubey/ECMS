const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project: Acevin Inventory Management System (AIMS)
 * Department: IT
 * File Type: Mongoose Schema
 * File Name: itStockHistory.js
 * 
 * Description:
 * This schema defines the structure for maintaining IT stock transaction history records. 
 * Each entry logs inventory movement details such as transaction type, handler, status, and associated inventory or user references.
 * 
 * Notes:
 * - The 'quantity' field has been deprecated and should be removed.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const ITStockHistorySchema = new Schema({
    inventoryId: { type: Schema.Types.ObjectId, ref: 'ItInventory', required: true },
    transactionType: { type: String, required: true },
    status: { type: String },
    inventoryHandler: { type: String },
    code: { type: String, required: true },
    issuedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    // quantity: { type: Number }, // need to remove
    date: { type: String, required: true },
    note: { type: String }
}, { 
    strict: false 
});

module.exports = mongoose.model('ItStockHistory', ITStockHistorySchema);

