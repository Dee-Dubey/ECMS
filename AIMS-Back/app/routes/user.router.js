/**
 * ---------------------------------------------------------------------
 * Routes: HR Department / User Management
 * 
 * Description:
 * This file defines all Express routes related to HR and user management,
 * including:
 *   - Creating, updating, and deleting users
 *   - Checking for unique login IDs and employee codes
 *   - User authentication and login
 *   - Resetting passwords and updating user status
 *   - Bulk user creation via CSV upload
 *   - Retrieving users with optional filters
 * 
 * Route Prefix: '/user'
 * 
 * Dependencies:
 *   - express
 *   - UserController (controller handling all user/HR logic)
 * 
 * Notes:
 *   - Routes support GET, POST, PUT, and DELETE operations as required.
 *   - Logging and error handling are managed inside controller methods.
 * ---------------------------------------------------------------------
 */
module.exports = app => {
    const UserController = require('../controllers/user.controller');
    const authMiddleware = require('../../middleware/auth.middleware');

    var router = require('express').Router();

    router.post('/', UserController.createUser);

    // Getting the list of all login ID 
    router.get('/check/l', UserController.checkLoginId);

    // Getting the list of employee code 
    router.get('/check/ec', UserController.checkEmployeeCode);

    // Getting the list of user by login ID
    router.get('/login', UserController.getUserByLoginId);

    router.get('/auth/context', authMiddleware, UserController.authContext)

    // Getting the list of users filters
    router.get('/', UserController.getUsersFilters);

    // Deleting the user by login ID
    router.delete('/', UserController.deleteUserByLoginId);

    // Creating the login
    router.post('/login', UserController.postLogin);

    // Creating the users by CSV
    router.post('/csvUpload', UserController.createUsersByCSV);

    // Updating with user by ID
    router.put('/', UserController.updateUserById);

    // Updating the user reset password by ID
    router.put('/password', UserController.resetPasswordById);

    // Updating the user status by ID 
    router.put('/status', UserController.updateUserStatusById);

    // Getting the employees
    // router.get('/all-employees', UserController.getEmployees);

    app.use('/user', router);
}