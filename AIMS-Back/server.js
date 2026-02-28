const express = require('express');
const app = express();
const http = require('http')
const socket = require('socket.io');
const schedule = require('node-schedule');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')
const cors = require('cors');
const port = process.env.PORT || 3010;
const config = require('./config.json');
const version = require('./version');
const multer = require('multer');
const xlsx = require('node-xlsx');
const fs = require('fs');
const archiver = require('archiver');
const logger = require('./logger')
const uploadsDir = path.join(__dirname, 'uploads');
const costUploadsDir = path.join(__dirname, 'costUploads');
const logsDir = path.join(__dirname, 'logs')

/**
 * Check if a directory exists, and create it if it doesn't.
 * 
 * This function ensures that the specified directory path exists. 
 * If the directory does not exist, it creates it recursively.
 * Logs are recorded for both creation and existing directory scenarios.
 * 
 * @param {string} directoryPath - The full path of the directory to check or create
 * 
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
 */
function checkAndCreateUploadsDir(directoryPath){
    if(!fs.existsSync(directoryPath) ){
        fs.mkdirSync(directoryPath, {recursive: true});
        logger.info(`Directory created: ${directoryPath}`)
        console.log(`Directory Created: ${directoryPath}`)
    } else {
        logger.info(`Directory already exists: ${directoryPath}`);
        console.log(`Directory already exists: ${directoryPath}`)
    }
}

checkAndCreateUploadsDir(uploadsDir)
checkAndCreateUploadsDir(costUploadsDir)
checkAndCreateUploadsDir(logsDir)

/**
 * Initiate connection to MongoDB database.
 * 
 * Connects to the MongoDB instance running at 'mongodb://127.0.0.1:27017/Acevin-IMS'.
 * Logs a message on successful connection or an error if the connection fails.
 * 
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
 */ 
mongoose.connect('mongodb://127.0.0.1:27017/Acevin-IMS-NEW').then(() => {
    console.log('MongoDB Database Acevin-IMS is connected');
    logger.info('MongoDB Database Acevin-IMS is connected')
}).catch((error) => {
    logger.error('Unable to connect to MongoDB Database Acevin-IMS', {error})
    console.log('Unable to connect to MongoDB Database Acevin-IMS');

});


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

// Using morgan
app.use(morgan('dev'));

require('./app/routes/user.router')(app);
require('./app/routes/hardware-department.router')(app);
require('./app/routes/it-department.router')(app);
require('./app/routes/bom.router')(app);
require('./app/routes/amc.router')(app);
require('./app/routes/consumable.router')(app);
require('./app/routes/company.router')(app);

/**
 * Serve static files from the "public" directory.
 * 
 * Any requests to the root URL ('/') will serve files located in './public'.
 * This is useful for serving HTML, CSS, JS, images, and other static assets.
 * 
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
 */
app.use('/', express.static(path.join(__dirname, './public')));

/**
 * GET /
 * 
 * Default route for the application.
 * Sends the 'index.html' file from the 'public' directory as the response.
 * This serves as the main entry point for the frontend.
 * 
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


/**
 * GET /app-version
 * 
 * Returns the current backend application version.
 * Responds with JSON: { appVersion: <version> }.
 * If version is not defined, returns "--".
 * 
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
 */
app.get('/app-version', (req,res)=>{
    try {
      let appVersion = (version?.backend !== null && version?.backend !== undefined) ? version.backend : "--";  
      res.status(200).json({appVersion: appVersion});
    } catch (error) {
        res.status(503);
    }
});

/**
 * Catch-all route
 * 
 * Sends the 'index.html' file for any route that does not match existing API endpoints.
 * Useful for client-side routing in single-page applications (SPA).
 * 
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
 */
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

/**
 * Start Express server
 * 
 * Initializes the server to listen on the specified port and logs a message
 * when the server is successfully running.
 * 
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
 */
const server = app.listen(port, () => {
    console.log(`Server is started and listening on port: ${port}`);
});

/**
 * Initialize Socket.IO on the server
 * 
 * Attaches Socket.IO to the existing Express server and enables CORS
 * so that clients from any origin can connect.
 * 
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127]
 */


const initSockets = require('./sockets/notification.socket');
const io = initSockets(server);

require('./schedulers/notification.scheduler')(io);
require('./schedulers/amc.schedular')()


// Old default user option.
// {
//     "defaultUser": {
//         "employeeCode": "AS-Master",
//         "firstName": "Acevin Master",
//         "loginId": "AcevinMaster",
//         "password": "@cevin2024",
//         "organizationEmail": "",
//         "rights": {
//             "hrDepartment": {
//                 "user": {
//                     "manage": 1
//                 }
//             },
//             "ITDepartment": {
//                 "ITInventory": {
//                     "view": 1,
//                     "manage": 1,
//                     "issue": 1,
//                     "return": 1
//                 }
//             },
//             "hardwareDepartment": {
//                 "electronicDevice": {
//                     "view": 1,
//                     "manage": 1,
//                     "issue": 1,
//                     "return": 1,
//                     "BOM": 1
//                 },
//                 "testingEquipment": {
//                     "view": 1,
//                     "manage": 1,
//                     "issue": 1,
//                     "return": 1,
//                     "BOM": 1
//                 }
//             },
//             "adminDepartment": {
//                 "consumableAsset": {
//                     "view": 1,
//                     "manage": 1,
//                     "issue": 1,
//                     "return": 1
//                 },
//                 "fixedAsset": {
//                     "view": 1,
//                     "manage": 1,
//                     "issue": 1,
//                     "return": 1
//                 }
//             }
//         },
//         "status": 1,
//         "userType": "0"
//     },
//     "key": "Acevin-inventory"
// }