const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project: Acevin Inventory Management System (AIMS)
 * Department: Hardware
 * Sub Section: Electronic-component
 * File Type: Mongoose Schema
 * File Name: category.js
 * 
 * Description:
 * This schema defines the structure for hardware component categories.
 * Each category includes a unique name, an abbreviation, and an optional
 * sequence ID for ordered listing within the inventory module.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const categorySchema = new Schema({
    name: { type: String, unique: true, required: true },
    abbreviation: { type: String, required: true },
    sequenceId: { type: Number }
}, { 
    strict: false 
});

module.exports = mongoose.model('ElectronicCategory', categorySchema);
