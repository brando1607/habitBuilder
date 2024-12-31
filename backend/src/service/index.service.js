import { UserService } from "./user.service.js";
import { ProfileService } from "./profile.service.js";
import { HabitService } from "./habits.service.js";
import { MessagesService } from "./messages.service.js";
import { BadgesAndLevelsService } from "./badges_levels.service.js";

export class ServiceIndex {
  constructor({ DaoIndex }) {
    this.userService = new UserService({ DaoIndex });
    this.profileService = new ProfileService({ DaoIndex });
    this.habitService = new HabitService({ DaoIndex });
    this.messagesService = new MessagesService({ DaoIndex });
    this.badgesAndLevelsService = new BadgesAndLevelsService({ DaoIndex });
  }
}
