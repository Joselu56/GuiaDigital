// pages/index.js
import VideoPlayer, { VideoGrid } from "../components/VideoPlayer";
import { videos } from "../data/videos";
import provinciasData from "../data/provincias.json";
import localidadesData from "../data/localidades.json";
import estafasData from "../data/estafas.json";
import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import { buscarLocalidad, obtenerProvinciaId } from "../lib/localidadService";

// Extraer el array de provincias
const provinciasArray = provinciasData.provincias || [];

// Mapeo de localidades por provincia para el selector (visual)
const MUNIS = {
  bsas: ["Miramar","La Plata","Bahía Blanca","Mar del Plata","Quilmes","Lomas de Zamora","Merlo","Moreno","Morón","San Antonio de Padua","San Isidro","Tigre","La Reja"],
  caba: ["Palermo","Belgrano","Flores","Caballito","Recoleta","Balvanera","Villa Urquiza"],
  cba:  ["Córdoba Capital","Río Cuarto","Villa María","San Francisco","Villa Carlos Paz","Cosquín","La Cumbre","La Falda","Capilla del Monte","Jesús María","Colonia Caroya","San Esteban","Villa Giardino","Valle Hermoso"],
  sf:   ["Rosario","Santa Fe Capital","Venado Tuerto","Rafaela","San Lorenzo","Reconquista"],
  mza:  ["Mendoza Capital","San Rafael","Godoy Cruz","Maipú","Luján de Cuyo","Las Heras"],
  tuc:  ["San Miguel de Tucumán","Concepción","Banda del Río Salí","Yerba Buena","Tafí Viejo"],
  entre:["Paraná","Concordia","Gualeguaychú","Concepción del Uruguay"],
  mis:  ["Posadas","Oberá","Eldorado","Puerto Iguazú"],
  salta:["Salta Capital","San Ramón de la Nueva Orán","Tartagal","Metán"],
  chaco:["Resistencia","Presidencia Roque Sáenz Peña","Villa Ángela","Charata"],
  chubut: ["Comodoro Rivadavia","Puerto Madryn","Rawson","Trelew"],
  santacruz: ["Caleta Olivia","Cañadón Seco","El Chaltén","Las Heras","Perito Moreno","Pico Truncado","Río Gallegos"]
};

