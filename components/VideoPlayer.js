// components/VideoPlayer.js
// Componente que detecta el tipo de video y renderiza
// el reproductor correcto: iframe para YouTube/Vimeo,
// <video> nativo para archivos locales.

import { useState } from "react";

const s = {
  verde: "#1B6B3A",
  naranja: "#D4580A",
  gris: "#F7F6F1",
  txt: "#1a1a18",
  txts: "#5F5E5A",
};

export default function VideoPlayer({ video, sz }) {
  const [playing, setPlaying] = useState(false);

  if (!video) return null;

  // Construir la URL del iframe segun el tipo
  function getEmbedUrl() {
    if (video.tipo === "youtube") {
      return `https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`;
    }
    if (video.tipo === "vimeo") {
      return `https://player.vimeo.com/video/${video.videoId}?autoplay=1`;
    }
    return null;
  }

  const embedUrl = getEmbedUrl();

  return (
    <div style={{
      background: s.gris,
      border: "0.5px solid rgba(0,0,0,0.15)",
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: "1rem",
    }}>
      {/* Miniatura / reproductor */}
      <div style={{ position: "relative", paddingTop: "56.25%", background: "#1a1a18" }}>

        {/* YouTube o Vimeo: iframe */}
        {(video.tipo === "youtube" || video.tipo === "vimeo") && (
          playing ? (
            <iframe
              src={embedUrl}
              title={video.titulo}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            />
          ) : (
            // Miniatura clicable antes de reproducir
            <div
              onClick={() => setPlaying(true)}
              role="button"
              aria-label={"Ver video: " + video.titulo}
              tabIndex={0}
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && setPlaying(true)}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "#111" }}
            >
              {/* Miniatura de YouTube si es ese tipo */}
              {video.tipo === "youtube" && (
                <img
                  src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                  alt={video.titulo}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }}
                />
              )}
              {/* Boton play */}
              <div style={{
                position: "relative", zIndex: 2,
                width: 64, height: 64, background: s.naranja,
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M8 5.5L19 12L8 18.5V5.5Z" fill="white"/>
                </svg>
              </div>
              {/* Duracion */}
              <span style={{
                position: "absolute", bottom: 10, right: 12,
                background: "rgba(0,0,0,0.75)", color: "#fff",
                fontSize: 12, borderRadius: 4, padding: "2px 7px", zIndex: 2,
              }}>{video.duracion}</span>
            </div>
          )
        )}

        {/* Video local (Cloudflare R2 u otro): tag <video> nativo */}
        {video.tipo === "local" && (
          <video
            controls
            src={video.videoId}
            title={video.titulo}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          >
            Su navegador no puede reproducir este video.
          </video>
        )}
      </div>

      {/* Info debajo del video */}
      <div style={{ padding: ".75rem 1rem" }}>
        <strong style={{ fontSize: sz ? 17 : 15, fontWeight: 700, color: s.txt, display: "block", marginBottom: 3 }}>
          {video.titulo}
        </strong>
        <span style={{ fontSize: sz ? 15 : 13, color: s.txts, lineHeight: 1.5 }}>
          {video.descripcion}
        </span>
      </div>
    </div>
  );
}


// -------------------------------------------------------
// VideoGrid: grilla de miniaturas para la seccion de Ayuda
// -------------------------------------------------------
export function VideoGrid({ videos, sz, onSelect }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 10,
      marginBottom: "1.3rem",
    }}>
      {videos.map(v => (
        <VideoCard key={v.id} video={v} sz={sz} onSelect={onSelect} />
      ))}
    </div>
  );
}


// -------------------------------------------------------
// VideoCard: miniatura clicable en la grilla
// -------------------------------------------------------
function VideoCard({ video, sz, onSelect }) {
  const thumbUrl = video.tipo === "youtube"
    ? `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`
    : null;

  return (
    <div
      onClick={() => onSelect && onSelect(video)}
      role="button"
      tabIndex={0}
      aria-label={"Ver tutorial: " + video.titulo}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onSelect && onSelect(video)}
      style={{
        background: s.gris,
        border: "0.5px solid rgba(0,0,0,0.12)",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "none"}
    >
      {/* Miniatura */}
      <div style={{ background: "#D3D1C7", height: 110, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {thumbUrl && (
          <img src={thumbUrl} alt={video.titulo} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div style={{ position: "relative", zIndex: 2, width: 40, height: 40, background: "rgba(212,88,10,0.9)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8 5.5L19 12L8 18.5V5.5Z" fill="white"/>
          </svg>
        </div>
        <span style={{ position: "absolute", bottom: 7, right: 9, background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 11, borderRadius: 4, padding: "2px 6px" }}>
          {video.duracion}
        </span>
      </div>
      {/* Texto */}
      <div style={{ padding: ".65rem .9rem" }}>
        <strong style={{ fontSize: sz ? 16 : 14, fontWeight: 700, color: s.txt, display: "block", marginBottom: 2 }}>
          {video.titulo}
        </strong>
        <span style={{ fontSize: 12, color: s.txts }}>
          {video.descripcion}
        </span>
      </div>
    </div>
  );
}
