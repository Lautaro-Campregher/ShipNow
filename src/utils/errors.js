export const ErrorDictionary = Object.freeze({
  USER_NOT_FOUND: {
    statusCode: 404,
    message: "Usuario no encontrado",
    code: "USER_NOT_FOUND",
  },
  ORDER_NOT_FOUND: {
    statusCode: 404,
    message: "Pedido no encontrado",
    code: "ORDER_NOT_FOUND",
  },
  DELIVERY_NOT_FOUND: {
    statusCode: 404,
    message: "Entrega no encontrada",
    code: "DELIVERY_NOT_FOUND",
  },
  DELIVERY_ORDER_NOT_FOUND: {
    statusCode: 400,
    message: "El pedido especificado no existe",
    code: "DELIVERY_ORDER_NOT_FOUND",
  },

  DELIVERY_DRIVER_INVALID: {
    statusCode: 400,
    message: "El repartidor especificado no existe o no tiene el rol correcto",
    code: "DELIVERY_DRIVER_INVALID",
  },
  ROUTE_NOT_FOUND: {
    statusCode: 404,
    message: "Ruta no encontrada",
    code: "ROUTE_NOT_FOUND",
  },
  VALIDATION_ERROR: {
    statusCode: 400,
    message: "Los datos enviados no son válidos",
    code: "VALIDATION_ERROR",
  },
  INVALID_JSON: {
    statusCode: 400,
    message: "El JSON enviado no es válido",
    code: "INVALID_JSON",
  },
  INVALID_ID: {
    statusCode: 400,
    message: "El ID proporcionado no es válido",
    code: "INVALID_ID",
  },
  INVALID_MOCK_QUANTITY: {
    statusCode: 400,
    message: "La cantidad solicitada para los mocks no es válida",
    code: "INVALID_MOCK_QUANTITY",
  },
  RESOURCE_CONFLICT: {
    statusCode: 409,
    message: "El recurso ya existe o presenta un conflicto",
    code: "RESOURCE_CONFLICT",
  },
  DATABASE_ERROR: {
    statusCode: 500,
    message: "Error al acceder a la base de datos",
    code: "DATABASE_ERROR",
  },
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    message: "Error interno del servidor",
    code: "INTERNAL_SERVER_ERROR",
  },
  ORDER_CUSTOMER_NOT_FOUND: {
    statusCode: 400,
    message: "El cliente especificado no existe",
    code: "ORDER_CUSTOMER_NOT_FOUND",
  },
  ORDER_ITEMS_REQUIRED: {
    statusCode: 400,
    message: "El pedido debe tener al menos un item",
    code: "ORDER_ITEMS_REQUIRED",
  },
  USER_ADMIN_CREATION_FORBIDDEN: {
    statusCode: 400,
    message: "No es posible crear admins desde este endpoint",
    code: "USER_ADMIN_CREATION_FORBIDDEN",
  },
  USER_ADMIN_ROLE_ASSIGNMENT_FORBIDDEN: {
    statusCode: 400,
    message: "No es posible asignar el rol admin desde este endpoint",
    code: "USER_ADMIN_ROLE_ASSIGNMENT_FORBIDDEN",
  },
  USER_EMAIL_ALREADY_EXISTS: {
    statusCode: 409,
    message: "Este email ya se encuentra registrado",
    code: "USER_EMAIL_ALREADY_EXISTS",
  },
});

class AppError extends Error {
  constructor(
    messageOrOptions,
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
  ) {
    const options =
      typeof messageOrOptions === "object" && messageOrOptions !== null
        ? messageOrOptions
        : { message: messageOrOptions, statusCode, code };

    super(options.message);

    this.name = "AppError";
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? "INTERNAL_SERVER_ERROR";
  }

  static fromCode(code) {
    const error =
      ErrorDictionary[code] ?? ErrorDictionary.INTERNAL_SERVER_ERROR;

    return new AppError(error);
  }
}

export default AppError;
