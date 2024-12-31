import { generateToken } from "../utils/jwt.js";
import { errors } from "../utils/errors/errors.js";
import { CustomError } from "../utils/errors/customErrors.js";

export class UserService {
  constructor({ DaoIndex }) {
    this.daoIndex = DaoIndex;
  }
  createUser = async ({ user }) => {
    try {
      let result = await this.daoIndex.userDao.createUser({ user });
      return result;
    } catch (error) {
      throw error;
    }
  };
  logIn = async ({ user, token }) => {
    try {
      if (token) {
        return CustomError.newError(errors.conflict.user);
      }

      let result = await this.daoIndex.userDao.logIn({ user });

      if (result) {
        const payload = {
          login: result.username,
        };

        const token = generateToken(payload);

        return token;
      } else {
        return CustomError.newError(errors.auth.unauthorized);
      }
    } catch (error) {
      throw error;
    }
  };
  changePassword = async ({ password }) => {
    try {
      let result = await this.daoIndex.userDao.changePassword({ password });
      return result;
    } catch (error) {
      throw error;
    }
  };
  changeLogin = async ({ username, input }) => {
    try {
      let result = await this.daoIndex.userDao.changeLogin({ username, input });
      return result;
    } catch (error) {
      throw error;
    }
  };
  sendTemporaryPassword = async ({ input }) => {
    try {
      let result = await this.daoIndex.userDao.sendTemporaryPassword({ input });
      return result;
    } catch (error) {
      throw error;
    }
  };
}
