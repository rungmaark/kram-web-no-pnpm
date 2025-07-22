// lib/infer-mbti.ts
export async function inferMbtiByGPT(text: string): Promise<string | null> {
    const prompt = `
  You are an MBTI classifier. 
  Given a short Thai or English description of a person, respond with *only* the most probable MBTI code (e.g. INTJ) or "null" if uncertain.
  Description: "${text}"
  Answer:
    `.trim();
  
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        max_tokens: 4,
        temperature: 0,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
      }),
    });
  
    const data = await res.json();
    const code = data.choices?.[0]?.message?.content?.trim().toUpperCase() || "";
    return /^[E|I][S|N][F|T][J|P]$/.test(code) || /^[E|I][S|N][F|T][J|P]{3}$/.test(code)
      ? code
      : null;
  }
  