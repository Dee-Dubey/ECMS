const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project: Acevin Inventory Management System (AIMS)
 * Department: Hardware
 * Sub Section: Electronic-component
 * File Type: Mongoose Schema
 * File Name: project.js
 * 
 * Description:
 * This schema defines the structure for hardware component projects. Each
 * project includes a unique name, an optional client name, and the year
 * the project started. Projects are used to track component allocations
 * and stock assignments within the inventory system.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const projectSchema = new Schema({
    name: { type: String, unique: true, required: true },
    clientName: { type: String },
    startYear: { type: String }
}, { 
    strict: false 
});

module.exports = mongoose.model('ElectronicProject', projectSchema);
