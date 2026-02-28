const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project: Acevin Inventory Management System (AIMS)
 * Department: IT
 * File Type: Mongoose Schema
 * File Name: supplier.js
 * 
 * Description:
 * This schema defines the structure for storing supplier details used in the inventory and procurement modules. 
 * Each supplier entry must have a unique name to prevent duplication across the system.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const SupplierSchema = new Schema({
    // supplierName: { type: String, unique: true, required: true }
    supplierName: { type: String, required: true, unique: true, trim: true },
    contact: { type: String },
    email: { type: String },
    address: { type: String },
    type: { type: String, enum: ['Local', 'Imported'], default: 'Local' }
}, { 
    strict: false
});

module.exports = mongoose.model('ItSupplier', SupplierSchema);
