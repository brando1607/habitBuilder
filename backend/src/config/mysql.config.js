import dotenv from "dotenv";
dotenv.config();

export const config = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  port: process.env.MYSQLPORT,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};
