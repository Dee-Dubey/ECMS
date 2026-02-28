module.exports = app => {
  const router = require('express').Router();
  const companyController = require('../controllers/company.controller')

  router.post('/', companyController.createCompany);

  router.get('/', companyController.getCompany);

  router.put('/:id', companyController.updateCompany)

  app.use('/api/company', router)
}