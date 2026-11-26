import { errors } from "./constants.js";
import AppError from "./error.js";

export default class ServerError extends AppError {
  constructor(msg: string) {
    super(msg, {
      code: errors.INTERNAL_SERVER_ERROR,
      statusCode: 500,
      isOperational: false,
    });
  }
}
