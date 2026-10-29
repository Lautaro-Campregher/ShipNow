import AppError, { ErrorDictionary } from "../utils/errors.js";
import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  if (err.name === "CastError") {
    err = new AppError(ErrorDictionary.INVALID_ID);
  } else if (
    err.type === "entity.parse.failed" ||
    (err instanceof SyntaxError && err.status === 400 && "body" in err)
  ) {
    err = new AppError(ErrorDictionary.INVALID_JSON);
  } else if (err.name === "ValidationError") {
    err = new AppError(ErrorDictionary.VALIDATION_ERROR);
  } else if (err.code === 11000) {
    err = new AppError(ErrorDictionary.RESOURCE_CONFLICT);
  } else if (
    err.name === "MongoServerError" ||
    err.name === "MongooseServerSelectionError" ||
    err.name === "MongoNetworkError" ||
    err.name === "MongoNetworkTimeoutError"
  ) {
    err = new AppError(ErrorDictionary.DATABASE_ERROR);
  }

  const isAppError = err instanceof AppError;
  const definition = isAppError ? err : ErrorDictionary.INTERNAL_SERVER_ERROR;

  const logMessage =
    `${req.method} ${req.originalUrl} - ${definition.code}: ` +
    `${isAppError ? definition.message : err.message}`;

  if (definition.statusCode >= 500) {
    logger.error(logMessage);
  } else {
    logger.warning(logMessage);
  }

  res.status(definition.statusCode).json({
    status: "error",
    message: definition.message,
    code: definition.code,
  });
};

export default errorHandler;
