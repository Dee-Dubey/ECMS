const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project: Acevin Inventory Management System (AIMS)
 * Department: IT
 * File Type: Mongoose Schema
 * File Name: Subcategory.js
 * 
 * Description:
 * This schema defines the structure for IT subcategory entries linked to their respective categories. 
 * Each subcategory includes configuration fields to determine which attributes are applicable 
 * (e.g., supplier, warranty, serial number, etc.).
 * 
 * Notes:
 * - Some fields like 'status', 'amount', and 'quantity' are commented out and reserved for future use or were deprecated.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const SubcategorySchema = new Schema({
    categoryName: { type: Schema.Types.ObjectId, ref: 'ItCategory' },
    subCategoryName: { type: String, required: true },
    // abbreviatedName: { type: String, required: true },
    numbericDigit: {type: Number, required: true},
    prefix: {type: String, required: true},
    suffix: {type: String, required: true}, 
    sequenceId: { type: Number, default: 0 },
    fields: {
        purchaseDate: { type: Boolean, required: true },
        warrantyDate: { type: Boolean, required: true },
        modelNo: { type: Boolean, required: true },
        // serialNo: { type: Boolean, required: true },
        inputVoltage: { type: Boolean, required: true },
        key: { type: Boolean, required: true },
        subscriptionStart: { type: Boolean, required: true },
        subscriptionEnd: { type: Boolean, required: true },
        cpu: { type: Boolean, required: true },
        ram: { type: Boolean, required: true },
        drive: { type: Boolean, required: true },
        systemConfig: { type: Boolean, required: true },
        licenseInEff: { type: Boolean },
        msEffect: { type: Boolean, required: true },
        ipAddress: { type: Boolean, required: true },
        internetAccess: { type: Boolean, required: true },
        softwareInstalled: { type: Boolean, required: true },
        lastUse: { type: Boolean, required: true },
        description: { type: Boolean, required: true }
    }


}, { 
    strict: false 
});

module.exports = mongoose.model('ItSubcategory', SubcategorySchema);
