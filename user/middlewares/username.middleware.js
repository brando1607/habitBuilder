import { verifyToken } from "../utils/jwt.js";
import { CustomError } from "../utils/errors/customErrors.js";
import { errors } from "../utils/errors/errors.js";

export function checkUsernameInUrl() {
  return async (req, res, next) => {
    try {
      let username = req.params.username;

      const token = verifyToken(req.cookies.token);
      if (username !== token.login) {
        return CustomError.newError(errors.auth.unauthorized);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
