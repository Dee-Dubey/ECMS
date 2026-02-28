const path = require('path')
const User = require('../models/user/user.model');
const jwt = require('jsonwebtoken');
const config = require('../../config.json');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const xlsx = require('xlsx');
const logger = require('../../logger')



// Define the path of the uploadUser directory
const uploadDirectory = path.join(__dirname, '../../uploadUsers')

/**
 * Ensure that a directory exists. If not, create it.
 * @param {string} directoryPath - The full path of the directory to ensure.
 */
const ensureDirectoryExists = (directoryPath) => {
    if (!fs.existsSync(directoryPath)) {
        try {
            fs.mkdirSync(directoryPath, { recursive: true });
            logger.info(`Directory created successfully: ${directoryPath}`)

        } catch (error) {
            logger.error('Failed to create directory', { error })

        }
    } else {
        console.log(`Directory already exists: ${directoryPath}`)
        logger.debug(`Directory already exists: ${directoryPath}`)
    }
}



/* Setting up Multer to handle uploads */
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        ensureDirectoryExists(uploadDirectory)
        cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

var upload = multer({ storage: storage }).single('file');

function enforceViewRule(section) {
    if (
        section.manage === 1 ||
        section.issue === 1 ||
        section.return === 1
    ) {
        section.view = 1;
    }
}

