import { GeminiService } from './gemini';
import { GroqService } from './groq';

export class DocumentParserPipeline {
  /**
   * Main parsing pipeline that coordinates between OCR text and AI models.
   * Attempts Gemini first, falls back to Groq.
   */
  static async parse(text: string, expectedType?: string): Promise<any> {
    try {
      console.log('[ParserPipeline] Attempting parsing with Gemini...');
      const result = await GeminiService.parseDocument(text, expectedType);
      console.log('[ParserPipeline] Gemini parsing successful.');
      return result;
    } catch (error) {
      console.warn(`[ParserPipeline] Gemini parsing failed: ${error}. Falling back to Groq...`);
      try {
        const fallbackResult = await GroqService.parseDocument(text, expectedType);
        console.log('[ParserPipeline] Groq fallback parsing successful.');
        return fallbackResult;
      } catch (fallbackError) {
        console.error(`[ParserPipeline] Both Gemini and Groq parsing failed.`);
        throw new Error(`Parsing failed completely. Gemini Error: ${error}, Groq Error: ${fallbackError}`);
      }
    }
  }
}
