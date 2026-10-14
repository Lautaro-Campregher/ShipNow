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
│   │
│   └── server.js
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

## Estados, prioridades y relaciones

Los datos generados respetan los modelos y las constantes del proyecto:

- Los usuarios utilizan roles válidos.
- Los pedidos utilizan estados y prioridades permitidos.
- Las entregas utilizan sus estados y prioridades permitidos.
- Los pedidos referencian a sus clientes.
- Las entregas referencian a sus pedidos y, cuando están asignadas, a un repartidor con el rol correspondiente.

Las operaciones de mocking no persisten información. La persistencia se realiza únicamente mediante el endpoint de seed o las operaciones CRUD correspondientes.

## Scripts disponibles

| Comando       | Uso                                 |
| ------------- | ----------------------------------- |
| `npm install` | Instalar dependencias               |
| `npm run dev` | Iniciar el servidor en desarrollo   |
| `npm start`   | Iniciar el servidor para producción |
