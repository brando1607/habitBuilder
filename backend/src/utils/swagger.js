import { __dirname } from "./utils.js";

export const opts = {
  definition: {
    openapi: "3.1.1",
    info: {
      title: "Habit Builder",
      description: "Habit builder's documentation",
    },
  },
  apis: [`${__dirname}/docs/*.yaml`],
};
