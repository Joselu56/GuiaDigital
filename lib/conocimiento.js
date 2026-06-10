// lib/conocimiento.js
// ─────────────────────────────────────────────────────────
// Motor de búsqueda local sobre guias.json
// Se ejecuta en el servidor (pages/api/chat.js) antes de
// llamar a ChatGPT. Si encuentra una guía relevante,
// la devuelve como contexto o como respuesta directa.
// ─────────────────────────────────────────────────────────

import guiasData from "../data/guias.json";

const { guias, glosario } = guiasData;

// ─────────────────────────────────────────────────────────
// Normalizar texto: minúsculas, sin tildes, sin puntuación
// ─────────────────────────────────────────────────────────
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // quitar tildes
    .replace(/[¿?¡!.,;:()]/g, " ")    // quitar puntuación
    .replace(/\s+/g, " ")
    .trim();
}

// ─────────────────────────────────────────────────────────
// Buscar guías relevantes para una pregunta
// Devuelve array de guías ordenadas por puntaje descendente
// ─────────────────────────────────────────────────────────
export function buscarGuias(pregunta) {
  const texto = normalizar(pregunta);
  const palabras = texto.split(" ").filter(p => p.length > 2);

  const resultados = guias.map(guia => {
    let puntaje = 0;

    // Buscar en palabrasClave de la guía
    for (const kw of guia.palabrasClave) {
      const kwNorm = normalizar(kw);
      if (texto.includes(kwNorm)) {
        // Coincidencia exacta de frase: puntaje alto
        puntaje += kwNorm.includes(" ") ? 10 : 5;
      }
    }

    // Buscar palabras sueltas de la pregunta en título y pasos
    const tituloNorm = normalizar(guia.titulo);
    for (const palabra of palabras) {
      if (tituloNorm.includes(palabra)) puntaje += 3;
      for (const paso of guia.pasos) {
        if (normalizar(paso.titulo).includes(palabra)) puntaje += 1;
        if (normalizar(paso.detalle).includes(palabra)) puntaje += 1;
      }
    }

    return { guia, puntaje };
  });

  return resultados
    .filter(r => r.puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje)
    .map(r => r.guia);
}

// ─────────────────────────────────────────────────────────
// Buscar términos de glosario relevantes en la pregunta
// ─────────────────────────────────────────────────────────
export function buscarGlosario(pregunta) {
  const texto = normalizar(pregunta);

  // 1. Conseguimos la lista de guías de forma segura. 
  // Si tu archivo importado se llama 'guiasData', usá esa variable.
  // Nos aseguramos con '|| []' de que si viene vacío, sea un array y no rompa con .filter()
  const listaGuias = guiasData.guias || []; 

  // 2. Filtramos usando la nueva estructura
  return listaGuias.filter(item => {
    // Verificamos el título de la guía (por ejemplo: "Cómo usar WhatsApp de forma segura")
    const tituloNorm = normalizar(item.titulo || "");
    if (texto.includes(tituloNorm)) return true;

    // Verificamos dentro de la lista 'palabrasClave' (que contiene el término y sus variantes)
    if (item.palabrasClave && Array.isArray(item.palabrasClave)) {
      return item.palabrasClave.some(palabra => {
        return texto.includes(normalizar(palabra));
      });
    }

    return false;
  });
}

// ─────────────────────────────────────────────────────────
// Formatear una guía como texto legible para el contexto
// que se envía a ChatGPT
// ─────────────────────────────────────────────────────────
export function formatearGuiaComoTexto(guia) {
  const pasos = guia.pasos
    .map((p, i) => `${i + 1}. ${p.titulo}: ${p.detalle}`)
    .join("\n");

  let texto = `GUÍA: ${guia.titulo}\n${pasos}`;

  if (guia.telefonoAyuda) {
    texto += `\nTeléfono de ayuda: ${guia.telefonoAyuda}`;
  }
  if (guia.urlOficial) {
    texto += `\nSitio web oficial: ${guia.urlOficial}`;
  }
  return texto;
}

// ─────────────────────────────────────────────────────────
// Función principal: evalúa si la pregunta puede responderse
// con la base local o necesita ir a ChatGPT
//
// Devuelve:
//   { fuente: "local", respuesta: "..." }   → responder sin API
//   { fuente: "gpt",   contexto: "..." }    → ir a ChatGPT con contexto
// ─────────────────────────────────────────────────────────
export function evaluar(pregunta) {
  const guiasEncontradas = buscarGuias(pregunta);
  const glosarioEncontrado = buscarGlosario(pregunta);

  // Si hay una guía con puntaje muy alto → respuesta local directa
  if (guiasEncontradas.length > 0) {
    const mejorGuia = guiasEncontradas[0];

    // Construir respuesta en lenguaje natural desde los pasos
    const pasos = mejorGuia.pasos
      .map((p, i) => `${i + 1}. ${p.titulo}\n   ${p.detalle}`)
      .join("\n\n");

    // SOLUCIÓN: Reemplazamos la frase estática por el título dinámico del JSON
    // Si mejorGuia.titulo existe, le agrega dos puntos al final. Si no, usa la frase anterior por seguridad.
    const introduccionDinamica = mejorGuia.titulo ? `${mejorGuia.titulo}:` : "Le explico paso a paso:";

    let respuesta = `${introduccionDinamica}\n\n${pasos}`;

    if (mejorGuia.telefonoAyuda) {
      respuesta += `\n\nSi necesita más ayuda, puede llamar al ${mejorGuia.telefonoAyuda} (es gratuito).`;
    }
    if (mejorGuia.urlOficial) {
      respuesta += `\n\nEl sitio oficial es: ${mejorGuia.urlOficial}`;
    }

    // Incluir contexto adicional de otras guías relevantes para la IA si hay más
    const contextoExtra = guiasEncontradas
      .slice(0, 3)
      .map(formatearGuiaComoTexto)
      .join("\n\n---\n\n");

    return {
      fuente: "local",
      respuesta,
      contexto: contextoExtra,   // se manda igual a GPT/Gemini como contexto adicional
    };
  }
  
  // ... (aquí continúa el resto de tu función evaluar si maneja el caso de que no encuentre guías)


  // Si hay términos de glosario → respuesta local directa
  if (glosarioEncontrado.length > 0) {
    const items = glosarioEncontrado
      .map(g => `${g.termino}: ${g.definicion}`)
      .join("\n\n");

    return {
      fuente: "local",
      respuesta: items,
      contexto: items,
    };
  }

  // No encontró nada → derivar a ChatGPT sin contexto local
  return {
    fuente: "gpt",
    contexto: "",
  };
}

// ─────────────────────────────────────────────────────────
// Construir el contexto completo para enviar a ChatGPT
// incluye las guías más relevantes como referencia
// ─────────────────────────────────────────────────────────
export function construirContextoParaGPT(pregunta) {
  const guiasEncontradas = buscarGuias(pregunta);
  const glosarioEncontrado = buscarGlosario(pregunta);

  const partes = [];

  if (guiasEncontradas.length > 0) {
    partes.push("INFORMACIÓN DE REFERENCIA SOBRE TRÁMITES ARGENTINOS:");
    guiasEncontradas.slice(0, 3).forEach(g => {
      partes.push(formatearGuiaComoTexto(g));
    });
  }

  if (glosarioEncontrado.length > 0) {
    partes.push("TÉRMINOS RELEVANTES:");
    glosarioEncontrado.forEach(g => {
      partes.push(`${g.termino}: ${g.definicion}`);
    });
  }

  return partes.join("\n\n");
}
