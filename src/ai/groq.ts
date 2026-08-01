import Groq from 'groq-sdk';
import { groqKeyManager } from './keyRotation';

export class GroqService {
  /**
   * Parse document text using Groq as a fast fallback.
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

      Do not output any markdown formatting, only the raw JSON.

      Text:
      ${text}
    `;

    return groqKeyManager.executeWithRotation(async (apiKey) => {
      const groq = new Groq({ apiKey });

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const rawText = completion.choices[0]?.message?.content || '{}';
      try {
        return JSON.parse(rawText);
      } catch (e) {
        console.error('Failed to parse Groq JSON output:', rawText);
        throw new Error('Groq returned invalid JSON');
      }
    });
  }
}
