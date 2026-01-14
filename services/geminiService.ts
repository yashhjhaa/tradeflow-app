import { GoogleGenAI } from "@google/genai";
import { Trade, CalendarEvent, ChatMessage, DisciplineLog } from "../types";

// --- CONFIGURATION ---
// STRICT INITIALIZATION: As per rules, API Key must come from process.env.API_KEY
// The vite.config.ts ensures this value is populated from env.API_KEY, VITE_API_KEY, etc.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.warn("Gemini API Key is missing or empty. AI features will be unavailable.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- ROBUST FALLBACK WRAPPER ---
// If the Pro model (Thinking Mode) fails due to timeouts/availability (XHR Error),
// automatically fallback to Flash to keep the app functional.
const generateWithFallback = async (
  primaryModel: string, 
  args: any, 
  fallbackModel: string = 'gemini-2.5-flash'
) => {
  if (!ai) throw new Error("AI not initialized");

  try {
    return await ai.models.generateContent({
      model: primaryModel,
      ...args
    });
  } catch (error: any) {
    console.warn(`Primary model ${primaryModel} failed. Falling back to ${fallbackModel}. Error:`, error);
    
    // Clean config for fallback (Flash doesn't support thinkingConfig)
    const { config, ...rest } = args;
    const fallbackConfig = { ...config };
    if (fallbackConfig.thinkingConfig) {
      delete fallbackConfig.thinkingConfig;
    }

    // Retry with fallback
    return await ai.models.generateContent({
      model: fallbackModel,
      config: fallbackConfig,
      ...rest
    });
  }
};

export const analyzeTradePsychology = async (trade: Trade): Promise<string> => {
  if (!ai) return "AI Unavailable. (API Key Missing)";

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

    // Using Flash for speed and stability as primary for this frequent task
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text || "Could not generate analysis.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `AI Analysis failed: ${error.message || "Check connection"}`;
  }
};

export const analyzeDeepPsychology = async (trade: Trade): Promise<string> => {
    if (!ai) return "AI Unavailable. (API Key Missing)";

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

        // Using Flash for immediate feedback in the Psychology Lab
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text || "Could not generate deep analysis.";
    } catch (error: any) {
        console.error("Deep Analysis Error:", error);
        return `Analysis failed: ${error.message || "Check connection"}`;
    }
};

export const analyzeTradeScreenshot = async (base64Image: string, pair: string): Promise<string> => {
  if (!ai) return "AI Vision Unavailable (API Key Missing)";

  try {
    const base64Data = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");

    // Vision tasks are best on Flash 2.5 currently.
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

      // Use Flash for standard text generation tasks to avoid timeout/preview limits
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
  
      return response.text || "Review unavailable.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Failed to generate review.";
    }
}

export const generateTradingStrategy = async (concept: string): Promise<string> => {
    if (!ai) return "AI Unavailable. (API Key Missing)";

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

        const response = await generateWithFallback(
            'gemini-3-pro-preview',
            {
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 16384 }
                }
            }
        );

        return response.text || "Could not generate strategy.";
    } catch (e) {
        return "Strategy generation failed. Check connection.";
    }
};

export const suggestStrategyFromPerformance = async (winningTrades: Trade[]): Promise<string> => {
    if (!ai) return "Focus on trend following.";
    if (winningTrades.length < 3) return "Log more winning trades to unlock AI suggestions.";

    try {
        // Prepare trade summary
        const tradeSummary = winningTrades.slice(0, 10).map(t => 
            `Pair: ${t.pair}, Session: ${t.session}, Setup Tag: ${t.setup}, Notes: ${t.notes}`
        ).join('\n---\n');

        const prompt = `
            You are a Strategy Architect. I will provide a list of my WINNING trades.
            Analyze the common patterns in these trades (time of day, pairs, specific setups mentioned in notes).
            
            Synthesize these patterns into a single, cohesive "Strategy Concept" that I can use to build a playbook entry.
            
            Winning Trades Data:
            ${tradeSummary}
            
            Output a concise 1-2 sentence description of the strategy I should formalize (e.g. "Focus on NY Session breakouts on EURUSD...").
            Do not write the full strategy, just the concept description.
        `;

        const response = await generateWithFallback(
            'gemini-3-pro-preview',
            {
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 8192 }
                }
            }
        );

        return response.text || "Focus on your best performing setups.";
    } catch (e) {
        return "Could not analyze performance.";
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
        // Using Flash for speed on simple extraction
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
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
        const response = await generateWithFallback(
            'gemini-3-pro-preview',
            {
                contents: prompt,
                config: { thinkingConfig: { thinkingBudget: 8192 } }
            }
        );
        return response.text || "Avoid high impact news events.";
    } catch(e) {
        return "Avoid News Events.";
    }
};

