import { ModelsIndex } from "../model/index.model.js";

export class HabitsController {
  static async addHabit(req, res, next) {
    let username = req.params.username;
    let input = req.body;
    try {
      let result = await ModelsIndex.habitsModel.addHabit({ input, username });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async completeHabit(req, res, next) {
    let username = req.params.username;
    let input = req.body;

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
