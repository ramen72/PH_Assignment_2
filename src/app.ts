import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { userRoute } from "./modules/user/user.router";
import { authRoute } from "./modules/auth/auth.route";

const app: Application = express();

app.use(cookieParser());
app.use(express.json()); //* middleware for read JSON from body
app.use(express.text()); //* middleware for read TextData from body
app.use(express.urlencoded({ extended: true })); //* middleware for read En-coded Data

// * Middleware for log request
// app.use(logger);
app.use(
  cors({
    origin: "http://localhost:5000", // Replace with your frontend URL
    // methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    // credentials: true, // Allow cookies to be sent with requestF
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World..");
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);

export default app;
