const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project      : Acevin Inventory Management System (AIMS)
 * Department   : Admin
 * File Type    : Mongoose Schema
 * File Name    : consumable.js
 * 
 * Description  :
 * Schema for consumable purchase entries. Each record represents
 * a single purchase transaction created either using a Bill
 * or a Challan document.
 * 
 * Based on the selected document type:
 * - BILL    → billNumber is mandatory
 * - CHALLAN → challanNumber is mandatory
 * 
 * Collection   : consumables
 * 
 * Last Updated : 29 January 2026
 * Updated By   : Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const LineItemSchema = new Schema(
  {
    itemName: {type: Schema.Types.ObjectId, ref: 'consumableItem', required: true },
    HSNCode: {type: String},
    quantity: {type: Number, require: true},
    supplier: {type: Schema.Types.ObjectId, ref: 'consumableSupplier', required: true },
    unitPrice: {type: Number, required: true},
    CGST: {type: Number, required: true},
    SGST: {type: Number, required: true},
    IGST: {type: Number, required: true},
    // challanNumber: {type: Schema.Types.ObjectId, ref: 'ChallenNumber', required: true},
    challanNumber: { type: Schema.Types.ObjectId, ref: 'consumableChallan' },
    // billNumber: {type: Schema.Types.ObjectId, ref: 'BillNumber'},
    billNumber: {type: Schema.Types.ObjectId, ref: 'consumableBill'},
    companyName: {type: Schema.Types.ObjectId, ref: 'company', required: true},
    baseAmount: {type: Number, required: true},
    GSTAmount: {type: Number, required: true},
    totalAmount: { type: Number, required: true}
  },
  {
    strict: false,
    timestamps: true
  }
);

module.exports = mongoose.model('consumableLineItem', LineItemSchema);

