const schedule = require("node-schedule");
const notificationService = require('../services/notification.service')
const logger = require('../logger');

module.exports = function (io) {

  const dataFetchRule = '0,30 * * * *'; // Run every 1 hours
  const emailSendRule = '0 10 * * *'; // Run every day at 10:00 AM
  
  /**
   * Schedule a job to fetch component data every hour at minutes 0 and 30
   * and emit notifications via Socket.IO if there are components to notify.
   * 
   * Last Modified: 25 October 2025
   * Modified By: Raza A [AS-127]
   */
  schedule.scheduleJob(dataFetchRule, async () => {
      try {
          const filteredComponents = await notificationService.getFilteredComponents();
          if (filteredComponents.length > 0) {
              logger.debug('Data fetched successfully')
              io.emit('notification', filteredComponents);
          } else {
              logger.debug('No Components need Notification')
          }
      } catch (error) {
          logger.error('Error in fetching data', {error})
      }
  });
  
  /**
   * Schedule a job to run every day at 10:00 AM to check for components
   * that need notification and send email alerts if required.
   * 
   * Last Modified: 25 October 2025
   * Modified By: Raza A [AS-127]
   */
  schedule.scheduleJob(emailSendRule, async () => {
      try {
          const filteredComponents = await notificationService.getFilteredComponents();
          if (filteredComponents.length > 0) {
              await notificationService.sendEmailNotification(filteredComponents);
              logger.info('Email sent successfully')
          } else {
              logger.warn('No components need notification.')
          }
      } catch (error) {
          logger.error('Error Sending email', {error})
      }
  });
}

