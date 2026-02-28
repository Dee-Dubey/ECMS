const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* ---------------------------------------------------------------------
 * Schema: AMC
 *
 * Description:
 * Represents the master contract record for an Annual Maintenance Contract.
 * Stores commercial details, validity range, linked assets, payment details,
 * and the assigned service provider. All service and repair activities are
 * recorded separately in AMCHistory to maintain full audit traceability.
 *
 * Fields:
 *  - amcName (String, required)
 *      Name/identifier of the AMC for reference and display
 *
 *  - assetsCode (String, required)
 *      Short contract/asset identifier used to generate unique service numbers
 *
 *  - startDate (Date, required)
 *      AMC effective date
 *
 *  - endDate (Date, required)
 *      AMC expiry date
 *
 *  - serviceProvider (String, required)
 *      Name or identifier of the vendor providing the AMC service
 *
 *  - invoiceNumber (String, required)
 *      Invoice reference used for billing and record keeping
 *
 *  - cost (Number, required)
 *      Final AMC contract cost
 *
 *  - frequency (String, required)
 *      Service frequency — e.g. Monthly, Quarterly, Yearly
 *
 *  - billNO (String, optional)
 *      Bill number associated with the AMC
 *
 *  - amcType (String, required)
 *      Type of AMC — e.g. Comprehensive / Non-Comprehensive / Warranty / etc.
 *
 *  - additionalNotes (String, optional)
 *      Extra remarks or contract conditions
 *
 *  - coveredAssets (Array<ObjectId>, required)
 *      List of assets covered under the AMC — drives eligibility for service
 *
 *  - paymentInfo (String, optional)
 *      Reference/transaction details for payment
 *
 *  - paymentMode (String, optional)
 *      Cash / UPI / Bank Transfer / Cheque / etc.
 *
 *  - status (String, required)
 *      Current AMC status:
 *        "Active AMC" | "Expire AMC"
 *
 * Schema Config:
 *  - timestamps: true → Automatically stores createdAt & updatedAt
 *  - strict: false → Allows saving future fields without migration requirement
 *
 * Notes:
 * - AMCHistory is responsible for tracking service, repair and extension events
 *   — the AMC document only contains static contract information
 * - Changing coveredAssets updates eligibility for further service/repair events
 *
 * Last Modified: 06 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const amcSchema = new Schema({
  amcName: { type: String, required: true },
  assetsCode: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  serviceProvider: { type: Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
  invoiceNumber: { type: String, required: true },
  cost: { type: Number, required: true },
  frequency: { type: String, required: true },
  billNO: { type: String },
  amcType: { type: String, required: true },
  additionalNotes: { type: String },
  // coveredAssets: [
  coveredAssets: [
    { type: Schema.Types.ObjectId, required: true },
  ],
  paymentInfo: { type: String },
  paymentMode: { type: String },
  status: { type: String, required: true } // Active AMC , Expire AMC
}, { 
  timestamps: true, strict: false 
});

module.exports = mongoose.model('AMC', amcSchema);
