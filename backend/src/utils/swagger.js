import { __dirname } from "./utils.js";

export const opts = {
  definition: {
    openapi: "3.1.1",
    info: {
      title: "Habit Builder",
      version: "1.0.0",
      description: "Habit builder's documentation",
    },
  },
  apis: [`${__dirname}/docs/index.yaml`],
};
