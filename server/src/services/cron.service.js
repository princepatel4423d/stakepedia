import cron from "node-cron";
import AuditLog  from "../models/AuditLog.model.js";
import EmailLog  from "../models/EmailLog.model.js";
import User      from "../models/User.model.js";

export const startCronJobs = () => {
  // Clean up unverified users older than 7 days — runs daily at 2am
  cron.schedule("0 2 * * *", async () => {
    try {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const result = await User.deleteMany({
        isEmailVerified: false,
        authProvider: "local",
        createdAt: { $lt: cutoff },
      });
      if (result.deletedCount > 0)
        console.log(`🧹 Cleaned ${result.deletedCount} unverified users`);
    } catch (err) {
      console.error("Cron cleanup error:", err.message);
    }
  });

  // Clean email logs older than 30 days — runs every Sunday at 3am
  cron.schedule("0 3 * * 0", async () => {
    try {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await EmailLog.deleteMany({ createdAt: { $lt: cutoff } });
      if (result.deletedCount > 0)
        console.log(`Cleaned ${result.deletedCount} old email logs`);
    } catch (err) {
      console.error("Cron email log cleanup error:", err.message);
    }
  });

  console.log("Cron jobs started");
};