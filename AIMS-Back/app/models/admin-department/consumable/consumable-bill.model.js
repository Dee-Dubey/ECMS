const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project      : Acevin Inventory Management System (AIMS)
 * Department   : Admin
 * File Type    : Mongoose Schema
 * File Name    : consumableChallanNumber.js
 * 
 * Description  :
 * This schema is used to store and manage consumable challan numbers.
 * Each document represents a unique supplier challan reference that
 * is used while creating and linking consumable purchase records.
 * 
 * The schema uses `strict: false` to allow flexibility for storing
 * additional fields in the future without modifying the schema.
 * 
 * Collection   : consumableChallanNumbers
 * 
 * Last Updated : 29 January 2026
 * Updated By   : Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const BillSchema = new Schema({
    billNumber: { type: String, required: true },
    challanNumber: [{ type: Schema.Types.ObjectId, ref: 'consumableChallan' }],
    // items: [{type: Schema.Types.ObjectId, required: true}]
    items: [{type: Schema.Types.ObjectId, ref: 'consumableLineItem' }]
}, { 
    strict: false,
    timestamps: true
});

module.exports = mongoose.model('consumableBill', BillSchema);
