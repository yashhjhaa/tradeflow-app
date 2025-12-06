

import { GoogleGenAI } from "@google/genai";
import { Trade, CalendarEvent, ChatMessage } from "../types";

// --- CONFIGURATION ---
const getApiKey = () => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) {
    return (import.meta as any).env.VITE_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }
  return null;
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeTradePsychology = async (trade: Trade): Promise<string> => {
  if (!ai) return "AI Analysis Unavailable (API Key Missing)";

  try {
    const prompt = `
      You are an elite trading performance coach and psychologist.
      Review the following trade execution and the trader's notes to identify behavioral patterns.

      Trade Context:
      - Pair: ${trade.pair}
      - Direction: ${trade.direction}
      - Outcome: ${trade.outcome} (PnL: ${trade.pnl})
      - Risk: ${trade.riskPercentage}%
      - Session: ${trade.session}
      
      Trader's Notes: 
      "${trade.notes}"

      Your Task:
      1. **Diagnosis**: Identify the specific psychological driver or error (e.g., FOMO, Revenge Trading, Hesitation, Premature Exit, Good Discipline).
      2. **Correction**: Provide ONE specific, actionable instruction or "Mental Correction" for the next trade to improve performance.

      Format the output clearly in Markdown. Be direct and concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Analysis failed. Please try again.";
  }
};

export const analyzeDeepPsychology = async (trade: Trade): Promise<string> => {
    if (!ai) return "AI Unavailable.";

    try {
        const prompt = `
            You are an elite Trading Psychologist and Performance Coach.
            Perform a deep-dive behavioral analysis on this specific trade based on the trader's notes and outcome.

            Trade Context:
            - Pair: ${trade.pair}
            - Result: ${trade.outcome} (${trade.pnl})
            - Session: ${trade.session}
            - Setup: ${trade.setup}
            
            Trader's Notes: 
            "${trade.notes}"

            Your Task:
            1. Identify the emotional state (e.g., FOMO, Revenge, Hesitation, Overconfidence).
            2. Detect cognitive biases (e.g., Confirmation Bias, Gambler's Fallacy).
            3. Provide a specific "Mental Correction" for the next trade.

            Output Format: Markdown. Be direct, professional, and insightful.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });

        return response.text || "Could not generate deep analysis.";
    } catch (e) {
        return "Analysis failed.";
    }
};

export const analyzeTradeScreenshot = async (base64Image: string, pair: string): Promise<string> => {
  if (!ai) return "AI Vision Unavailable (API Key Missing)";

  try {
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
    if (!ai) return "AI Coach Unavailable (API Key Missing).";
    
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
        model: 'gemini-3-pro-preview', 
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });
  
      return response.text || "Review unavailable.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Failed to generate review.";
    }
}

export const generateTradingStrategy = async (concept: string): Promise<string> => {
    if (!ai) return "AI Unavailable.";

    try {
        const prompt = `
            Create a professional trading strategy based on this concept: "${concept}".
            
            Structure the response as a formal Trading Playbook Entry in Markdown:
            # [Strategy Name]
            
            ## 1. The Setup
            (Describe market condition, e.g., Liquidity Sweep, FVG)
            
            ## 2. Entry Triggers
            - Exact conditions to enter
            
            ## 3. Stop Loss & Take Profit
            - Logical SL placement
            - Target logic
            
            ## 4. Risk Profile
            - Win Rate Estimation
            - R:R Expectancy
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });

        return response.text || "Could not generate strategy.";
    } catch (e) {
        return "Strategy generation failed.";
    }
};

export const generateStrategyChecklist = async (strategyText: string): Promise<string[]> => {
    if (!ai) return ["Ensure Trend Alignment", "Check Risk/Reward", "Confirm Entry Signal"];
    try {
        const prompt = `
            Analyze this trading strategy and create a strict "Pre-Flight Checklist".
            Return a JSON array of 5 short, actionable yes/no strings that a trader must check before entering.
            
            Strategy: "${strategyText}"
            
            Example output format:
            ["Market structure is bullish?", "Price swept liquidity?", "FVG created?"]
            
            Output ONLY the JSON array.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { thinkingConfig: { thinkingBudget: 8192 } }
        });
        
        const text = response.text || "[]";
        const match = text.match(/\[.*\]/s);
        return match ? JSON.parse(match[0]) : [];
    } catch(e) {
        return ["Check Market Structure", "Confirm Signal", "Verify Risk"];
    }
};