/**
 * ---------------------------------------------------------------------
 * Function: createUser
 * 
 * Description:
 * Handles the creation of a new user in the system.
 * Steps performed:
 *   1. Receives user data from the request body.
 *   2. Hashes the user's password using bcrypt (salt rounds: 6).
 *   3. Saves the new user to the database.
 *   4. Logs success or failure using the logger.
 * 
 * HTTP Method: POST
 * Route: '/user' (or as defined in router)
 * 
 * Parameters:
 *   - req.body: Object containing user details (loginId, password, employeeCode, firstName, etc.)
 * 
 * Response:
 *   - Success: JSON with message 'User Created Successfully'.
 *   - Error: Sends the error object.
 * 
 * Logging:
 *   - Info: When request is received.
 *   - Debug: When user is created successfully.
 *   - Error: If saving the user fails.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.createUser = async (req, res) => {
    try {
        logger.info('Received request to create user', { user: req.body });
        const newUser = new User(req.body);
        newUser.password = bcrypt.hashSync(newUser.password, 6);

        const result = await newUser.save()
        logger.debug('User created successfully', { user: result });
        return res.status(201).json({
            success: true,
            message: 'User created successfully'
        });
    } catch (err) {
        logger.error('Error creating user', { error: err });

        // Duplicate key error (very common case)
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User already exists (duplicate loginId or email)'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error while creating user'
        });
    }
}



/**
 * ---------------------------------------------------------------------
 * Function: checkLoginId
 * 
 * Description:
 * Checks if a given login ID already exists in the system.
 * Steps performed:
 *   1. Retrieves 'loginId' from the query parameters.
 *   2. Searches the User collection for the given loginId.
 *   3. Responds with `true` if loginId is available (not found).
 *   4. Responds with `false` if loginId already exists.
 *   5. Logs all actions and errors.
 * 
 * HTTP Method: GET
 * Route: '/user/check/l'
 * 
 * Parameters:
 *   - req.query.loginId: Login ID to check for availability.
 * 
 * Response:
 *   - true: loginId is available.
 *   - false: loginId already exists.
 * 
 * Logging:
 *   - Info: When checking, available, or already exists.
 *   - Error: If database query fails.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.checkLoginId = (req, res) => {
    const loginId = req.query.loginId;
    logger.info('Checking loginId', { loginId })
    User.findOne({
        loginId: loginId
    }).then(result => {
        if (result === null || result === undefined) {
            logger.info('loginId is available', { loginId })
            res.send(true)
        } else {
            logger.info('loginId already exists', { loginId })
            res.send(false)
        }
    }).catch(err => {
        logger.error('Error checking LoginId', { loginId, error: err })
        console.log(err)
    })
}



/**
 * ---------------------------------------------------------------------
 * Function: checkEmployeeCode
 * 
 * Description:
 * Checks if a given employee code already exists in the system.
 * Steps performed:
 *   1. Retrieves 'employeeCode' from the query parameters.
 *   2. Searches the User collection for the given employee code.
 *   3. Responds with `true` if employee code is available (not found).
 *   4. Responds with `false` if employee code already exists.
 *   5. Logs all actions and errors.
 * 
 * HTTP Method: GET
 * Route: '/user/check/ec'
 * 
 * Parameters:
 *   - req.query.employeeCode: Employee code to check for availability.
 * 
 * Response:
 *   - true: employee code is available.
 *   - false: employee code already exists.
 * 
 * Logging:
 *   - Info: When checking, available, or already exists.
 *   - Error: If database query fails.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.checkEmployeeCode = (req, res) => {
    const employeeCode = req.query.employeeCode;
    logger.info('Checking Employeecode', { employeeCode })
    User.findOne({
        employeeCode: employeeCode
    }).then(result => {
        if (result === null || result === undefined) {
            logger.info('Employee code is available', { employeeCode })
            res.send(true)
        } else {
            logger.info('Employee code already exist', { employeeCode })
            res.send(false)
        }
    }).catch(err => {
        logger.error('Error checking employee code', { employeeCode, error: err })
        console.log(err)
    })
}




/**
 * ---------------------------------------------------------------------
 * Function: getUserByLoginId
 * 
 * Description:
 * Fetches a user from the database based on the provided login ID.
 * Steps performed:
 *   1. Retrieves 'loginId' from the query parameters.
 *   2. Searches the User collection for the given login ID.
 *   3. If found, returns the user data as JSON.
 *   4. If not found, returns an error message.
 *   5. Logs all actions and errors.
 * 
 * HTTP Method: GET
 * Route: '/user/login'
 * 
 * Parameters:
 *   - req.query.loginId: Login ID of the user to fetch.
 * 
 * Response:
 *   - JSON object with user details if found.
 *   - JSON object with error message if not found.
 * 
 * Logging:
 *   - Info: When user is found or not found.
 *   - Error: If database query fails.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.getUserByLoginId = (req, res) => {
    const loginId = req.query.loginId
    User.findOne({
        loginId: loginId
    }).then(result => {
        if (result) {
            logger.info('User found', { loginId, user: result });
            res.send(JSON.stringify(result));
        } else {
            logger.info('No user found for loginId', { loginId });
            res.send({ error: 'User not found' });
        }
    }).catch(err => {
        logger.error('Error fetching user by loginId', { loginId, error: err });
        res.send(JSON.stringify(err));
    })
}



/**
 * ---------------------------------------------------------------------
 * Function: getUsersFilters
 * 
 * Description:
 * Fetches users from the database based on the 'type' filter.
 * Steps performed:
 *   1. Retrieves 'type' from query parameters.
 *   2. If 'type' is 'all', fetches all users.
 *   3. If a specific type is provided, fetches users matching that type.
 *   4. Sends the retrieved user list as JSON.
 *   5. Logs all actions and any errors encountered.
 * 
 * HTTP Method: GET
 * Route: '/user'
 * 
 * Parameters:
 *   - req.query.type: Type of users to fetch (e.g., 'all', 'admin', 'staff').
 * 
 * Response:
 *   - JSON array of user objects matching the filter.
 *   - Error object if the database query fails.
 * 
 * Logging:
 *   - Info: When users are fetched successfully.
 *   - Error: If database query fails.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.getUsersFilters = (req, res) => {
    const filter = req.query.type
    if (filter === "all") {
        User.find().then(users => {
            logger.info('Users fetched successfully', { count: users.length });
            res.send(users)
        }).catch(err => {
            logger.error('Error fetching users', { error: err });
            console.log(err)
            res.send(err)
        })
    } else {
        User.find({ type: filter }).then(users => {
            logger.info('Users fetched successfully with filter', { filter, count: users.length });
            res.send(users)
        }).catch(err => {
            logger.error('Error fetching users with filter', { filter, error: err });
            console.log(err)
            res.send(err)
        })
    }
}



/**
 * ---------------------------------------------------------------------
 * Function: postLogin
 * 
 * Description:
 * Handles user authentication for both default and registered users.
 * Steps performed:
 *   1. Checks if the loginId matches the default system user.
 *   2. Verifies password for default user using plain-text comparison.
 *   3. For other users, retrieves user details from the database.
 *   4. Validates password using bcrypt and generates a JWT token.
 *   5. Returns user details and token upon successful authentication.
 * 
 * HTTP Method: POST
 * Route: '/user/login'
 * 
 * Request Body:
 *   - loginId: (String) User login ID.
 *   - password: (String) User password.
 * 
 * Response:
 *   - { status: 'success', token, user } on successful login.
 *   - { status: 'login' } if user not found.
 *   - { status: 'password' } if password is incorrect.
 *   - { error } if an exception occurs.
 * 
 * Logging:
 *   - Info: Successful logins.
 *   - Warn: Invalid login attempts (wrong password or unknown user).
 *   - Error: Database or authentication errors.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.postLogin = (req, res) => {
    const loginId = req.body.loginId;
    const password = req.body.password;
    if (loginId === config.defaultUser.loginId) {
        if (password === config.defaultUser.password) {
            const token = jwt.sign({ loginId: 'AcevinMaster' }, config.key, { expiresIn: '10h' })
            logger.info('Default user login successful', { loginId });
            res.send({ status: 'sucess', token: token, user: config.defaultUser })

        } else {
            logger.warn('Incorrect password for default user', { loginId });
            res.send({ status: 'password' })
        }
    } else {
        User.findOne({
            loginId: loginId
        }).then(user => {
            if (!user) {
                logger.warn('User not found', { loginId });
                return res.send({ status: 'login' })
            }
            if (!bcrypt.compareSync(password, user.password)) {
                logger.warn('Incorrect password', { loginId });
                return res.send({ status: 'password' })
            }
            const token = jwt.sign({ loginId: user.loginId }, 'Acevin-inventory', { expiresIn: '10h' })
            logger.info('Login successful', { loginId, user });
            res.send({ status: 'sucess', token: token, user: user })
        }).catch(err => {
            logger.error('Error during login', { loginId, error: err });
            res.send({ error: 'Error while retriving the user data' })
        })
    }
}



exports.authContext = async (req, res) => {
    try {
        const loginId = req.loginId;
        console.log('loginID', loginId)
        // 🔹 1. Check CONFIG ADMIN first
        if (loginId === config.defaultUser.loginId) {
            return res.json({
                user: {
                    firstName: config.defaultUser.firstName,
                    email: config.defaultUser.organizationEmail,
                    employeeCode: config.defaultUser.employeeCode,
                    loginId: config.defaultUser.loginId,
                    userType: config.defaultUser.userType,
                    status: config.defaultUser.status
                },
                rights: config.defaultUser.rights,
            });
        }

        // 🔹 2. Check DATABASE users
        const user = await User.findOne({ loginId }).lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                email: user.organizationEmail,
                employeeCode: user.employeeCode,
                loginId: user.loginId,
                staffType: user.type,
                status: user.status
            },
            rights: user.rights,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Context fetch failed' });
    }
};




/**
 * ---------------------------------------------------------------------
 * Function: deleteUserByLoginId
 * 
 * Description:
 * Deletes a user from the database based on the provided login ID.
 * Performs a direct deletion and returns the operation status.
 * 
 * HTTP Method: DELETE
 * Route: '/user'
 * 
 * Query Parameters:
 *   - loginId: (String) Unique identifier of the user to delete.
 * 
 * Response:
 *   - { status: true } if deletion is successful.
 *   - { status: false, message: error } if an error occurs.
 * 
 * Logging:
 *   - Info: When a user is deleted successfully.
 *   - Error: When deletion fails or database error occurs.
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.deleteUserByLoginId = (req, res) => {
    const loginId = req.query.loginId;
    User.deleteOne({
        loginId: loginId
    }).then((result) => {
        console.log('delete data:', result);
        logger.info('User deleted successfully', { loginId, result });
        res.send(JSON.stringify({ status: true }));
    }).catch((err) => {
        console.log(err);
        logger.error('Error deleting user', { loginId, error: err });
        res.send(JSON.stringify({ status: false, message: err }));
    })
}



/**
 * ---------------------------------------------------------------------
 * Function: createUsersByCSV
 * 
 * Description:
 * Handles bulk user creation or update from a CSV/XLSX file upload.
 * Reads the uploaded file, validates headers and mandatory fields, 
 * maps each row to a user object, and saves or updates users in the database.
 * 
 * Functionality:
 *   - Validates uploaded CSV/XLSX structure against a predefined schema.
 *   - Checks required fields (loginId, password, employeeCode, etc.).
 *   - Automatically hashes passwords before saving.
 *   - Creates new users or updates existing ones based on loginId.
 *   - Returns detailed validation or error feedback for incorrect files.
 *   - Deletes the uploaded file after processing.
 * 
 * HTTP Method: POST  
 * Route: '/user/csvUpload'
 * 
 * File Upload:
 *   - Accepts CSV or XLSX files.
 *   - Uses Multer middleware for file handling.
 * 
 * Response:
 *   - { message: 'Users File Uploaded Successfully', status: 'success' }  
 *       → if all records processed successfully.  
 *   - { message: 'Error In Some Entries', data: [...], status: 'entries' }  
 *       → if missing or invalid fields in any rows.  
 *   - { message: 'File Missing Columns', status: 'file' }  
 *       → if file structure doesn’t match required columns.  
 *   - { error: 'Error processing the file', status: 'error' }  
 *       → if parsing or database operations fail.  
 * 
 * Logging:
 *   - Info: For successful file parsing and user operations.
 *   - Error: For file structure, validation, or database save issues.
 * 
 * Dependencies:
 *   - multer (for upload)
 *   - xlsx (for file parsing)
 *   - bcrypt (for password hashing)
 *   - fs & path (for file system operations)
 *   - logger (for application logs)
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */

