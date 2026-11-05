import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.js";
import ordersRouter from "./routes/orders.js";
import deliveriesRouter from "./routes/deliveries.js";
import mocksRouter from "./routes/mocks.router.js";
import { config } from "./config/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import routeNotFound from "./middlewares/routeNotFoundHandler.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import loggerRouter from "./routes/logger.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/deliveries", deliveriesRouter);
app.use("/api/logger", loggerRouter);

if (config.nodeEnv !== "production") {
  app.use("/api/mocks", mocksRouter);
}

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use(routeNotFound);
app.use(errorHandler);

export default app;
