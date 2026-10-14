import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import usersRouter from "./routes/users.js";
import ordersRouter from "./routes/orders.js";
import deliveriesRouter from "./routes/deliveries.js";
import mocksRouter from "./routes/mocks.router.js";
import { config } from "./config/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/deliveries", deliveriesRouter);
app.use("/api/mocks", mocksRouter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada",
  });
});

try {
  await mongoose.connect(config.mongoUri);
  console.log("Conexión a MongoDB establecida");

  app.listen(config.port, () => {
    console.log(`Servidor corriendo en puerto ${config.port}`);
  });
} catch (error) {
  console.error("No fue posible conectar con MongoDB:", error.message);
  process.exit(1);
}
