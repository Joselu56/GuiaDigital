// lib/localidadService.js
// Servicio para manejar la búsqueda de información de localidades

// Importación correcta: el archivo exporta un objeto por defecto
import localidadesData from "../data/localidades.json";
// Importación correcta: el archivo exporta un objeto con propiedad provincias
import provinciasData from "../data/provincias.json";

// Normalizar texto para comparación (sin tildes, minúsculas)
export function normalizarTexto(texto) {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Buscar localidad por nombre y provincia
export function buscarLocalidad(nombre, provinciaId) {
  if (!nombre || !provinciaId) return null;
  
  const nombreNormalizado = normalizarTexto(nombre);
  
  // localidadesData es un objeto con claves como "bsas", "cba", etc.
  const localidadesProvincia = localidadesData[provinciaId] || [];
  
  if (!localidadesProvincia.length) return null;
  
  const encontrada = localidadesProvincia.find(loc => 
    normalizarTexto(loc.nombre) === nombreNormalizado
  );
  
  return encontrada || null;
}

// Obtener ID de provincia a partir del nombre o ID
export function obtenerProvinciaId(provincia) {
  if (!provincia) return null;
  
  // Extraer el array de provincias del objeto importado
  const provinciasArray = provinciasData.provincias || [];
  
  // Si ya es un ID (ej: "bsas", "cba")
  if (provinciasArray.some(p => p.id === provincia)) {
    return provincia;
  }
  
  // Si es nombre (ej: "Buenos Aires", "Córdoba")
  const provinciaEncontrada = provinciasArray.find(p => 
    normalizarTexto(p.nombre) === normalizarTexto(provincia)
  );
  
  return provinciaEncontrada ? provinciaEncontrada.id : null;
}