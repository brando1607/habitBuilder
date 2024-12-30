import { UserController } from "./user.controller.js";
import { HabitsController } from "./habits.controller.js";
import { BadgesAndLevelsController } from "./badges_levels.controller.js";
import { MessagesController } from "./messages.controller.js";
import { ProfileController } from "./profile.controller.js";

export class IndexController {
  constructor({ DaoIndex }) {
    this.userController = new UserController({ DaoIndex });
    this.habitsController = new HabitsController({ DaoIndex });
    this.badgesAndLevelsController = new BadgesAndLevelsController({
      DaoIndex,
    });
    this.messagesController = new MessagesController({ DaoIndex });
    this.profileController = new ProfileController({ DaoIndex });
  }
}
