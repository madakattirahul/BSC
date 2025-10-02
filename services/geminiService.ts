import { GoogleGenAI, Type } from "@google/genai";
import { ConversionResult } from '../types';

// Custom Error types for more specific error handling
export class RateLimitError extends Error {
  constructor(message = "We're experiencing high traffic at the moment. Please wait a few moments and try again.") {
    super(message);
    this.name = "RateLimitError";
  }
}

export class ParsingError extends Error {
  constructor(message = "The AI model returned data in an unexpected format. This can happen occasionally. Please try converting your file again.") {
    super(message);
    this.name = "ParsingError";
  }
}

export class ApiError extends Error {
    constructor(message = "Failed to process the bank statement. The AI model could not be reached.") {
        super(message);
        this.name = "ApiError";
    }
}


// This function asks Gemini to parse text from a bank statement PDF and structure it into JSON.
export const convertBankStatement = async (pdfText: string): Promise<ConversionResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Based on the following text extracted from a bank statement PDF, perform the following tasks:
    1.  Identify and list all transactions, extracting the date, a clear description, debit (withdrawals), and credit (deposits).
    2.  For each transaction, assign a relevant category from this list: Groceries, Transport, Bills, Shopping, Entertainment, Health, Income, Transfers, Eating Out, General, Other.
    3.  Calculate the running balance if available; otherwise, set it to 0.
    4.  Calculate a summary object containing:
        -   totalIncome (sum of all credit transactions).
        -   totalSpending (sum of all debit transactions).
        -   spendingByCategory (an object where keys are categories and values are the sum of spending for that category).
    5.  Format the entire output as a single valid JSON object, matching the provided schema. Do not include any text, explanations, or markdown formatting outside of the JSON object itself.

    Here is the text from the PDF:
    ---
    ${pdfText}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                transactions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            date: { type: Type.STRING, description: 'The transaction date in YYYY-MM-DD format.' },
                            description: { type: Type.STRING, description: 'A brief description of the transaction.' },
                            debit: { type: Type.NUMBER, description: 'The withdrawal amount. Should be null if it is a credit.' },
                            credit: { type: Type.NUMBER, description: 'The deposit amount. Should be null if it is a debit.' },
                            balance: { type: Type.NUMBER, description: 'The account balance after the transaction.' },
                            category: { type: Type.STRING, description: 'The assigned category for the transaction.'}
                        },
                        required: ['date', 'description', 'balance', 'category']
                    }
                },
                summary: {
                    type: Type.OBJECT,
                    properties: {
                        totalIncome: { type: Type.NUMBER },
                        totalSpending: { type: Type.NUMBER },
                        spendingByCategory: { 
                            type: Type.OBJECT,
                            description: 'A key-value map of spending per category.'
                        }
                    },
                    required: ['totalIncome', 'totalSpending', 'spendingByCategory']
                }
            },
            required: ['transactions', 'summary']
        },
      },
    });

    const jsonText = response.text.trim();
    
    try {
        const data = JSON.parse(jsonText);
        return data as ConversionResult;
    } catch (parseError) {
        console.error("Error parsing JSON from Gemini API:", parseError);
        console.error("Received text:", jsonText);
        throw new ParsingError();
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof ParsingError) {
        throw error; // Re-throw parsing errors
    }
    if (error instanceof Error && (error.message.includes('429') || /rate limit/i.test(error.message))) {
        throw new RateLimitError();
    }
    throw new ApiError();
  }
};
