import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  console.log("User route is working...");
  res.send("User route is working...");
});
export const userRoute = router;
