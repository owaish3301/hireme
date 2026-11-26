import { errors } from "./constants.js";
import AppError from "./error.js";

export class ConfigError extends AppError {
  constructor(msg: string) {
    super(msg, {
      code: errors.CONFIG_ERROR,
      isOperational: false,
    });
  }
}
