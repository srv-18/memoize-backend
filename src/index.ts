import express from "express";
import cors from "cors";
import prisma from "./client";
import { router } from "./routes/v1";
import { securityMiddleware } from "./middleware/security-middleware";
import { ratelimitter } from "./middleware/rateLimiter-middleware";

const app = express();

app.use(cors());

app.use(express.json());

//v1 Routes
app.use("/api/v1", router);

//security middlewares
app.use(securityMiddleware);
app.use(ratelimitter);


app.get("/", (_, res) => {
  res.status(200).json({message: "Hello World"});
});

app.listen(process.env.PORT, async () => {
  console.log(`Server is running on port ${process.env.PORT}`);

  try {
    await prisma.$connect();
    console.log("Database Connected");
  } catch(e: any) {
    console.log(`Prisma Error: ${e.message}`);
  }
});