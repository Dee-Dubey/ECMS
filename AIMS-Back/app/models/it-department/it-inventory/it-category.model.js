const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project: Acevin Inventory Management System (AIMS)
 * Department: IT
 * File Type: Mongoose Schema
 * File Name: category.js
 * 
 * Description:
 * This schema defines the structure for IT department category entries.
 * It supports flexible fields (strict: false) and is exported as 'incategories'.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const CategorySchema = new Schema({
    name: { type: String, required: true }
}, { 
    strict: false 
});

module.exports = mongoose.model('ItCategory', CategorySchema);
