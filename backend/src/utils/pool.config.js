import { createPool } from "mysql2/promise";
import { config } from "../config/mysql.config.js";
export const pool = createPool(config);

export async function dbConnection() {
  try {
    await pool.query(`SELECT 1;`);
    console.log(`Mysql database connected.`);
  } catch (error) {
    console.error("Failed to connect to MySQL database.");
  }
}
