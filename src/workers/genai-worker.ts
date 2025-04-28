import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const useGenAI = async (prompt: string): Promise<string> => {

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
        });

        console.log(response.text);

        return response.text ?? "";
    } catch(e) {
        console.log(`Error while using genai: ${e}`);
        throw new Error("Error using genai");
    }
}