# ShipNow API

API de ShipNow desarrollada con Node.js, Express y MongoDB. El proyecto utiliza una arquitectura por capas para separar las rutas, los controladores, la lógica de negocio y el acceso a datos. Incluye un sistema de mocking para generar datos ficticios y un mecanismo de seed para insertar registros de prueba en MongoDB.

## Requisitos

- Node.js 18 o superior.
- MongoDB local o una instancia accesible mediante una URI válida.
- npm.

## Instalación y configuración

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/Lautaro-Campregher/ShipNow.git
   cd ShipNow
   ```

2. Instalar las dependencias:

   ```bash
   npm install
   ```

3. Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`:

   ```env
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/ShipNow
   NODE_ENV=development
   ```

   Ajustar los valores según el entorno utilizado. El archivo `.env` contiene configuración local y no debe subirse al repositorio.

4. Iniciar el servidor en modo desarrollo:

   ```bash
   npm run dev
   ```

   Para ejecutar la aplicación en producción:

   ```bash
   npm start
   ```

La aplicación valida las variables de entorno necesarias al iniciar. Si falta una variable obligatoria o su configuración es inválida, el servidor informa el error correspondiente.

## Arquitectura del proyecto

El proyecto organiza sus responsabilidades en las siguientes capas:

- **Routes:** definen los endpoints y delegan las solicitudes a los controladores.
- **Controllers:** reciben las solicitudes HTTP, invocan los servicios y construyen las respuestas.
- **Services:** contienen la lógica de negocio, las validaciones y la coordinación de operaciones.
- **Repositories:** encapsulan las operaciones de acceso a datos mediante Mongoose.
- **Models:** definen los esquemas y las validaciones de los documentos de MongoDB.
- **Config:** centraliza la configuración y la validación de variables de entorno.
- **Utils:** contiene constantes y utilidades compartidas.

El flujo principal de dependencias es:

```text
Routes → Controller → Service → Repository → Model/MongoDB
```

El módulo de mocking utiliza servicios para generar datos simulados sin persistirlos. El módulo de seed coordina los repositorios para insertar usuarios, pedidos y entregas manteniendo sus relaciones.

Los errores que se producen durante el procesamiento se propagan hacia el middleware centralizado de manejo de errores.

## Estructura del proyecto

```text
ShipNow/
├── src/
│   ├── config/
│   │   └── index.js
│   ├── controllers/
│   │   ├── deliveries.controller.js
│   │   ├── mocks.controller.js
│   │   ├── orders.controller.js
│   │   └── user.controller.js
│   ├── middlewares/
│   │   ├── errorHandler.js
│   │   └── routeNotFoundHandler.js
│   ├── models/
│   │   ├── delivery.model.js
│   │   ├── order.model.js
│   │   └── user.model.js
│   ├── repositories/
│   │   ├── delivery.repository.js
│   │   ├── order.repository.js
│   │   ├── user.mock.repository.js
│   │   └── user.repository.js
│   ├── routes/
│   │   ├── deliveries.js
│   │   ├── mocks.router.js
│   │   ├── orders.js
│   │   └── users.js
│   ├── services/
│   │   ├── deliveries.service.js
│   │   ├── mocks.service.js
│   │   ├── orders.service.js
│   │   ├── seed.service.js
│   │   └── user.service.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── errors.js
│   │   └── user.service.js
│   │
│   └── server.js
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

### Descripción de las carpetas

- **`config/`**: configuración de la aplicación y variables de entorno.
- **`controllers/`**: controladores HTTP de usuarios, pedidos, entregas y mocking.
- **`models/`**: esquemas de Mongoose para usuarios, pedidos y entregas.
- **`repositories/`**: acceso a MongoDB y operaciones de persistencia.
- **`routes/`**: definición de los endpoints de la API.
- **`services/`**: lógica de negocio, generación de datos simulados y carga de registros de prueba.
- **`utils/`**: constantes compartidas, manejo de errores y utilidades del servidor.
- **`server.js`**: punto de entrada de la aplicación.

### Entidades principales

- **User:** representa a los usuarios del sistema. Los roles contemplados incluyen `admin`, `customer`, `driver` y `store`.
- **Order:** representa un pedido, con cliente, artículos, dirección de entrega, importes, estado, prioridad y referencia a la entrega asociada.
- **Delivery:** representa una entrega asociada a un pedido y, cuando corresponde, a un usuario con rol `driver`.

Los roles, estados y prioridades se centralizan en `src/utils/constants.js` para evitar valores inconsistentes.

## Endpoints de la API

La URL base de desarrollo es `http://localhost:8080`.

