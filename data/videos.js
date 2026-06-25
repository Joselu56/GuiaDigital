// data/videos.js
// -------------------------------------------------------
// CATALOGO CENTRAL DE VIDEOS
// Para agregar un video nuevo, simplemente agregar un objeto
// a este array. No hay que tocar ningun otro archivo.
// -------------------------------------------------------

// TIPOS DISPONIBLES:
//   "youtube"  -> usar el ID del video (lo que va despues de ?v= en la URL)
//   "vimeo"    -> usar el ID numerico del video
//   "local"    -> usar la URL completa (Cloudflare R2 u otro servicio)

// CATEGORIAS DISPONIBLES:
//   "salud" | "estado" | "vida" | "celular" | "general"

export const videos = [
  {
    id: "v12",
    tipo: "youtube",
    videoId: "mlF3UyFau0I",          // <-- reemplazar con el ID real de YouTube
    titulo: "Como hacer una videollamada con sus nietos",
    descripcion: "Paso a paso en WhatsApp y FaceTime, desde el celular.",
    duracion: "0:45",
    categoria: "general",
    guia: "celular",                        // si tiene guia relacionada, poner el ID (ej: "pami")
  },
  {
    id: "v2",
    tipo: "youtube",
    videoId: "ICO-TCvQnHM",          // <-- reemplazar con el ID real
    titulo: "Como sacar turno en PAMI por internet",
    descripcion: "Sin llamar por telefono, desde cualquier celular.",
    duracion: "0:38",
    categoria: "salud",
    guia: "pami",
  },
  {
    id: "v3",
    tipo: "youtube",
    videoId: "kyu1OuHhPYA",          // <-- reemplazar con el ID real
    titulo: "Como reiniciar el router cuando el internet no anda",
    descripcion: "Solucion en 3 pasos para recuperar la conexion.",
    duracion: "1:56",
    categoria: "celular",
    guia: null,
  },
  {
    id: "v4",
    tipo: "youtube",
    videoId: "KfZP3mPRJeg",          // <-- reemplazar con el ID real
    titulo: "Como ver la jubilacion en ANSES",
    descripcion: "Consultar recibos y liquidaciones online.",
    duracion: "1:58",
    categoria: "estado",
    guia: "anses",
  },
  {
    id: "v5",
    tipo: "youtube",
    videoId: "_KjUWqW5VKw",          // <-- reemplazar con el ID real
    titulo: "Como pagar con codigo QR en un comercio",
    descripcion: "Con Mercado Pago o la app de su banco.",
    duracion: "1:35",
    categoria: "vida",
    guia: "qr",
  },
  {
    id: "v6",
    tipo: "youtube",
    videoId: "78ZU9KEevp0",          // <-- reemplazar con el ID real
    titulo: "Como registrarse en PAMI",
    descripcion: "Mi PAMI - Registro.",
    duracion: "1:22",
    categoria: "salud",
    guia: "pami",
  },
  {
    id: "v7",
    tipo: "youtube",
    videoId: "tTwsx6bHI4w",          // <-- reemplazar con el ID real
    titulo: "Mi PAMI | Preguntas frecuentes:",
    descripcion: "Registro y Acceso.",
    duracion: "1:15",
    categoria: "salud",
    guia: "pami",
  },
  {
    id: "v8",
    tipo: "youtube",
    videoId: "nsvvJciLGws",          // <-- reemplazar con el ID real
    titulo: "Mi PAMI - Funcionalidades:",
    descripcion: "Descripcion.",
    duracion: "0:55",
    categoria: "salud",
    guia: "pami",
  },
  {
    id: "v9",
    tipo: "youtube",
    videoId: "vGYFiphnVyk",          // <-- reemplazar con el ID real
    titulo: "Bienestar PAMI:",
    descripcion: "Hipertensión.",
    duracion: "0:35",
    categoria: "salud",
    guia: "pami",
  },
  {
    id: "v10",
    tipo: "youtube",
    videoId: "70CZJKohRzs",          // <-- reemplazar con el ID real
    titulo: "Bienestar PAMI:",
    descripcion: "Diabetes.",
    duracion: "0:39",
    categoria: "salud",
    guia: "pami",
  },
  {
    id: "v11",
    tipo: "youtube",
    videoId: "2pqQRRrKuNw",          // <-- reemplazar con el ID real
    titulo: "Bienestar PAMI:",
    descripcion: "Evitar caídas.",
    duracion: "0:41",
    categoria: "salud",
    guia: "pami",
  },
  {
    id: "v1",
    tipo: "youtube",
    videoId: "_lxOoK4Jwns",          // <-- reemplazar con el ID real
    titulo: "Whatsapp:",
    descripcion: "Tips para los primeros usos de WhatsApp.",
    duracion: "3:39",
    categoria: "general",
    guia: "celular",
  },
  {
    id: "v13",
    tipo: "youtube",
    videoId: "uBPDLg7tqZc",          // <-- reemplazar con el ID real
    titulo: "Celular:",
    descripcion: "Como cargar SUBE 🚌con Mercado pago, desde CASA",
    duracion: "1:45",
    categoria: "celular",
    guia: "celular",
  },
  {
    id: "v14",
    tipo: "youtube",
    videoId: "OLLe91Iqte0",          // <-- reemplazar con el ID real
    titulo: "Celular:",
    descripcion: "Como cargar SUBE con Mercado pago.",
    duracion: "4:05",
    categoria: "celular",
    guia: "celular",
  },
  // -------------------------------------------------------
  // EJEMPLO: video propio subido a Cloudflare R2
  // -------------------------------------------------------
  // {
  //   id: "v6",
  //   tipo: "local",
  //   videoId: "https://pub-XXXXXXXX.r2.dev/tutorial-whatsapp.mp4",
  //   titulo: "Como mandar fotos por WhatsApp",
  //   descripcion: "Adjuntar una foto de la galeria y enviarla.",
  //   duracion: "1:50",
  //   categoria: "vida",
  //   guia: "whatsapp",
  // },

  // -------------------------------------------------------
  // EJEMPLO: video de Vimeo
  // -------------------------------------------------------
  // {
  //   id: "v7",
  //   tipo: "vimeo",
  //   videoId: "123456789",           // ID numerico de Vimeo
  //   titulo: "Como usar la app Mi Argentina",
  //   descripcion: "DNI digital y tramites desde el celular.",
  //   duracion: "3:10",
  //   categoria: "estado",
  //   guia: "dni",
  // },
];

// Helper: filtrar por categoria
export function videosPorCategoria(cat) {
  if (!cat || cat === "todos") return videos;
  return videos.filter(v => v.categoria === cat);
}

// Helper: buscar por ID de guia relacionada
export function videosPorGuia(guiaId) {
  return videos.filter(v => v.guia === guiaId);
}
