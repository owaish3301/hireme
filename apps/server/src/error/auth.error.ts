import { errors } from "./constants.js";
import AppError, { type Options } from "./error.js";

export class AuthError extends AppError {
  constructor(
    msg: string,
    options: Options = {
      isOperational: true,
      statusCode: 400,
      code: errors.AUTHENTICATION_ERROR,
    },
  ) {
    super(msg, options);
  }
}