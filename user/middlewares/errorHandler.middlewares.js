import { errors } from "../utils/errors/errors.js";

export function errorHandler(error, req, res, next) {
  console.log(error);
  const { fatal } = errors;
  return res
    .status(error.statusCode || fatal.statusCode)
    .json({ message: error.message || fatal.message });
}
