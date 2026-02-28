const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project      : Acevin Inventory Management System (AIMS)
 * Department   : Admin
 * File Type    : Mongoose Schema
 * File Name    : supplier.js
 * 
 * Description  :
 * This schema defines the structure for storing supplier details
 * used in the inventory and procurement modules. Each supplier
 * represents a vendor or service provider from whom consumable
 * items are procured.
 * 
 * The `supplierName` field is enforced as unique to prevent
 * duplicate supplier entries across the system.
 * 
 * Collection   : consumableSuppliers
 * 
 * Last Updated : 29 January 2026
 * Updated By   : Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const SupplierSchema = new Schema({
    supplierName: { type: String, unique: true, required: true },
    contactPerson: { type: String},
    contactNumber: { type: String},
    email: { type: String},
    GSTNumber: { type: String},
    address: { type: String},
    type: { type: String} 
}, { 
    strict: false,
    timestamps: true
});

module.exports = mongoose.model('consumableSupplier', SupplierSchema);
