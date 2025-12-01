const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// 1. CHAT BOT
export const generateAIResponse = async (history: any[], newMessage: string) => {
  if (!API_KEY) return "Config Error";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));
  contents.push({ role: 'user', parts: [{ text: newMessage }] });

  const systemPrompt = `
  You are an empathetic conflict mediator talking to ONE partner privately.
  RULES:
  1. Listen and validate their feelings.
  2. Ask clarifying questions to understand the root cause.
  3. Keep responses short (under 50 words).
  4. CRITICAL: Do NOT give advice yet.
  5. If you have enough info (3-4 exchanges), say: "Thank you. I have a clear understanding now. Please click the button above to proceed."
  `;

  try {
    const response = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: systemPrompt }] } })
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Thinking...";
  } catch (e) { return "Connection Error"; }
};

// 2. BRIDGE SUMMARY (For the Invite Screen)
export const generateBridgeSummary = async (chatHistory: any[]) => {
  if (!API_KEY) return "a relationship matter";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  const text = chatHistory.map(m => m.content).join("\n");
  const prompt = `Read this private chat between a mediator and Partner A:\n${text}\n\nTASK: Summarize the *topic* of the conflict in 5-10 words. Be NEUTRAL. Do not reveal secrets. Example: "Communication regarding future plans".`;

  try {
    const response = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "important relationship topics";
  } catch (e) { return "important relationship topics"; }
};

// 3. FINAL REPORT (Shared Analysis)
export const generateFinalReport = async (chatA: any[], chatB: any[]) => {
  if (!API_KEY) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const textA = chatA.map(m => m.content).join("\n");
  const textB = chatB.map(m => m.content).join("\n");

  const prompt = `
  You are an expert mediator.
  PARTNER A: ${textA}
  PARTNER B: ${textB}
  TASK:
  1. Write a "Joint Analysis" validating BOTH sides.
  2. Write separate advice for A and B, explaining the OTHER person's feelings to build empathy.
  OUTPUT JSON: { "analysis": "...", "advice_for_a": "...", "advice_for_b": "..." }
  `;

  try {
    const response = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(raw.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (error) { return null; }
};