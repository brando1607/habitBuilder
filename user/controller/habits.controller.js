import { ModelsIndex } from "../model/index.model.js";
import { verifyToken } from "../utils/jwt.js";
import { CustomError } from "../utils/errors/customErrors.js";
import { errors } from "../utils/errors/errors.js";

export class HabitsController {
  static async addHabit(req, res, next) {
    let username = req.params.username;
    let input = req.body;
    try {
      const token = verifyToken(req.cookies.token);
      if (username !== token.login) {
        return CustomError.newError(errors.auth.unauthorized);
      }

      let result = await ModelsIndex.habitsModel.addHabit({ input, username });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async completeHabit(req, res, next) {
    let username = req.params.username;
    let input = req.body;

    const token = verifyToken(req.cookies.token);
    if (username !== token.login) {
      return CustomError.newError(errors.auth.unauthorized);
    }
    try {
      let result = await ModelsIndex.habitsModel.completeHabit({
        username,
        input,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async deleteHabit(req, res, next) {
    let input = req.body;
    let username = req.params.username;

    const token = verifyToken(req.cookies.token);
    if (username !== token.login) {
      return CustomError.newError(errors.auth.unauthorized);
    }

    try {
      let result = await ModelsIndex.habitsModel.deleteHabit({
        input,
        username,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
