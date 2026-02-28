const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
  * Project      : Acevin Inventory Management System (AIMS)
 * Department   : Admin
 * File Type    : Mongoose Schema
 * File Name    : consumableItemName.js
 * 
 * Description  :
 * This schema defines the structure for storing consumable item names.
 * Each document represents a unique consumable item that can be used
 * while creating purchase entries, challans, and bills.
 * 
 * The item name is used as a master reference across the inventory
 * system for item selection, reporting, and stock management.
 * 
 * The schema uses `strict: false` to allow flexibility for storing
 * additional attributes in the future without requiring schema changes.
 * 
 * Collection   : consumableItemNames
 * 
 * Last Updated : 29 January 2026
 * Updated By   : Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const ItemSchema = new Schema({
    category: {type: Schema.Types.ObjectId,ref:'consumableCategory', required: true},
    itemName: { type: String, required: true, unique: true },
    location: {type: Schema.Types.ObjectId, ref: 'consumableLocation', required: true},
    branded: {type: String},
    description: {type: String},
    totalIntake: {type: Number, required: true},
    totalConsume: {type: Number, required: true}
}, { 
    strict: false,
    timestamps: true
});

module.exports = mongoose.model('consumableItem', ItemSchema);
