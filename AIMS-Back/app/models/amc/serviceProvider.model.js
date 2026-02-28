const mongoose = require('mongoose');

/* ---------------------------------------------------------------------
 * Schema: ServiceProvider
 *
 * Description:
 * Stores vendor / agency information for AMC and service contracts.
 * Each service provider is uniquely identified by name and may include
 * contact and address details for communication and billing purposes.
 *
 * Fields:
 *  - name (String, required, unique)
 *      Name of the service provider. Acts as the unique identifier to
 *      prevent duplication of vendor records.
 *
 *  - contact (String, optional)
 *      Phone number or other contact reference for maintenance requests
 *
 *  - address (String, optional)
 *      Physical / mailing address of the vendor
 *
 * Schema Config:
 *  - trim on name ensures consistent formatting and avoids duplicates
 *    due to whitespace variations
 *  - unique constraint on name prevents multiple providers with the
 *    same name from being created
 *
 * Notes:
 * - This schema maintains static vendor profile information only.
 * - AMC associations are handled in the AMC document (serviceProvider field)
 *   and NOT here.
 * - If vendors can have multiple contact numbers in the future, consider
 *   upgrading `contact` to an array.
 *
 * Last Modified: 06 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
const serviceProviderSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  contact: { type: String },
  address: { type: String },
}, {
  strict: false
});

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