### Health check y usuarios

| Método | Ruta             | Descripción                   |
| ------ | ---------------- | ----------------------------- |
| GET    | `/api/health`    | Verificar el estado de la API |
| GET    | `/api/users`     | Listar usuarios               |
| GET    | `/api/users/:id` | Obtener un usuario            |
| POST   | `/api/users`     | Crear un usuario              |
| PUT    | `/api/users/:id` | Actualizar un usuario         |
| DELETE | `/api/users/:id` | Eliminar un usuario           |

### Pedidos

| Método | Ruta              | Descripción          |
| ------ | ----------------- | -------------------- |
| GET    | `/api/orders`     | Listar pedidos       |
| GET    | `/api/orders/:id` | Obtener un pedido    |
| POST   | `/api/orders`     | Crear un pedido      |
| PUT    | `/api/orders/:id` | Actualizar un pedido |
| DELETE | `/api/orders/:id` | Eliminar un pedido   |

### Entregas

| Método | Ruta                  | Descripción            |
| ------ | --------------------- | ---------------------- |
| GET    | `/api/deliveries`     | Listar entregas        |
| GET    | `/api/deliveries/:id` | Obtener una entrega    |
| POST   | `/api/deliveries`     | Crear una entrega      |
| PUT    | `/api/deliveries/:id` | Actualizar una entrega |
| DELETE | `/api/deliveries/:id` | Eliminar una entrega   |

Las operaciones de creación y actualización deben respetar los campos definidos por los modelos y las relaciones entre las entidades.

# Manejo profesional de errores

La API implementa un sistema centralizado de manejo de errores para mantener respuestas consistentes y separar la lógica de negocio del tratamiento de los errores HTTP.

## Componentes principales

`src/utils/errors.js`: define ErrorDictionary, que centraliza los códigos, mensajes y estados HTTP de los errores. También implementa AppError, una clase personalizada para representar errores controlados.

`src/middlewares/routeNotFoundHandler.js`: gestiona las solicitudes a rutas inexistentes.

`src/middlewares/errorHandler.js`: interpreta los errores recibidos, determina su clasificación y devuelve una respuesta HTTP uniforme.

Los controladores delegan el tratamiento de los errores al middleware mediante next(error), evitando duplicar la construcción de respuestas de error en cada endpoint.

Formato de las respuestas de error

Las respuestas siguen una estructura JSON uniforme:

```json
{
  "status": "error",
  "message": "Mensaje descriptivo del error",
  "code": "ERROR_CODE"
}
```

Cada error incluye:

status: indica que la operación falló.

message: describe el problema.

code: identifica el tipo de error mediante un código estable.

### Códigos de error

La API utiliza códigos específicos para identificar los errores y facilitar su interpretación por parte del cliente.

