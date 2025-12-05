import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

export const enhanceImageWithGemini = async (base64Image: string): Promise<string> => {
  const ai = getClient();
  
  // Using Gemini 3 Pro Image Preview for high quality editing
  const model = 'gemini-3-pro-image-preview';
  
  // Extract real mime type to prevent 500 errors
  const match = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  
  let mimeType = 'image/jpeg';
  let data = base64Image;

  if (match) {
      mimeType = match[1];
      data = match[2];
  } else {
      // Fallback: try to strip header if it exists in a different format or assume it's raw base64
       data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            text: "Enhance photo quality, sharpen image, improve lighting, smooth skin lightly, keep natural and realistic. Output the result as an image."
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          }
        ]
      },
      config: {
        // We hope for an image response
        imageConfig: {
            aspectRatio: "1:1", // Standard assumption, though ideally matches input
            imageSize: "1K"
        }
      }
    });

    // Parse Response
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("The AI enhanced the image but did not return a visual output. Please try again.");
    
  } catch (error) {
    console.error("Gemini Enhancement Error:", error);
    throw error;
  }
};