exports.createUsersByCSV = async (req, res) => {
    upload(req, res, async (err) => {
        let filePath = null;

        try {
            if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: err.message || 'File upload failed'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No file uploaded'
                });
            }

            filePath = path.join(uploadDirectory, req.file.filename);

            const workbook = xlsx.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            if (!sheet) throw new Error('Invalid or empty sheet');

            const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

            if (!rows.length) {
                return res.status(400).json({
                    status: 'error',
                    message: 'File contains no data'
                });
            }

            // Normalize headers
            const normalize = (key) =>
                String(key).replace(/\s/g, '').toLowerCase();

            const errors = [];
            const bulkOps = [];
            const loginIdsInFile = new Set();

            for (let i = 0; i < rows.length; i++) {
                const rowNumber = i + 2;
                const raw = rows[i];

                // Normalize row keys
                const row = {};
                Object.keys(raw).forEach(k => {
                    row[normalize(k)] = raw[k];
                });

                // Required validation
                if (!row.loginid || !row.password || !row.employeecode || !row.firstname) {
                    errors.push({
                        row: rowNumber,
                        error: 'Missing required fields'
                    });
                    continue;
                }

                const loginId = String(row.loginid).trim();

                // Duplicate inside file check
                if (loginIdsInFile.has(loginId)) {
                    errors.push({
                        row: rowNumber,
                        error: 'Duplicate loginId in file'
                    });
                    continue;
                }
                loginIdsInFile.add(loginId);
                const employeeCode = String(row.employeecode).trim();
                const existingUser = await User.findOne({ employeeCode: employeeCode }).select('_id');

                if (existingUser) {
                    errors.push({
                        row: rowNumber,
                        loginId: loginId,
                        error: 'User already exists'
                    });
                    continue; // Skip inserting
                }

                const hashedPassword = bcrypt.hashSync(String(row.password), 10);

                const userDoc = {
                    loginId: loginId,
                    password: hashedPassword,
                    employeeCode: String(row.employeecode).trim(),
                    organizationEmail: row.organizationemail || null,
                    firstName: String(row.firstname).trim(),
                    middleName: row.middlename || null,
                    lastName: row.lastname || null,
                    status: Number(row.status ?? 1),
                    rights: {
                        hrDepartment: {
                            user: {
                                manage: Number(row.userrights ?? 0)
                            }
                        },
                        // ITDepartment: {
                        //     ITInventory: {
                        //         view: Number(row.inventoryviewrights ?? 0),
                        //         manage: Number(row.inventorymanagerights ?? 0),
                        //         issue: Number(row.inventoryissuerights ?? 0),
                        //         return: Number(row.inventoryreturnrights ?? 0),
                        //     }
                        // },
                        hardwareDepartment: {
                            electronicDevice: {
                                view: Number(row.electronicviewrights ?? 0),
                                manage: Number(row.electronicmanagerights ?? 0),
                                issue: Number(row.electronicissuerights ?? 0),
                                return: Number(row.electronicreturnrights ?? 0),
                                BOM: Number(row.electronicbomrights ?? 0),
                            }
                            // testingEquipment: {
                            //     view: Number(row.testingequipmentviewrights ?? 0),
                            //     manage: Number(row.testingequipmentmanagerights ?? 0),
                            //     issue: Number(row.testingequipmentissuerights ?? 0),
                            //     return: Number(row.testingequipmentreturnrights ?? 0),
                            //     BOM: Number(row.testingequipmentbomrights ?? 0)
                            // }
                        }
                        // adminDepartment: {
                        //     consumableAsset: {
                        //         view: Number(row.consumableassetviewrights ?? 0),
                        //         manage: Number(row.consumableassetmanagerights ?? 0),
                        //         issue: Number(row.consumableassetissuerights ?? 0),
                        //         return: Number(row.consumableassetreturnrights ?? 0),
                        //     },
                        //     fixedAsset: {
                        //         view: Number(row.fixedassetviewrights ?? 0),
                        //         manage: Number(row.fixedassetmanagerights ?? 0),
                        //         issue: Number(row.fixedassetissuerights ?? 0),
                        //         return: Number(row.fixedassetreturnrights ?? 0),
                        //     }
                        // }
                    }
                };
                bulkOps.push({
                    insertOne: {
                        document: userDoc
                    }
                });
            }

            if (!bulkOps.length) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No valid new users to insert',
                    errors
                });
            }

            const result = await User.bulkWrite(bulkOps, { ordered: false });

            return res.status(200).json({
                status: errors.length ? 'partial' : 'success',
                inserted: result.insertedCount,
                skipped: errors.length,
                errors
            });

        } catch (error) {
            console.error('CSV Upload Error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Server error while processing file'
            });
        } finally {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    });
};