| Código                                 | Estado HTTP | Descripción                                                |
| -------------------------------------- | ----------: | ---------------------------------------------------------- |
| `USER_NOT_FOUND`                       |         404 | Usuario inexistente.                                       |
| `ORDER_NOT_FOUND`                      |         404 | Pedido inexistente.                                        |
| `DELIVERY_NOT_FOUND`                   |         404 | Entrega inexistente.                                       |
| `DELIVERY_ORDER_NOT_FOUND`             |         400 | Pedido asociado a la entrega inválido o inexistente.       |
| `DELIVERY_DRIVER_INVALID`              |         400 | Repartidor inválido.                                       |
| `ROUTE_NOT_FOUND`                      |         404 | Ruta inexistente.                                          |
| `VALIDATION_ERROR`                     |         400 | Error de validación de datos.                              |
| `INVALID_JSON`                         |         400 | El cuerpo de la solicitud contiene JSON mal formado.       |
| `INVALID_ID`                           |         400 | Identificador inválido.                                    |
| `INVALID_MOCK_QUANTITY`                |         400 | La cantidad solicitada para los mocks no es válida.        |
| `RESOURCE_CONFLICT`                    |         409 | Conflicto con un recurso existente.                        |
| `DATABASE_ERROR`                       |         500 | Error al acceder a la base de datos.                       |
| `INTERNAL_SERVER_ERROR`                |         500 | Error interno no clasificado.                              |
| `ORDER_CUSTOMER_NOT_FOUND`             |         400 | Cliente asociado al pedido inexistente.                    |
| `ORDER_ITEMS_REQUIRED`                 |         400 | El pedido debe contener artículos.                         |
| `USER_ADMIN_CREATION_FORBIDDEN`        |         400 | No está permitida la creación de usuarios administradores. |
| `USER_ADMIN_ROLE_ASSIGNMENT_FORBIDDEN` |         400 | No está permitida la asignación del rol administrador.     |
| `USER_EMAIL_ALREADY_EXISTS`            |         409 | El correo electrónico ya está registrado.                  |

### Clasificación de errores

El middleware central reconoce diferentes tipos de errores y los transforma en respuestas controladas:

Errores de identificadores: los errores de tipo CastError se convierten en INVALID_ID.

Errores de formato JSON: las solicitudes con JSON mal formado se convierten en INVALID_JSON.

Errores de validación de Mongoose: se clasifican como VALIDATION_ERROR.

Errores de conexión o acceso a MongoDB: los errores de conexión, selección de servidor y red se clasifican como DATABASE_ERROR.

Errores de negocio: utilizan los códigos definidos en ErrorDictionary.

Errores no reconocidos: se devuelven como INTERNAL_SERVER_ERROR.

Este enfoque permite que el cliente reciba mensajes y códigos consistentes, sin exponer detalles internos de la implementación.

## Mocking y datos de prueba

El módulo de mocking está disponible bajo `/api/mocks`. Permite generar datos ficticios para probar la estructura de las entidades y sus relaciones sin guardarlos en MongoDB.

El parámetro `qty` permite indicar la cantidad solicitada y se valida antes de generar los datos.

| Método | Ruta                          | Descripción                              |
| ------ | ----------------------------- | ---------------------------------------- |
| GET    | `/api/mocks/users?qty=3`      | Generar usuarios ficticios               |
| GET    | `/api/mocks/drivers?qty=2`    | Generar usuarios con rol de repartidor   |
| GET    | `/api/mocks/orders?qty=2`     | Generar pedidos ficticios                |
| GET    | `/api/mocks/deliveries?qty=2` | Generar entregas ficticias               |
| GET    | `/api/mocks/dataset?qty=2`    | Generar un conjunto relacionado de datos |
| POST   | `/api/mocks/seed?qty=2`       | Insertar datos de prueba en MongoDB      |

### Ejemplos de uso

**1. Generar usuarios ficticios**

```http
GET http://localhost:8080/api/mocks/users?qty=3
```

Devuelve una colección de usuarios simulados con nombre, apellido, email y rol. Los datos se generan en memoria y no se persisten.

**2. Generar un conjunto de datos relacionados**

```http
GET http://localhost:8080/api/mocks/dataset?qty=2
```

Permite obtener usuarios, repartidores, pedidos y entregas ficticios, con referencias coherentes entre las entidades. Esta operación tampoco inserta registros en MongoDB.

**3. Insertar datos de prueba**

```http
POST http://localhost:8080/api/mocks/seed?qty=2
```

El seed crea usuarios con roles de cliente y repartidor, genera pedidos para los clientes y crea las entregas correspondientes. Finalmente, actualiza las referencias de los pedidos para vincularlos con sus entregas.

La respuesta incluye un resumen de los registros insertados, por ejemplo:

```json
{
  "status": "success",
  "payload": {
    "insertados": {
      "usuarios": 3,
      "clientes": 2,
      "repartidores": 1,
      "pedidos": 2,
      "entregas": 2
    }
  }
}
```

La cantidad de usuarios incluye los clientes y repartidores creados. En este ejemplo, `qty=2` genera dos clientes y un repartidor.

