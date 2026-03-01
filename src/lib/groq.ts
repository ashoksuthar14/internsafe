const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function callGroqAgent(
  systemPrompt: string,
  userContent: string,
  apiKey: string
): Promise<any> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch {
    throw new Error("Failed to parse agent response as JSON");
  }
}

export function getApiKey(): string | null {
  return localStorage.getItem("groq_api_key");
}

export function setApiKey(key: string) {
  localStorage.setItem("groq_api_key", key);
}

export async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "Say hi" }],
        max_tokens: 10,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
