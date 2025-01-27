import cron from "node-cron";
import { pool } from "./pool.config.js";

export function midnightCheck() {
  cron.schedule("0 0 * * *", async () => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(`    
      UPDATE daily_habit_status
      SET status = 'IN PROGRESS'
      WHERE deadline = CURRENT_DATE
      AND status = 'SCHEDULED';
  `);

      await connection.commit();

      await connection.beginTransaction();

      await connection.query(`
      UPDATE daily_habit_status
      SET status = 'NOT COMPLETED'
      WHERE deadline = (SELECT DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
      AND status = 'IN PROGRESS';
  `);

      await connection.commit();

      await connection.beginTransaction();

      await connection.query(`    
      UPDATE habit_completion hc
      JOIN daily_habit_status hs ON hc.habit_id = hs.habit_id
      SET hc.times_not_completed = hc.times_not_completed + 1
      WHERE hs.deadline = CURRENT_DATE - INTERVAL 1 DAY
      AND hs.status = 'NOT COMPLETED';
  `);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });
}
