// Função serverless da Vercel: intermedia as chamadas à IA sem expor a chave.
const MAX_CHARS = 30000;
const MAX_TOKENS = 1500;

function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(obj));
}

async function readBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === "string") return JSON.parse(req.body);
    if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString("utf8"));
    return req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 200000) throw new Error("too_large");
    chunks.push(c);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

module.exports = async function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY;

  if (req.method === "GET") {
    return send(res, 200, { ok: true, servidor: !!key });
  }
  if (req.method !== "POST") {
    res.setHeader("allow", "GET, POST");
    return send(res, 405, { error: "Método não permitido." });
  }
  if (!key) {
    return send(res, 503, { error: "IA não configurada no servidor." });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return send(res, 400, { error: "JSON inválido." });
  }
  if (!body || typeof body !== "object") {
    return send(res, 400, { error: "JSON inválido." });
  }

  const system = typeof body.system === "string" ? body.system : "";
  const user = typeof body.user === "string" ? body.user : "";
  if (!user.trim()) {
    return send(res, 400, { error: "Campo 'user' é obrigatório." });
  }
  if (system.length + user.length > MAX_CHARS) {
    return send(res, 413, {
      error: "Texto muito longo (máx. 30.000 caracteres).",
    });
  }
  let maxTokens = parseInt(body.maxTokens, 10);
  if (!Number.isFinite(maxTokens) || maxTokens < 1) maxTokens = 1200;
  maxTokens = Math.min(maxTokens, MAX_TOKENS);

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
        max_tokens: maxTokens,
        ...(system ? { system } : {}),
        messages: [{ role: "user", content: user }],
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = (j && j.error && j.error.message) || "HTTP " + r.status;
      console.error(
        "Erro da Anthropic:",
        r.status,
        j && j.error && j.error.type,
      );
      return send(res, r.status >= 500 ? 502 : r.status, { error: msg });
    }
    const text = (j.content || []).map((c) => c.text || "").join("");
    return send(res, 200, { text });
  } catch (e) {
    console.error("Falha ao chamar a IA:", e && e.name);
    return send(res, 502, { error: "Falha ao contatar o serviço de IA." });
  }
};
