const SYSTEM_PROMPT = `You are Chaptr, a personal relationship intelligence assistant.
You help users understand people in their lives through pattern recognition and honest analysis.
You reason ONLY from what the user has shared. You never invent patterns.
You are warm but direct — like a smart, honest friend who has been paying attention.
Always respond in valid JSON only. No preamble. No markdown. No explanation outside JSON.`;

export type TrustScore = {
  level: 'High' | 'Medium' | 'Low' | 'Uncertain';
  reason: string;
};

export type CharacterSummary = {
  summary: string;
  strengths: string[];
  watchouts: string[];
};

export type TraitExtraction = {
  positive: string[];
  negative: string[];
  category: 'positive_trait' | 'negative_trait' | 'trust_event' | 'pattern' | 'one_off';
};

export type JudgementResponse = {
  pattern: string;
  relevant_incidents: string[];
  my_read: string;
  bias_check: 'too_harsh' | 'too_lenient' | 'balanced';
  bias_note: string;
  recommendation: string;
};

export type PatternAlert = {
  detected: boolean;
  pattern_text: string;
};

// ─── Groq (Primary — works on Vercel) ────────────────────────────────────────
async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Groq error (${res.status}):`, errText);
    throw new Error(`Groq error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// ─── Ollama (Optional — local dev only) ───────────────────────────────────────
async function callOllama(prompt: string): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL;
  if (!baseUrl) throw new Error('OLLAMA_BASE_URL not set');

  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || 'llama3',
      prompt,
      stream: false,
      system: SYSTEM_PROMPT,
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.response;
}

// ─── Smart dispatcher: Groq first, Ollama as local fallback ──────────────────
export async function callAI(prompt: string): Promise<string> {
  // Try Groq first (works everywhere including Vercel)
  if (process.env.GROQ_API_KEY) {
    try {
      return await callGroq(prompt);
    } catch (groqErr) {
      console.warn('Groq failed, trying Ollama fallback:', groqErr);
    }
  }
  // Fall back to local Ollama if available
  if (process.env.OLLAMA_BASE_URL) {
    return await callOllama(prompt);
  }
  throw new Error('No AI provider configured. Set GROQ_API_KEY or OLLAMA_BASE_URL.');
}


function buildContext(
  name: string,
  relationship: string,
  logs: { content: string; category: string; created_at: string }[]
): string {
  const logText = logs
    .map(
      (l, i) =>
        `${i + 1}. [${l.category}] ${l.content} (${new Date(l.created_at).toDateString()})`
    )
    .join('\n');
  return `Person: ${name}\nRelationship: ${relationship}\nTotal logs: ${logs.length}\n\nLog history:\n${logText}`;
}

function parseJSON<T>(raw: string): T {
  return JSON.parse(raw.replace(/```json|```/g, '').trim()) as T;
}

export async function getTrustScore(
  name: string,
  relationship: string,
  logs: { content: string; category: string; created_at: string }[]
): Promise<TrustScore> {
  const context = buildContext(name, relationship, logs);
  const prompt = `${context}\n\nBased on this history, calculate a trust score.\nRespond ONLY with this JSON:\n{"level":"High|Medium|Low|Uncertain","reason":"one concise sentence explaining why"}`;
  const raw = await callAI(prompt);
  return parseJSON<TrustScore>(raw);
}

export async function getCharacterSummary(
  name: string,
  relationship: string,
  logs: { content: string; category: string; created_at: string }[]
): Promise<CharacterSummary> {
  const context = buildContext(name, relationship, logs);
  const prompt = `${context}\n\nWrite a character summary for this person.\nRespond ONLY with this JSON:\n{"summary":"3-4 sentence paragraph about who this person is","strengths":["s1","s2"],"watchouts":["w1","w2"]}`;
  const raw = await callAI(prompt);
  return parseJSON<CharacterSummary>(raw);
}

export async function extractTraits(
  logContent: string,
  existingLogs: { content: string; category: string; created_at: string }[]
): Promise<TraitExtraction> {
  const context =
    existingLogs.length > 0
      ? `Previous logs:\n${existingLogs
          .slice(-5)
          .map((l) => l.content)
          .join('\n')}\n\n`
      : '';
  const prompt = `${context}New incident: "${logContent}"\n\nExtract traits from this new incident.\nRespond ONLY with this JSON:\n{"positive":["trait1"],"negative":["trait1"],"category":"positive_trait|negative_trait|trust_event|pattern|one_off"}`;
  const raw = await callAI(prompt);
  return parseJSON<TraitExtraction>(raw);
}

export async function getJudgement(
  question: string,
  name: string,
  relationship: string,
  logs: { content: string; category: string; created_at: string }[]
): Promise<JudgementResponse> {
  const context = buildContext(name, relationship, logs);
  const prompt = `${context}\n\nUser question: "${question}"\n\nAnswer this question about ${name} based on their history.\nRespond ONLY with this JSON:\n{"pattern":"what their history consistently shows","relevant_incidents":["incident1","incident2"],"my_read":"honest assessment","bias_check":"too_harsh|too_lenient|balanced","bias_note":"explain if user seems biased","recommendation":"one clear actionable suggestion"}`;
  const raw = await callAI(prompt);
  return parseJSON<JudgementResponse>(raw);
}

export async function detectPattern(
  name: string,
  relationship: string,
  logs: { content: string; category: string; created_at: string }[]
): Promise<PatternAlert> {
  if (logs.length < 3) return { detected: false, pattern_text: '' };
  const context = buildContext(name, relationship, logs);
  const prompt = `${context}\n\nDo you detect any recurring behavioral pattern in the last 3-5 logs?\nRespond ONLY with this JSON:\n{"detected":true,"pattern_text":"short description of pattern, or empty string if none"}`;
  const raw = await callAI(prompt);
  return parseJSON<PatternAlert>(raw);
}
