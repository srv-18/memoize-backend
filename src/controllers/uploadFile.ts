import { Request, Response } from "express";
import prisma from "../client";
import { textExtractor } from "../workers/textExtractor-worker";
import { generateEmbedding } from "../workers/embeddings-worker";
import { uploadToS3 } from "../workers/uploadToS3-worker";

export const uploadFile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const file = req.file;

        if(!file) {
            res.status(400).json({ message: "File not found" });
            return;
        }

        const [uploadedFileS3Url, text] = await Promise.all([
            uploadToS3(file),
            textExtractor(file.buffer),
        ]);

        const maxContentLength = 25000;
        const content = text.length > maxContentLength ? text.slice(0, maxContentLength) : text;

        const embedding = await generateEmbedding(`title: ${file.originalname}, content: ${content}, createdAt: ${new Date()}`);

        console.log(text);  //print text extracted from pdfparser
        console.log(uploadedFileS3Url)  //url of file uploaded to S3

        const contentType = "FILE";

        const fileData = await prisma.$executeRaw`
            INSERT INTO "Contents" 
                (id, title, content, "url", "type", embedding, "userId") 
            VALUES 
                (gen_random_uuid(), ${file.originalname}, ${content}, ${uploadedFileS3Url}, ${contentType}::"ContentType", ${embedding}::vector, ${userId})
            RETURNING *;
        `;

        console.log(fileData);  //print fileData

        res.status(200).json({ fileData });
    } catch(e) {
        console.log(`error in upload file route: ${e}`)
        res.status(500).json({"error": "something went wrong while uploading file"});
        return;
    }
}