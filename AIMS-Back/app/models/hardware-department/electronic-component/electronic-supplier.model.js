const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project: Acevin Inventory Management System (AIMS)
 * Department: Hardware
 * Sub Section: Electronic-component
 * File Type: Mongoose Schema
 * File Name: supplier.js
 * 
 * Description:
 * This schema defines the structure for storing hardware component supplier
 * details. Each supplier entry includes:
 *   - Unique name
 *   - Optional contact information (phone, email, address)
 *   - Supplier type (e.g., manufacturer, distributor, reseller)
 * 
 * Notes:
 * - The 'name' field must be unique to avoid duplication across the system.
 * - All other fields are optional but recommended for proper supplier management.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const supplierSchema = new Schema({
    name: { type: String, unique: true, required: true },
    contact: { type: Number },
    email: { type: String, },
    address: { type: String },
    type: { type: String }
}, { 
    strict: false 
});

module.exports = mongoose.model('ElectronicSupplier', supplierSchema);
