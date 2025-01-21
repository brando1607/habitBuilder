import { pool } from "../utils/pool.config.js";
import { errors } from "../utils/errors/errors.js";
import { CustomError } from "../utils/errors/customErrors.js";

export function userExists() {
  return async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
      const username = req.params.username
        ? req.params.username
        : req.params.receiver;

      console.log(username, "usename");
      console.log(req.params.username, "username 2");

      const [getUser] = await connection.query(
        `SELECT id FROM user WHERE username = ?;`,
        [username]
      );

      console.log(getUser, "query");

      if (getUser.length === 0) {
        return CustomError.newError(errors.notFound.userNotFound);
      }

      next();
    } catch (error) {
      next(error);
    } finally {
      connection.release();
    }
  };
}
