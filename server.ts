import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Max payload size for handling large high-res image scans
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Route for AI Image Scans using Gemini 3.5 Flash
  app.post("/api/scan-image", async (req, res) => {
    try {
      const { image, categories, existingAlbums } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image file provided." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Gemini API key is not configured. Please add GEMINI_API_KEY inside Settings > Secrets." 
        });
      }

      // Parse mime type and data from base64 string
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let mimeType = "image/jpeg";
      let base64Data = image;
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const categoriesStr = categories ? categories.join(", ") : "Stage, Backdrops, AV Systems";
      const albumsStr = existingAlbums ? existingAlbums.join(", ") : "Corporate Event";

      const promptText = `Analyze this premium event design, exhibition booth, or structural setup photo.
For our event portfolio organization, generate the following metadata:
1. title: Generate a premium, descriptive, highly professional caption or title for this specific element/installation (e.g. "Sleek Circular LED Stage", "SABIC Exhibition Check-in Stand", "High-Tech AV Control Bridge"). Avoid generic words. Maximum 6 words.
2. category: Categorize this photo by selecting the SINGLE most relevant, precise matches from this Joudcon capability list: [${categoriesStr}]. You must match one of these categories exactly.
3. albumName: Suggest a relevant event project name that acts as an album. Select from this list of current active albums: [${albumsStr}] if it matches the style/event, or generate a compelling new professional event/project name as an album title (e.g. "SABIC Brand Launcher 2026", "Riyadh Pavilion", "Middle East Tech Summit") if it doesn't fit existing ones.

Return the result as JSON matching the requested schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          promptText,
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Clean professional title describing the asset, limit 6 words."
              },
              category: {
                type: Type.STRING,
                description: "Select the single closest matching category from the Joudcon catalog list."
              },
              albumName: {
                type: Type.STRING,
                description: "Matching existing album name or elegant suggested custom event album name."
              }
            },
            required: ["title", "category", "albumName"],
          },
        },
      });

      const responseText = response.text ? response.text.trim() : "{}";
      const result = JSON.parse(responseText);
      res.json(result);
    } catch (error: any) {
      console.error("AI Scan Error:", error);
      res.status(500).json({ error: error?.message || "Internal server error occurred during scan." });
    }
  });

  // Serve static assets in production, otherwise Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
