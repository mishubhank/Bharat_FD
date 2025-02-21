const express = require("express");
import { PrismaClient } from "@prisma/client";
import { promises } from "dns";
import { Request, Response } from "express";
import { date, z } from "zod";
const app = express();
const router = express.Router();
//import {} from "../keys";
const { Translate } = require("@google-cloud/translate").v2;
//const translate = new Translate({ keyFilename: '' });
// Creates a client
//const translate = new Translate();

// async function translateText() {
//   // Translates the text into the target language. "text" can be a string for
//   // translating a single piece of text, or an array of strings for translating
//   // multiple texts.
//   const target = "fr";
//   const text = " hi my name is walter white";
//   let [translations] = await translate.translate(text, target);
//   translations = Array.isArray(translations) ? translations : [translations];
//   console.log("Translations:");
//   translations.forEach((translation: any, i: Number) => {
//     console.log(`${[i]} => (${target}) ${translation}`);
//   });
// }

//translateText();

const prisma = new PrismaClient();
// xV6Vpp!#wg7g9Z@
const faqData = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(3, "Answer must be at least 3 characters"),
  tagId: z.number().optional(),
  category: z
    .string()
    .min(2)

    .optional(),
  translations: z
    .array(
      z.object({
        languageCode: z.string().length(2), // e.g., 'es', 'fr'
        question: z.string().min(3).max(255),
        answer: z.string().min(3),
      })
    )
    .optional(),
});

const admin = router.post("/create", async (req: Request, res: Response) => {
  const { question } = req.body;
  const validatedData = faqData.parse(req.body);
  const tagName = validatedData.category;
  const resp = await prisma.tag.findFirst({
    where: {
      name: tagName,
    },
  });

  let newTag;
  if (!resp) {
    newTag = await prisma.tag.create({
      data: {
        name: tagName || "all",
      },
    });
  } else {
    newTag = await prisma.tag.findFirst({
      where: {
        name: tagName,
      },
    });
  }

  console.log(validatedData);
  {
    if (question) {
      const newquestion = await prisma.fAQ.create({
        data: {
          question: validatedData.question,
          answer: validatedData.answer,
          createdAt: new Date(),
          tagId: newTag?.id,

          translations: validatedData.translations
            ? {
                create: validatedData.translations,
              }
            : undefined,
        },
        include: {
          translations: true,
          tag: true,
        },
      });

      console.log(newquestion);
      return res.json({
        message: "question successfully made",
      });
    }
  }
  {
    return res.json({ message: "failed to make a ques" });
  }
});

router.get("/tag", async (req: Request, res: Response) => {
  const tagName = req.body.tagName;
  const filterTag = await prisma.tag.findMany({
    where: {
      name: tagName,
    },
    include: {
      faqs: true,
    },
  });

  if (filterTag) {
    filterTag.map((value) => {
      console.log(value.faqs);
    });
    // console.log(filterTag);
    return res.json({ filterTag });
  }
});

module.exports = admin;
