const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const companySchema = new Schema({
  companyName: {type: String, unique: true, required: true},
  abbreviation: {type: String, unique: true, required: true},
  GSTNumber: {type: String, unique: true, required: true},
  address: {type: String, unique: true, required: true}
}, {
  timestamps: true, strict: false 
})

module.exports = mongoose.model('company', companySchema);