/**
 * ---------------------------------------------------------------------
 * Function: updateUserById
 * 
 * Description:
 * Updates user information based on the provided loginId.
 * The function retrieves the existing user using the loginId from query parameters
 * and updates it with the new data provided in the request body.
 * 
 * Functionality:
 *   - Finds a user by loginId.
 *   - Updates user fields with new values.
 *   - Returns the updated user data upon success.
 *   - Handles any database or validation errors.
 * 
 * HTTP Method: PUT  
 * Route: '/user/update'
 * 
 * Request Parameters:
 *   - Query: loginId (string) → Unique identifier for the user.
 *   - Body: updatedUserData (object) → Fields to update (e.g., name, email, type, etc.)
 * 
 * Response:
 *   - { status: true, rights: result }  
 *       → When the user is successfully updated.
 *   - { status: false, message: err }  
 *       → When an error occurs during the update.
 * 
 * Logging:
 *   - Info: Logs successful user update with loginId.
 *   - Error: Logs update failure with error details.
 * 
 * Dependencies:
 *   - User (Mongoose model)
 *   - logger (for structured logging)
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.updateUserById = async (req, res) => {
    try {
        const loginId = req.query.loginId;
        const updatedUserData = req.body;

        if (!loginId) {
            return res.status(400).json({
                success: false,
                message: 'LoginId is required'
            });
        }

        const result = await User.findOneAndUpdate(
            { loginId: loginId },
            { $set: updatedUserData },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        logger.info('User Updated successfully', { loginId });

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: result
        });

    } catch (err) {
        logger.error('Error updating user', { loginId: req.query.loginId, error: err });

        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate data: loginId or email already exists'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error while updating user'
        });
    }
}



/**
 * ---------------------------------------------------------------------
 * Function: resetPasswordById
 * 
 * Description:
 * Resets and updates a user's password based on their loginId.
 * The new password is securely hashed using bcrypt before saving it to the database.
 * 
 * Functionality:
 *   - Receives a new password from the request body.
 *   - Hashes the password using bcrypt for security.
 *   - Finds the user by loginId and updates the password.
 *   - Returns a success or error response.
 * 
 * HTTP Method: PUT  
 * Route: '/user/password'
 * 
 * Request Parameters:
 *   - Query: loginId (string) → The unique user identifier.
 *   - Body: { password: string } → The new password to be set.
 * 
 * Response:
 *   - { status: true }  
 *       → When the password is updated successfully.
 *   - { status: false, message: err }  
 *       → When an error occurs during update.
 * 
 * Logging:
 *   - Info: Logs password reset success.
 *   - Error: Logs any error during password update.
 * 
 * Dependencies:
 *   - bcrypt (for password hashing)
 *   - User (Mongoose model)
 *   - logger (for structured logging)
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.resetPasswordById = async (req, res) => {

    try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: false,
        message: 'Password is required'
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 6);

    const result = await User.findOneAndUpdate(
      { loginId: req.query.loginId },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    logger.info('Password updated successfully');

    res.status(200).json({
      status: true,
      message: 'Password updated successfully'
    });

  } catch (err) {
    logger.error('Error updating password', { error: err });

    res.status(500).json({
      status: false,
      message: 'Server error while updating password'
    });
  }
}



/**
 * ---------------------------------------------------------------------
 * Function: updateUserStatusById
 * 
 * Description:
 * Updates the status of a user (e.g., Active/Inactive) based on their loginId.
 * This is typically used for enabling, disabling, or suspending user accounts.
 * 
 * Functionality:
 *   - Receives updated status details from the request body.
 *   - Finds the user by loginId and updates their status field(s).
 *   - Returns a success or error response.
 * 
 * HTTP Method: PUT  
 * Route: '/user/status'
 * 
 * Request Parameters:
 *   - Query: loginId (string) → The user's unique identifier.
 *   - Body: { status: string | boolean } → The new status value to set.
 * 
 * Response:
 *   - { status: true }  
 *       → When the user status is updated successfully.
 *   - { status: false, message: err }  
 *       → When an error occurs during update.
 * 
 * Logging:
 *   - Info: Logs successful status update.
 *   - Error: Logs error details if update fails.
 * 
 * Dependencies:
 *   - User (Mongoose model)
 *   - logger (for structured logging)
 * 
 * Last Modified: 24 October 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
exports.updateUserStatusById = async (req, res) => {
    try {
    const { status } = req.body;

    if (status === undefined) {
      return res.status(400).json({
        status: false,
        message: 'Status value is required'
      });
    }

    const result = await User.findOneAndUpdate(
      { loginId: req.query.loginId },
      { $set: { status: status } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    logger.info('User status updated successfully');

    res.status(200).json({
      status: true,
      message: 'User status updated successfully'
    });

  } catch (err) {
    logger.error('Error updating user status', { error: err });

    res.status(500).json({
      status: false,
      message: 'Server error while updating user status'
    });
  }

}
