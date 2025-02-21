const express = require("express");
import { PrismaClient } from "@prisma/client";
import { promises } from "dns";
import { Translate } from "@google-cloud/translate/build/src/v2";
import { Request, Response } from "express";
import { date, z } from "zod";

import { createClient } from "redis";
const client = createClient();

client.on("error", (err) => console.error("Redis Error:", err));
(async () => {
  client.connect();
  console.log("connected");
})();
//redis();
const app = express();
const prisma = new PrismaClient();
const translate = new Translate({
  keyFilename: "./keys/sacred-pursuit-449514-h3-5149959cab91.json", // Adjust path as needed
});

const tranlsation = app.get("/:id", async (req: Request, res: Response) => {
  const lang = req.query.lang as string;

  const { id } = req.params;
  const key = `faq${id}-${lang}`;
  const cachedData = await client.get(key);
  if (cachedData) {
    console.log(cachedData);
    return res.json({ " messga": "return the cached output" });
  }
  const v = parseInt(id);
  const params = { id, lang };
  console.log(lang, id);
  const find = await prisma.fAQ.findFirst({
    where: {
      id: v,
    },
    include: {
      translations: {
        where: {
          languageCode: lang,
        },
      },
    },
  });
  if (find && find.translations.length > 0) {
    await client.set(key, JSON.stringify(find));
    console.log(find.translations, "Found translation");
    return res.json(find);
  } else {
    const qna = await prisma.fAQ.findFirst({
      where: {
        id: v,
      },
    });
    const ques = qna?.question;
    const ans = qna?.answer;

    const [translatedQuestion] = await translate.translate(ques || "", lang);
    const [translatedAnswer] = await translate.translate(ans || "", lang);
    try {
      const newLan = await prisma.translation.create({
        data: {
          question: translatedQuestion,
          answer: translatedAnswer,
          languageCode: lang,
          faqId: v,
        },
      });
      console.log(newLan, "converted");
      await client.set(key, JSON.stringify(newLan));
      return res.json({
        message: `translated to ${lang}`,
      });
    } catch {
      return res.json({
        message: `failed traslating to ${lang}`,
      });
    }
  }
});
module.exports = tranlsation;
