const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project      : Acevin Inventory Management System (AIMS)
 * Department   : Admin
 * File Type    : Mongoose Schema
 * File Name    : consumableBillNumber.js
 * 
 * Description  :
 * This schema is used to store and manage consumable bill numbers.
 * Each document represents a unique supplier bill reference that
 * is used while creating and linking consumable purchase records.
 * 
 * The schema uses `strict: false` to allow flexibility for storing
 * additional fields in the future without modifying the schema.
 * 
 * Collection   : consumableBillNumbers
 * 
 * Last Updated : 29 January 2026
 * Updated By   : Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const ChallanSchema = new Schema({
    challanNumber: { type: String, required: true, unique: true },
    billNumber: { type: Schema.Types.ObjectId, ref: 'consumableBill'},
    items: [{ type: Schema.Types.ObjectId, ref: 'consumableLineItem', required: true} ],
    supplier: { type: Schema.Types.ObjectId, ref: 'consumableSupplier', required: true },
    GSTNumber: { type: String },
    challanDate: { type: String, required: true },
    companyName: { type: Schema.Types.ObjectId, ref: 'companyName', required: true },
    totalQuantity: { type: Number, required: true },
    totalBaseAmount: { type: Number, required: true },
    totalGSTAmount: { type: Number, required: true },
    totalAmount: {  type: Number, required: true }
}, { 
    strict: false,
    timestamps: true
});

module.exports = mongoose.model('consumableChallan', ChallanSchema);
