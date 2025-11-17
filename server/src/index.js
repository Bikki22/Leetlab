import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT ?? 8080;

app.use(express.json());
app.use(
  cors({
    // origin: "process.env.BASE_URI",
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.use("/api/v1/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`server is running in http://localhost:${PORT}`);
});