const GUIDES = {
  pami: {
    title: "Cómo sacar un turno en PAMI",
    steps: [
      { t: "Abra el navegador de su celular", d: "Toque el ícono de internet (Chrome, Safari o similar). Es el que parece una bola con líneas o una brújula." },
      { t: "Escriba: mi.pami.org.ar", d: "En la barra de arriba, escriba esa dirección y toque Ir o Enter en el teclado." },
      { t: "Ingrese con su número de afiliado y fecha de nacimiento", d: "Si es la primera vez, toque Quiero registrarme y siga los pasos. Anote su contraseña en un papel." },
      { t: "Toque Solicitar turno", d: "Elija su médico de cabecera o un especialista, luego el día y el horario que más le convenga." },
      { t: "Guarde la confirmación", d: "Le llegará un mensaje de texto al celular con los datos del turno. Puede anotarlo o pedirle a un familiar que lo guarde." },
    ],
  },
  receta: {
    title: "Funciona a través de los siguientes pasos:",
    steps: [
      { t: "Prescripción: ", d: "El médico confecciona la receta desde una plataforma digital autorizada." },
      { t: "Notificación: ", d: "Recibís tu receta mediante correo electrónico, WhatsApp, o a través de las aplicaciones móviles de tu obra social, prepaga, o de Mi Argentina." },
      { t: "Compra en farmacia: ", d: "Para retirar tu medicación, no necesitas imprimirla. Solo debes dirigirte a la farmacia con tu DNI y tu credencial de afiliación (física o digital)" },
      { t: "Validación: ", d: "El farmacéutico buscará la receta digital en el sistema y te entregará los medicamentos." },
    ],
  },
  telemedicina: {
    title: "Consulta médica a distancia en Argentina:",
    steps: [
      { t: "Vía Obra Social o Prepaga: ", d: "(Swiss Medical, OSDE, PAMI, etc.)" },
      { t: "Descargá la App oficial: ", d: "Ingresá a la tienda de tu celular y descarga la aplicación de tu cobertura (ej. Swiss Medical o PAMI para personas mayores)" },
      { t: "Creá tu usuario: ", d: "Registrate utilizando tu número de credencial and tu DNI." },
      { t: "Seleccioná el servicio: ", d: "Buscá la opción de Guardia Virtual, E-Consulta o Telemedicina." },
      { t: "Comunicate: ", d: "Según la plataforma, chatearás con un bot para describir tus síntomas o accederás a una videollamada directa con un clínico." },
      { t: "Sistema Público : ", d: "(En CABA o Provincia de Buenos Aires)" },
      { t: "Líneas de atención: ", d: "Si vivís en la Ciudad de Buenos Aires, podés llamar al 147 (opción 1) de lunes a viernes." },
      { t: "Telemedicina Bonaerense: ", d: "Si residís en la Provincia de Buenos Aires, podés ingresar al portal Mi Salud Digital Bonaerense para acceder a consultas clínicas." },
    ],
  },
  farmacia: {
    title: "Encontrar la farmacia más cercana:",
    steps: [
      { t: "Abre Google Maps: ", d: "Busca y abre la aplicación en tu celular." },
      { t: "Usa la búsqueda rápida: ", d: "En la parte superior, toca la barra de búsqueda y escribe la palabra farmacia (o farmacias de turno)." },
      { t: "Usa los botones de categoría: ", d: "Alternativamente, debajo de la barra de búsqueda, desliza las opciones hacia la derecha y selecciona el botón Farmacias." },
      { t: "Elige una opción: ", d: "El mapa mostrará tu ubicación con un punto azul y las farmacias cercanas con puntos rojos. Toca sobre el ícono de la farmacia que prefieras para ver su horario de atención, si está abierta y su dirección" },
      { t: "Obtén indicaciones: ", d: "Presiona el botón Cómo llegar o Indicaciones y luego selecciona Iniciar para que el mapa te guíe paso a paso." },
    ],
  },
  anses: {
    title: "Ver su jubilación en ANSES",
    steps: [
      { t: "Entre a anses.gob.ar", d: "Abra el navegador y escriba esa dirección en la barra de arriba." },
      { t: "Toque Mi ANSES", d: "Es el botón principal en la página de inicio. Es de color azul." },
      { t: "Ingrese su CUIL y su clave", d: "El CUIL está en el DNI. Si no tiene clave, pídala en la sucursal ANSES más cercana llevando su DNI." },
      { t: "Elija Mis liquidaciones", d: "Allí puede ver todos sus recibos de pago del mes actual y de meses anteriores. Puede imprimirlos." },
    ],
  },
  qr: {
    title: "Cómo pagar con código QR",
    steps: [
      { t: "Abra la app de su banco o Mercado Pago", d: "Busque el ícono en su celular y tóquelo para abrirlo." },
      { t: "Busque el botón Pagar o Escanear QR", d: "Suele estar en el centro de la pantalla o en la parte de abajo." },
      { t: "Apunte la cámara al código del comercio", d: "Sostenga el celular a unos 15-20 cm del cuadradito con puntitos. El teléfono lo detecta solo." },
      { t: "Ingrese el monto y confirme", d: "Revise bien el monto y el nombre del comercio antes de tocar Confirmar o Pagar." },
      { t: "Guarde el comprobante", d: "Toque Ver comprobante para guardarlo o enviárselo a un familiar por WhatsApp." },
    ],
  },
  servicios: {
    title: "Pagar tus servicios de luz, agua y gas sin ir al banco.",
    steps: [
      { t: "Opción 1: ", d: "Billeteras Virtuales (ej. Mercado Pago)." },
      { t: "Mercado Pago: ", d: "Abre la aplicación de Mercado Pago en tu celular." },
      { t: "Pagar servicios: ", d: "Selecciona la sección Pagar servicios" },
      { t: "Código de barras: ", d: "Puedes buscar la empresa manualmente o escanear el código de barras de tu factura." },
      { t: "Pagar: ", d: "Confirma el monto, elige con qué pagar (saldo en cuenta, tarjeta de débito o crédito) y presiona Pagar." },
      { t: "Opción 2: ", d: "Home Banking (Red Link o Banelco/Pago Mis Cuentas)." },
      { t: "Aplicación o Web: ", d: "Ingresa a la app o web de tu banco con tu usuario y contraseña." },
      { t: "Pago de Servicios: ", d: "Busca la opción Pagos o Pago de Servicios." },
      { t: "Selecciona el rubro (Luz, Gas o Agua): ", d: "Busca la empresa prestataria (por ejemplo, Edenor, Edesur, AySA, Naturgy, etc.)." },
      { t: "Código de Pago Electrónico: ", d: "Ingresa el código de pago electrónico que figura en tu boleta" },
      { t: "Verificar los datos: ", d: "Verifica los datos, selecciona la cuenta bancaria de débito y confirma la operación." },
    ],
  },
  impuestos: {
    title: "Qué es la AFIP, qué es la Clave Fiscal y cuándo la necesita un jubilado",
    steps: [
      { t: "Es la gran alcancía del país", d: "La AFIP es la oficina del gobierno que se encarga de recaudar los impuestos. Es como una caja común donde todos los ciudadanos aportamos un poquito de dinero para que funcionen los hospitales, las escuelas y los servicios públicos." },
      { t: "Cuándo la cruzamos al comprar", d: "Aunque no nos demos cuenta, interactuamos con ella todos los días. Cada vez que compramos un paquete de yerba o un remedio en la farmacia y nos dan un ticket, una parte de ese pago (llamado IVA) va destinado a esta oficina." },
      { t: "Por qué es importante tenerla al día", d: "Estar registrado o tener las cuentas ordenadas ante la AFIP es lo que le permite al Estado saber que nuestros ingresos son legales y transparentes, evitando problemas a la hora de hacer movimientos grandes de dinero." },
      { t: "qué es la Clave Fiscal", d: "La Clave Fiscal es una contraseña especial que sirve para entrar a la página web de AFIP. Funciona exactamente igual que su firma de puño y letra, pero para hacer trámites desde la computadora o el celular." },
      { t: "Cómo se obtiene de forma sencilla", d: "Hoy en día se puede sacar en cinco minutos bajando la aplicación 'Mi AFIP' en el celular. La aplicación le pedirá sacarle una foto a su DNI y hacer unos gestos frente a la cámara para comprobar su identidad." },
      { t: "Reglas de oro para protegerla", d: "Esta clave es personalísima. Jamás se la dicte por teléfono a desconocidos ni la anote en lugares donde otros puedan verla. Si necesita hacer un trámite complejo, compártala únicamente con un contador de su total confianza o pídale ayuda a un familiar cercano." },
      { t: "Cuándo la necesita un jubilado, al comprar o vender un bien grande", d: "Si usted decide vender un auto viejo, una propiedad, o si recibe una herencia, la AFIP necesita estar enterada. Se debe hacer un papel digital para demostrar de dónde salió ese dinero de forma legal." },
      { t: "Si supera los límites de la jubilación", d: "La gran mayoría de los jubilados no deben hacer nada porque sus impuestos se descuentan solos. Pero si usted cobra una jubilación muy alta o tiene otras propiedades en alquiler, puede que deba declarar esos bienes una vez al año." },
      { t: "Al hacer trámites de subsidios o asistencia", d: "A veces, para pedir un descuento en la luz, el gas o para solicitar ciertos beneficios del gobierno, le van a pedir una 'Constancia de Inscripción' o una certificación que emite la página web de esta oficina." }
    ]
  },
  dni: {
    title: "Cómo tener el DNI digital en el celular",
    steps: [
      { t: "Busque Mi Argentina en la tienda de aplicaciones", d: "En su celular, abra la tienda (Play Store o App Store). Busque Mi Argentina y toque Instalar." },
      { t: "Abra la app e ingrese con su DNI", d: "Escriba su número de DNI y su fecha de nacimiento para entrar por primera vez." },
      { t: "Busque Identidad digital", d: "En el menú principal aparece una opción llamada Identidad digital o DNI digital." },
      { t: "Listo: muestre el código cuando lo pidan", d: "En algunos comercios u oficinas puede mostrar la pantalla del celular en lugar del DNI físico." },
    ],
  },
  compras: {
     title : "Cómo hacer compras en Mercado Libre O Supermercado con envío a casa",
     steps: [
      {  t : "Mercado Libre: Busque lo que necesita",  d: "Abra la aplicación o la página de Mercado Libre. En la barra de arriba con la lupa, escriba el producto (ejemplo: 'Zapatillas cómodas') y toque la lupa." },
      {  t : "Revise el precio y el envío",  d: "Toque el producto que le guste. Mire el precio grande y fíjese abajo si dice 'Envío gratis' o cuánto cobran por llevárselo a su casa." },
      {  t : "Toque el botón Comprar ahora",  d: "Es el botón grande de color azul. Si es su primera vez, el sistema le pedirá su correo electrónico para crear una cuenta segura." },
      {  t : "Escriba su dirección de entrega",  d: "Ponga la calle, el número y el piso de su casa con mucha paciencia. Revise que no haya errores para que el cartero no se pierda." },
      {  t : "Elija cómo pagar y confirme",  d: "Seleccione pagar con tarjeta de débito, crédito o dinero en cuenta. Siga los pasos en pantalla, toque 'Confirmar compra' y anote el día que le llegará." },
      {  t : "Supermercado: Entre a la página de su supermercado",  d: "Escriba en el navegador la página del súper de su confianza (como Coto Digital, Carrefour o Disco) e inicie sesión o regístrese." },
      {  t : "Seleccione Envío a domicilio",  d: "Antes de empezar a elegir productos, busque la opción que dice 'Recibir en casa' e ingrese su dirección para ver la disponibilidad." },
      {  t : "Llene el changuito virtual",  d: "Busque los alimentos o artículos. Al lado de cada uno verá un botón que dice 'Agregar' o un dibujo de un carrito de compras. Tóquelo para ir sumando cosas." },
      {  t : "Elija el día y horario de entrega",  d: "Cuando termine, toque el dibujo del changuito arriba a la derecha. El sistema le dejará elegir una ventana de tiempo (ejemplo: 'Martes de 9 a 13 hs') para esperarlos en casa." },
      {  t : "Pague de forma segura",  d: "Coloque los datos de su tarjeta de débito o crédito. Una vez aceptado, le llegará un correo electrónico que sirve como el ticket de su compra." }
    ]
  },
  transporte: {
    title: "Cómo saber qué colectivo tomar usando el mapa del celular",
    steps: [
      { t: "Abra la aplicación de mapas", d: "Busque en su pantalla el ícono de Google Maps, que parece un pin de mapa de colores o un mapa doblado, y tóquelo con el dedo." },
      { t: "Escriba adónde quiere ir", d: "Toque la barra blanca que está arriba de todo de la pantalla. Escriba la dirección exacta o el nombre del lugar (ejemplo: 'Hospital Italiano') y elija el resultado correcto." },
      { t: "Toque el botón Cómo llegar", d: "Es un botón redondo de color azul que suele aparecer abajo a la izquierda. Tiene el dibujo de una flecha o un auto." },
      { t: "Elija la opción de transporte público", d: "Arriba verá varios dibujos: un auto, a pie, etc. Toque el dibujo que parece el frente de un colectivo o un trencito." },
      { t: "Siga las instrucciones del recorrido", d: "El celular le mostrará una lista con los números de colectivo que le sirven, dónde caminar para tomarlo, cuántas paradas pasar y en cuál bajarse. Puede llevar la pantalla prendida mientras viaja." }
    ]
  },
  whatsapp: {
    title: "Cómo usar WhatsApp de forma segura y enviar fotos, mensajes, etc.",
    steps: [
      { t: "Abra WhatsApp en su celular", d: "Busque el ícono verde con el dibujo de un teléfono blanco." },
      { t: "Elegir un contacto de confianza", d: "Toque el nombre de la persona a la que le quiere escribir o llamar." },
      { t: "Envíe mensajes de forma sencilla", d: "Toque el cuadrado de texto abajo, escriba lo que quiera decir y toque la flechita verde para enviar." },
      { t: "Cómo enviar fotos sin riesgos", d: "Toque el ícono del clip (adjuntar), elija Galería, seleccione la foto y envíela solo a sus conocidos." },
      { t: "Cuidado con los desconocidos", d: "Nunca comparta contraseñas, códigos de verificación ni datos bancarios por WhatsApp, aunque le dicen que son del banco o del gobierno." }
    ]
  },
};

const GUIDE_AREA = {
  pami: "salud", receta: "salud", telemedicina: "salud", farmacia: "salud",
  anses: "estado", dni: "estado", servicios: "estado", impuestos: "estado",
  qr: "vida", compras: "vida", transporte: "vida", whatsapp: "vida",
};

