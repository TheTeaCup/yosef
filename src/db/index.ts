import mysql from "mysql2/promise";
import { config } from "../config.js";

export const db = await mysql.createPool({
  host: config.MYSQL_HOST,
  user: config.MYSQL_USERNAME,
  password: config.MYSQL_PASSWORD,
  database: config.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
});