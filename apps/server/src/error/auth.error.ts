import { errors } from "./constants.js";
import AppError, { type Options } from "./error.js";

export class AuthError extends AppError {
  constructor(
    msg: string,
    options: Options,
  ) {
    super(msg, {
      isOperational:options.isOperational ?? true,
      statusCode:options.statusCode ?? 401,
      code : options.code ?? errors.AUTHENTICATION_ERROR,
    });
  }
}

export class UnauthenticatedError extends AuthError {
  constructor(msg: string="login required") {
    super(msg, {
      code: errors.AUTHENTICATION_ERROR,
      statusCode: 401,
      isOperational: true,
    });
  }
}
