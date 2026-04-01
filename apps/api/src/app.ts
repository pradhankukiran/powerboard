import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import { routes } from "./routes/index.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1", routes);
app.use(errorHandler);
