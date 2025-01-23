import { __dirname } from "../utils.js";

export const opts = {
  definition: {
    openapi: "3.1.1",
    info: {
      title: "Habit Builder",
      description:
        "Documentation for the Habit Builder app. Link to github repository https://github.com/brando1607/habitBuilder",
    },
  },
  apis: [`${__dirname}/docs/*.yaml`],
};
