import express, { type Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRoute } from "./modules/auth/auth.route";
import { issueRoute } from "./modules/issues/issues.route";

const app: Application = express();

app.use(cookieParser());
app.use(express.json()); //* middleware for read JSON from body
app.use(express.text()); //* middleware for read TextData from body
app.use(express.urlencoded({ extended: true })); //* middleware for read En-coded Data

// * Middleware for log request
app.use(
  cors({
    origin: "http://localhost:9000", // Replace with your frontend URL
    // methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    // credentials: true, // Allow cookies to be sent with requestF
  }),
);

app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

export default app;
