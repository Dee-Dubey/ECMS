const Company = require('../models/company/company.model');
const mongoose = require('mongoose');

exports.createCompany = async (req, res) => {
  try {
    const company = req.body;

    console.log('company', company)

    const newCompany = new Company(company);
    const savedCompany = await newCompany.save();

    return res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: savedCompany
    });

  } catch (error) {
    console.error('Create Company Error:', error);

    // Duplicate key error (e.g. unique email / company code)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Company already exists',
        error: error.keyValue
      });
    }

    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    // Fallback – real server error
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.getCompany = async (req, res) => {
  try {
    const companiesData = await Company
      .find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Companies fetched successfully',
      count: companiesData.length,
      data: companiesData
    });

  } catch (error) {
    console.error('Get Company Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch companies'
    });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = req.body;

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      company,
      {
        new: true,          // return updated document
        runValidators: true // enforce schema rules
      }
    );

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: updatedCompany
    });

  } catch (error) {
    console.error('Update Company Error:', error);

    // Duplicate key (unique fields like email)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate field value',
        error: error.keyValue
      });
    }

    // Validation errors
    if (error.name === 'ValidationError') {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    // Unknown server error
    return res.status(500).json({
      success: false,
      message: 'Failed to update company'
    });
  }
};
