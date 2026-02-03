import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../constants/Config';

// Initialize the Gemini AI
const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY.trim());

export interface OCRresult {
    sessions: {
        day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
        subject: string;
        startTime: string;
        endTime: string;
        type: 'Theory' | 'Lab';
        room?: string;
        instructor?: string;
    }[];
}

export const ocrService = {
    async processTimetableImage(base64Image: string): Promise<OCRresult> {
        console.log("OCR starting with next-gen models...");

        // Models available specifically for this project's API key
        // Based on internal list: gemini-3-flash-preview, gemini-3-pro-preview
        const prioritizedModels = [
            "gemini-3-flash-preview",
            "gemini-3-pro-preview",
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-flash-latest"
        ];

        let lastError: any = null;

        for (const modelId of prioritizedModels) {
            try {
                console.log(`Attempting OCR with model ID: ${modelId}...`);

                const model = genAI.getGenerativeModel({ model: modelId });

                const prompt = `
          Extract timetable sessions from this image.
          Return ONLY a JSON object with a 'sessions' array.
          
          Fields for each session:
          - day: Exactly one of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          - subject: string (e.g. 'Mathematics', 'Physics')
          - startTime: 'HH:mm' (24-hour format)
          - endTime: 'HH:mm' (24-hour format)
          - type: 'Theory' or 'Lab'
          
          Important: Return ONLY raw JSON. No markdown backticks, no preamble.
        `;

                const cleanBase64 = base64Image.includes('base64,')
                    ? base64Image.split('base64,')[1]
                    : base64Image;

                const result = await model.generateContent([
                    {
                        inlineData: {
                            data: cleanBase64,
                            mimeType: 'image/jpeg'
                        }
                    },
                    { text: prompt }
                ]);

                const response = await result.response;
                const text = response.text();

                console.log(`Success! OCR finished using: ${modelId}`);

                // Robust JSON parsing
                const firstBrace = text.indexOf('{');
                const lastBrace = text.lastIndexOf('}');

                if (firstBrace === -1 || lastBrace === -1) {
                    throw new Error('AI response did not contain a valid JSON object.');
                }

                const jsonStr = text.substring(firstBrace, lastBrace + 1);
                const parsed = JSON.parse(jsonStr) as OCRresult;

                if (!parsed.sessions || !Array.isArray(parsed.sessions)) {
                    throw new Error('Parsed JSON is missing the sessions array.');
                }

                return parsed;

            } catch (error: any) {
                console.warn(`Model ${modelId} failed:`, error.message);
                lastError = error;

                if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('API_KEY_INVALID')) {
                    throw new Error(`Cloud API Key Error: ${error.message}. Please check your project permissions.`);
                }
            }
        }

        console.error("All next-gen models failed.");
        throw new Error(`OCR Processing Failed: ${lastError?.message || 'Unknown Error'}.`);
    }
};
