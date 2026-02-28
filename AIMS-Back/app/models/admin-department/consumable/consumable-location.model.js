const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project      : Acevin Inventory Management System (AIMS)
 * Department   : Admin
 * File Type    : Mongoose Schema
 * File Name    : location.js
 * 
 * Description  :
 * This schema defines the structure for storing consumable storage
 * location details used across inventory and procurement modules.
 * Each location represents a physical or logical storage area
 * (e.g., Rack A1, Shelf B2, Store Room, Warehouse).
 * 
 * The `locationName` field is enforced as unique to prevent duplicate
 * location entries within the system.
 * 
 * Collection   : consumableLocations
 * 
 * Last Updated : 29 January 2026
 * Updated By   : Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const LocationSchema = new Schema({
    locationName: { type: String, unique: true, required: true },
    shelfLocation: {type: String}
}, { 
    strict: false,
    timestamps: true
});

module.exports = mongoose.model('consumableLocation', LocationSchema);