**Importante:** cada ejecución del seed inserta nuevos registros. Ejecutarlo varias veces puede aumentar la cantidad de documentos almacenados en MongoDB.

#### Ejemplo de cantidad inválida

**Solicitud:**

`GET /api/mocks/users?qty=0`

Si la cantidad solicitada no es un entero entre 1 y 100, la API responde con un error `INVALID_MOCK_QUANTITY`.

**Respuesta esperada:**

```json
{
  "status": "error",
  "message": "La cantidad solicitada para los mocks no es válida",
  "code": "INVALID_MOCK_QUANTITY"
}
```

El mismo criterio de validación se aplica al endpoint `POST /api/mocks/seed`, que utiliza `qty=10` como valor predeterminado cuando no se especifica el parámetro.

## Estados, prioridades y relaciones

Los datos generados respetan los modelos y las constantes del proyecto:

- Los usuarios utilizan roles válidos.
- Los pedidos utilizan estados y prioridades permitidos.
- Las entregas utilizan sus estados y prioridades permitidos.
- Los pedidos referencian a sus clientes.
- Las entregas referencian a sus pedidos y, cuando están asignadas, a un repartidor con el rol correspondiente.

Las operaciones de mocking no persisten información. La persistencia se realiza únicamente mediante el endpoint de seed o las operaciones CRUD correspondientes.

## Logging y monitoreo

ShipNow utiliza **Winston** para centralizar los registros de eventos y errores de la aplicación. La configuración se encuentra en `src/utils/logger.js`.

### Niveles de logging

El logger utiliza seis niveles personalizados, ordenados de mayor a menor prioridad:

- `fatal`: errores críticos que impiden el funcionamiento normal de la aplicación.
- `error`: errores de ejecución.
- `warning`: situaciones anómalas o solicitudes inválidas.
- `info`: eventos importantes, como el inicio del servidor, la conexión a MongoDB, la generación de mocks y la creación de pedidos.
- `http`: eventos relacionados con solicitudes HTTP.
- `debug`: información detallada útil durante el desarrollo.

Cada registro incluye fecha, hora, nivel y mensaje.

### Configuración por entorno

El comportamiento se determina mediante la variable `NODE_ENV`:

- **Desarrollo (`development`):** muestra todos los niveles, desde `debug` hasta `fatal`.
- **Producción (`production`):** muestra desde `info` hasta `fatal`, omitiendo `http` y `debug` en consola.

### Persistencia y rotación

Los registros `error` y `fatal` se almacenan en la carpeta `logs/`, mediante archivos con nombres basados en la fecha, por ejemplo, `error-2026-10-28.log`.

La rotación está configurada con Winston Daily Rotate File:

- Tamaño máximo por archivo: `5 MB`.
- Retención: `14 días`.
- Rotación por fecha.
- Los registros de menor severidad no se persisten en estos archivos.

La carpeta `logs/` está excluida del repositorio mediante `.gitignore`.

### Endpoint de prueba

En desarrollo se puede probar el logger mediante:

`GET /api/mocks/logger-test`

El endpoint emite un registro por cada uno de los seis niveles. Las rutas de mocks no están disponibles en producción.

### Archivos excluidos de Git

El archivo `.gitignore` excluye:

- `node_modules/`: dependencias instaladas.
- `.env`: variables de entorno y configuración local.
- `logs/`: archivos de registro generados durante la ejecución.

### Ubicación de los archivos de log

Los archivos de registro se almacenan en la carpeta `logs/`, ubicada en la **raíz del proyecto**, al mismo nivel que `src/`, `node_modules/` y `package.json`.

Esta carpeta se genera o utiliza durante la ejecución de la aplicación y contiene los archivos de log rotativos, por ejemplo, `error-2026-10-28.log`.

La carpeta `logs/` está incluida en `.gitignore`, por lo que los registros generados localmente no se suben al repositorio de GitHub.

## Scripts disponibles

| Comando       | Uso                                 |
| ------------- | ----------------------------------- |
| `npm install` | Instalar dependencias               |
| `npm run dev` | Iniciar el servidor en desarrollo   |
| `npm start`   | Iniciar el servidor para producción |
