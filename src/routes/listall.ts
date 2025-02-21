const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router();

const listAll = router.get("/", async (req: any, res: any) => {
  try {
    const all = await prisma.fAQ.findMany();
    return res.json(all);
  } catch (e) {
    return res.json(e);
  }
});

module.exports = listAll;
