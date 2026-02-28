const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project      : Acevin Inventory Management System (AIMS)
 * Department   : Admin
 * File Type    : Mongoose Schema
 * File Name    : category.js
 * 
 * Description  :
 * This schema defines the structure for consumable item categories.
 * Each category represents a logical grouping of consumable items
 * (e.g., Stationery, Electrical, Hardware, Pantry, etc.).
 * 
 * The schema is configured with `strict: false` to allow flexibility
 * for future enhancements or additional attributes without requiring
 * schema changes.
 * 
 * Collection   : consumableCategories
 * 
 * Last Updated : 29 January 2026
 * Updated By   : Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const CategorySchema = new Schema({
    categoryName: { type: String, unique: true, required: true }
}, { 
    strict: false,
    timestamps: true
});

module.exports = mongoose.model('consumableCategory', CategorySchema);