export const critiqueTradingStrategy = async (strategy: string): Promise<string> => {
    if (!ai) return "AI Unavailable. (API Key Missing)";

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

        const response = await generateWithFallback(
            'gemini-3-pro-preview',
            {
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 16384 }
                }
            }
        );

        return response.text || "Could not critique strategy.";
    } catch (e) {
        return "Critique failed. Check connection.";
    }
};

export const transcribeAudioNote = async (base64Audio: string): Promise<{ text: string; sentiment: string }> => {
  if (!ai) return { text: "AI Unavailable", sentiment: "Neutral" };
  try {
    const base64Data = base64Audio.split(',')[1] || base64Audio;
    
    const prompt = `
      Transcribe this audio recording of a trader's notes.
      Also, analyze the tone and extract a single word Sentiment tag (e.g., Frustrated, Confident, Anxious, Calm, Euphoric).
      
      Output JSON:
      {
        "text": "The transcribed text...",
        "sentiment": "Confident"
      }
      
      IMPORTANT: Ensure no unescaped double quotes are used inside the JSON string values.
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
        model: 'gemini-2.5-flash',
        contents: prompt
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
    if (!ai) return "AI Coach Unavailable. Please check API Key configuration.";
  
    try {
      const parts: any[] = [];
      
      let context = "You are an expert trading coach and technical analyst. Be concise, professional, and helpful. If an image is provided, analyze the chart market structure, liquidity zones, and price action patterns.\n\n";
      
      if (history.length > 0) {
          context += "Previous conversation:\n" + history.slice(-6).map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n') + "\n\n";
      }
      
      if (image) {
          const base64Data = image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");
          parts.push({
              inlineData: {
                  mimeType: 'image/png', 
                  data: base64Data
              }
          });
          context += "[User has uploaded a chart image for analysis].\n";
      }
      
      context += "User Query: " + newMessage;
      parts.push({ text: context });
  
      const response = await generateWithFallback(
          'gemini-3-pro-preview',
          {
            contents: { parts },
            config: {
                thinkingConfig: { thinkingBudget: 16384 }
            }
          }
      );
  
      return response.text || "No response.";
    } catch (e) {
      console.error(e);
      return "Error connecting to AI Coach.";
    }
  };

export const getLiveMarketNews = async (): Promise<{sentiment: string, events: CalendarEvent[]}> => {
  if (!ai) {
      return { 
          sentiment: "Demo Mode: AI Key missing.", 
          events: [
              { id: '1', time: '08:30 AM', currency: 'USD', impact: 'High', event: 'CPI m/m', actual: '0.4%', forecast: '0.3%', previous: '0.4%', isBetter: false },
              { id: '2', time: '02:00 PM', currency: 'USD', impact: 'High', event: 'FOMC Statement', actual: '', forecast: '', previous: '', isBetter: false },
          ] 
      };
  }

  try {
      // Flash 2.5 is sufficient and faster for Search
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `
            Retrieve the upcoming High Impact "Red Folder" economic calendar events for the current week.
            Focus on major pairs (USD, EUR, GBP, JPY).
            
            Provide:
            1. A short "Weekly Outlook" summary (2 sentences).
            2. A list of 5-7 HIGH IMPACT events.

            Strictly output valid JSON format:
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
                   "isBetter": boolean
                }
              ]
            }

            CRITICAL FORMATTING RULES:
            1. The response MUST be valid JSON.
            2. Property names must be in DOUBLE quotes (e.g., "sentiment", "events").
            3. String values must be in DOUBLE quotes (e.g., "The market is...").
            4. If you need to use quotes INSIDE a string value, use SINGLE quotes (e.g., "The 'Red Folder' events..."). 
            5. Do NOT use single quotes for JSON structure.
            6. Do not include markdown formatting (like \`\`\`json). Just the raw JSON object.
          `,
          config: {
              tools: [{ googleSearch: {} }],
          }
      });

      const jsonText = response.text || "{}";
      // Enhance cleaning to remove possible markdown
      const cleanText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let finalJson = cleanText;
      if (cleanText.startsWith("'") || cleanText.includes("'sentiment'")) {
           finalJson = cleanText.replace(/'/g, '"'); 
      }

      const jsonMatch = finalJson.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : "{}";
      
      let data;
      try {
        data = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error("JSON Parse Error", parseError, cleanJson);
        return { sentiment: "Error parsing live market data.", events: [] };
      }
      
      return {
          sentiment: data.sentiment || "Market data currently unavailable.",
          events: data.events || []
      };
  } catch (e) {
      console.error(e);
      return { 
          sentiment: "Data unavailable (Connection Error).", 
          events: [] 
      };
  }
}

