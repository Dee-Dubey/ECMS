
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Project: Acevin Inventory Management System (AIMS)
 * Department: IT
 * File Type: Mongoose Schema
 * File Name: itinventory.js
 * 
 * Description: This file holds the main schema for IT inventory entries and is exported as 'ITInventory'
 * 
 * Last Modified: 24 October 2025
 * Last Modified By: Raza A [AS-127]
 */
const ItInventorySchema = new Schema({
    amc: {type: Schema.Types.ObjectId, ref: 'AMC'},
    categoryName: { type: Schema.Types.ObjectId, ref: 'ItCategory' },
    subCategoryName: { type: Schema.Types.ObjectId, ref: 'ItSubcategory' },
    description: { type: String },
    purchaseDate: { type: Date },
    warrantyDate: { type: Date },
    modelNo: { type: String },
    serialNo: { type: String },
    inputVoltage: { type: String },
    inputAmperage: {type: String},
    key: { type: String },
    subscriptionStart: { type: Date },
    subscriptionEnd: { type: Date },
    cpu: { type: String },
    ram: { type: String },
    drive: { type: String },
    systemConfig: { type: String },
    licenseInEff: { type: String },
    msEffect: { type: String },
    ipAddress: { type: String },
    internetAccess: { type: String },
    softwareInstalled: { type: String },
    lastUse: { type: String },
    code: { type: String, required: true, unique: true },
    creator: { type: String },
    status: { type: Number, default: 0 },
    supplier: { type: Schema.Types.ObjectId, ref: 'ItSupplier' },
    amount: { type: Number },
    manufacturer: { type: Schema.Types.ObjectId, ref: 'ItManufacturer' },
    transactionType: { type: String, required: true },
    // Adding user for issue the inventory
    user: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
    timestamps: true, strict: false 
});

module.exports = mongoose.model('ItInventory', ItInventorySchema);
