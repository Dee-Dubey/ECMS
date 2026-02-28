const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* ---------------------------------------------------------------------
 * Schema: AMCHistory
 *
 * Description:
 * Stores chronological logs of all AMC lifecycle events, including
 * service initiation, service closure, repair initiation, repair closure,
 * AMC creation, and AMC extension. Each record represents a snapshot of
 * an event rather than an update to an existing record, ensuring a fully
 * traceable audit history.
 *
 * Fields:
 *  - amcID (ObjectId, required)
 *      Reference to the AMC to which this history entry belongs
 *
 *  - transactionType (String, required)
 *      Type of event:
 *        "create", "service initiated", "service closed",
 *        "Repair initiated", "Repair closed",
 *        "extended", "closed"
 *
 *  - serviceDetails (String, optional)
 *      Description of issue or repair notes
 *
 *  - serviceNumber (String, optional)
 *      Unique number representing a single service/repair cycle
 *
 *  - serviceStatus (String, optional)
 *      "Open" or "Closed" — represents ongoing or finished service
 *
 *  - servicedAssets (Array<ObjectId>)
 *      List of assets involved in the event (mandatory during initiation)
 *
 *  - cost (Number, optional)
 *      Final service/repair cost
 *
 *  - billNo (String, optional)
 *      Bill number provided by service vendor
 *
 *  - estimatedCost (Number, optional)
 *      Cost estimated during initiation before final billing
 *
 *  - invoiceNumber (String, required)
 *      Invoice reference number for billing and documentation
 *
 *  - paymentMode (String, optional)
 *      Cash / UPI / Bank Transfer / Debit Note / etc.
 *
 *  - paymentInfo (String, optional)
 *      Reference/transaction details for payment
 *
 *  - additionalNotes (String, optional)
 *      Extra remarks recorded during the event
 *
 * Schema Config:
 *  - timestamps: Automatically stores createdAt and updatedAt
 *  - strict: false → Allows saving additional fields dynamically if needed
 *
 * Notes:
 * - Each entry is immutable by design — new events create new rows
 * - Enables complete AMC life tracking for audits and reporting
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const amcHistorySchema = new Schema({
  amcID: { type: Schema.Types.ObjectId, ref: 'AMC', required: true },

  transactionType: { type: String, required: true },  //create, service initiated, service closed, repair initiated, repair closed, extended, closed
  serviceDetails: { type: String },
  serviceNumber: { type: String },     // generate the service number
  serviceStatus: { type: String }, // open and closed
  servicedAssets: [
    { type: Schema.Types.ObjectId, required: true }
  ],
  cost: { type: Number },
  billNo: { type: String },
  estimatedCost: { type: Number },
  invoiceNumber: { type: String, required: true},
  paymentMode: { type: String },
  paymentInfo: { type: String },
  additionalNotes: { type: String },
}, { 
  timestamps: true, strict: false 
});

/* ---------------------------------------------------------------------
 * Index Definitions for: AMCHistory Schema
 *
 * Purpose:
 * Enhances query performance for high-traffic lookup patterns commonly
 * used across AMC reporting, dashboards, and service status checks.
 *
 * Indexes:
 *  1) { amcID: 1 }
 *      - Optimizes queries fetching full AMC history using amcID
 *
 *  2) { amcID: 1, serviceStatus: 1 }
 *      - Improves queries that filter history by AMC + open/closed state
 *      - Frequently used when checking for active services/repairs
 *
 *  3) { serviceStatus: 1 }
 *      - Speeds up filtering all open/closed services regardless of AMC
 *      - Useful for global dashboards and pending service counts
 *
 *  4) { servicedAssets: 1 }
 *      - Enables fast lookups for "asset currently under service"
 *      - Helps enforce AMC service locking rules to prevent double-booking
 *
 * Notes:
 * - Indexes do not alter schema behavior; they only optimize query time
 * - Combined index (amcID + serviceStatus) reduces DB scans significantly
 *   for open/closed service checks
 * - If dataset grows very large, consider compound index:
 *      { serviceStatus: 1, serviceNumber: 1 }
 *   for even faster active-service resolution
 *
 * Last Modified: 05 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
amcHistorySchema.index({ amcID: 1 });
amcHistorySchema.index({ amcID: 1, serviceStatus: 1 });
amcHistorySchema.index({ serviceStatus: 1 });
amcHistorySchema.index({ servicedAssets: 1 });

module.exports = mongoose.model('AMCHistory', amcHistorySchema);
