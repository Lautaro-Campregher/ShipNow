# ShipNow API

API de ShipNow construida con Node.js, Express y MongoDB, organizada con arquitectura de tres capas: Controller, Service y Repository.

## Requisitos

- Node.js 18+
- MongoDB
- Una URI válida de MongoDB

## Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`:

```env
PORT=
MONGODB_URI=
NODE_ENV=
```

> El archivo `.env` no debe subirse al repositorio.

3. Ejecutar en desarrollo:

```bash
npm run dev
```

Para producción:

```bash
npm start
```

La aplicación valida `PORT`, `MONGODB_URI` y `NODE_ENV` al arrancar. Si falta cualquiera de estas variables, la aplicación lanza un error descriptivo y no inicia el servidor.

## Arquitectura

```text
src/
├── config/
│   └── index.js
├── controllers/
│   ├── product.controller.js
│   └── user.controller.js
├── models/
│   ├── product.model.js
│   └── user.model.js
├── repositories/
│   ├── product.repository.js
│   └── user.repository.js
├── routes/
│   ├── products.js
│   └── users.js
├── services/
│   ├── product.service.js
│   └── user.service.js
└── utils/
│    ├── constants.js
│    └── errors.js
│
└── server.js
```

El flujo de dependencias es:

```text
Controller → Service → Repository → Model/MongoDB
```

- **Controller:** recibe `req`, llama al Service y construye la respuesta HTTP.
- **Service:** contiene reglas de negocio, validaciones y decisiones como el estado del producto según su stock.
- **Repository:** es la única capa que conoce Mongoose y encapsula las operaciones de persistencia, filtros, ordenamiento y proyecciones.
- **Model:** define los esquemas de MongoDB.
- **Routes:** solamente conectan paths con métodos del Controller.
- **Config:** centraliza y valida las variables de entorno.
- **Constants:** evita strings mágicos para roles y estados del dominio.

### ¿Por qué separar Service y Repository?

El Repository se ocupa exclusivamente de cómo se consultan y guardan los datos. Por ejemplo, el repositorio de Products decide qué filtro y ordenamiento aplicar a una consulta y utiliza Mongoose para ejecutarla.

El Service se ocupa de qué debe hacer la aplicación con esos datos. Por ejemplo, al crear un producto determina si su estado debe ser `available` o `out_of_stock` según el stock, y al crear un usuario impide asignar el rol administrador desde este endpoint.

De esta manera, las reglas de negocio no dependen directamente de Mongoose y la persistencia puede modificarse sin trasladar esa lógica al Controller.

## Endpoints

| Método         | Ruta                              | Descripción                     |
| -------------- | --------------------------------- | ------------------------------- |
| GET            | `/api/health`                     | Health check                    |
| GET/POST       | `/api/users`                      | Listar / crear usuarios         |
| GET/PUT/DELETE | `/api/users/:id`                  | Obtener / actualizar / eliminar |
| GET            | `/api/products`                   | Listar productos con stock      |
| GET            | `/api/products?all=true`          | Listar todos los productos      |
| POST           | `/api/products`                   | Crear producto                  |
| GET/PUT/DELETE | `/api/products/:id`               | Obtener / actualizar / eliminar |
| GET            | `/api/products/:id/shipping-cost` | Cotizar el envío de un producto |

## Scripts

| Comando       | Uso                    |
| ------------- | ---------------------- |
| `npm run dev` | Desarrollo con nodemon |
| `npm start`   | Producción             |
