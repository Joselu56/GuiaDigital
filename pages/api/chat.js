// pages/api/chat.js
// ─────────────────────────────────────────────────────────
// ARQUITECTURA HÍBRIDA ADAPTADA A GEMINI:
//   1. Busca en base de conocimiento local (guias.json)
//   2. Si encuentra respuesta → la devuelve directamente
//   3. Si no encuentra → llama a Google Gemini con el contexto local
// ─────────────────────────────────────────────────────────

import { evaluar, construirContextoParaGPT } from "../../lib/conocimiento"; //

export default async function handler(req, res) {
  if (req.method !== "POST") { //
    return res.status(405).json({ error: "Método no permitido" }); //
  }

  const { messages, location } = req.body; //

  if (!messages || !Array.isArray(messages) || messages.length === 0) { //
    return res.status(400).json({ error: "Mensajes inválidos" }); //
  }

  // Tomar la última pregunta del usuario
  const ultimaPregunta = messages
    .filter(m => m.role === "user")
    .pop()?.content || ""; //

  const loc = typeof location === "string" ? location.slice(0, 80) : "Argentina"; //

  // ─────────────────────────────────────────────────────
  // PASO 1: Buscar en base local
  // ─────────────────────────────────────────────────────
  const evaluacion = evaluar(ultimaPregunta); //

  if (evaluacion.fuente === "local") { //
    console.log("[chat] Respondido desde base local:", ultimaPregunta.slice(0, 60)); //
    return res.status(200).json({
      reply: evaluacion.respuesta,
      fuente: "local",
    }); //
  }

  // ─────────────────────────────────────────────────────
  // PASO 2: No encontrado localmente → llamar a Google Gemini
  // ─────────────────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY; 
  
  // Línea de prueba diagnóstica en consola
  console.log("[DEBUG] ¿La clave existe?:", apiKey ? "SÍ (empieza con " + apiKey.slice(0, 5) + "...)" : "NO, ES UNDEFINED");
  
  if (!apiKey) {
    return res.status(500).json({
      error: "El asistente no está configurado correctamente. Por favor llame al 0800-333-1234.", //
    });
  }

  // Construir contexto de guías relevantes
  const contextoLocal = construirContextoParaGPT(ultimaPregunta); //

  // Mapeamos el historial al formato que entiende la API nativa de Gemini (user / model)
  const historialFiltrado = messages
    .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0) //
    .slice(-10); //

  const contentsForGemini = historialFiltrado.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  // System prompt adaptado a las directrices de Gemini
  const systemPrompt = `Sos el asistente de "Conexión Senior", un sitio argentino para ayudar a adultos mayores con la tecnología. El usuario está en: ${loc}.

REGLAS ESTRICTAS:
- Siempre hablar de "usted", nunca de "vos" o "tú"
- Español rioplatense, tono muy cálido, paciente y respetuoso
- Frases cortas y simples, sin tecnicismos
- Nunca decir "login" (decir "ingresar sus datos"), nunca "click" (decir "toque" o "presione")
- Cuando expliques pasos, numerarlos: 1, 2, 3...
- Si el usuario parece confundido, mencionar el teléfono 0800-333-1234
- Nunca pedir contraseñas ni datos de tarjeta
- Si hay información local relevante para ${loc}, mencionarla
- Máximo 5 pasos por respuesta; si son más, resumir los menos importantes

${contextoLocal ? `INFORMACIÓN DE REFERENCIA (usar como base para responder):\n${contextoLocal}` : ""}`; //

  try {
    console.log("[chat] Derivando a Google Gemini:", ultimaPregunta.slice(0, 60)); //

    // URL oficial del endpoint de generación de contenido de Gemini 2.5 Flash
    const urlGemini = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`; //

    const response = await fetch(urlGemini, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contentsForGemini, //
        systemInstruction: {
          parts: [{ text: systemPrompt }] //
        },
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.4, //
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); //
      console.error("[chat] Error Gemini API:", response.status, errorData); //
      throw new Error(`Gemini error ${response.status}`); //
    }

    const data = await response.json(); //
    
    // Navegamos la estructura de respuesta nativa de Google Gemini
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || ""; //

    if (!reply) throw new Error("Respuesta vacía de Gemini"); //

    return res.status(200).json({ reply, fuente: "gemini" }); //

  } catch (error) {
    console.error("[chat] Error llamando a Gemini:", error.message); //
    return res.status(500).json({
      error: "No pudimos conectar con el asistente en este momento. Por favor intente de nuevo o llame al 0800-333-1234.", //
    });
  }
}