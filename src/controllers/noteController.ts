import { Request, Response } from "express";
import prisma from "../prisma.js";
import { getEmbedding } from "../services/embeddingService.js";

export const createNote = async (req: Request, res: Response) => {
  try {
    const { title, content, userId } = req.body;

    // Check if userId is provided in the request body
    if (!content)
      return res.status(400).json({ message: "Content is required" });
    if (!title) return res.status(400).json({ message: "Title is required" });

    console.log(userId);

    const createdAt = new Date();

    //get embedding for the content using the getEmbedding function
    const embedding = await getEmbedding(
      "title: " +
        title +
        "\n" +
        "Date:" +
        createdAt +
        "\n" +
        "content: " +
        content
    );

    let contentType: string = "NOTE";

    //query to insert the note into the database
    const note =
      await prisma.$executeRaw`INSERT INTO "Content" (id,title, content, embedding, "userId", "type", "createdAt", "updatedAt") 
        VALUES 
        (gen_random_uuid(),
        ${title}, 
        ${content}, 
        ${embedding}::vector,
         ${userId},
         ${contentType}::"ContentType", 
         Now(), 
         Now())`;

    return res.status(201).json(note);
  } catch (error: any) {
    console.error("Error creating note:", error.message);
    return res.status(500).json({ message: "Failed to create Note" });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "INote ID is required" });

    const note = await prisma.content.delete({
      where: {
        id: id,
      },
    });

    console.log("Deleted note:", note);
    return res.status(200).json(note);
  } catch (error: any) {
    console.error("Error deleting note:", error.message);
    return res.status(500).json({ message: "Failed to delete Note" });
  }
};
