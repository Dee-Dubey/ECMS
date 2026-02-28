const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project: Acevin Inventory Management System (AIMS)
 * Department: Hardware
 * Sub Section: Electronic-component
 * File Type: Mongoose Schema
 * File Name: manufacturer.js
 * 
 * Description:
 * This schema defines the structure for storing component manufacturer details.
 * Each manufacturer must have a unique name to avoid duplication across the 
 * hardware inventory system.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const manufacturerSchema = new Schema({
    name: { type: String, unique: true, required: true }
}, { 
    strict: false 
});

module.exports = mongoose.model('ElectronicManufacturer', manufacturerSchema);