// ============================================================
// FUNCIÓN PARA LIMPIAR TEXTO PARA VOZ (solo elimina URLs y correos, conserva todo lo demás)
// ============================================================
function limpiarTextoParaVoz(texto) {
  if (!texto) return "";
  
  let limpio = texto;
  
  // Eliminar URLs completas (http, https, www, dominios)
  limpio = limpio.replace(/\b(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?\b/gi, '');
  
  // Eliminar direcciones de correo electrónico
  limpio = limpio.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi, '');
  
  // Conservar números de teléfono, direcciones, nombres de hospitales, etc.
  // Solo eliminar caracteres especiales que no aportan
  limpio = limpio.replace(/[*_`~]/g, '');
  
  // Limpiar múltiples espacios
  limpio = limpio.replace(/\s+/g, ' ').trim();
  
  return limpio;
}

// ============================================================
// FUNCIÓN PARA CONSTRUIR TEXTO COMPLETO DE INFORMACIÓN DE LOCALIDAD
// ============================================================
function construirTextoLocalidad(info) {
  if (!info) return "";
  
  let texto = `Información de ${info.nombre}. `;
  
  if (info.urls?.municipal && info.urls.municipal !== "") {
    texto += `Sitio web municipal: ${info.urls.municipal}. `;
  }
  if (info.urls?.whatsapp && info.urls.whatsapp !== "") {
    texto += `WhatsApp municipal disponible. `;
  }
  if (info.urls?.energia && info.urls.energia !== "") {
    texto += `Sitio web de energía eléctrica disponible. `;
  }
  if (info.urls?.agua && info.urls.agua !== "") {
    texto += `Sitio web de agua corriente disponible. `;
  }
  if (info.urls?.hospital && info.urls.hospital !== "") {
    texto += `Sitio web del hospital disponible. `;
  }
  if (info.contacto?.nombre_hospital && info.contacto.nombre_hospital !== "") {
    texto += `Hospital: ${info.contacto.nombre_hospital}. `;
  }
  if (info.contacto?.hospital_guardia && info.contacto.hospital_guardia !== "") {
    texto += `Hospital guardia: ${info.contacto.hospital_guardia}. `;
  }
  if (info.contacto?.telefono_reclamos && info.contacto.telefono_reclamos !== "") {
    texto += `Teléfono de reclamos: ${info.contacto.telefono_reclamos}. `;
  }
  if (info.contacto?.policia && info.contacto.policia !== "") {
    texto += `Policía: ${info.contacto.policia}. `;
  }
  if (info.contacto?.bomberos && info.contacto.bomberos !== "") {
    texto += `Bomberos: ${info.contacto.bomberos}. `;
  }
  if (info.contacto?.defensa_civil && info.contacto.defensa_civil !== "") {
    texto += `Defensa Civil: ${info.contacto.defensa_civil}. `;
  }
  if (info.contacto?.registro_civil && info.contacto.registro_civil !== "") {
    texto += `Registro Civil: ${info.contacto.registro_civil}. `;
  }
  
  return texto;
}

// ============================================================
// FUNCIÓN PARA SELECCIONAR VOZ ARGENTINA
// ============================================================
async function seleccionarVozArgentina() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve(null);
      return;
    }
    
    const cargarVoces = () => {
      const voces = window.speechSynthesis.getVoices();
      
      const patronesArgentinos = [
        'diego', 'mora', 'agustin', 'valeria', 'tomas',
        'argentina', 'argentine', 'es-ar', 'es_AR', 'latino',
        'spanish latin', 'latin american', 'mexican'
      ];
      
      let vozArgentina = null;
      for (const patron of patronesArgentinos) {
        vozArgentina = voces.find(v => 
          v.lang === 'es-AR' || 
          v.lang === 'es-MX' || 
          v.lang === 'es-419' ||
          (v.lang.startsWith('es') && v.name.toLowerCase().includes(patron))
        );
        if (vozArgentina) break;
      }
      
      if (!vozArgentina) {
        vozArgentina = voces.find(v => v.lang.startsWith('es'));
      }
      
      resolve(vozArgentina || null);
    };
    
    const voces = window.speechSynthesis.getVoices();
    if (voces.length > 0) {
      cargarVoces();
    } else {
      window.speechSynthesis.onvoiceschanged = cargarVoces;
      setTimeout(cargarVoces, 500);
    }
  });
}

// ============================================================
// HOOK PARA SÍNTESIS DE VOZ (TEXT-TO-SPEECH) CON VOZ ARGENTINA
// ============================================================
function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef(null);
  const vozArgentinaRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }
    
    seleccionarVozArgentina().then(voz => {
      vozArgentinaRef.current = voz;
    });
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = async (text, options = {}) => {
    if (!isSupported || !text) return;
    
    const textoLimpio = limpiarTextoParaVoz(text);
    if (!textoLimpio || textoLimpio.length === 0) return;
    
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(textoLimpio);
    utteranceRef.current = utterance;
    
    utterance.lang = options.lang || 'es-AR';
    
    if (vozArgentinaRef.current) {
      utterance.voice = vozArgentinaRef.current;
    }
    
    utterance.rate = options.rate || 0.85;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const pause = () => {
    if (!isSupported || !window.speechSynthesis.speaking) return;
    window.speechSynthesis.pause();
  };

  const resume = () => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
  };

  return { speak, stop, pause, resume, isSpeaking, isPaused, isSupported };
}

// ============================================================
// COMPONENTE BOTÓN DE VOZ
// ============================================================
function VoiceButton({ text, label = "Escuchar", size = "normal", onSpeakStart, onSpeakEnd }) {
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis();
  
  if (!isSupported) return null;
  
  const handleClick = () => {
    if (isSpeaking) {
      stop();
      if (onSpeakEnd) onSpeakEnd();
    } else {
      speak(text);
      if (onSpeakStart) onSpeakStart();
    }
  };
  
  const buttonSize = size === "large" ? { width: 44, height: 44, fontSize: 20 } : 
                     size === "small" ? { width: 28, height: 28, fontSize: 12 } : 
                     { width: 36, height: 36, fontSize: 16 };
  
  return (
    <button
      onClick={handleClick}
      aria-label={isSpeaking ? "Detener lectura" : "Escuchar texto"}
      title={isSpeaking ? "Detener" : "Escuchar"}
      style={{
        background: isSpeaking ? "#D4580A" : "#1B6B3A",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        transition: "all 0.2s",
        ...buttonSize
      }}
    >
      <i className={`ti ${isSpeaking ? "ti-volume" : "ti-volume"}`} style={{ fontSize: buttonSize.fontSize }} aria-hidden="true"></i>
    </button>
  );
}

// ============================================================
// COMPONENTE PARA MOSTRAR GUÍA CON BOTÓN DE VOZ
// ============================================================
function GuideWithVoice({ guide, sz }) {
  if (!guide) return null;
  
  const fullText = `${guide.title}. ${guide.steps.map((s, i) => `Paso ${i + 1}: ${s.t}. ${s.d}`).join('. ')}`;
  
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: ".7rem", flexWrap: "wrap" }}>
        <p style={{ fontSize: sz ? 18 : 16, fontWeight: 700, color: "#1a1a18", margin: 0 }}>{guide.title}</p>
        <VoiceButton text={fullText} label="Escuchar guía completa" size={sz ? "large" : "normal"} />
      </div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginBottom: "1rem" }}>
        {guide.steps.map((s, i) => {
          const stepText = `${s.t}. ${s.d}`;
          return (
            <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#F7F6F1", borderRadius: 8, padding: ".7rem .9rem" }}>
              <div style={{ width: 30, height: 30, minWidth: 30, background: "#1B6B3A", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, marginTop: 1 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <strong style={{ fontSize: sz ? 17 : 15, fontWeight: 700, display: "block", marginBottom: 2, color: "#1a1a18" }}>{s.t}</strong>
                  <VoiceButton text={stepText} size="small" />
                </div>
                <span style={{ fontSize: sz ? 16 : 14, color: "#5F5E5A", lineHeight: 1.5 }}>{s.d}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Función para seleccionar el tutorial del día con sistema de prioridades
 */
function seleccionarTutorialDelDia(videosArray) {
  if (!videosArray || videosArray.length === 0) return null;
  
  const prioridades = {
    "v1": 3, "v2": 3, "v5": 3,
    "v3": 2, "v4": 2, "v12": 2,
  };
  
  const prioridadPorCategoria = {
    "salud": 2, "celular": 1.5,
  };
  
  const weightedVideos = [];
  
  videosArray.forEach(video => {
    let peso = prioridades[video.id] || 1;
    if (video.categoria && prioridadPorCategoria[video.categoria]) {
      peso = peso * prioridadPorCategoria[video.categoria];
    }
    peso = Math.max(1, Math.round(peso));
    for (let i = 0; i < peso; i++) {
      weightedVideos.push(video);
    }
  });
  
  const randomIndex = Math.floor(Math.random() * weightedVideos.length);
  return weightedVideos[randomIndex];
}

// Componente para mostrar información de la localidad seleccionada
function InfoLocalidad({ localidadInfo, sz }) {
  if (!localidadInfo) return null;

  const info = localidadInfo;
  
  // Construir texto completo para voz
  const voiceText = construirTextoLocalidad(info);

  return (
    <div style={{
      background: "#E8F5EE",
      borderRadius: 12,
      padding: "1rem 1.25rem",
      marginTop: "0.75rem",
      marginBottom: "0.25rem",
      border: "1px solid rgba(27,107,58,0.25)"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: "0.5rem" }}>
        <p style={{ fontSize: sz ? 17 : 15, fontWeight: 700, color: "#0F5C2E", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <i className="ti ti-info-circle" style={{ fontSize: 18 }} aria-hidden="true"></i>
          Información de {info.nombre}
        </p>
        <VoiceButton text={voiceText} size={sz ? "large" : "normal"} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {info.urls?.municipal && info.urls.municipal !== "" && (
          <a href={info.urls.municipal} target="_blank" rel="noopener noreferrer" style={{ color: "#1B6B3A", textDecoration: "none", fontSize: sz ? 16 : 14, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-building" style={{ fontSize: 16 }}></i> <span>🏛️ Sitio web municipal</span>
          </a>
        )}
        
        {info.urls?.whatsapp && info.urls.whatsapp !== "" && (
          <a href={info.urls.whatsapp} target="_blank" rel="noopener noreferrer" style={{ color: "#1B6B3A", textDecoration: "none", fontSize: sz ? 16 : 14, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-brand-whatsapp" style={{ fontSize: 16 }}></i> <span>📱 WhatsApp municipal</span>
          </a>
        )}
        
        {info.urls?.energia && info.urls.energia !== "" && (
          <a href={info.urls.energia} target="_blank" rel="noopener noreferrer" style={{ color: "#1B6B3A", textDecoration: "none", fontSize: sz ? 16 : 14, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-bolt" style={{ fontSize: 16 }}></i> <span>⚡ Sitio web de energía eléctrica</span>
          </a>
        )}
        
        {info.urls?.agua && info.urls.agua !== "" && (
          <a href={info.urls.agua} target="_blank" rel="noopener noreferrer" style={{ color: "#1B6B3A", textDecoration: "none", fontSize: sz ? 16 : 14, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-droplet" style={{ fontSize: 16 }}></i> <span>💧 Sitio web de agua corriente</span>
          </a>
        )}
        
        {info.urls?.hospital && info.urls.hospital !== "" && (
          <a href={info.urls.hospital} target="_blank" rel="noopener noreferrer" style={{ color: "#1B6B3A", textDecoration: "none", fontSize: sz ? 16 : 14, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-hospital" style={{ fontSize: 16 }}></i> <span>🏥 Sitio web del hospital</span>
          </a>
        )}

        {info.contacto?.nombre_hospital && info.contacto.nombre_hospital !== "" && (
          <div style={{ fontSize: sz ? 16 : 14, color: "#0F5C2E", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <i className="ti ti-hospital" style={{ fontSize: 16 }}></i>
            <span>🏥 Hospital: </span>
            <span style={{ color: "#D4580A", fontWeight: 700 }}>{info.contacto.nombre_hospital}</span>
          </div>
        )}

        {info.contacto?.hospital_guardia && info.contacto.hospital_guardia !== "" && (
          <div style={{ fontSize: sz ? 16 : 14, color: "#0F5C2E", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <i className="ti ti-phone" style={{ fontSize: 16 }}></i>
            <span>🏥 Hospital guardia: </span>
            <a href={`tel:${info.contacto.hospital_guardia.replace(/[^0-9\-/]/g, '')}`} style={{ color: "#D4580A", fontWeight: 700, textDecoration: "none" }}>
              {info.contacto.hospital_guardia}
            </a>
          </div>
        )}

        {info.contacto?.telefono_reclamos && info.contacto.telefono_reclamos !== "" && (
          <div style={{ fontSize: sz ? 16 : 14, color: "#0F5C2E", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <i className="ti ti-phone" style={{ fontSize: 16 }}></i>
            <span>📞 Teléfono de reclamos: </span>
            <a href={`tel:${info.contacto.telefono_reclamos.replace(/[^0-9\-/]/g, '')}`} style={{ color: "#D4580A", fontWeight: 700, textDecoration: "none" }}>
              {info.contacto.telefono_reclamos}
            </a>
          </div>
        )}

        {info.contacto?.policia && info.contacto.policia !== "" && (
          <div style={{ fontSize: sz ? 16 : 14, color: "#0F5C2E", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <i className="ti ti-shield" style={{ fontSize: 16 }}></i>
            <span>👮 Policía: </span>
            <span style={{ color: "#D4580A", fontWeight: 700 }}>{info.contacto.policia}</span>
          </div>
        )}

        {info.contacto?.bomberos && info.contacto.bomberos !== "" && (
          <div style={{ fontSize: sz ? 16 : 14, color: "#0F5C2E", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <i className="ti ti-flame" style={{ fontSize: 16 }}></i>
            <span>🚒 Bomberos: </span>
            <span style={{ color: "#D4580A", fontWeight: 700 }}>{info.contacto.bomberos}</span>
          </div>
        )}

        {info.contacto?.defensa_civil && info.contacto.defensa_civil !== "" && (
          <div style={{ fontSize: sz ? 16 : 14, color: "#0F5C2E", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <i className="ti ti-ambulance" style={{ fontSize: 16 }}></i>
            <span>🆘 Defensa Civil: </span>
            <span style={{ color: "#D4580A", fontWeight: 700 }}>{info.contacto.defensa_civil}</span>
          </div>
        )}

        {info.contacto?.registro_civil && info.contacto.registro_civil !== "" && (
          <div style={{ fontSize: sz ? 16 : 14, color: "#0F5C2E", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <i className="ti ti-file-text" style={{ fontSize: 16 }}></i>
            <span>📄 Registro Civil: </span>
            <span style={{ color: "#D4580A", fontWeight: 700 }}>{info.contacto.registro_civil}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Función auxiliar para hacer scroll y posicionar el elemento en la parte superior del chat
function scrollToChatTop(element, chatContainer) {
  if (!element || !chatContainer) return;
  
  // Calcular la posición del elemento dentro del contenedor del chat
  const elementOffsetTop = element.offsetTop;
  
  // Scroll para que el elemento quede en la parte superior con un pequeño margen
  chatContainer.scrollTo({
    top: elementOffsetTop - 15,
    behavior: 'smooth'
  });
}

// ============================================================
// COMPONENTE PARA MOSTRAR ESTAFAS
// ============================================================
function EstafasPanel({ estafas, estafaSeleccionada, setEstafaSeleccionada, sz }) {
  const estafa = estafas.find(e => e.id === estafaSeleccionada);

  return (
    <div id="estafas-section" style={{ scrollMarginTop: "20px" }}>
      {!estafa ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
          {estafas.map(e => (
            <div 
              key={e.id}
              onClick={() => setEstafaSeleccionada(e.id)}
              style={{
                border: "2px solid rgba(0,0,0,0.1)",
                borderRadius: 12,
                padding: "1rem 1.2rem",
                cursor: "pointer",
                background: "#fff",
                transition: "all 0.2s",
                borderLeft: `4px solid ${e.color}`
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <i className={`ti ${e.icono}`} style={{ fontSize: 24, color: e.color }} aria-hidden="true"></i>
                <strong style={{ fontSize: sz ? 17 : 15, color: "#1a1a18" }}>{e.titulo}</strong>
              </div>
              <p style={{ fontSize: sz ? 15 : 13, color: "#5F5E5A", margin: 0, lineHeight: 1.5 }}>
                {e.que_es.substring(0, 100)}...
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          background: "#FFF8F5", 
          borderRadius: 12, 
          padding: "1.2rem 1.5rem", 
          border: `2px solid ${estafa.color}`,
          position: "relative"
        }}>
          <button 
            onClick={() => setEstafaSeleccionada(null)}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#5F5E5A"
            }}
            aria-label="Volver al listado de estafas"
          >
            ✕
          </button>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <i className={`ti ${estafa.icono}`} style={{ fontSize: 32, color: estafa.color }} aria-hidden="true"></i>
            <h3 style={{ fontSize: sz ? 22 : 20, color: estafa.color, margin: 0, fontWeight: 700 }}>
              {estafa.titulo}
            </h3>
          </div>

          {/* Botón de voz para la estafa completa */}
          <VoiceButton 
            text={`${estafa.titulo}. ${estafa.que_es}. Ejemplo típico: ${estafa.ejemplo}. Cómo evitarlo: ${estafa.como_evitarlo.join('. ')}. Si ya caíste: ${estafa.que_hacer_si_caiste}`}
            size={sz ? "large" : "normal"}
          />

          <div style={{ marginTop: 12 }}>
            <p style={{ fontWeight: 700, fontSize: sz ? 16 : 14, color: "#1a1a18", marginBottom: 4 }}>
              <i className="ti ti-info-circle" style={{ marginRight: 6 }} aria-hidden="true"></i>
              ¿Qué es?
            </p>
            <p style={{ fontSize: sz ? 16 : 14, color: "#2C3E50", lineHeight: 1.6, marginBottom: 12 }}>
              {estafa.que_es}
            </p>

            <p style={{ fontWeight: 700, fontSize: sz ? 16 : 14, color: "#1a1a18", marginBottom: 4 }}>
              <i className="ti ti-alert-circle" style={{ marginRight: 6, color: "#D4580A" }} aria-hidden="true"></i>
              Ejemplo típico
            </p>
            <div style={{ 
              background: "#FFF0E0", 
              padding: "10px 14px", 
              borderRadius: 8, 
              marginBottom: 12,
              fontSize: sz ? 16 : 14,
              color: "#7A2F00",
              borderLeft: `3px solid ${estafa.color}`
            }}>
              {estafa.ejemplo}
            </div>

            <p style={{ fontWeight: 700, fontSize: sz ? 16 : 14, color: "#1a1a18", marginBottom: 4 }}>
              <i className="ti ti-shield-check" style={{ marginRight: 6, color: "#1B6B3A" }} aria-hidden="true"></i>
              Cómo evitarlo
            </p>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: 12 }}>
              {estafa.como_evitarlo.map((item, idx) => (
                <li key={idx} style={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  gap: 8, 
                  padding: "4px 0",
                  fontSize: sz ? 16 : 14,
                  color: "#2C3E50"
                }}>
                  <span style={{ color: "#1B6B3A", fontWeight: 700 }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p style={{ fontWeight: 700, fontSize: sz ? 16 : 14, color: "#1a1a18", marginBottom: 4 }}>
              <i className="ti ti-phone-call" style={{ marginRight: 6, color: "#C0392B" }} aria-hidden="true"></i>
              Si ya caíste
            </p>
            <div style={{ 
              background: "#FDEDEC", 
              padding: "10px 14px", 
              borderRadius: 8,
              fontSize: sz ? 16 : 14,
              color: "#7A2F00",
              borderLeft: `3px solid #C0392B`
            }}>
              {estafa.que_hacer_si_caiste}
            </div>

            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                marginTop: 16,
                background: estafa.color,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 18px",
                fontSize: sz ? 15 : 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              Volver arriba
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [fontSize, setFontSize] = useState("normal");
  const [provincia, setProvincia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [localidadInfo, setLocalidadInfo] = useState(null);
  const [activePanel, setActivePanel] = useState("inicio");
  const [activeGuide, setActiveGuide] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [categoriaVideo, setCategoriaVideo] = useState("todos");
  const [isMobile, setIsMobile] = useState(false);
  const [tutorialDelDia, setTutorialDelDia] = useState(null);
  const [mostrarEstafas, setMostrarEstafas] = useState(false);
  const [estafaSeleccionada, setEstafaSeleccionada] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const chatRef = useRef(null);
  const chatContainerRef = useRef(null);
  const ayudaSectionRef = useRef(null); 
  const videosSectionRef = useRef(null);
  const panelContainerRef = useRef(null);
  const ultimoMensajeRef = useRef(null);

  useEffect(() => {
    const detectMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    detectMobile();
    window.addEventListener('resize', detectMobile);
    
    return () => window.removeEventListener('resize', detectMobile);
  }, []);

  useEffect(() => {
    if (!videos || videos.length === 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    const storedTutorial = localStorage.getItem(`tutorial_del_dia_${today}`);
    
    if (storedTutorial) {
      setTutorialDelDia(JSON.parse(storedTutorial));
    } else {
      const selectedVideoObj = seleccionarTutorialDelDia(videos);
      setTutorialDelDia(selectedVideoObj);
      localStorage.setItem(`tutorial_del_dia_${today}`, JSON.stringify(selectedVideoObj));
    }
  }, [videos]);

  useEffect(() => {
    if (!municipio || !provincia) {
      setLocalidadInfo(null);
      return;
    }

    const provinciaId = obtenerProvinciaId(provincia);
    if (!provinciaId) {
      setLocalidadInfo(null);
      return;
    }

    const info = buscarLocalidad(municipio, provinciaId);
    setLocalidadInfo(info);
  }, [municipio, provincia]);

  const location = municipio || (provincia ? MUNIS[provincia]?.[0] : "Argentina");

  async function sendChat(text) {
    const userText = text || input.trim();
    if (!userText) return;
    setInput("");
    setLoading(true);
    setActivePanel("ayuda");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, location }),
      });
      const data = await res.json();
      
      let reply = data.reply || data.error || "Hubo un error. Llame al 0800-333-1234.";
      reply = reply.replace(/\\n/g, "\n").replace(/\\r/g, "");
      
      setMessages([...newMessages, { role: "assistant", content: reply }]);
      
      // Scroll al último mensaje (la respuesta) para que se vea el inicio
      setTimeout(() => {
        if (ultimoMensajeRef.current && chatContainerRef.current) {
          scrollToChatTop(ultimoMensajeRef.current, chatContainerRef.current);
        }
      }, 150);
      
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "No pudimos conectar. Por favor llame al 0800-333-1234." }]);
    }

    setLoading(false);
  }

  function goPanel(id) {
    setActivePanel(id);
    setActiveGuide(null);
    
    setTimeout(() => {
      if (panelContainerRef.current) {
        const elementPosition = panelContainerRef.current.getBoundingClientRect().top;
        const scrollPosition = window.pageYOffset + elementPosition - 60;
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }, 50);
  }

  function showGuide(id) {
    setActiveGuide(id);
    if (GUIDE_AREA[id]) setActivePanel(GUIDE_AREA[id]);
    
    setTimeout(() => {
      if (panelContainerRef.current) {
        const elementPosition = panelContainerRef.current.getBoundingClientRect().top;
        const scrollPosition = window.pageYOffset + elementPosition - 60;
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }, 50);
  }

  function openVideosAndScroll() {
    setActivePanel("videos");
    setActiveGuide(null);
    
    setTimeout(() => {
      if (videosSectionRef.current) {
        const elementPosition = videosSectionRef.current.getBoundingClientRect().top;
        const scrollPosition = window.pageYOffset + elementPosition - 60;
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  const toggleEstafas = () => {
    setMostrarEstafas(!mostrarEstafas);
    if (!mostrarEstafas) {
      setEstafaSeleccionada(null);
      // Hacer scroll al panel de estafas
      setTimeout(() => {
        const estafaSection = document.getElementById('estafas-section');
        if (estafaSection) {
          const elementPosition = estafaSection.getBoundingClientRect().top;
          const scrollPosition = window.pageYOffset + elementPosition - 60;
          window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const sz = fontSize === "large";

  return (
    <>
      <Head>
        <title>Conexión Senior — La tecnología a tu ritmo</title>
        <meta name="description" content="Guías paso a paso para adultos mayores en Argentina. Salud, trámites, compras y más, en lenguaje simple." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <div style={{ background: "#F0EDE6", minHeight: "100vh", padding: "1rem", fontFamily: "'Source Sans 3', sans-serif" }}>
        <div style={{ maxWidth: 840, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,0,0,0.12)", fontSize: sz ? 18 : 16 }}>

          <header style={{ background: "#1B6B3A", padding: "0.65rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, background: "#D4580A", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤝</div>
              <div>
                <strong style={{ fontFamily: "'Lora', serif", fontSize: 17, color: "#fff", display: "block" }}>Conexión Senior</strong>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", letterSpacing: ".4px" }}>La tecnología a su ritmo, con cariño</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {["normal", "large"].map((s, i) => (
                  <button key={s} onClick={() => setFontSize(s)}
                    style={{ background: fontSize === s ? "#D4580A" : "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontSize: i === 0 ? 12 : 16, fontWeight: fontSize === s ? 700 : 400 }}>A</button>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                <i className="ti ti-phone" style={{ fontSize: 16, color: "#fff" }} aria-hidden="true"></i>
                <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>0800-333-1234</span>
              </div>
            </div>
          </header>

          <div style={{ background: "#F1EFE8", borderBottom: "0.5px solid rgba(0,0,0,0.12)", padding: "0.5rem 1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <i className="ti ti-map-pin" style={{ fontSize: 16, color: "#1B6B3A" }} aria-hidden="true"></i>
              <label htmlFor="sel-prov" style={{ fontSize: 13, fontWeight: 600, color: "#5F5E5A" }}>🔍 Para buscar datos útiles en tu zona - Su Provincia:</label>
              <select id="sel-prov" value={provincia} onChange={e => { setProvincia(e.target.value); setMunicipio(""); }}
                style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.22)", borderRadius: 8, padding: "5px 10px", fontFamily: "inherit", fontSize: 13, cursor: "pointer", minWidth: 145 }}>
                <option value="">— Elegir provincia —</option>
                {provinciasArray.map(prov => (
                  <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                ))}
              </select>
              {provincia && (
                <>
                  <label htmlFor="sel-mun" style={{ fontSize: 13, fontWeight: 600, color: "#5F5E5A" }}>Municipio / localidad:</label>
                  <select id="sel-mun" value={municipio} onChange={e => setMunicipio(e.target.value)}
                    style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.22)", borderRadius: 8, padding: "5px 10px", fontFamily: "inherit", fontSize: 13, cursor: "pointer", minWidth: 160 }}>
                    <option value="">— Elegir municipio —</option>
                    {(MUNIS[provincia] || []).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </>
              )}
              {municipio && (
                <span style={{ background: "#E8F5EE", color: "#0F5C2E", borderRadius: 14, padding: "3px 10px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  <i className="ti ti-check" aria-hidden="true"></i> {municipio}
                </span>
              )}
            </div>
            
            {localidadInfo && <InfoLocalidad localidadInfo={localidadInfo} sz={sz} />}
          </div>

          <section style={{ background: "#FAF8F3", borderBottom: "0.5px solid rgba(0,0,0,0.12)", padding: "1.6rem 1.5rem 1.3rem" }}>
            <div style={{ background: "#E8F5EE", borderRadius: 12, padding: "0.9rem 1.1rem", marginBottom: "1.2rem", display: "flex", gap: 12, alignItems: "flex-start", border: "0.5px solid rgba(27,107,58,0.25)" }}>
              <i className="ti ti-heart" style={{ fontSize: 22, color: "#1B6B3A", marginTop: 2 }} aria-hidden="true"></i>
              <p style={{ fontSize: sz ? 20 : 18, lineHeight: 1.6, color: "#0F5C2E" }}>
                Es completamente normal sentirse confundido con la tecnología. Estamos aquí para acompañarle, paso a paso, sin apuros y con todo el cariño del mundo.
              </p>
            </div>

            {/* Sección de Estafas Digitales */}
            <section style={{ 
              background: "#FDF2F0", 
              borderRadius: 12, 
              padding: "1rem 1.2rem", 
              marginBottom: "1.5rem",
              border: "2px solid #D4580A",
              cursor: "pointer"
            }}>
              <div 
                onClick={toggleEstafas}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    background: "#D4580A",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 20
                  }}>
                    <i className="ti ti-shield-off" aria-hidden="true"></i>
                  </div>
                  <div>
                    <p style={{ 
                      fontSize: sz ? 20 : 18, 
                      fontWeight: 700, 
                      color: "#7A2F00", 
                      margin: 0,
                      fontFamily: "'Lora', serif"
                    }}>
                      🔒 Estafas digitales más comunes
                    </p>
                    <p style={{ fontSize: sz ? 15 : 13, color: "#8B3A00", margin: "2px 0 0 0" }}>
                      Cómo cuidarte de las estafas digitales con reglas fáciles.
                    </p>
                  </div>
                </div>
                <span style={{ 
                  fontSize: 22, 
                  color: "#D4580A",
                  transition: "transform 0.3s",
                  transform: mostrarEstafas ? "rotate(180deg)" : "rotate(0deg)"
                }}>
                  <i className="ti ti-chevron-down" aria-hidden="true"></i>
                </span>
              </div>

              {mostrarEstafas && (
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(212,88,10,0.2)" }}>
                  <EstafasPanel 
                    estafas={estafasData.estafas || []}
                    estafaSeleccionada={estafaSeleccionada}
                    setEstafaSeleccionada={setEstafaSeleccionada}
                    sz={sz}
                  />
                </div>
              )}
            </section>

            <h1 style={{ fontFamily: "'Lora', serif", fontSize: sz ? 28 : 24, color: "#1B6B3A", marginBottom: ".4rem", fontWeight: 600 }}>¿Qué desea aprender hoy?</h1>
            <p style={{ fontSize: sz ? 18 : 16, color: "#5F5E5A", marginBottom: "1.1rem", lineHeight: 1.6 }}>Elija uno de los temas de abajo y le guiamos sin tecnicismos.</p>
            
            <div style={{ background: "#FEF3EB", border: "1.5px solid #D4580A", borderRadius: 12, padding: ".9rem 1.1rem" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px", color: "#D4580A", marginBottom: ".3rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                <span>
                  <i className="ti ti-star" style={{ fontSize: 12, verticalAlign: -1, marginRight: 3 }} aria-hidden="true"></i>
                  Tutorial del día
                </span>
                <span style={{ fontSize: 10, fontWeight: 400, background: "#FFF0E0", padding: "2px 8px", borderRadius: 12 }}>
                  {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              
              {tutorialDelDia ? (
                <>
                  <div style={{ fontSize: sz ? 19 : 17, fontWeight: 700, color: "#7A2F00", marginBottom: ".35rem" }}>
                    {tutorialDelDia.titulo}
                  </div>
                  <div style={{ fontSize: sz ? 16 : 14, color: "#8B3A00", lineHeight: 1.5, marginBottom: ".6rem" }}>
                    {tutorialDelDia.descripcion || "Aprenda paso a paso con este tutorial en video."}
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedVideo(tutorialDelDia);
                      openVideosAndScroll();
                    }}
                    style={{ background: "#D4580A", color: "#fff", border: "none", borderRadius: 8, padding: ".5rem 1.1rem", fontFamily: "inherit", fontSize: sz ? 16 : 14, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <i className="ti ti-player-play" aria-hidden="true"></i> Ver el tutorial
                  </button>
                </>
              ) : (
                <div style={{ fontSize: sz ? 16 : 14, color: "#8B3A00" }}>
                  Cargando tutorial del día...
                </div>
              )}
            </div>
          </section>

          <nav style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, padding: "1rem 1.25rem", borderBottom: "0.5px solid rgba(0,0,0,0.12)" }}>
            {[
              { id: "salud", ico: "ti-heartbeat", lbl: "Salud", sub: "Turnos y recetas", bg: "#E1F5EE", color: "#085041" },
              { id: "estado", ico: "ti-building-bank", lbl: "Trámites", sub: "ANSES y DNI", bg: "#E6F1FB", color: "#042C53" },
              { id: "vida", ico: "ti-shopping-cart", lbl: "Vida diaria", sub: "Pagos y compras", bg: "#FEF3EB", color: "#7A2F00" },
              { id: "videos", ico: "ti-video", lbl: "Videos", sub: "Clases guiadas", bg: "#FFF4E5", color: "#B35400" },
              { id: "ayuda", ico: "ti-help-circle", lbl: "Ayuda", sub: "Asistente virtual", bg: "#EEEDFE", color: "#26215C" },
            ].map(b => (
              <button key={b.id} onClick={() => goPanel(b.id)} aria-pressed={activePanel === b.id}
                style={{ border: activePanel === b.id ? "2px solid #1B6B3A" : "2px solid rgba(0,0,0,0.22)", borderRadius: 12, background: activePanel === b.id ? "#E8F5EE" : "#fff", padding: "0.75rem 0.5rem", cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: "inherit", transition: "all .2s" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: b.bg, color: b.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  <i className={`ti ${b.ico}`} aria-hidden="true"></i>
                </div>
                <div style={{ fontSize: sz ? 18 : 16, fontWeight: 700, color: "#1a1a18" }}>{b.lbl}</div>
                <div style={{ fontSize: sz ? 14 : 12, color: "#5F5E5A", lineHeight: 1.3 }}>{b.sub}</div>
              </button>
            ))}
          </nav>

          <div id="panel-container" ref={panelContainerRef} style={{ minHeight: 360, padding: "1.4rem 1.5rem" }}>

            {activePanel === "inicio" && (
              <p style={{ fontSize: sz ? 19 : 17, color: "#5F5E5A", textAlign: "center", padding: "2rem 0", lineHeight: 1.8 }}>
                Elija uno de los temas del menú de arriba para empezar.<br />
                <span style={{ fontSize: sz ? 17 : 15 }}>
                  O vaya directamente a la pestaña <strong style={{ color: "#B35400" }}>Videos</strong> para ver los tutoriales en pantalla.
                </span>
              </p>
            )}

            {(activePanel === "salud" || activePanel === "estado" || activePanel === "vida") && (
              <PanelContent
                panel={activePanel} sz={sz}
                activeGuide={activeGuide}
                showGuide={showGuide}
                goPanel={goPanel}
                sendChat={sendChat}
                ayudaSectionRef={ayudaSectionRef}
              />
            )}

            {activePanel === "videos" && (
              <div id="videos-section" ref={videosSectionRef} style={{ scrollMarginTop: "24px" }}>
                <VideosPanel
                  sz={sz}
                  selectedVideo={selectedVideo}
                  setSelectedVideo={setSelectedVideo}
                  categoriaVideo={categoriaVideo}
                  setCategoriaVideo={setCategoriaVideo}
                />
              </div>
            )}

            {activePanel === "ayuda" && (
              <div ref={ayudaSectionRef} style={{ scrollMarginTop: "24px" }}>
                <AyudaPanel 
                  sz={sz} 
                  messages={messages} 
                  loading={loading} 
                  input={input} 
                  setInput={setInput} 
                  sendChat={sendChat} 
                  chatRef={chatRef}
                  chatContainerRef={chatContainerRef}
                  ultimoMensajeRef={ultimoMensajeRef}
                />
              </div>
            )}

          </div>

          <footer style={{ background: "#1B6B3A", padding: ".9rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Conexión Senior — Proyecto sin fines de lucro — Argentina</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Ayuda gratuita: <strong style={{ color: "#fff" }}>0800-333-1234</strong></span>
          </footer>

        </div>
      </div>
    </>
  );
}

function PanelContent({ panel, sz, activeGuide, showGuide, goPanel, sendChat, ayudaSectionRef }) {
  const configs = {
    salud: {
      title: "Salud y cuidado médico", icon: "ti-heartbeat",
      cards: [
        { id: "pami", icon: "ti-stethoscope", title: "Turno en PAMI", desc: "Sacar turno con su médico sin llamar." },
        { id: "receta", icon: "ti-pill", title: "Receta electrónica", desc: "Obtener y usar la receta digital en la farmacia." },
        { id: "telemedicina", icon: "ti-video", title: "Hablar con el médico por video", desc: "Una consulta desde su casa, sin salir." },
        { id: "farmacia", icon: "ti-building-hospital", title: "Farmacia más cercana", desc: "Encontrarla con el mapa del celular." },
      ],
    },
    estado: {
      title: "Trámites y oficinas del Estado", icon: "ti-building-bank",
      cards: [
        { id: "anses", icon: "ti-report-money", title: "ANSES", desc: "Ver su jubilación y liquidaciones." },
        { id: "dni", icon: "ti-id-badge", title: "DNI digital", desc: "Tener el DNI en el celular." },
        { id: "servicios", icon: "ti-bolt", title: "Pagar servicios", desc: "Luz, gas y agua sin ir al banco." },
        { id: "impuestos", icon: "ti-receipt", title: "Impuestos (AFIP)", desc: "Qué es y cuándo necesita actuar." },
      ],
    },
    vida: {
      title: "Vida diaria y comercio", icon: "ti-shopping-cart",
      cards: [
        { id: "qr", icon: "ti-qrcode", title: "Pagar con código QR", desc: "Cómo pagar en un comercio con el celular." },
        { id: "compras", icon: "ti-shopping-bag", title: "Comprar online", desc: "MercadoLibre y supermercados con envío." },
        { id: "transporte", icon: "ti-bus", title: "Colectivo y transporte", desc: "Saber qué colectivo tomar con el celular." },
        { id: "whatsapp", icon: "ti-message-circle", title: "WhatsApp seguro", desc: "Mandar fotos y mensajes sin riesgos." },
      ],
    },
  };
  const cfg = configs[panel];
  const guide = activeGuide && GUIDES[activeGuide] ? GUIDES[activeGuide] : null;

  function handleDudaButton(textoPregunta) {
    sendChat(textoPregunta);
    goPanel("ayuda");
  }

  return (
    <div>
      <p style={{ fontFamily: "'Lora', serif", fontSize: sz ? 22 : 20, color: "#1B6B3A", marginBottom: "1rem", fontWeight: 600 }}>
        <i className={`ti ${cfg.icon}`} style={{ fontSize: 22, verticalAlign: -3, marginRight: 8 }} aria-hidden="true"></i>
        {cfg.title}
      </p>

      {panel === "vida" && (
        <div style={{ background: "#FEF3EB", border: "1.5px solid #D4580A", borderRadius: 8, padding: ".75rem 1rem", display: "flex", gap: 10, marginBottom: "1rem", alignItems: "flex-start" }}>
          <i className="ti ti-shield-check" style={{ fontSize: 20, color: "#D4580A", marginTop: 1 }} aria-hidden="true"></i>
          <p style={{ fontSize: sz ? 16 : 14, color: "#7A2F00", lineHeight: 1.55 }}>Recuerde: ningún banco ni tienda le pedirá su contraseña por teléfono o mensaje. Si alguien se la pide, no la dé y consulte con un familiar.</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, marginBottom: "1.3rem" }}>
        {cfg.cards.map(c => (
          <div key={c.id} onClick={() => showGuide(c.id)} role="button" tabIndex={0}
            onKeyDown={e => (e.key === "Enter" || e.key === " ") && showGuide(c.id)}
            style={{ border: activeGuide === c.id ? "1.5px solid #1B6B3A" : "0.5px solid rgba(0,0,0,0.22)", borderRadius: 12, padding: ".9rem 1rem", cursor: "pointer", background: activeGuide === c.id ? "#E8F5EE" : "#fff", transition: "all .2s" }}>
            <i className={`ti ${c.icon}`} style={{ fontSize: 22, color: "#1B6B3A", marginBottom: 6, display: "block" }} aria-hidden="true"></i>
            <strong style={{ fontSize: sz ? 17 : 15, fontWeight: 700, display: "block", marginBottom: 3, color: "#1a1a18" }}>{c.title}</strong>
            <span style={{ fontSize: sz ? 15 : 13, color: "#5F5E5A", lineHeight: 1.45 }}>{c.desc}</span>
          </div>
        ))}
      </div>

      {guide && (
        <GuideWithVoice guide={guide} sz={sz} />
      )}

      {activeGuide && !guide && (
        <div style={{ padding: ".75rem 0" }}>
          <button onClick={() => handleDudaButton(`Explicame cómo hacer: ${activeGuide}`)}
            style={{ background: "#D4580A", color: "#fff", border: "none", borderRadius: 8, padding: ".5rem 1.1rem", fontFamily: "inherit", fontSize: sz ? 16 : 14, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <i className="ti ti-robot" aria-hidden="true"></i> Preguntarle al asistente
          </button>
        </div>
      )}
    </div>
  );
}

// COMPONENTE EXCLUSIVO PARA LA NAVEGACIÓN Y FILTRADO DE VIDEOS
function VideosPanel({ sz, selectedVideo, setSelectedVideo, categoriaVideo, setCategoriaVideo }) {
  const categoriasFiltro = [
    { id: "todos", label: "📺 Todos" },
    { id: "salud", label: "❤️ Salud" },
    { id: "estado", label: "🏦 Trámites" },
    { id: "celular", label: "📱 Celular" },
    { id: "vida", label: "🛒 Vida Diaria" },
    { id: "general", label: "📚 General" }
  ];

  const videosFiltrados = categoriaVideo === "todos" 
    ? videos 
    : videos.filter(v => v.categoria === categoriaVideo);

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setTimeout(() => {
      const videoContainer = document.querySelector('.video-player-container');
      if (videoContainer) {
        const elementPosition = videoContainer.getBoundingClientRect().top;
        const scrollPosition = window.pageYOffset + elementPosition - 60;
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <div>
      <p style={{ fontFamily: "'Lora', serif", fontSize: sz ? 22 : 20, color: "#1B6B3A", marginBottom: "1rem", fontWeight: 600 }}>
        <i className="ti ti-video" style={{ fontSize: 22, verticalAlign: -3, marginRight: 8 }} aria-hidden="true"></i>
        Clases en Video y Tutoriales Pasos a Paso
      </p>

      {selectedVideo && (
        <div className="video-player-container" style={{ marginBottom: "1.5rem", background: "#FAF8F3", padding: "1rem", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: "0.5rem" }}>
            <p style={{ fontSize: sz ? 16 : 14, fontWeight: 700, color: "#D4580A", margin: 0 }}>Viendo ahora:</p>
            <VoiceButton text={`${selectedVideo.titulo}. ${selectedVideo.descripcion}`} size={sz ? "large" : "normal"} />
          </div>
          <VideoPlayer video={selectedVideo} sz={sz} />
        </div>
      )}

      {!selectedVideo && (
        <div style={{ background: "#E8F5EE", padding: "1rem 1.25rem", borderRadius: 12, marginBottom: "1.5rem", color: "#0F5C2E", fontSize: sz ? 17 : 15 }}>
          Toque cualquiera de los videos de abajo para comenzar la reproducción en pantalla grande.
        </div>
      )}

      <p style={{ fontSize: sz ? 17 : 15, fontWeight: 700, marginBottom: ".6rem", color: "#1a1a18" }}>¿De qué tema busca videos?</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.5rem" }}>
        {categoriasFiltro.map(cat => {
          const estaActivo = categoriaVideo === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoriaVideo(cat.id)}
              style={{
                background: estaActivo ? "#1B6B3A" : "#fff",
                color: estaActivo ? "#fff" : "#5F5E5A",
                border: estaActivo ? "2px solid #1B6B3A" : "2px solid rgba(0,0,0,0.22)",
                borderRadius: 20,
                padding: "8px 18px",
                fontSize: sz ? 16 : 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s ease-in-out"
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: sz ? 17 : 15, fontWeight: 700, marginBottom: ".8rem", color: "#1a1a18" }}>
        Tutoriales encontrados ({videosFiltrados.length})
      </p>

      {videosFiltrados.length > 0 ? (
        <VideoGrid 
          videos={videosFiltrados} 
          sz={sz} 
          onSelect={handleVideoSelect} 
        />
      ) : (
        <p style={{ fontSize: sz ? 16 : 14, color: "#5F5E5A", fontStyle: "italic", padding: "1rem 0" }}>
          No hay videos cargados en esta categoría por el momento.
        </p>
      )}
    </div>
  );
}

function AyudaPanel({ sz, messages, loading, input, setInput, sendChat, chatRef, chatContainerRef, ultimoMensajeRef }) {
  const glosario = [
    { term: "Router", def: "El aparatito que distribuye el internet por su casa. Si el wifi no anda, a veces hay que reiniciarlo." },
    { term: "App", def: 'Un programa que se instala en el celular o tablet. Como un "libro" con una función específica.' },
    { term: "Contraseña", def: "Una palabra secreta que protege su cuenta. Nunca se la dé a nadie por teléfono." },
    { term: "Código QR", def: "Un cuadradito con puntitos que el celular puede leer para pagar o abrir una página." },
  ];
  
  const quickBtns = [
    "¿Cómo saco turno en PAMI?",
    "¿Cómo veo mi jubilación en ANSES?",
    "¿Cómo pago con QR en un comercio?",
    "¿Qué hago si me llaman diciendo ser del banco?",
  ];

  return (
    <div>
      <p style={{ fontFamily: "'Lora', serif", fontSize: sz ? 22 : 20, color: "#1B6B3A", marginBottom: "1rem", fontWeight: 600 }}>
        <i className="ti ti-help-circle" style={{ fontSize: 22, verticalAlign: -3, marginRight: 8 }} aria-hidden="true"></i>
        Ayuda y Asistente Virtual
      </p>

      <p style={{ fontSize: sz ? 17 : 15, fontWeight: 700, marginBottom: ".7rem", color: "#1a1a18" }}>Palabras difíciles explicadas fácil</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))", gap: 10, marginBottom: "1.8rem" }}>
        {glosario.map(g => (
          <div key={g.term} style={{ border: "0.5px solid rgba(0,0,0,0.22)", borderRadius: 8, padding: ".75rem 1rem", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <strong style={{ fontSize: sz ? 17 : 15, fontWeight: 700, color: "#0C5EA8", display: "block", marginBottom: 3 }}>{g.term}</strong>
              <VoiceButton text={`${g.term}: ${g.def}`} size="small" />
            </div>
            <span style={{ fontSize: sz ? 15 : 13, color: "#5F5E5A", lineHeight: 1.5 }}>{g.def}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: sz ? 17 : 15, fontWeight: 700, marginBottom: ".6rem", color: "#1a1a18" }}>Pregúntele al asistente</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {quickBtns.map(q => (
          <button 
            key={q} 
            onClick={() => sendChat(q)}
            style={{ 
              background: "#F7F6F1", 
              border: "1px solid rgba(0,0,0,0.15)", 
              borderRadius: 20, 
              padding: "8px 16px", 
              fontSize: sz ? 15 : 13, 
              cursor: "pointer", 
              fontFamily: "inherit", 
              color: "#1a1a18", 
              transition: "all .2s",
              textAlign: "center",
              fontWeight: 500,
              whiteSpace: "normal",
              wordBreak: "normal"
            }}>
            {q}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div 
          ref={chatContainerRef}
          style={{ 
            background: "#F7F6F1", 
            borderRadius: 8, 
            padding: "1rem", 
            minHeight: 320, 
            maxHeight: 400, 
            overflowY: "auto", 
            display: "flex", 
            flexDirection: "column", 
            gap: 12 
          }}
        >
          {messages.length === 0 && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, minWidth: 32, borderRadius: "50%", background: "#E8F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🤝</div>
              <div style={{ maxWidth: "78%", borderRadius: 12, padding: "8px 12px", fontSize: sz ? 17 : 15, lineHeight: 1.6, background: "#fff", border: "0.5px solid rgba(0,0,0,0.12)", color: "#1a1a18" }}>
                ¡Bienvenido! Soy su asistente. Puede preguntarme lo que quiera sobre tecnología, trámites o cómo usar el celular. Respondo en palabras sencillas, sin tecnicismos.
              </div>
            </div>
          )}
          
          {messages.map((m, i) => {
            const esUltimoMensaje = i === messages.length - 1;
            const mensajeRef = esUltimoMensaje ? ultimoMensajeRef : null;

            return (
              <div 
                key={i} 
                ref={mensajeRef}
                style={{ 
                  display: "flex", 
                  gap: 8, 
                  alignItems: "flex-start", 
                  flexDirection: m.role === "user" ? "row-reverse" : "row",
                  scrollMarginTop: "10px"
                }}
              >
                <div style={{ width: 32, height: 32, minWidth: 32, borderRadius: "50%", background: m.role === "user" ? "#FEF3EB" : "#E8F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                  {m.role === "user" ? "👤" : "🤝"}
                </div>
                <div style={{ maxWidth: "78%", borderRadius: 12, padding: "8px 12px", fontSize: sz ? 17 : 15, lineHeight: 1.6, background: m.role === "user" ? "#1B6B3A" : "#fff", border: m.role === "user" ? "none" : "0.5px solid rgba(0,0,0,0.12)", color: m.role === "user" ? "#fff" : "#1a1a18", whiteSpace: "pre-wrap" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: sz ? 14 : 12 }}>
                      {m.role === "user" ? "📝 Usted preguntó:" : "💬 Asistente:"}
                    </span>
                    {m.role === "assistant" && (
                      <VoiceButton text={m.content} size="small" />
                    )}
                  </div>
                  {m.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, minWidth: 32, borderRadius: "50%", background: "#E8F5EE", display: "flex", alignItems: "center", justifyContent: "center" }}>🤝</div>
              <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 5 }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <span key={i} style={{ width: 7, height: 7, background: "#1B6B3A", borderRadius: "50%", display: "inline-block", animation: `bop 1.1s ${d}s infinite` }}></span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === "Enter" && sendChat()}
            placeholder="Escriba su pregunta aquí...puede utilizar solo una palabra..." 
            aria-label="Su pregunta al asistente"
            style={{ flex: 1, border: "0.5px solid rgba(0,0,0,0.22)", borderRadius: 8, padding: "0.6rem 0.9rem", fontFamily: "inherit", fontSize: sz ? 17 : 15, background: "#fff", color: "#1a1a18" }} 
          />
          <button 
            onClick={() => sendChat()} 
            disabled={loading}
            style={{ background: "#1B6B3A", color: "#fff", border: "none", borderRadius: 8, padding: "0.6rem 1.1rem", fontFamily: "inherit", fontSize: sz ? 17 : 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: loading ? 0.45 : 1 }}
          >
            <i className="ti ti-send" aria-hidden="true"></i> Enviar
          </button>
        </div>
      </div>
      <style>{`@keyframes bop{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}