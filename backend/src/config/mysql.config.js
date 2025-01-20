process.loadEnvFile();
export const config = {
  host: process.env.MYSQL_DATABASE,
  user: process.env.MYSQLUSER,
  port: process.env.MYSQLPORT,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};