export const generateChallengeMotivation = async (day: number, challengeTitle: string): Promise<string> => {
    if (!ai) return "Stay hard. Stay disciplined.";
    try {
        const prompt = `
            You are a Stoic Trading Mentor. 
            The user is on Day ${day} of the "${challengeTitle}" challenge.
            Give them a short, punchy (1-2 sentences) motivational directive.
        `;
        const response = await generateWithFallback(
            'gemini-3-pro-preview',
            {
                contents: prompt,
                config: { thinkingConfig: { thinkingBudget: 4096 } }
            }
        );
        return response.text || "Keep pushing.";
    } catch(e) {
        return "Discipline equals freedom.";
    }
};

export const reframeNegativeThought = async (thought: string): Promise<string> => {
    if (!ai) return "Focus on what you can control: your process, not the outcome.";
    try {
        const prompt = `
            You are a Cognitive Behavioral Therapist specializing in trading psychology.
            The trader has a negative/limiting thought: "${thought}".
            
            Provide a "Cognitive Reframe" - a more productive, logical, and stoic way to view this situation.
            Keep it short (max 2 sentences), punchy, and empowering.
        `;
        // Using Flash for speed/availability
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "Focus on the process.";
    } catch(e) {
        return "Focus on the process.";
    }
};

export const generateWeeklyReportInsight = async (trades: Trade[], discipline: DisciplineLog[], startOfWeek: Date): Promise<string> => {
    if (!ai) return "AI Analyst Unavailable (API Key Missing).";

    try {
        const weekEnd = new Date(startOfWeek);
        weekEnd.setDate(startOfWeek.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // Filter provided arrays again just to be safe, though caller should handle
        const weeklyTrades = trades.filter(t => {
            const d = new Date(t.date);
            return d >= startOfWeek && d <= weekEnd;
        });

        const weeklyDiscipline = discipline.filter(d => {
            const dDate = new Date(d.date);
            return dDate >= startOfWeek && dDate <= weekEnd;
        });

        if (weeklyTrades.length === 0) return "No trades recorded for this week. No analysis possible.";

        // Construct a DETAILED daily summary
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let dailySummary = "";
        
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            const dateStr = currentDay.toISOString().split('T')[0];
            const dayName = days[currentDay.getDay()];
            
            const dayTrades = weeklyTrades.filter(t => t.date.startsWith(dateStr));
            const dayLog = weeklyDiscipline.find(d => d.date === dateStr);
            
            if (dayTrades.length > 0 || dayLog) {
                dailySummary += `\n### ${dayName} (${dateStr})\n`;
                if (dayLog) {
                    dailySummary += `  - Mood: ${dayLog.mood}/100\n`;
                    dailySummary += `  - Followed Plan: ${dayLog.followedPlan ? 'YES' : 'NO'}\n`;
                    dailySummary += `  - Notes: "${dayLog.notes || 'None'}"\n`;
                } else {
                    dailySummary += `  - No journal entry.\n`;
                }
                
                if (dayTrades.length > 0) {
                    dayTrades.forEach(t => {
                        dailySummary += `  - Trade: ${t.direction} ${t.pair} | Result: ${t.outcome} (${t.pnl}) | Setup: ${t.setup || 'None'} | Notes: "${t.notes}"\n`;
                    });
                } else {
                    dailySummary += `  - No trades taken.\n`;
                }
            }
        }

        const prompt = `
            You are a Chief Investment Officer (CIO) and Performance Psychologist conducting a deep-dive Weekly Board Meeting review.
            
            Review Data:
            ${dailySummary}
            
            Your Task:
            Write a detailed, day-by-day analysis of the week.
            
            Structure the response strictly as follows (Markdown):
            
            ## 1. Executive Summary
            (A brief high-level overview of profitability, win rate, and mental state for the week.)

            ## 2. Daily Breakdown
            (For EACH day provided in the data that had trades or significant journal entries, write a dedicated bullet point or short paragraph. Analyze specifically what was done well and what was a mistake that day.)
            *   **Monday:** ...
            *   **Tuesday:** ...
            (etc...)

            ## 3. Key Strengths (What to Keep)
            (Bullet points of what the trader is doing right.)

            ## 4. Critical Weaknesses (What to Fix)
            (Bullet points of specific errors found in the daily data.)

            ## 5. Strategic Directive
            (One final command for next week.)
            
            Tone: Professional, stern, extremely specific to the trade details provided. Do not be generic.
        `;

        const response = await generateWithFallback(
            'gemini-3-pro-preview',
            {
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 16384 } // High budget for deep analysis
                }
            }
        );

        return response.text || "Report generation failed.";
    } catch (error: any) {
        console.error("Weekly Report Error:", error);
        return "Failed to generate weekly report.";
    }
};
