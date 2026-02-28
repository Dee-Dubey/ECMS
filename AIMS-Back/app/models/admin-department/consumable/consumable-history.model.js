const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project      : Acevin Inventory Management System (AIMS)
 * Department   : Admin
 * File Type    : Mongoose Schema
 * File Name    : itStockHistory.js
 * 
 * Description  :
 * This schema is used to maintain the transaction history of consumable
 * inventory items. Each document represents a single inventory event
 * such as stock addition, adjustment, or status change.
 * 
 * The history records are linked to a consumable entry and are primarily
 * used for auditing, tracking changes, and maintaining traceability of
 * inventory operations.
 * 
 * Notes        :
 * - The `quantity` field has been deprecated and intentionally removed.
 * 
 * Collection   : consumableHistories
 * 
 * Last Updated : 29 January 2026
 * Updated By   : Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const ConsumableHistorySchema = new Schema({
    item: { type: Schema.Types.ObjectId, required: true, ref: 'consumableLineItem' },
    status: { type: String },
    date: { type: String, required: true },
    note: { type: String }
}, { 
    strict: false,
    timestamps: true
});

module.exports = mongoose.model('consumableHistory', ConsumableHistorySchema);

