const mongoose = require('mongoose');
const  Schema  = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project: Acevin Inventory Management System (AIMS)
 * Department: Hardware
 * Sub Section: Electronic-component
 * File Type: Mongoose Schema
 * File Name: shelfLocation.js
 * 
 * Description:
 * This schema defines the structure for component shelf locations in the hardware inventory system. 
 * Each shelf has a unique name, an optional physical location, and an array of boxes. 
 * Each box contains a 'name' field for identifying stored components.
 * 
 * Notes:
 * - The older commented-out structure for 'boxNames' (array of strings) 
 *   was replaced with an array of objects to allow for potential future
 *   expansion (e.g., adding box metadata).
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const shelflocationSchema = new Schema({
    shelfName: {type: String, unique: true, required:true},
    shelfLocation: {type: String},
    boxNames: [{
        name: String
    }]
    
}, { 
    strict: false
});

module.exports = mongoose.model('ElectronicShelfLocation', shelflocationSchema);
