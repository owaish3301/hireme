import { errors } from "./constants.js";
import AppError from "./error.js";

export class NotFoundError extends AppError {
  constructor(msg: string) {
    super(msg, {
      code: errors.NOT_FOUND,
      isOperational: true,
      statusCode: 404,
    });
  }
}
