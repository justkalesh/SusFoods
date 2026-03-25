import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("receipt") as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
    }

    // Initialize the Gemini client
    // Note: The user MUST provide GEMINI_API_KEY in .env.local
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    
    if (!apiKey) {
      console.warn("No Gemini API Key found. Falling back to mock data for demonstration.");
      // Fallback for demonstration if key is missing
      await new Promise(r => setTimeout(r, 2000));
      return NextResponse.json({
         success: true, 
         data: [{
            id: crypto.randomUUID(),
            itemName: "Mock Apple Box (NO API KEY)",
            dateStocked: new Date().toISOString().split("T")[0],
            quantity: 10,
            unit: "boxes",
            price: 15.00,
            predictedExpiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
         }]
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Read the file buffer and prepare it for Gemini
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';

    const prompt = `You are an AI assistant for a surplus food redistribution platform. 
Your task is to analyze the provided image (which may be a receipt, invoice, or a photo of food items) and extract line items.
If the image shows multiple items, extract them all.
Return the result strictly as a JSON array of objects, with NO markdown formatting, NO \`\`\`json block, and NO other text.
Each object must have the following exact keys and data types:
- "itemName": string (the name of the food product)
- "quantity": number (the numerical quantity. If not specified, guess 1.)
- "unit": string (e.g. "kg", "boxes", "portions", "loaves", "cans")
- "price": number (the price per unit or total. If not specified, use 0)
- "predictedExpiryDays": number (your best AI prediction for how many days until this item spoils, based on the item name)

Ensure the output is valid JSON. Example output:
[{"itemName": "Whole Milk", "quantity": 2, "unit": "gallons", "price": 4.99, "predictedExpiryDays": 7}]`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            prompt, 
            {
               inlineData: {
                  data: buffer.toString("base64"),
                  mimeType: mimeType
               }
            }
        ],
        config: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
    });

    const textOutput = response.text || "[]";
    let parsedItems = [];
    
    try {
        parsedItems = JSON.parse(textOutput);
    } catch (e) {
        // Fallback cleanup if the LLM returned markdown by accident
        const cleanJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedItems = JSON.parse(cleanJson);
    }

    const currentDate = new Date();
    
    // Map the output to the frontend ExtractedItem structure
    const extractedData = parsedItems.map((item: any) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + (item.predictedExpiryDays || 5));
        
        return {
            id: crypto.randomUUID(),
            itemName: item.itemName || "Unknown Item",
            dateStocked: currentDate.toISOString().split("T")[0],
            quantity: item.quantity || 1,
            unit: item.unit || "units",
            price: item.price || 0,
            predictedExpiryDate: d.toISOString().split("T")[0],
        };
    });

    return NextResponse.json({ success: true, data: extractedData });
  } catch (error) {
    console.error("AI Scan Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process receipt imagery." },
      { status: 500 }
    );
  }
}
