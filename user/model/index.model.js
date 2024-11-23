import { UserModel } from "./user.model.js";
import { HabitsModel } from "./habits.model.js";
import { BadgesAndLevelsModel } from "./ badges_levels.model.js";
import { pool } from "../config/pool.config.js";

const userModel = new UserModel(pool);
const habitsModel = new HabitsModel(pool);
const badgesAndLevelsModel = new BadgesAndLevelsModel(pool);

export class ModelsIndex {
  static userModel = userModel;
  static habitsModel = habitsModel;
  static badgesAndLevelsModel = badgesAndLevelsModel;
}
