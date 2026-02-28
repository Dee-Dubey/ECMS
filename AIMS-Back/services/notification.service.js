const Component = require('../app/models/hardware-department/electronic-component/electronic-component.model');
const nodemailer = require('nodemailer');
const logger = require('../logger')

/**
 * ---------------------------------------------------------------------
 * Function: getFilteredComponents
 * 
 * Description:
 * Fetches all components from the database and filters their stock details
 * based on a notification threshold. Specifically, it returns stock entries
 * where the current quantity is less than or equal to the configured 
 * notification quantity.
 * 
 * Behavior:
 * - Populates the 'projectName' field from the 'stockDetails' subdocuments.
 * - Filters stockDetails for each component where:
 *       stockDetail.quantity <= stockDetail.notificationQuantity
 * - Logs the number of filtered stock details at debug level.
 * - Returns an array of objects containing:
 *       - manufacturerPartNumber
 *       - projectName (populated name)
 *       - quantity
 *       - notificationQuantity
 * - Logs info on successful retrieval and error on failure.
 * 
 * Returns:
 * - Array of filtered component stock objects if successful
 * - Empty array on error
 * 
 * Dependencies:
 * - Component model (mongoose)
 * - logger (winston)
 * ---------------------------------------------------------------------
 */
async function getFilteredComponents() {
    try {
        const components = await Component.find().populate('stockDetails.projectName');

        const filteredComponents = components.reduce((acc, component) => {

            const filteredStockDetails = component.stockDetails.filter(stockDetail => {
                return stockDetail.quantity <= stockDetail.notificationQuantity
            })


            if (filteredStockDetails.length > 0) {
                console.log('filtered stock detail', filteredStockDetails.length)
                logger.debug('Filtered stock detail', { count: filteredStockDetails.length })
                filteredStockDetails.forEach(stockDetail => {
                    // console.log('stock detail', stockDetail)
                    const filteredComponents = {
                        manufacturerPartNumber: component.manufacturerPartNumber,
                        projectName: stockDetail.projectName.name, // Assuming 'projectName' is an object with 'name' field
                        quantity: stockDetail.quantity,
                        notificationQuantity: stockDetail.notificationQuantity
                    }

                    acc.push(filteredComponents);
                })
            }

            return acc;

        }, [])


        // console.log('Filtered components', filteredComponents);
        // console.log('Number of filtered components', filteredComponents.length);
        logger.info('Filtered components retrived sucessfully', { count: filteredComponents.length })
        return filteredComponents;




    } catch (err) {
        logger.error('Error in fetching component', { error: err })
        console.log('Error fetching components:', err);
        return [];
    }
}



/**
 * ---------------------------------------------------------------------
 * Function: sendEmailNotification
 * 
 * Description:
 * Sends an email notification containing a table of filtered components
 * whose stock levels are below or equal to their notification threshold.
 * 
 * Behavior:
 * - Generates an HTML table with the following columns:
 *       - Manufacturer Part No.
 *       - Quantity
 *       - Notification Quantity
 *       - Project Name
 * - Uses nodemailer to send the email via Gmail service.
 * - Logs the generated table in debug mode.
 * - Logs info on successful email sending and errors if any.
 * 
 * Parameters:
 * - filteredComponents: Array of objects containing
 *       manufacturerPartNumber, quantity, notificationQuantity, projectName
 * 
 * Notes:
 * - Ensure the email account credentials are correct and secure.
 * - You can customize the recipient list and email content as needed.
 * ---------------------------------------------------------------------
 */
async function sendEmailNotification(filteredComponents) {
    try {
        // Create HTML for the table
        let tableHtml = `<table border="1"><tr><th>Manufacturer Part No.</th><th>Quantity</th><th>Notification Quantity</th><th>Project Name</th></tr>`;

        filteredComponents.forEach(component => {
            console.log('filtered component', component)
            tableHtml += `<tr><td>${component.manufacturerPartNumber}</td><td>${component.quantity}</td><td>${component.notificationQuantity}</td><td>${component.projectName}</td></tr>`;
        });

        tableHtml += '</table>';
        console.log('Table', tableHtml);
        logger.debug('Generate HTML table for email', { tableHtml })

        // Example code to send email (uncomment and adjust as needed)

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'acevininventory@gmail.com',
                pass: 'bvbc soas bznt airq'
            }
        });

        let mailOptions = {
            from: 'acevininventory@gmail.com',
            to: 'shalinis@acevin.com',
            subject: 'Stock Notification',
            html: `<p>Dear Receiver,</p><p>Your stock is running low. Please take action.</p><p>Regards,<br>Your Company</p><br>${tableHtml}`
        };

        transporter.sendMail(mailOptions, (err, res) => {
            if (err) {
                console.log('Error sending email:', err);
                logger.error('Error sending email', { error: err })
            } else {
                console.log('Email sent successfully:', res.response);
                logger.info('Email sent successfully:', { response: res.response })
            }
        });

    } catch (err) {
        logger.error('Error Sending email notification', { error: err })
        console.log('Error sending email notification:', err);
    }
}



/* ---------------------------------------------------------------------
 * Module Exports
 *
 * Description:
 * Exposes selected controller/utility methods from this file so they can
 * be imported and used in route handlers or other modules across the
 * application.
 *
 * Exported Methods:
 *  - getFilteredComponents
 *      Function responsible for retrieving component data based on
 *      applied filters or criteria.
 *
 *  - sendEmailNotification
 *      Utility responsible for sending email alerts/notifications
 *      based on defined triggers or business logic.
 *
 * Notes:
 * - Only these two methods are exposed publicly; all other internal/helper
 *   functions inside the file remain private.
 * - Helps maintain modular code structure and separation of concerns.
 *
 * Last Modified: 06 December 2025
 * Modified By: Raza A [AS-127]
 * ---------------------------------------------------------------------
 */
module.exports = {
    getFilteredComponents,
    sendEmailNotification
};
