import AppError from "../utils/errors.js";

const routeNotFound = (req, res, next) => {
  next(AppError.fromCode("ROUTE_NOT_FOUND"));
};

export default routeNotFound;
