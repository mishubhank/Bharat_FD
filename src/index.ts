import { Prisma, PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
const admin = require("./admin");
const app = express();
const prisma = new PrismaClient();
const translate = require("./routes/translate");
const listAll = require("./routes/listall");

const cors = require("cors");

app.use(cors());
app.get("/", (req: Request, res: Response) => {
  console.log("Hello World!");
  res.send("Hello World!");
});

app.use(express.json());

app.use("/admin", admin);
app.use("/translate", translate);
app.use("/listall", listAll);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
