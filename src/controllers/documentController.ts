import { Request, Response } from "express";
import { processDocument } from "../services/documentService.js"; // Import the document processing function

import { uploadToTebiStorage } from "../services/tebiStorage.js";
import prisma from "../prisma.js";

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const tebiFileUrl = await uploadToTebiStorage(file); // Upload the file to Tebi storage

    const { content, embedding, metadata } = await processDocument(file); // Process the document and get content, embedding, and metadata
    const contentType = "DOCUMENT";

    const document =
      await prisma.$executeRaw`INSERT INTO "Content" (id, url, title, content, embedding, "userId", "type", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        ${tebiFileUrl},
        ${metadata.fileName},
        ${content},
        ${embedding}::vector,
        ${userId},
        ${contentType}::"ContentType", -- Add the contentType here
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    res.status(201).json(document);
  } catch {
    Error;
  }
  {
    console.error("Error uploading document:", Error);
    res.status(500).json({
      error: "Failed to upload document",
      details: Error instanceof Error ? Error.message : "Unknown error",
    });
  }
};
