

import { GoogleGenAI } from "@google/genai";
import { Trade, CalendarEvent, ChatMessage } from "../types";

// --- CONFIGURATION ---
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// Assume this variable is pre-configured, valid, and accessible in the execution context.
// Do not generate any UI elements or code snippets for entering or managing the API key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTradePsychology = async (trade: Trade): Promise<string> => {
  if (!process.env.API_KEY) return "AI Analysis Unavailable (Missing API Key)";

  try {
    const prompt = `
      Act as a professional trading psychologist. 
      Analyze this trade entry and give brief, constructive feedback (max 2 sentences).
      
      Trade Details:
      - Pair: ${trade.pair}
      - Direction: ${trade.direction}
      - Outcome: ${trade.outcome}
      - Session: ${trade.session}
      - PnL: ${trade.pnl}
      - R-Multiple: ${trade.rMultiple}
      - Checklist Grade: ${trade.checklistScore || 'N/A'}
      - User Notes: "${trade.notes}"

      Focus on discipline, emotional state, or risk management.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Analysis failed. Please try again.";
  }
};

export const analyzeTradeScreenshot = async (base64Image: string, pair: string): Promise<string> => {
  if (!process.env.API_KEY) return "AI Vision Unavailable";

  try {
    // Remove data URL prefix if present to get raw base64
    const base64Data = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: base64Data
                    }
                },
                {
                    text: `Analyze this trading chart for ${pair || 'the asset'}. Identify the market structure (trend), key support/resistance levels visible, and potential candlestick patterns. Keep it concise (under 50 words).`
                }
            ]
        }
    });

    return response.text || "Could not analyze chart.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Failed to analyze screenshot.";
  }
};

export const generatePerformanceReview = async (trades: Trade[]): Promise<string> => {
    if (!process.env.API_KEY) return "AI Coach Unavailable.";
    
    try {
      const summary = trades.slice(-30).map(t => 
        `${t.date}: ${t.pair} ${t.outcome} ${t.pnl} (${t.setup || 'No Setup'})`
      ).join('\n');
  
      const prompt = `
        You are a harsh but effective hedge fund manager reviewing a junior trader's recent performance. 
        Review this trade history and give a brutally honest performance review.
        
        Data provided:
        ${summary}
        
        Output ONLY Markdown with these sections:
        1. **The Good**: (1 sentence)
        2. **The Bad**: (1 sentence)
        3. **The Fix**: (Actionable advice)
        4. **Rating**: (1-10)
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
  
      return response.text || "Review unavailable.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Failed to generate review.";
    }
}

export const parseTradeFromNaturalLanguage = async (text: string): Promise<Partial<Trade>> => {
    if (!process.env.API_KEY) return {};
    
    try {
        const prompt = `
            Extract trading data from the following text into a JSON object.
            
            Text: "${text}"
            
            Output JSON schema:
            {
                "pair": "string (e.g. EURUSD, BTCUSD)",
                "direction": "BUY" or "SELL",
                "entryPrice": number,
                "exitPrice": number,
                "sl": number (Stop Loss),
                "tp": number (Take Profit),
                "lotSize": number,
                "outcome": "WIN" | "LOSS" | "BREAKEVEN" | "PENDING",
                "pnl": number (Profit/Loss amount),
                "notes": "string (any extra commentary)"
            }
            
            If a value is missing, use null or omit the field. 
            Only return the JSON block.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const jsonText = response.text || "{}";
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : "{}";
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("Parse Error", e);
        return {};
    }
};

export const chatWithTradeCoach = async (history: ChatMessage[], newMessage: string, image?: string): Promise<string> => {
    if (!process.env.API_KEY) return "AI Coach Unavailable (Missing API Key)";
  
    try {
      const parts: any[] = [];
      
      if (image) {
          const base64Data = image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");
          parts.push({
              inlineData: {
                  mimeType: 'image/png',
                  data: base64Data
              }
          });
      }
      
      // Provide limited context from history to keep it relevant
      let context = "You are an expert trading coach and technical analyst. Be concise, professional, and helpful.\n\n";
      if (history.length > 0) {
          context += "Previous conversation:\n" + history.slice(-4).map(m => `${m.role}: ${m.text}`).join('\n') + "\n\n";
      }
      context += "User Query: " + newMessage;
  
      parts.push({ text: context });
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts }
      });
  
      return response.text || "No response.";
    } catch (e) {
      console.error(e);
      return "Error connecting to AI Coach.";
    }
  };

export const getLiveMarketNews = async (): Promise<{sentiment: string, events: CalendarEvent[]}> => {
  if (!process.env.API_KEY) {
      // Return mock data if no API key to prevent breaking the UI
      return { 
          sentiment: "Demo Mode: API Key missing.", 
          events: [
              { id: '1', time: '08:30 AM', currency: 'USD', impact: 'High', event: 'CPI m/m', actual: '0.4%', forecast: '0.3%', previous: '0.4%', isBetter: false },
              { id: '2', time: '02:00 PM', currency: 'USD', impact: 'High', event: 'FOMC Statement', actual: '', forecast: '', previous: '', isBetter: false },
              { id: '3', time: '02:30 PM', currency: 'USD', impact: 'High', event: 'FOMC Press Conference', actual: '', forecast: '', previous: '', isBetter: false },
          ] 
      };
  }

  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `
            Retrieve the upcoming High Impact "Red Folder" economic calendar events for the current week.
            Focus on major pairs (USD, EUR, GBP, JPY).
            Look for: FOMC, CPI, NFP, GDP, Interest Rate Decisions, PPI, Retail Sales.
            
            Provide 2 things:
            1. A short "Weekly Outlook" summary (2 sentences).
            2. A list of 5-7 HIGH IMPACT events.

            Strictly output valid JSON in the following format:
            {
              "sentiment": "string",
              "events": [
                {
                   "time": "Day + Time (e.g. Wed 2:00 PM)",
                   "currency": "USD",
                   "impact": "High",
                   "event": "Event Name",
                   "actual": "Value or --",
                   "forecast": "Value or --",
                   "previous": "Value or --",
                   "isBetter": boolean (true if actual is better than forecast for the currency)
                }
              ]
            }

            Use Google Search to get the latest calendar data from ForexFactory or TradingEconomics.
          `,
          config: {
              tools: [{ googleSearch: {} }],
          }
      });

      let sourcesText = "";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const urls = chunks
            .map((c: any) => c.web?.uri)
            .filter((u: string) => u);
        if (urls.length > 0) {
            // Dedup sources
            sourcesText = "\n\nSources:\n" + [...new Set(urls)].map((u: unknown) => `- ${u}`).join('\n');
        }
      }

      const jsonText = response.text || "{}";
      
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : "{}";
      
      let data;
      try {
        data = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error("JSON Parse Failed:", parseError, cleanJson);
        return { sentiment: "Error parsing market data.", events: [] };
      }
      
      return {
          sentiment: (data.sentiment || "Market data currently unavailable.") + sourcesText,
          events: data.events || []
      };
  } catch (e) {
      console.error(e);
      return { 
          sentiment: "Data unavailable.", 
          events: [] 
      };
  }
}
