import { UserController } from "./user.controller.js";
import { HabitsController } from "./habits.controller.js";
import { BadgesAndLevelsController } from "./badges_levels.controller.js";
import { MessagesController } from "./messages.controller.js";

export class IndexController {
  static userController = UserController;
  static habitsController = HabitsController;
  static badgesAndLevelsController = BadgesAndLevelsController;
  static messagesController = MessagesController;
}
