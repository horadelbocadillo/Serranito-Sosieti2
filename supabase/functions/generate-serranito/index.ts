// Supabase Edge Function: generate-serranito
// Genera una descripcion creativa del serranito perfecto del usuario usando IA
// Si no hay API key configurada, devuelve una descripcion generada localmente

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface QuizSelections {
  carne: string;
  pan: string;
  otrosIngredientes: string[];
  extras: string[];
}

interface RequestBody {
  selections: QuizSelections;
  name: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Content-Type": "application/json",
};

// Mapa de ingredientes a nombres legibles
const ingredientNames: Record<string, string> = {
  // Carnes
  lomo: "lomo de cerdo",
  pollo: "pollo",
  ternera: "ternera",
  // Panes
  viena: "pan de Viena",
  brioche: "pan brioche",
  // Otros ingredientes
  tomate: "tomate",
  pimiento: "pimiento frito",
  jamon: "jamon serrano",
  patatas: "patatas fritas",
  // Extras
  mayonesa: "mayonesa",
  alioli: "alioli",
  mojo: "mojo picon",
  tortilla: "tortilla francesa",
  patatas_dentro: "patatas dentro del pan",
  sin_guarnicion: "sin guarnicion",
};

const getIngredientName = (id: string): string => ingredientNames[id] || id;

// Genera descripcion local sin IA (fallback)
const generateLocalDescription = (selections: QuizSelections, name: string): string => {
  const parts: string[] = [];

  parts.push(`Tu serranito perfecto es "${name}".`);

  // Base
  parts.push(
    `Un ${getIngredientName(selections.carne)} jugoso en ${getIngredientName(selections.pan)} crujiente`
  );

  // Otros ingredientes
  if (selections.otrosIngredientes.length > 0) {
    const ingredientesText = selections.otrosIngredientes.map(getIngredientName).join(", ");
    parts.push(`con ${ingredientesText}`);
  }

  // Extras (sin incluir sin_guarnicion en la lista)
  const extrasFiltered = selections.extras.filter(e => e !== "sin_guarnicion");
  if (extrasFiltered.length > 0) {
    const extrasText = extrasFiltered.map(getIngredientName).join(" y ");
    parts.push(`y los toques especiales de ${extrasText}`);
  }

  // Si eligio sin guarnicion
  if (selections.extras.includes("sin_guarnicion")) {
    parts.push("Sin guarnicion, porque el serranito ya es suficiente.");
  }

  // Personalidad
  if (selections.extras.includes("patatas_dentro")) {
    parts.push("Eres de los valientes que no temen meter las patatas dentro.");
  } else if (selections.otrosIngredientes.length === 0 && selections.extras.length === 0) {
    parts.push("Un purista de corazon, respetas la tradicion sevillana.");
  }

  return parts.join(" ");
};

// Genera descripcion usando Claude API
const generateWithClaude = async (
  selections: QuizSelections,
  name: string,
  apiKey: string
): Promise<string> => {
  const ingredientsList = [
    `Carne: ${getIngredientName(selections.carne)}`,
    `Pan: ${getIngredientName(selections.pan)}`,
    selections.otrosIngredientes.length > 0
      ? `Ingredientes: ${selections.otrosIngredientes.map(getIngredientName).join(", ")}`
      : "Sin ingredientes adicionales",
    selections.extras.length > 0
      ? `Extras: ${selections.extras.map(getIngredientName).join(", ")}`
      : "Sin extras",
  ].join("\n");

  const prompt = `Eres un experto en gastronomia andaluza con un toque de humor sevillano.
Un usuario ha creado su serranito perfecto llamado "${name}" con estos ingredientes:

${ingredientsList}

Genera una descripcion divertida y creativa de 2-3 frases sobre este serranito y la personalidad de quien lo eligiria.
Usa un tono coloquial andaluz pero sin pasarte. No uses emojis.
Solo devuelve la descripcion, sin introduccion ni explicacion adicional.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || "";
};

// Genera descripcion usando OpenAI API
const generateWithOpenAI = async (
  selections: QuizSelections,
  name: string,
  apiKey: string
): Promise<string> => {
  const ingredientsList = [
    `Carne: ${getIngredientName(selections.carne)}`,
    `Pan: ${getIngredientName(selections.pan)}`,
    selections.otrosIngredientes.length > 0
      ? `Ingredientes: ${selections.otrosIngredientes.map(getIngredientName).join(", ")}`
      : "Sin ingredientes adicionales",
    selections.extras.length > 0
      ? `Extras: ${selections.extras.map(getIngredientName).join(", ")}`
      : "Sin extras",
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en gastronomia andaluza con un toque de humor sevillano. Responde en espanol con tono coloquial pero sin pasarte.",
        },
        {
          role: "user",
          content: `Un usuario ha creado su serranito perfecto llamado "${name}" con estos ingredientes:\n\n${ingredientsList}\n\nGenera una descripcion divertida y creativa de 2-3 frases sobre este serranito y la personalidad de quien lo eligiria. No uses emojis. Solo devuelve la descripcion.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Metodo no permitido" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { selections, name } = body;

    if (!selections || !name) {
      return new Response(
        JSON.stringify({ error: "Faltan datos requeridos" }),
        { status: 400, headers: corsHeaders }
      );
    }

    let description = "";

    // Intentar con Claude API primero
    const claudeKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (claudeKey) {
      try {
        description = await generateWithClaude(selections, name, claudeKey);
      } catch (e) {
        console.error("Error con Claude API:", e);
      }
    }

    // Si no funciono Claude, intentar con OpenAI
    if (!description) {
      const openaiKey = Deno.env.get("OPENAI_API_KEY");
      if (openaiKey) {
        try {
          description = await generateWithOpenAI(selections, name, openaiKey);
        } catch (e) {
          console.error("Error con OpenAI API:", e);
        }
      }
    }

    // Fallback a generacion local
    if (!description) {
      console.log("Usando generacion local (sin API keys configuradas)");
      description = generateLocalDescription(selections, name);
    }

    return new Response(JSON.stringify({ description }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    console.error("Error en generate-serranito:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Error interno",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
