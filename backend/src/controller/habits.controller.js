import { ServiceIndex } from "../service/index.service.js";

export class HabitsController {
  constructor({ DaoIndex }) {
    this.serviceIndex = new ServiceIndex({ DaoIndex });
  }
  addHabit = async (req, res, next) => {
    let username = req.params.username;
    let input = req.body;
    try {
      let result = await this.serviceIndex.habitService.addHabit({
        input,
        username,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  completeHabit = async (req, res, next) => {
    let username = req.params.username;
    let input = req.body;

    try {
      let result = await this.serviceIndex.habitService.completeHabit({
        username,
        input,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  deleteHabit = async (req, res, next) => {
    let input = req.body;
    let username = req.params.username;

    try {
      let result = await this.serviceIndex.habitService.delete({
        input,
        username,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
}
