const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project: Acevin Inventory Management System (AIMS)
 * Department: IT
 * File Type: Mongoose Schema
 * File Name: Manufacturer.js
 * 
 * Description:
 * This schema defines the structure for storing manufacturer details.
 * Each entry contains a unique manufacturer name used across inventory and procurement modules.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const ManufacturerSchema = new Schema({
    manufacturerName: { type: String, unique: true, required: true }
}, { 
    strict: false 
});

module.exports = mongoose.model('ItManufacturer', ManufacturerSchema);