export const analyzeStrategyEdgeCases = async (strategyText: string): Promise<string> => {
    if (!ai) return "Use caution in high volatility.";
    try {
        const prompt = `
            Analyze this trading strategy. Identify the "Danger Zones" or "Anti-Patterns" where this strategy will likely FAIL.
            
            Strategy: "${strategyText}"
            
            Output a concise bulleted list (Markdown) of 3 specific market conditions to AVOID when using this system.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { thinkingConfig: { thinkingBudget: 8192 } }
        });
        return response.text || "Avoid high impact news events.";
    } catch(e) {
        return "Avoid News Events.";
    }
};

export const critiqueTradingStrategy = async (strategy: string): Promise<string> => {
    if (!ai) return "AI Unavailable.";

    try {
        const prompt = `
            Critique this trading strategy provided by the user. Find the flaws, the edge cases where it will fail, and rate its robustness.

            Strategy: "${strategy}"

            Output strictly in Markdown:
            ## Analysis
            (Your critique)

            ## Vulnerabilities
            - (List 2 key weaknesses)

            ## Robustness Score
            (1-10)/10
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });

        return response.text || "Could not critique strategy.";
    } catch (e) {
        return "Critique failed.";
    }
};

export const transcribeAudioNote = async (base64Audio: string): Promise<{ text: string; sentiment: string }> => {
  if (!ai) return { text: "AI Unavailable", sentiment: "Neutral" };
  try {
    const base64Data = base64Audio.split(',')[1] || base64Audio;
    // We assume the browser records in webm, but Gemini handles various formats.
    // mimeType 'audio/webm' is standard for MediaRecorder.
    
    const prompt = `
      Transcribe this audio recording of a trader's notes.
      Also, analyze the tone and extract a single word Sentiment tag (e.g., Frustrated, Confident, Anxious, Calm, Euphoric).
      
      Output JSON:
      {
        "text": "The transcribed text...",
        "sentiment": "Confident"
      }
      
      Only output the JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/webm', data: base64Data } }, 
          { text: prompt }
        ]
      }
    });

    const jsonText = response.text || "{}";
    const cleanJson = jsonText.match(/\{[\s\S]*\}/)?.[0] || "{}";
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Transcription failed", e);
    return { text: "Audio transcription failed.", sentiment: "Unknown" };
  }
};

export const validateTradeAgainstStrategy = async (trade: any, strategyRules: string): Promise<{ valid: boolean; reason: string }> => {
  if (!ai) return { valid: true, reason: "AI Unavailable" };
  
  const prompt = `
    You are a Risk Manager. Validate this trade against the user's Strategy Rules.
    
    Strategy Rules:
    "${strategyRules}"
    
    Trade Details:
    Pair: ${trade.pair}
    Direction: ${trade.direction}
    Session: ${trade.session}
    Notes/Context: ${trade.notes}
    
    Does this trade violate the strategy? 
    Strictly output JSON:
    {
      "valid": boolean,
      "reason": "Short explanation if invalid, otherwise 'Looks good'"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4096 }
      }
    });

    const jsonText = response.text || "{}";
    const cleanJson = jsonText.match(/\{[\s\S]*\}/)?.[0] || "{}";
    return JSON.parse(cleanJson);
  } catch (e) {
    return { valid: true, reason: "Validation skipped (Error)" };
  }
};

export const parseTradeFromNaturalLanguage = async (text: string): Promise<Partial<Trade>> => {
    if (!ai) return {};
    
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
    if (!ai) return "AI Coach Unavailable. Please set VITE_API_KEY in Vercel.";
  
    try {
      const parts: any[] = [];
      
      let context = "You are an expert trading coach and technical analyst. Be concise, professional, and helpful. If an image is provided, analyze the chart market structure, liquidity zones, and price action patterns.\n\n";
      
      // Add History
      if (history.length > 0) {
          context += "Previous conversation:\n" + history.slice(-6).map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n') + "\n\n";
      }
      
      // Add Image if present
      if (image) {
          const base64Data = image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");
          parts.push({
              inlineData: {
                  mimeType: 'image/png', // Gemini supports png/jpeg/webp
                  data: base64Data
              }
          });
          context += "[User has uploaded a chart image for analysis].\n";
      }
      
      context += "User Query: " + newMessage;
      parts.push({ text: context });
  
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts },
        config: {
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });
  
      return response.text || "No response.";
    } catch (e) {
      console.error(e);
      return "Error connecting to AI Coach.";
    }
  };

export const getLiveMarketNews = async (): Promise<{sentiment: string, events: CalendarEvent[]}> => {
  if (!ai) {
      return { 
          sentiment: "Demo Mode: API Key missing. Please set VITE_API_KEY in Vercel environment variables to enable live data.", 
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

export const generateChallengeMotivation = async (day: number, challengeTitle: string): Promise<string> => {
    if (!ai) return "Stay hard. Stay disciplined.";
    try {
        const prompt = `
            You are a Stoic Trading Mentor and Drill Sergeant. 
            The user is on Day ${day} of the "${challengeTitle}" challenge.
            
            Give them a short, punchy (1-2 sentences) motivational quote or directive to stay the course.
            If Day 1: Welcome to hell/glory.
            If Day 7/14/etc: Acknowledge the milestone.
            If middle days: Remind them why they started.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { thinkingConfig: { thinkingBudget: 4096 } }
        });
        return response.text || "Keep pushing.";
    } catch(e) {
        return "Discipline equals freedom.";
    }
};
