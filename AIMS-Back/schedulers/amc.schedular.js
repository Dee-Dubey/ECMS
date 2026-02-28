const schedule = require("node-schedule");
const AMC = require('../app/models/amc/amc.model');
const logger = require('../logger');

module.exports = function () {
  const amcExpiryRule = "40 12 * * *"; // 11:00 AM every day



  schedule.scheduleJob(amcExpiryRule, async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      logger.info("Running AMC Expiry check...");

      const expiringAMCs = await AMC.find({
        status: "Active",
        endDate: { $lte: today }
      });

      if (expiringAMCs.length === 0) {
        logger.info("No AMC Records need expiry update.");
        return;
      }

      const result = await AMC.updateMany(
        { status: "Active", endDate: { $lte: today } },
        { $set: { status: "Expired" } }
      );

      logger.info(`AMC Expiry job completed. Updated ${result.modifiedCount}`);

    } catch (error) {
      logger.error("Error in AMC expiry scheduler", { error });
    }
  });
}

