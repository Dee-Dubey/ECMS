const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ---------------------------------------------------------------------
 * Project: Acevin Inventory Management System (AIMS)
 * Department: Users
 * File Type: Mongoose Schema
 * File Name: userModel.js
 * 
 * Description:
 * This schema defines the structure for system users. Each user has:
 *   - Authentication details: loginId, password
 *   - Employee information: employeeCode, organizationEmail, first/middle/last name
 *   - User type and role-based access rights
 *   - Status indicator (0 = inactive, 1 = active, 2 = suspended)
 * 
 * Rights Structure:
 *   - HR Department: manage users
 *   - IT Department: view/manage/issue/return IT inventory
 *   - Hardware Department: view/manage/issue/return electronic devices and testing equipment
 *   - Admin Department: view/manage/issue/return consumable and fixed assets
 * 
 * Notes:
 * - All rights fields are numbers constrained to 0 or 1 (binary access control).
 * - The 'status' field uses 0-2 to indicate user activity state.
 * - This schema uses 'strict: false' to allow flexible updates to rights or additional fields.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const userSchema = new Schema({
    loginId: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    employeeCode: { type: String, unique: true, required: true },
    organizationEmail: {type: String, required: true},
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String },
    // type: { type: String, required: true },
    rights: {
        hrDepartment: {
            user: {
                manage: { type: Number, min: 0, max: 1, required: true }
            },
        },
        // ITDepartment: {
        //     ITInventory: {
        //         view: { type: Number, min: 0, max: 1, required: true },
        //         manage: { type: Number, min: 0, max: 1, required: true },
        //         issue: { type: Number, min: 0, max: 1, required: true },
        //         return: { type: Number, min: 0, max: 1, required: true },
        //     },
        // },
        hardwareDepartment: {
            electronicDevice: {
                view: { type: Number, min: 0, max: 1, required: true },
                manage: { type: Number, min: 0, max: 1, required: true },
                issue: { type: Number, min: 0, max: 1, required: true },
                return: { type: Number, min: 0, max: 1, required: true },
                BOM: { type: Number, min: 0, max: 1, required: true },
            }
            // testingEquipment: {
            //     view: { type: Number, min: 0, max: 1, required: true },
            //     manage: { type: Number, min: 0, max: 1, required: true },
            //     issue: { type: Number, min: 0, max: 1, required: true },
            //     return: { type: Number, min: 0, max: 1, required: true },
            //     BOM: { type: Number, min: 0, max: 1, required: true },
            // }
        },
        // adminDepartment: {
        //     consumableAsset: {
        //         view: { type: Number, min: 0, max: 1, required: true },
        //         manage: { type: Number, min: 0, max: 1, required: true },
        //         issue: { type: Number, min: 0, max: 1, required: true },
        //         return: { type: Number, min: 0, max: 1, required: true },
        //     },
        //     fixedAsset: {
        //         view: { type: Number, min: 0, max: 1, required: true },
        //         manage: { type: Number, min: 0, max: 1, required: true },
        //         issue: { type: Number, min: 0, max: 1, required: true },
        //         return: { type: Number, min: 0, max: 1, required: true },
        //     }
        // }
    },
    status: { type: Number, min: 0, max: 2, required: true }
}, { strict: false });

module.exports = mongoose.model('User', userSchema);
