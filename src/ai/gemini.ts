import { GoogleGenAI } from '@google/genai';
import { geminiKeyManager } from './keyRotation';

export class GeminiService {
  /**
   * Parse document text using Gemini.
   */
  static async parseDocument(text: string, documentType?: string): Promise<any> {
    const prompt = `
      You are an expert AI Financial Document Parser.
      Extract structured data from the following OCR text.
      The expected document type is: ${documentType || 'Unknown (classify it yourself)'}.
      
      Return ONLY a valid JSON object matching the following structure requirements:
      - Add a "confidenceScore" (0-100) based on how clear the text was.
      - Add a "documentType" representing what type of document this is (e.g. Invoice, PAN, BankStatement, SalarySlip).
      - Add an "extractedData" object containing key-value pairs of the extracted information.

      Text:
      ${text}
    `;

    // Execute via our key rotation manager to handle rate limits / quotas
    return geminiKeyManager.executeWithRotation(async (apiKey) => {
      // Note: @google/genai syntax
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const rawText = response.text || '{}';
      try {
        return JSON.parse(rawText);
      } catch (e) {
        console.error('Failed to parse Gemini JSON output:', rawText);
        throw new Error('Gemini returned invalid JSON');
      }
    });
  }
}
