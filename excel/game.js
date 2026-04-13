// ================================================================
//  ExcelQuest – El Reino de los Datos
//  Profesor Alan Acosta | game.js
// ================================================================

// ===== ESTADO DEL JUEGO =====
const G = {
  playerName: '',
  charType: '',
  points: 0,
  xp: 0,
  currentLevel: 0,
  unlockedLevel: 1,
  completedLevels: [],
  dialogueIndex: 0,
  battleAnswer: null,
  selectedQuizOption: null,
  hintUsed: false,
  typeTimer: null,
  pendingVictoryTimer: null,
};

// ===== UTILIDADES =====
const $ = id => document.getElementById(id);
const STORAGE_KEY = 'excelquest-save-v2';
const showScreen = id => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
};
const pName = () => `<span class="player-name-tag">${G.playerName}</span>`;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeText(value) {
  return String(value)
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/Â¡/g, '¡')
    .replace(/Â¿/g, '¿')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã/g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã/g, 'Í')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã‘/g, 'Ñ')
    .replace(/Ã¼/g, 'ü')
    .replace(/âœ¦/g, '✦')
    .replace(/â–¶/g, '▶')
    .replace(/â–®/g, '▮')
    .replace(/âš”ï¸/g, '⚔️')
    .replace(/âšœï¸/g, '⚜️')
    .replace(/â›°ï¸/g, '⛰️')
    .replace(/â›ï¸/g, '⛏️')
    .replace(/âˆ’/g, '-')
    .replace(/â†’/g, '→')
    .replace(/â‰¥/g, '≥')
    .replace(/ðŸŒ€/g, '🌀')
    .replace(/ðŸŽ‰/g, '🎉')
    .replace(/ðŸ†/g, '🏆')
    .replace(/ðŸ‘‘/g, '👑')
    .replace(/ðŸ¡/g, '🏡')
    .replace(/ðŸ”¢/g, '🔢')
    .replace(/ðŸ§®/g, '🧮')
    .replace(/ðŸ“Š/g, '📊')
    .replace(/ðŸ’°/g, '💰')
    .replace(/ðŸŒŠ/g, '🌊')
    .replace(/ðŸ§ /g, '🧠')
    .replace(/ðŸ™ï¸/g, '🏙️')
    .replace(/ðŸ”/g, '🔍')
    .replace(/ðŸª/g, '🏪')
    .replace(/ðŸ›•/g, '🛕')
    .replace(/ðŸ¯/g, '🏯')
    .replace(/ðŸ°/g, '🏰')
    .replace(/ðŸï¸/g, '🏝️')
    .replace(/ðŸ“ˆ/g, '📈')
    .replace(/ðŸŽ¯/g, '🎯')
    .replace(/ðŸŒ¿/g, '🌿')
    .replace(/ðŸ—»/g, '🗻')
    .replace(/â­/g, '⭐')
    .replace(/âœ“/g, '✓')
    .replace(/âœ…/g, '✅')
    .replace(/âŒ/g, '❌')
    .replace(/âš ï¸/g, '⚠️')
    .replace(/ðŸ’¡/g, '💡')
    .replace(/ðŸ—º/g, '🗺️')
    .replace(/ðŸ“–/g, '📖')
    .replace(/ðŸ—„ï¸/g, '🗄️')
    .replace(/ðŸ§›/g, '🧛')
    .replace(/ðŸ²/g, '🐲')
    .replace(/ðŸŸ¢/g, '🟢')
    .replace(/ðŸ‘º/g, '👺')
    .replace(/ðŸ¦/g, '🦁')
    .replace(/ðŸ“œ/g, '📜')
    .replace(/ðŸ—¿/g, '🗿')
    .replace(/ðŸ’€/g, '💀')
    .replace(/ðŸ“‰/g, '📉')
    .replace(/ðŸ“‹/g, '📋')
    .replace(/ðŸ/g, '🐍')
    .replace(/ðŸŽ®/g, '🎮');
}

function renderRichText(value) {
  const resolved = typeof value === 'function' ? value() : value;
  return normalizeText(String(resolved).replace(/\$\{\(\)=>pName\(\)\}/g, pName()));
}

function setHtml(id, html) {
  const el = $(id);
  if (el) el.innerHTML = normalizeText(html);
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = normalizeText(text);
}

function saveProgress() {
  try {
    const payload = {
      playerName: G.playerName,
      charType: G.charType,
      points: G.points,
      xp: G.xp,
      currentLevel: G.currentLevel,
      unlockedLevel: G.unlockedLevel,
      completedLevels: G.completedLevels
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('No se pudo guardar el progreso.', error);
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    if (!saved || !saved.playerName || !saved.charType) return false;

    G.playerName = saved.playerName;
    G.charType = saved.charType;
    G.points = Number(saved.points) || 0;
    G.xp = Number(saved.xp) || 0;
    G.currentLevel = Number(saved.currentLevel) || 0;
    G.unlockedLevel = Math.max(1, Number(saved.unlockedLevel) || 1);
    G.completedLevels = Array.isArray(saved.completedLevels) ? saved.completedLevels.map(Number).filter(Boolean) : [];
    return true;
  } catch (error) {
    console.warn('No se pudo cargar el progreso.', error);
    return false;
  }
}

// ===== DEFINICIÓN DE LOS 30 NIVELES =====
const LEVELS = [
  // ── ZONA 1: El Valle del Inicio ──────────────────────────────
  {
    id: 1, zone: 'Valle del Inicio', icon: '🏡', type: 'teach',
    title: 'El Origen de las Planillas',
    bg: 'linear-gradient(180deg,#0a1a10 0%,#0d2010 60%,#0a1a08 100%)',
    enemy: null,
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡Bienvenido, ${()=>pName()}! Soy el Profesor Alan Acosta. Hoy comienza tu aventura en el Reino de Calcurea.` },
      { speaker: 'Prof. Alan Acosta', text: `Hace mucho tiempo, el sabio Calc inventó una poderosa herramienta llamada PLANILLA DE CÁLCULO. Con ella podía organizar números, textos y fórmulas mágicas.` },
      { speaker: 'Prof. Alan Acosta', text: `Pero el malvado Virus Kaptor destruyó el reino y dispersó los conocimientos por todo el mundo. ¡Solo vos podés recuperarlos!` },
      { speaker: 'Prof. Alan Acosta', text: `Una HOJA DE CÁLCULO es como una tabla gigante dividida en FILAS (horizontales, numeradas 1, 2, 3...) y COLUMNAS (verticales, con letras A, B, C...).` },
      { speaker: 'Prof. Alan Acosta', text: `Donde se cruzan una fila y una columna se forma una CELDA. Por ejemplo: la celda A1 es la que está en la Columna A, Fila 1. ¡Es como las coordenadas de un mapa!` },
      { speaker: 'Prof. Alan Acosta', text: `Excel, LibreOffice Calc y Google Sheets son programas de planillas de cálculo. Se usan para negocios, escuelas, ciencia ¡y hasta en videojuegos! 🎮` },
      { speaker: 'Prof. Alan Acosta', text: `Ya aprendiste lo básico. ¡Estás listo para tu primer desafío! El reino cuenta contigo, ${()=>pName()}.` },
    ],
  },
  {
    id: 2, zone: 'Valle del Inicio', icon: '⚔️', type: 'battle',
    title: '¡El Slime del Caos!',
    bg: 'linear-gradient(180deg,#0a1a10 0%,#0d1a08 100%)',
    enemy: { name: 'Slime de la Confusión', icon: '🟢', hp: 100 },
    description: () => `¡Un Slime de la Confusión bloquea el camino, ${pName()}! Para vencerlo, respondé correctamente estas preguntas sobre lo que aprendiste.`,
    quiz: [
      {
        q: '¿Cómo se llama el lugar donde se cruza una fila con una columna en una planilla?',
        options: ['Tabla', 'Celda', 'Hoja', 'Fila'],
        correct: 1,
        explanation: '¡Exacto! La intersección de una fila y una columna se llama CELDA. Por ejemplo: A1, B3, C7.'
      },
      {
        q: '¿Con qué tipo de caracteres se identifican las COLUMNAS en Excel?',
        options: ['Números', 'Símbolos', 'Letras', 'Colores'],
        correct: 2,
        explanation: '¡Correcto! Las columnas se identifican con letras: A, B, C... Z, AA, AB...'
      },
      {
        q: '¿Con qué se identifican las FILAS en Excel?',
        options: ['Letras', 'Números', 'Colores', 'Iconos'],
        correct: 1,
        explanation: '¡Muy bien! Las filas se numeran: 1, 2, 3... y pueden llegar hasta más de un millón.'
      }
    ],
    pts: 80,
    victoryMsg: () => `¡Magnífico, ${pName()}! Derrotaste al Slime. Las bases del reino están más seguras. El conocimiento es poder.`
  },

  // ── ZONA 2: La Aldea de los Números ──────────────────────────
  {
    id: 3, zone: 'Aldea de Números', icon: '🏘️', type: 'teach',
    title: 'La Magia de Ingresar Datos',
    bg: 'linear-gradient(180deg,#0a0a20 0%,#101030 100%)',
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡Bienvenido a la Aldea de los Números, ${()=>pName()}! Aquí aprenderás a ingresar datos en las celdas.` },
      { speaker: 'Prof. Alan Acosta', text: `En una planilla podés ingresar tres tipos de datos: TEXTO (palabras), NÚMEROS y FÓRMULAS (que empiezan con =).` },
      { speaker: 'Prof. Alan Acosta', text: `Para ingresar algo en una celda, hacés clic en ella y escribís. Luego apretás ENTER para confirmar. ¡Así de fácil!` },
      { speaker: 'Prof. Alan Acosta', text: `Los TEXTOS se alinean a la izquierda automáticamente. Los NÚMEROS se alinean a la derecha. ¡Excel es inteligente y los diferencia solo!` },
      { speaker: 'Prof. Alan Acosta', text: `Para borrar el contenido de una celda, la seleccionás y apretás la tecla DELETE o SUPR. ¡Sin miedo, no borrás nada más!` },
    ],
  },
  {
    id: 4, zone: 'Aldea de Números', icon: '🔢', type: 'battle',
    title: '¡El Duende de los Datos Revueltos!',
    bg: 'linear-gradient(180deg,#0a0a20 0%,#101030 100%)',
    enemy: { name: 'Duende Confuso', icon: '👺', hp: 100 },
    description: () => `¡El Duende Confuso mezcló todos los datos del almacén del pueblo! Ayudá a ${pName()} a identificar qué tipo de dato es cada cosa.`,
    quiz: [
      {
        q: '¿Qué tipo de dato es: "Nombre del cliente"?',
        options: ['Número', 'Fórmula', 'Texto', 'Error'],
        correct: 2,
        explanation: '"Nombre del cliente" es TEXTO. En Excel, el texto se alinea a la izquierda.'
      },
      {
        q: '¿Qué tipo de dato es: 1250.50?',
        options: ['Texto', 'Número', 'Fórmula', 'Fecha'],
        correct: 1,
        explanation: '1250.50 es un NÚMERO. Los números se alinean a la derecha y se pueden usar en cálculos.'
      },
      {
        q: '¿Qué característica tienen las FÓRMULAS en Excel?',
        options: ['Empiezan con #', 'Empiezan con =', 'Empiezan con @', 'Empiezan con $'],
        correct: 1,
        explanation: '¡Exacto! Toda fórmula en Excel SIEMPRE empieza con el signo = (igual). Por ejemplo: =A1+B1'
      }
    ],
    pts: 90,
    victoryMsg: () => `¡Excelente, ${pName()}! El duende huyó. El almacén del pueblo está ordenado. ¡Los datos bien organizados salvan reinos!`
  },

  // ── ZONA 3: El Bosque de las Fórmulas ────────────────────────
  {
    id: 5, zone: 'Bosque Fórmulas', icon: '🌲', type: 'teach',
    title: 'La Suma: El Hechizo Más Básico',
    bg: 'linear-gradient(180deg,#051a05 0%,#082008 60%,#051205 100%)',
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡El Bosque de las Fórmulas! Aquí vive la magia más poderosa del reino: las operaciones matemáticas.` },
      { speaker: 'Prof. Alan Acosta', text: `La SUMA es el hechizo más básico. Hay dos formas de sumar:\n1) Escribir: =A1+B1+C1\n2) Usar la función: =SUMA(A1:C1)` },
      { speaker: 'Prof. Alan Acosta', text: `El símbolo : (dos puntos) significa "desde hasta". Entonces A1:A5 significa "desde A1 hasta A5". ¡Es un rango de celdas!` },
      { speaker: 'Prof. Alan Acosta', text: `Ejemplo: Si en A1 tenés 100, en A2 tenés 200 y en A3 tenés 300, la fórmula =SUMA(A1:A3) dará como resultado 600.` },
      { speaker: 'Prof. Alan Acosta', text: `También podés restar: =A1-B1, multiplicar: =A1*B1 y dividir: =A1/B1. ¡Los operadores son +, -, *, /!` },
      { speaker: 'Prof. Alan Acosta', text: `Lo más PODEROSO es que si cambiás el número en A1, el resultado de la fórmula se actualiza SOLO. ¡Eso es la magia de Excel!` },
    ],
  },
  {
    id: 6, zone: 'Bosque Fórmulas', icon: '🧮', type: 'battle',
    title: '¡La Tienda de la Señora Rosa!',
    bg: 'linear-gradient(180deg,#051a05 0%,#082008 60%,#051205 100%)',
    enemy: { name: 'Números Revueltos', icon: '🌀', hp: 100 },
    description: () => `La Señora Rosa vende frutas en el mercado del bosque. Ella necesita calcular sus GANANCIAS. Ayudá a ${pName()} a construir su planilla y calcular cuánto ganó vendiendo manzanas y naranjas.`,
    spreadsheet: {
      cols: ['A','B','C','D'],
      headers: ['Producto','Costo ($)','Precio Venta ($)','Ganancia ($)'],
      rows: [
        ['Manzanas', '30', '50', { formula: '=C2-B2', expected: 20, editable: true }],
        ['Naranjas',  '40', '70', { formula: '=C3-B3', expected: 30, editable: true }],
        ['TOTAL', '', '', { formula: '=D2+D3', expected: 50, editable: true }],
      ],
      inputCells: ['D2','D3','D4'],
      hint: 'La ganancia = Precio de Venta − Costo. Escribí la fórmula =C2-B2 en la celda D2, =C3-B3 en D3 y =D2+D3 en D4.',
    },
    pts: 120,
    victoryMsg: () => `¡INCREÍBLE, ${pName()}! Aprendiste a calcular ganancias con fórmulas. La Señora Rosa puede manejar su negocio. ¡Eso es el poder de Excel!`
  },

  // ── ZONA 4: La Cueva del Promedio ────────────────────────────
  {
    id: 7, zone: 'Cueva del Promedio', icon: '⛏️', type: 'teach',
    title: 'PROMEDIO: El Oráculo del Equilibrio',
    bg: 'linear-gradient(180deg,#0a0510 0%,#150a20 60%,#0a0510 100%)',
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡La Cueva del Promedio! Aquí mora el Oráculo que todo lo equilibra. El PROMEDIO nos dice el valor "del medio" de un conjunto de números.` },
      { speaker: 'Prof. Alan Acosta', text: `Fórmula: =PROMEDIO(A1:A5)\nEsto suma todos los valores del rango y los divide por la cantidad. ¡Excel lo hace automáticamente!` },
      { speaker: 'Prof. Alan Acosta', text: `Ejemplo: Si tres estudiantes sacaron 6, 8 y 10, el promedio es (6+8+10)/3 = 8. Con Excel: =PROMEDIO(A1:A3) y obtenés 8.` },
      { speaker: 'Prof. Alan Acosta', text: `El promedio se usa para: calcular notas, analizar ventas, medir temperaturas, ¡y mucho más! Es una de las funciones más usadas del mundo.` },
    ],
  },
  {
    id: 8, zone: 'Cueva del Promedio', icon: '📊', type: 'battle',
    title: '¡El Dragón de las Notas!',
    bg: 'linear-gradient(180deg,#0a0510 0%,#150a20 60%,#0a0510 100%)',
    enemy: { name: 'Dragón de las Notas', icon: '🐲', hp: 100 },
    description: () => `El Dragón de las Notas tiene las calificaciones de los estudiantes del reino mezcladas. Ayudá a ${pName()} a calcular el promedio de notas de cada alumno para saber si aprobaron.`,
    spreadsheet: {
      cols: ['A','B','C','D','E'],
      headers: ['Alumno','Nota 1','Nota 2','Nota 3','Promedio'],
      rows: [
        ['Ana',    '7', '9', '8',  { formula: '=PROMEDIO(B2:D2)', expected: 8,    editable: true }],
        ['Carlos', '5', '6', '7',  { formula: '=PROMEDIO(B3:D3)', expected: 6,    editable: true }],
        ['María',  '10','9', '10', { formula: '=PROMEDIO(B4:D4)', expected: 9.67, editable: true }],
      ],
      inputCells: ['E2','E3','E4'],
      hint: 'Usá =PROMEDIO(B2:D2) en E2 para calcular el promedio de Ana. Hacé lo mismo para Carlos (E3) y María (E4).',
    },
    pts: 130,
    victoryMsg: () => `¡Fantástico, ${pName()}! El Dragón se rindió ante tu conocimiento. Ahora el reino puede evaluar a sus estudiantes correctamente.`
  },

  // ── ZONA 5: Las Torres del Porcentaje ────────────────────────
  {
    id: 9, zone: 'Torres del %', icon: '🏰', type: 'teach',
    title: 'Los Porcentajes: La Magia del Tanto Por Ciento',
    bg: 'linear-gradient(180deg,#1a0a00 0%,#2a1000 60%,#1a0800 100%)',
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡Las Torres del Porcentaje! Aquí los porcentajes son la moneda del poder. Un porcentaje es una parte de 100.` },
      { speaker: 'Prof. Alan Acosta', text: `Para calcular el 20% de 500: =500*20/100 → Resultado: 100\nO más simple: =500*0.2 → ¡Mismo resultado!` },
      { speaker: 'Prof. Alan Acosta', text: `En Excel también podés formatear una celda como porcentaje. Si escribís 0.2 y la formateas como %, te muestra 20%.` },
      { speaker: 'Prof. Alan Acosta', text: `Ejemplo práctico: Un producto cuesta $200 y tiene 15% de descuento.\nDescuento: =200*15/100 = $30\nPrecio final: =200-30 = $170` },
      { speaker: 'Prof. Alan Acosta', text: `Para calcular QUÉ porcentaje representa un número: =(parte/total)*100\nEjemplo: 30 es qué % de 200? =(30/200)*100 = 15%` },
    ],
  },
  {
    id: 10, zone: 'Torres del %', icon: '💰', type: 'battle',
    title: '¡El Mercader Avaro!',
    bg: 'linear-gradient(180deg,#1a0a00 0%,#2a1000 60%,#1a0800 100%)',
    enemy: { name: 'Mercader Avaro', icon: '🧛', hp: 100 },
    description: () => `El Mercader Avaro quiere cobrar de más en su tienda. Ayudá a ${pName()} a calcular los precios correctos con descuentos para defender al pueblo.`,
    spreadsheet: {
      cols: ['A','B','C','D'],
      headers: ['Producto','Precio Original ($)','Descuento (%)','Precio Final ($)'],
      rows: [
        ['Espada',   '300', '10', { formula: '=B2-(B2*C2/100)', expected: 270, editable: true }],
        ['Escudo',   '200', '25', { formula: '=B3-(B3*C3/100)', expected: 150, editable: true }],
        ['Poción',   '50',  '20', { formula: '=B4-(B4*C4/100)', expected: 40,  editable: true }],
      ],
      inputCells: ['D2','D3','D4'],
      hint: 'El Precio Final = Precio Original − (Precio Original × Descuento / 100). Escribí =B2-(B2*C2/100) en D2.',
    },
    pts: 150,
    victoryMsg: () => `¡Brillante, ${pName()}! El mercader ya no puede engañar al pueblo. Los porcentajes son tus aliados en el comercio.`
  },

  // ── ZONA 6: El Lago de la Lógica ─────────────────────────────
  {
    id: 11, zone: 'Lago de la Lógica', icon: '🌊', type: 'teach',
    title: 'SI, Y, O: Los Tres Guardianes Lógicos',
    bg: 'linear-gradient(180deg,#001520 0%,#002030 60%,#001020 100%)',
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡El Lago de la Lógica! Aquí viven los tres guardianes más inteligentes del reino: SI, Y, O.` },
      { speaker: 'Prof. Alan Acosta', text: `La función SI evalúa una condición y da dos posibles resultados:\n=SI(condición; "si es verdad"; "si es falso")\nEjemplo: =SI(A1>=6; "Aprobado"; "Reprobado")` },
      { speaker: 'Prof. Alan Acosta', text: `La función Y devuelve VERDADERO solo si TODAS las condiciones son ciertas:\n=Y(A1>5; B1>5)\nSolo es verdadero si A1 Y B1 son mayores que 5.` },
      { speaker: 'Prof. Alan Acosta', text: `La función O devuelve VERDADERO si AL MENOS UNA condición es cierta:\n=O(A1>5; B1>5)\nEs verdadero si A1 O B1 son mayores que 5.` },
      { speaker: 'Prof. Alan Acosta', text: `¡Se pueden combinar! =SI(Y(A1>=6;B1>=6);"Aprueba todo";"Debe recuperar")\nEsto aprueba solo si las DOS notas son 6 o más.` },
    ],
  },
  {
    id: 12, zone: 'Lago de la Lógica', icon: '🧠', type: 'battle',
    title: '¡La Esfinge del Lago!',
    bg: 'linear-gradient(180deg,#001520 0%,#002030 60%,#001020 100%)',
    enemy: { name: 'Esfinge del Lago', icon: '🦁', hp: 100 },
    description: () => `La Esfinge plantea acertijos lógicos a ${pName()}. ¡Demostrá tu sabiduría con las funciones lógicas de Excel!`,
    quiz: [
      {
        q: '¿Qué resultado dará =SI(5>3;"Grande";"Chico")?',
        options: ['Chico', 'Grande', 'Error', '5'],
        correct: 1,
        explanation: '5>3 es VERDADERO, entonces la función SI devuelve el primer valor: "Grande".'
      },
      {
        q: '¿Qué devuelve =Y(3>2; 10>5)?',
        options: ['FALSO', 'ERROR', 'VERDADERO', '0'],
        correct: 2,
        explanation: 'Ambas condiciones son verdaderas (3>2 y 10>5), por lo que Y() devuelve VERDADERO.'
      },
      {
        q: 'Un alumno tiene nota 4 en Matemática y 8 en Lengua. ¿Qué fórmula lo aprueba si le alcanza con una sola?',
        options: ['=SI(Y(A1>=6;B1>=6);"Aprueba";"No")', '=SI(O(A1>=6;B1>=6);"Aprueba";"No")', '=SI(A1>=6;"Aprueba";"No")', '=SI(B1>=6;"Aprueba";"No")'],
        correct: 1,
        explanation: 'Con O() alcanza con que UNA condición sea verdadera. Como Lengua (8) ≥ 6, el alumno aprueba.'
      }
    ],
    pts: 160,
    victoryMsg: () => `¡IMPRESIONANTE, ${pName()}! La Esfinge quedó muda. La lógica de Excel no tiene secretos para vos.`
  },

  // ── ZONA 7: La Ciudad del BUSCARV ────────────────────────────
  {
    id: 13, zone: 'Ciudad de BUSCARV', icon: '🏙️', type: 'teach',
    title: 'BUSCARV: El Detective de los Datos',
    bg: 'linear-gradient(180deg,#0a0515 0%,#15082a 100%)',
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡Bienvenido a la Ciudad del BUSCARV, ${()=>pName()}! Esta función es como un detective: busca un dato en una tabla y te trae información relacionada.` },
      { speaker: 'Prof. Alan Acosta', text: `La sintaxis es:\n=BUSCARV(qué_busco; dónde_busco; qué_columna_traigo; 0)\nEl 0 al final significa búsqueda exacta.` },
      { speaker: 'Prof. Alan Acosta', text: `Ejemplo: Tenés una tabla de productos (A:C) con Código, Nombre y Precio. Para buscar el precio del producto con código 101:\n=BUSCARV(101;A:C;3;0)\nBusca 101 en la columna A y trae el valor de la columna 3 (Precio).` },
      { speaker: 'Prof. Alan Acosta', text: `IMPORTANTE: BUSCARV siempre busca en la PRIMERA columna del rango. El número final indica cuál columna del rango querés traer.` },
      { speaker: 'Prof. Alan Acosta', text: `Si el valor no existe, aparece #N/A. Esto significa "No Disponible". ¡Es una señal de que el código buscado no está en la tabla!` },
    ],
  },
  {
    id: 14, zone: 'Ciudad de BUSCARV', icon: '🔍', type: 'battle',
    title: '¡El Archivista Olvidadizo!',
    bg: 'linear-gradient(180deg,#0a0515 0%,#15082a 100%)',
    enemy: { name: 'Archivista Olvidadizo', icon: '🗄️', hp: 100 },
    description: () => `El Archivista perdió los precios de los productos. Hay una tabla con códigos y precios, pero él necesita buscar el precio del producto 102. Ayudá a ${pName()} a usar BUSCARV.`,
    quiz: [
      {
        q: 'Tenés una tabla donde A1:B5 tiene códigos y precios. ¿Cómo buscás el precio del código que está en D1?',
        options: ['=BUSCARV(D1;A1:B5;1;0)', '=BUSCARV(D1;A1:B5;2;0)', '=BUSCARV(A1;D1:D5;2;0)', '=BUSCARV(B5;A1:B5;1;0)'],
        correct: 1,
        explanation: 'Correcto: buscamos D1 en el rango A1:B5, y queremos traer la columna 2 (precios). El 0 es búsqueda exacta.'
      },
      {
        q: '¿Qué significa el #N/A que muestra BUSCARV?',
        options: ['Hay un error de suma', 'El valor buscado no existe en la tabla', 'La columna está vacía', 'La fórmula tiene mal el rango'],
        correct: 1,
        explanation: '#N/A significa "No Aplicable" o "No Disponible". El valor que buscás no existe en la primera columna del rango.'
      },
      {
        q: 'En =BUSCARV(A1;B:D;3;0), ¿qué trae el número 3?',
        options: ['La celda A3', 'La tercera columna del rango B:D (que es D)', 'El tercer resultado', 'El rango de 3 celdas'],
        correct: 1,
        explanation: 'El número 3 indica que queremos traer el valor de la TERCERA columna del rango especificado (B:D). La tercera columna es D.'
      }
    ],
    pts: 170,
    victoryMsg: () => `¡Asombroso, ${pName()}! El archivista tiene su sistema de búsqueda. BUSCARV es una de las funciones más usadas en el trabajo real.`
  },

  // ── ZONA 8: La Montaña de la Multiplicación ───────────────────
  {
    id: 15, zone: 'Montaña × ÷', icon: '⛰️', type: 'teach',
    title: 'Multiplicación y División: La Fuerza y la División',
    bg: 'linear-gradient(180deg,#100510 0%,#200a20 100%)',
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡La Montaña de la Multiplicación! Aquí el poder se multiplica. Para multiplicar en Excel usamos el asterisco: *` },
      { speaker: 'Prof. Alan Acosta', text: `Ejemplo: Si tenés 5 cajas y cada caja tiene 12 unidades, el total es:\n=B2*C2 (donde B2=5 y C2=12)\nResultado: 60 unidades.` },
      { speaker: 'Prof. Alan Acosta', text: `Para dividir usamos la barra /:\n=A1/B1\nSi A1=120 y B1=4, el resultado es 30.` },
      { speaker: 'Prof. Alan Acosta', text: `Una operación muy común: Precio total = Cantidad × Precio unitario\n=B2*C2\n¡Eso es todo! Excel calcula automáticamente.` },
      { speaker: 'Prof. Alan Acosta', text: `Tip de experto: Podés combinar todo en una fórmula.\n=(B2*C2)-(B2*C2*D2/100)\nEso calcula el total con descuento incluido en un solo paso.` },
    ],
  },
  {
    id: 16, zone: 'Montaña × ÷', icon: '🏪', type: 'battle',
    title: '¡El Almacén del Guerrero!',
    bg: 'linear-gradient(180deg,#100510 0%,#200a20 100%)',
    enemy: { name: 'Factura del Caos', icon: '📜', hp: 100 },
    description: () => `El almacén de armas del reino necesita calcular el subtotal de cada ítem. Ayudá a ${pName()} a completar la factura de compra multiplicando cantidad por precio.`,
    spreadsheet: {
      cols: ['A','B','C','D'],
      headers: ['Artículo','Cantidad','Precio Unit. ($)','Subtotal ($)'],
      rows: [
        ['Espada larga',  '3',  '150', { formula: '=B2*C2', expected: 450, editable: true }],
        ['Escudo de roble','2', '200', { formula: '=B3*C3', expected: 400, editable: true }],
        ['Poción roja',   '10', '25',  { formula: '=B4*C4', expected: 250, editable: true }],
        ['TOTAL',         '',   '',    { formula: '=D2+D3+D4', expected: 1100, editable: true }],
      ],
      inputCells: ['D2','D3','D4','D5'],
      hint: 'El subtotal es Cantidad × Precio. Escribí =B2*C2 en D2, =B3*C3 en D3, =B4*C4 en D4, y =D2+D3+D4 en D5 para el total.',
    },
    pts: 150,
    victoryMsg: () => `¡PERFECTO, ${pName()}! La factura está lista. El almacén puede seguir proveyendo al ejército del reino.`
  },

  // ── ZONA 9: El Templo del MAX y MIN ──────────────────────────
  {
    id: 17, zone: 'Templo MAX/MIN', icon: '🛕', type: 'teach',
    title: 'MAX, MIN y CONTAR: Los Sabios del Templo',
    bg: 'linear-gradient(180deg,#1a0a00 0%,#2a1500 100%)',
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡El Templo de MAX y MIN! Aquí viven funciones que encuentran los extremos y cuentan.` },
      { speaker: 'Prof. Alan Acosta', text: `=MAX(A1:A10) → Encuentra el valor MÁXIMO en ese rango\n=MIN(A1:A10) → Encuentra el valor MÍNIMO en ese rango` },
      { speaker: 'Prof. Alan Acosta', text: `=CONTAR(A1:A10) → Cuenta cuántas celdas tienen NÚMEROS\n=CONTARA(A1:A10) → Cuenta celdas con CUALQUIER contenido (texto o número)` },
      { speaker: 'Prof. Alan Acosta', text: `Ejemplo: Si tenés ventas de 10 días y querés saber el mejor y peor día:\nMejor día: =MAX(B2:B11)\nPeor día:  =MIN(B2:B11)` },
    ],
  },
  {
    id: 18, zone: 'Templo MAX/MIN', icon: '🏆', type: 'battle',
    title: '¡El Torneo de los Números!',
    bg: 'linear-gradient(180deg,#1a0a00 0%,#2a1500 100%)',
    enemy: { name: 'Coloso de los Récords', icon: '🗿', hp: 100 },
    description: () => `¡El Torneo! ${pName()} debe analizar los puntajes de los competidores para encontrar el máximo, mínimo y promedio del torneo.`,
    spreadsheet: {
      cols: ['A','B'],
      headers: ['Competidor','Puntaje'],
      rows: [
        ['Guerrero Rojo',  '850'],
        ['Maga Azul',      '920'],
        ['Orco Verde',     '750'],
        ['Bruja Oscura',   '990'],
        ['Brujo Dorado',   '870'],
        ['─────────────', '───'],
        ['Puntaje MÁXIMO', { formula: '=MAX(B2:B6)', expected: 990, editable: true }],
        ['Puntaje MÍNIMO', { formula: '=MIN(B2:B6)', expected: 750, editable: true }],
        ['PROMEDIO',       { formula: '=PROMEDIO(B2:B6)', expected: 876, editable: true }],
      ],
      inputCells: ['B8','B9','B10'],
      hint: 'En B8 escribí =MAX(B2:B6), en B9 escribí =MIN(B2:B6), en B10 escribí =PROMEDIO(B2:B6).',
    },
    pts: 160,
    victoryMsg: () => `¡CAMPEÓN, ${pName()}! El Coloso se inclinó ante tu destreza. Las funciones MAX, MIN y PROMEDIO son herramientas esenciales.`
  },

  // ── ZONA 10: El Castillo Final ────────────────────────────────
  {
    id: 19, zone: 'Castillo Final', icon: '🏯', type: 'teach',
    title: 'Referencias Absolutas: El Escudo del Mago',
    bg: 'linear-gradient(180deg,#15001a 0%,#250030 100%)',
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡El Castillo Final! Aquí aprenderás el poder de las referencias absolutas, el secreto de los grandes magos.` },
      { speaker: 'Prof. Alan Acosta', text: `Cuando copiás una fórmula =A1*B1 hacia abajo, se convierte en =A2*B2, =A3*B3... Eso se llama referencia RELATIVA.` },
      { speaker: 'Prof. Alan Acosta', text: `Pero a veces querés que una celda NO cambie al copiar. Usás el signo $ para fijarla:\n$A$1 → fija tanto la columna como la fila\n$A1 → solo fija la columna\nA$1 → solo fija la fila` },
      { speaker: 'Prof. Alan Acosta', text: `Ejemplo: Tenés el IVA en la celda E1 (21%). Para calcular el IVA de cada precio:\n=A2*$E$1 → Si copias hacia abajo, A2 cambia pero $E$1 siempre apunta al IVA.` },
      { speaker: 'Prof. Alan Acosta', text: `Atajo: Seleccioná la referencia en la fórmula y apretá F4 para agregar los signos $ automáticamente.` },
    ],
  },
  {
    id: 20, zone: 'Castillo Final', icon: '🏰', type: 'battle',
    title: '¡El Jefe Final: Virus Kaptor!',
    bg: 'linear-gradient(180deg,#15001a 0%,#250030 100%)',
    enemy: { name: '⚡ VIRUS KAPTOR ⚡', icon: '💀', hp: 100 },
    description: () => `¡BATALLA FINAL, ${pName()}! El Virus Kaptor desafía todo lo que aprendiste. Demostrá que podés recuperar el reino de Calcurea con tu conocimiento de Excel.`,
    quiz: [
      {
        q: '¿Para qué sirve el $ en una fórmula de Excel como $A$1?',
        options: ['Indica precio en dólares', 'Fija la celda para que no cambie al copiar la fórmula', 'Suma automáticamente', 'Busca el valor mayor'],
        correct: 1,
        explanation: '¡Correcto! El $ fija la referencia. $A$1 siempre apuntará a la celda A1, aunque copies la fórmula a otro lugar.'
      },
      {
        q: '¿Cuál es la función correcta para calcular el promedio de ventas de B2 a B12?',
        options: ['=SUMA(B2:B12)/10', '=PROMEDIO(B2:B12)', '=MEDIA(B2:B12)', '=AVG(B2:B12)'],
        correct: 1,
        explanation: '=PROMEDIO(B2:B12) es la función correcta en Excel en español. Calcula el promedio del rango especificado.'
      },
      {
        q: '¿Qué fórmula muestra "MAYOR DE EDAD" si A1 es >= 18, y "MENOR DE EDAD" si no?',
        options: ['=SI(A1>18;"Mayor";"Menor")', '=SI(A1>=18;"MAYOR DE EDAD";"MENOR DE EDAD")', '=Y(A1>=18;"MAYOR";"MENOR")', '=SI(A1=18;"Adulto";"Niño")'],
        correct: 1,
        explanation: '=SI(A1>=18;"MAYOR DE EDAD";"MENOR DE EDAD") evalúa si A1 es 18 o más y devuelve el texto correspondiente.'
      }
    ],
    pts: 300,
    victoryMsg: () => `🎉 ¡¡¡FELICITACIONES, ${pName()}!!! ¡DERROTASTE AL VIRUS KAPTOR! El Reino de Calcurea ha sido restaurado. Sos oficialmente un MAESTRO DE EXCEL. El Profesor Alan Acosta está muy orgulloso de vos.`
  },

  // ── ZONAS 21-30: Aventuras Avanzadas ─────────────────────────
  {
    id: 21, zone: 'Isla del SUMAR.SI', icon: '🏝️', type: 'teach',
    title: 'SUMAR.SI: Suma con Condición',
    bg: 'linear-gradient(180deg,#001a10 0%,#002a18 100%)',
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡La Isla del SUMAR.SI! Esta función suma solo los valores que cumplen una condición.` },
      { speaker: 'Prof. Alan Acosta', text: `Sintaxis: =SUMAR.SI(rango_condición; criterio; rango_suma)\nEjemplo: Sumar ventas solo de la categoría "Ropa":\n=SUMAR.SI(A:A;"Ropa";B:B)` },
      { speaker: 'Prof. Alan Acosta', text: `También podés usar comparadores: =SUMAR.SI(B:B;">100";C:C)\nEsto suma los valores de C solo donde B es mayor a 100.` },
    ],
  },
  {
    id: 22, zone: 'Isla del SUMAR.SI', icon: '📈', type: 'battle',
    title: '¡El Contador de la Isla!',
    bg: 'linear-gradient(180deg,#001a10 0%,#002a18 100%)',
    enemy: { name: 'Contador Caótico', icon: '📉', hp: 100 },
    description: () => `El contador de la isla necesita saber cuánto vendió solo en la categoría "Armas". Ayudá a ${pName()} con SUMAR.SI.`,
    quiz: [
      {
        q: 'Tenés categorías en A:A y montos en B:B. ¿Cómo sumás solo los montos de "Armas"?',
        options: ['=SUMA(B:B)', '=SUMAR.SI(A:A;"Armas";B:B)', '=SI(A1="Armas";B1;0)', '=BUSCARV("Armas";A:B;2;0)'],
        correct: 1,
        explanation: '=SUMAR.SI(A:A;"Armas";B:B) busca "Armas" en la columna A y suma los valores correspondientes de B.'
      },
      {
        q: '¿Cuál sería la fórmula para contar cuántas celdas en A:A contienen "Armas"?',
        options: ['=CONTAR.SI(A:A;"Armas")', '=SUMAR.SI(A:A;"Armas")', '=CONTARA(A:A)', '=BUSCARV("Armas";A:A;1;0)'],
        correct: 0,
        explanation: '=CONTAR.SI cuenta celdas que cumplen un criterio. =SUMAR.SI suma valores, pero =CONTAR.SI cuenta cantidad de ocurrencias.'
      }
    ],
    pts: 170,
    victoryMsg: () => `¡Brillante, ${pName()}! El contador tiene sus cuentas al día. SUMAR.SI es muy usada en contabilidad real.`
  },
  {
    id: 23, zone: 'Montaña de Gráficos', icon: '📉', type: 'teach',
    title: 'Gráficos: La Imagen de los Datos',
    bg: 'linear-gradient(180deg,#001020 0%,#001830 100%)',
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡Los Gráficos transforman números aburridos en imágenes poderosas! Un gráfico comunica en segundos lo que una tabla tardaría minutos.` },
      { speaker: 'Prof. Alan Acosta', text: `Tipos de gráficos principales:\n📊 Barras/Columnas → comparar categorías\n📈 Líneas → mostrar tendencias en el tiempo\n🍕 Torta/Circular → mostrar proporciones de un total` },
      { speaker: 'Prof. Alan Acosta', text: `Para crear un gráfico en Excel: 1) Seleccioná los datos. 2) Hacé clic en Insertar. 3) Elegí el tipo de gráfico. ¡Listo!` },
      { speaker: 'Prof. Alan Acosta', text: `Tip de experto: Siempre poné título al gráfico y etiquetas en los ejes. Un gráfico sin contexto no comunica nada.` },
    ],
  },
  {
    id: 24, zone: 'Montaña de Gráficos', icon: '🎯', type: 'battle',
    title: '¡El Desafío Visual!',
    bg: 'linear-gradient(180deg,#001020 0%,#001830 100%)',
    enemy: { name: 'Monstruo de los Datos', icon: '📊', hp: 100 },
    description: () => `El Monstruo de los Datos presenta preguntas sobre gráficos. ¡Mostrá tu sabiduría, ${pName()}!`,
    quiz: [
      {
        q: '¿Qué tipo de gráfico es el MEJOR para mostrar cómo cambiaron las ventas a lo largo de 12 meses?',
        options: ['Gráfico de Torta', 'Gráfico de Líneas', 'Gráfico de Área Circular', 'Diagrama de dispersión'],
        correct: 1,
        explanation: 'El gráfico de Líneas es ideal para mostrar tendencias a lo largo del tiempo. Conecta puntos cronológicamente.'
      },
      {
        q: '¿Para qué sirve mejor un gráfico de torta (circular)?',
        options: ['Comparar ventas entre años', 'Mostrar tendencias', 'Mostrar qué porcentaje representa cada categoría del total', 'Correlacionar dos variables'],
        correct: 2,
        explanation: 'El gráfico circular/torta es perfecto para mostrar proporciones: "qué parte del total representa cada categoría".'
      }
    ],
    pts: 160,
    victoryMsg: () => `¡Visual y brillante, ${pName()}! Los gráficos son el arma perfecta para presentaciones profesionales.`
  },
  {
    id: 25, zone: 'Cueva del Formato', icon: '🎨', type: 'teach',
    title: 'Formato de Celdas: La Apariencia Importa',
    bg: 'linear-gradient(180deg,#0a0a00 0%,#1a1a00 100%)',
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡El Formato es la armadura de los datos! Una planilla bien formateada se lee fácil y se ve profesional.` },
      { speaker: 'Prof. Alan Acosta', text: `Podés formatear celdas con: Negrita (Ctrl+N), Cursiva (Ctrl+K), Subrayado (Ctrl+S). También podés cambiar el tamaño y tipo de letra.` },
      { speaker: 'Prof. Alan Acosta', text: `Formato de NÚMEROS: Podés mostrar un número como moneda ($), porcentaje (%), fecha, o con decimales específicos. Clic derecho → Formato de celdas.` },
      { speaker: 'Prof. Alan Acosta', text: `Formato CONDICIONAL: ¡La magia real! Podés hacer que Excel coloree automáticamente celdas según su valor. Ejemplo: rojo si es menor a 60, verde si es mayor a 90.` },
    ],
  },
  {
    id: 26, zone: 'Cueva del Formato', icon: '✨', type: 'battle',
    title: '¡El Informe del Rey!',
    bg: 'linear-gradient(180deg,#0a0a00 0%,#1a1a00 100%)',
    enemy: { name: 'Informe Caótico', icon: '📋', hp: 100 },
    description: () => `El rey necesita un informe profesional. ${pName()} debe responder las preguntas sobre formato para que el informe quede perfecto.`,
    quiz: [
      {
        q: '¿Qué atajo de teclado pone en NEGRITA el texto en Excel?',
        options: ['Ctrl+I', 'Ctrl+N', 'Ctrl+B', 'Ctrl+G'],
        correct: 1,
        explanation: 'En Excel en español, Ctrl+N activa la Negrita. (En inglés es Ctrl+B de "Bold").'
      },
      {
        q: '¿Qué es el "Formato Condicional" en Excel?',
        options: ['Formatea celdas con condición matemática', 'Colorea o formatea celdas automáticamente según reglas que vos definís', 'Fórmula que aplica formato', 'Plantilla de colores fija'],
        correct: 1,
        explanation: 'El Formato Condicional aplica formatos (colores, íconos) automáticamente según condiciones que definís. Muy útil para dashboards.'
      }
    ],
    pts: 150,
    victoryMsg: () => `¡Magnífico, ${pName()}! El rey quedó maravillado con el informe. El formato profesional abre puertas en el mundo laboral.`
  },
  {
    id: 27, zone: 'Pantano de las Tablas', icon: '🌿', type: 'teach',
    title: 'Tablas Dinámicas: El Poder Supremo',
    bg: 'linear-gradient(180deg,#051505 0%,#0a200a 100%)',
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡Las Tablas Dinámicas son el arma final de Excel! Permiten resumir, analizar y explorar grandes cantidades de datos con unos pocos clics.` },
      { speaker: 'Prof. Alan Acosta', text: `Para crear una: 1) Clic en cualquier celda de tus datos. 2) Insertar → Tabla Dinámica. 3) Arrastrá los campos a Filas, Columnas y Valores.` },
      { speaker: 'Prof. Alan Acosta', text: `Ejemplo: Tenés 1000 ventas con datos de Vendedor, Producto y Monto. Con una Tabla Dinámica podés ver en segundos cuánto vendió CADA vendedor por CADA producto.` },
      { speaker: 'Prof. Alan Acosta', text: `Las Tablas Dinámicas son la habilidad más buscada en el mercado laboral. Dominar esto te diferencia de la mayoría.` },
    ],
  },
  {
    id: 28, zone: 'Pantano de las Tablas', icon: '📋', type: 'battle',
    title: '¡El Gran Análisis del Pantano!',
    bg: 'linear-gradient(180deg,#051505 0%,#0a200a 100%)',
    enemy: { name: 'Hidra de los Datos', icon: '🐍', hp: 100 },
    description: () => `La Hidra tiene miles de datos desorganizados. Ayudá a ${pName()} a entender las Tablas Dinámicas.`,
    quiz: [
      {
        q: '¿Cuál es la principal ventaja de una Tabla Dinámica?',
        options: ['Hace los datos más coloridos', 'Permite resumir y analizar grandes volúmenes de datos fácilmente', 'Crea gráficos automáticamente', 'Ordena datos alfabéticamente'],
        correct: 1,
        explanation: 'Las Tablas Dinámicas permiten resumir, filtrar y analizar grandes cantidades de datos de forma flexible e interactiva.'
      },
      {
        q: '¿Desde dónde se insertan las Tablas Dinámicas en Excel?',
        options: ['Desde la pestaña "Inicio"', 'Desde la pestaña "Insertar"', 'Desde la pestaña "Datos"', 'Desde la pestaña "Fórmulas"'],
        correct: 1,
        explanation: 'Las Tablas Dinámicas se insertan desde la pestaña "Insertar" → "Tabla Dinámica".'
      }
    ],
    pts: 180,
    victoryMsg: () => `¡Extraordinario, ${pName()}! La Hidra fue derrotada. Las Tablas Dinámicas son tu nueva superpotencia.`
  },
  {
    id: 29, zone: 'Cumbre del Experto', icon: '🗻', type: 'teach',
    title: 'Atajos y Productividad: El Camino del Ninja',
    bg: 'linear-gradient(180deg,#100010 0%,#200020 100%)',
    dialogues: [
      { speaker: 'Prof. Alan Acosta', text: `¡La Cumbre del Experto! Aquí aprenderás los atajos que usan los profesionales para trabajar 10 veces más rápido.` },
      { speaker: 'Prof. Alan Acosta', text: `Atajos esenciales:\nCtrl+Z → Deshacer\nCtrl+Y → Rehacer\nCtrl+C/V/X → Copiar/Pegar/Cortar\nCtrl+F → Buscar\nCtrl+S → Guardar` },
      { speaker: 'Prof. Alan Acosta', text: `Atajos de Excel específicos:\nCtrl+Inicio → Ir a A1\nCtrl+Fin → Ir a la última celda con datos\nCtrl+Shift+L → Activar/desactivar filtros\nF2 → Editar celda activa` },
      { speaker: 'Prof. Alan Acosta', text: `Truco PRO: Seleccioná un rango de celdas, escribí una fórmula y apretá Ctrl+Enter. ¡La fórmula se ingresa en TODAS las celdas seleccionadas a la vez!` },
    ],
  },
  {
    id: 30, zone: 'El Trono de Calcurea', icon: '👑', type: 'battle',
    title: '¡¡EL DESAFÍO DEL TRONO!!',
    bg: 'linear-gradient(180deg,#150015 0%,#250025 100%)',
    enemy: { name: '💎 GUARDIÁN DEL TRONO 💎', icon: '⚜️', hp: 100 },
    description: () => `¡¡El desafío supremo, ${pName()}!! Demostrá que sos digno/a del Trono de Calcurea respondiendo estas preguntas finales de MAESTRO DE EXCEL.`,
    quiz: [
      {
        q: '¿Cuál es el atajo para seleccionar TODA la planilla en Excel?',
        options: ['Ctrl+A', 'Ctrl+T', 'Ctrl+Shift+A', 'Ctrl+Alt+A'],
        correct: 0,
        explanation: 'Ctrl+A selecciona todo el contenido de la hoja de cálculo. ¡Súper útil para formatear todo de una vez!'
      },
      {
        q: 'En =BUSCARV(A2;$B$2:$D$100;3;0), ¿por qué se usa $ en $B$2:$D$100?',
        options: ['Para indicar que es moneda', 'Para fijar el rango y que no cambie al copiar la fórmula', 'Para proteger las celdas', 'Para ordenar el rango'],
        correct: 1,
        explanation: 'El $ fija la referencia. Si copiás la fórmula hacia abajo, $B$2:$D$100 siempre buscará en ese mismo rango exacto.'
      },
      {
        q: '¿Qué hace la fórmula =SUMAR.SI(A:A;">500";B:B)?',
        options: ['Suma todos los valores mayores a 500 en B', 'Suma los valores de B donde los correspondientes en A son mayores a 500', 'Cuenta cuántos valores en A son mayores a 500', 'Busca el valor 500 en B'],
        correct: 1,
        explanation: 'Suma los valores de la columna B, pero SOLO para las filas donde la columna A tiene un valor mayor a 500.'
      }
    ],
    pts: 500,
    victoryMsg: () => `🎊🏆👑 ¡¡¡ERES EL CAMPEÓN DE CALCUREA, ${pName()}!!! ¡Has completado los 30 niveles! El Profesor Alan Acosta te corona como el/la MAESTRO/A SUPREMO/A de Excel. ¡Tu futuro en el mundo laboral está ASEGURADO! 🎊🏆👑`
  },
];

// ===== RENDERIZADO DE SPRITES =====
function applyCharSprite(el, charType) {
  if (!el) return;
  el.className = el.className.replace(/\bchico\b|\bchica\b|\borco\b|\bbruja\b|\bbrujo\b/g, '');
  el.classList.add(charType);
  el.setAttribute('data-char', charType);
}

// ===== HUD UPDATE =====
function updateHUD() {
  const pct = Math.min(100, (G.xp % 500) / 500 * 100);
  ['hud-xp-fill','hud-xp-fill2'].forEach(id => {
    const el = $(id); if(el) el.style.width = pct + '%';
  });
  ['hud-pts','hud-pts2'].forEach(id => {
    const el = $(id); if(el) el.textContent = `⭐ ${G.points} pts`;
  });
  ['hud-name-display','hud-name2'].forEach(id => {
    const el = $(id); if(el) el.textContent = G.playerName.toUpperCase();
  });
  ['hud-level-num','hud-level-num2'].forEach(id => {
    const el = $(id); if(el) el.textContent = G.currentLevel || 1;
  });
  const hud1 = $('hud-char'), hud2 = $('hud-char2');
  if(hud1) applyCharSprite(hud1, G.charType);
  if(hud2) applyCharSprite(hud2, G.charType);
}

// ===== TYPEWRITER EFFECT =====
function typeText(el, text, cb) {
  el.textContent = '';
  let i = 0;
  const timer = setInterval(() => {
    el.textContent += text[i++];
    if (i >= text.length) { clearInterval(timer); if(cb) cb(); }
  }, 18);
}

// ===== INTRO SCREEN =====
const INTRO_TEXT = '¡Bienvenido al Reino de Calcurea! Soy el Profesor Alan Acosta. El Virus Kaptor ha destruido nuestros conocimientos. ¡Solo un elegido puede restaurar el reino con el poder de las planillas de cálculo!';

$('btn-start-game').addEventListener('click', () => {
  showScreen('screen-name');
});
document.addEventListener('keydown', e => {
  if ($('screen-intro').classList.contains('active') && e.key !== 'Tab') {
    showScreen('screen-name');
  }
});

// Animación typewriter en intro
window.addEventListener('load', () => {
  const introEl = $('intro-text');
  if (introEl) typeText(introEl, INTRO_TEXT);
});

// ===== NAME SCREEN =====
$('btn-confirm-name').addEventListener('click', () => {
  const name = $('player-name-input').value.trim();
  if (!name) { $('player-name-input').style.borderColor = 'var(--clr-red)'; return; }
  G.playerName = name;
  document.querySelectorAll('.player-name-tag').forEach(el => el.textContent = name);
  $('char-speech').innerHTML = `¡Excelente, <span class="player-name-tag">${name}</span>!<br>El destino del reino recae sobre vos.<br>¡Elegí tu personaje, héroe!`;
  showScreen('screen-character');
});
$('player-name-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('btn-confirm-name').click();
});

// ===== CHARACTER SELECT =====
let selectedChar = null;
document.querySelectorAll('.char-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedChar = card.dataset.char;
    $('btn-confirm-char').disabled = false;
  });
});

$('btn-confirm-char').addEventListener('click', () => {
  if (!selectedChar) return;
  G.charType = selectedChar;
  updateHUD();
  buildMap();
  showStory();
  showScreen('screen-map');
});

// ===== HISTORIA INICIAL =====
function showStory() {
  $('modal-title').textContent = '✦ LA LEYENDA DE CALCUREA ✦';
  $('modal-body').innerHTML = `
    <p>Hace mil años, el sabio <strong style="color:var(--clr-gold)">Calc el Grande</strong> fundó el próspero Reino de Calcurea.</p>
    <br>
    <p>Con su poderosa herramienta —la Planilla de Cálculo— organizó los recursos del reino, calculó las cosechas, administró el comercio y mantuvo la paz.</p>
    <br>
    <p>Pero el malvado <strong style="color:var(--clr-red)">Virus Kaptor</strong> invadió el reino y dispersó el conocimiento en 30 fragmentos escondidos por todo Calcurea.</p>
    <br>
    <p>El Profesor Alan Acosta buscó durante años al elegido que pudiera recuperar los fragmentos... ¡y ese elegido eres TÚ, <strong style="color:var(--clr-gold)">${G.playerName}</strong>!</p>
    <br>
    <p>¡Aventúrate por el mapa, aprende las artes de Excel y restaura el Reino de Calcurea!</p>
  `;
  $('modal-story').classList.remove('hidden');
}

$('btn-close-modal').addEventListener('click', () => {
  $('modal-story').classList.add('hidden');
});

// ===== BUILD MAP =====
function buildMap() {
  const container = $('map-container');
  container.innerHTML = '';
  LEVELS.forEach(level => {
    const zone = document.createElement('div');
    zone.className = 'map-zone' +
      (G.completedLevels.includes(level.id) ? ' completed' : '') +
      (level.id > G.unlockedLevel ? ' locked' : '');
    zone.innerHTML = `
      <span class="zone-icon">${level.icon}</span>
      <span class="zone-num">NIVEL ${level.id}</span>
      <span class="zone-name">${level.zone}</span>
      <span class="zone-type ${level.type}">${level.type === 'teach' ? '📖 LECCIÓN' : '⚔️ BATALLA'}</span>
    `;
    if (level.id <= G.unlockedLevel) {
      zone.addEventListener('click', () => startLevel(level.id));
    }
    container.appendChild(zone);
  });
}

// ===== START LEVEL =====
function startLevel(id) {
  const level = LEVELS.find(l => l.id === id);
  if (!level) return;
  G.currentLevel = id;
  updateHUD();
  showScreen('screen-level');

  // Reset scenes
  $('scene-teach').classList.add('hidden');
  $('scene-battle').classList.add('hidden');
  $('scene-victory').classList.add('hidden');

  if (level.type === 'teach') {
    startTeach(level);
  } else {
    startBattle(level);
  }
}

// ===== TEACH SCENE =====
function startTeach(level) {
  $('scene-teach').classList.remove('hidden');
  $('scene-bg').style.background = level.bg;
  G.dialogueIndex = 0;

  const playerSprite = $('scene-player-sprite');
  applyCharSprite(playerSprite, G.charType);
  playerSprite.className = 'player-sprite medium';
  playerSprite.classList.add(G.charType);

  renderDialogue(level);
}

function renderDialogue(level) {
  const dlg = level.dialogues[G.dialogueIndex];
  if (!dlg) {
    // Fin de la lección → marcar completado
    markCompleted(level.id);
    // Ir a la siguiente si hay batalla encadenada
    const next = LEVELS.find(l => l.id === level.id + 1);
    if (next) startLevel(next.id);
    else showVictory(level, 50);
    return;
  }

  $('dialogue-speaker').textContent = dlg.speaker;
  const text = typeof dlg.text === 'function' ? dlg.text() : dlg.text;
  typeText($('dialogue-text'), text.replace(/<[^>]+>/g,''));
}

$('btn-next-dialogue').addEventListener('click', () => {
  const level = LEVELS.find(l => l.id === G.currentLevel);
  if (!level || level.type !== 'teach') return;
  G.dialogueIndex++;
  renderDialogue(level);
});

// ===== BATTLE SCENE =====
function startBattle(level) {
  $('scene-battle').classList.remove('hidden');
  $('scene-bg').style.background = level.bg;

  $('battle-title').textContent = level.title;
  $('enemy-name').textContent = level.enemy.name;
  $('enemy-sprite').textContent = level.enemy.icon;
  $('enemy-hp-fill').style.width = '100%';

  const desc = typeof level.description === 'function' ? level.description() : level.description;
  $('battle-description').innerHTML = desc;

  $('battle-feedback').classList.add('hidden');
  $('battle-feedback').classList.remove('error');
  G.battleAnswer = null;
  G.selectedQuizOption = null;
  G.hintUsed = false;

  if (level.spreadsheet) {
    $('spreadsheet-container').classList.remove('hidden');
    $('quiz-container').classList.add('hidden');
    buildSpreadsheet(level.spreadsheet);
  } else if (level.quiz) {
    $('spreadsheet-container').classList.add('hidden');
    $('quiz-container').classList.remove('hidden');
    buildQuiz(level.quiz);
  }
}

// ===== BUILD SPREADSHEET =====
function buildSpreadsheet(config) {
  const grid = $('spreadsheet-grid');
  grid.innerHTML = '';

  const table = document.createElement('table');
  // Header row (col letters)
  const headerRow = document.createElement('tr');
  const cornerTh = document.createElement('th');
  cornerTh.className = 'row-header';
  cornerTh.textContent = '';
  headerRow.appendChild(cornerTh);
  config.cols.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Column headers row (row 1)
  const chRow = document.createElement('tr');
  const numTh = document.createElement('th');
  numTh.className = 'row-header';
  numTh.textContent = '1';
  chRow.appendChild(numTh);
  config.headers.forEach(h => {
    const td = document.createElement('td');
    td.className = 'header-cell';
    td.textContent = h;
    chRow.appendChild(td);
  });
  table.appendChild(chRow);

  // Data rows
  config.rows.forEach((row, ri) => {
    const tr = document.createElement('tr');
    const numTd = document.createElement('th');
    numTd.className = 'row-header';
    numTd.textContent = ri + 2;
    tr.appendChild(numTd);

    row.forEach((cell, ci) => {
      const td = document.createElement('td');
      const colLetter = config.cols[ci];
      const cellRef = `${colLetter}${ri+2}`;

      if (typeof cell === 'object' && cell.editable) {
        td.className = 'input-cell';
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'cell-input';
        input.dataset.ref = cellRef;
        input.dataset.expected = cell.expected;
        input.dataset.formula = cell.formula;
        input.placeholder = cell.formula;
        input.addEventListener('focus', () => {
          $('formula-bar').textContent = input.value || input.placeholder;
        });
        input.addEventListener('input', () => {
          $('formula-bar').textContent = input.value;
        });
        td.appendChild(input);
      } else if (typeof cell === 'object') {
        td.className = 'result-cell';
        td.textContent = '???';
        td.dataset.ref = cellRef;
        td.dataset.expected = cell.expected;
      } else if (cell === '───' || cell === '') {
        td.className = 'header-cell';
        td.textContent = cell;
      } else {
        td.className = 'data-cell';
        td.textContent = cell;
        td.dataset.ref = cellRef;
        td.dataset.value = cell;
      }
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  grid.appendChild(table);
}

// ===== BUILD QUIZ =====
let currentQuizIndex = 0;
let quizCorrect = 0;

function buildQuiz(questions) {
  currentQuizIndex = 0;
  quizCorrect = 0;
  renderQuizQuestion(questions);
}

function renderQuizQuestion(questions) {
  const q = questions[currentQuizIndex];
  $('quiz-question').textContent = `Pregunta ${currentQuizIndex+1}/${questions.length}: ${q.q}`;
  const optContainer = $('quiz-options');
  optContainer.innerHTML = '';
  G.selectedQuizOption = null;

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = `${['A','B','C','D'][i]}) ${opt}`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      G.selectedQuizOption = i;
    });
    optContainer.appendChild(btn);
  });
}

// ===== CHECK ANSWER =====
$('btn-check-answer').addEventListener('click', () => {
  const level = LEVELS.find(l => l.id === G.currentLevel);
  if (!level) return;

  if (level.spreadsheet) {
    checkSpreadsheet(level);
  } else if (level.quiz) {
    checkQuiz(level);
  }
});

function checkSpreadsheet(level) {
  const inputs = document.querySelectorAll('.cell-input');
  let allCorrect = true;
  let errors = [];

  inputs.forEach(input => {
    const expected = parseFloat(input.dataset.expected);
    const val = input.value.trim();
    // Accept formula or numeric answer
    let numVal = null;
    if (val.startsWith('=')) {
      // Try to evaluate simple formulas
      numVal = evalSimpleFormula(val, level.spreadsheet);
    } else {
      numVal = parseFloat(val);
    }
    const correct = Math.abs(numVal - expected) < 0.1;
    input.style.background = correct ? '#c8f5c8' : '#f5c8c8';
    input.style.color = correct ? '#007700' : '#770000';
    if (!correct) { allCorrect = false; errors.push(input.dataset.ref); }
  });

  const fb = $('battle-feedback');
  if (allCorrect) {
    fb.classList.remove('hidden','error');
    fb.textContent = '✅ ¡CORRECTO! ¡Todas las fórmulas son perfectas!';
    $('enemy-hp-fill').style.width = '0%';
    setTimeout(() => showVictory(level, level.pts), 1200);
  } else {
    fb.classList.remove('hidden');
    fb.classList.add('error');
    fb.textContent = `❌ Celdas con error: ${errors.join(', ')}. Revisá tus fórmulas e intentá de nuevo.`;
  }
}

function evalSimpleFormula(formula, config) {
  try {
    // Build a cell value map from the spreadsheet config
    const cells = {};
    config.rows.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        const ref = `${config.cols[ci]}${ri+2}`;
        if (typeof cell === 'string' && !isNaN(parseFloat(cell))) {
          cells[ref] = parseFloat(cell);
        } else if (typeof cell === 'object') {
          cells[ref] = cell.expected || 0;
        }
      });
    });
    // Also read current input values
    document.querySelectorAll('.cell-input').forEach(inp => {
      cells[inp.dataset.ref] = parseFloat(inp.value) || 0;
    });

    let expr = formula.substring(1).toUpperCase();
    // Replace PROMEDIO(...) with average
    expr = expr.replace(/PROMEDIO\(([^)]+)\)/g, (_, range) => {
      const vals = expandRange(range, cells);
      return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
    });
    expr = expr.replace(/SUMA\(([^)]+)\)/g, (_, range) => {
      return expandRange(range, cells).reduce((a,b)=>a+b,0);
    });
    expr = expr.replace(/MAX\(([^)]+)\)/g, (_, range) => {
      const v = expandRange(range, cells); return v.length ? Math.max(...v) : 0;
    });
    expr = expr.replace(/MIN\(([^)]+)\)/g, (_, range) => {
      const v = expandRange(range, cells); return v.length ? Math.min(...v) : 0;
    });
    // Replace cell refs
    expr = expr.replace(/\$?([A-Z])\$?(\d+)/g, (_, col, row) => {
      return cells[`${col}${row}`] || 0;
    });
    // Evaluate
    return Function('"use strict"; return (' + expr + ')')();
  } catch(e) { return NaN; }
}

function expandRange(range, cells) {
  const parts = range.split(':');
  if (parts.length < 2) {
    return [cells[parts[0].replace(/\$/g,'')] || 0];
  }
  const startRef = parts[0].replace(/\$/g,'');
  const endRef   = parts[1].replace(/\$/g,'');
  const startCol = startRef.match(/[A-Z]+/)[0];
  const startRow = parseInt(startRef.match(/\d+/)[0]);
  const endCol   = endRef.match(/[A-Z]+/)[0];
  const endRow   = parseInt(endRef.match(/\d+/)[0]);
  const vals = [];
  for (let r = startRow; r <= endRow; r++) {
    for (let cc = startCol.charCodeAt(0); cc <= endCol.charCodeAt(0); cc++) {
      const ref = String.fromCharCode(cc) + r;
      if (cells[ref] !== undefined) vals.push(cells[ref]);
    }
  }
  return vals;
}

function checkQuiz(level) {
  if (G.selectedQuizOption === null) {
    const fb = $('battle-feedback');
    fb.classList.remove('hidden');
    fb.classList.add('error');
    fb.textContent = '⚠️ Elegí una opción antes de atacar.';
    return;
  }

  const q = level.quiz[currentQuizIndex];
  const opts = document.querySelectorAll('.quiz-option');

  if (G.selectedQuizOption === q.correct) {
    opts[G.selectedQuizOption].classList.add('correct');
    quizCorrect++;

    const fb = $('battle-feedback');
    fb.classList.remove('hidden','error');
    fb.textContent = `✅ ${q.explanation}`;

    // HP damage
    const hpEl = $('enemy-hp-fill');
    const hpPct = Math.max(0, 100 - ((currentQuizIndex + 1) / level.quiz.length * 100));
    hpEl.style.width = hpPct + '%';

    currentQuizIndex++;
    if (currentQuizIndex >= level.quiz.length) {
      setTimeout(() => showVictory(level, level.pts), 1500);
    } else {
      setTimeout(() => {
        fb.classList.add('hidden');
        renderQuizQuestion(level.quiz);
        G.selectedQuizOption = null;
      }, 2000);
    }
  } else {
    opts[G.selectedQuizOption].classList.add('wrong');
    opts[q.correct].classList.add('correct');

    const fb = $('battle-feedback');
    fb.classList.remove('hidden');
    fb.classList.add('error');
    fb.textContent = `❌ No era esa. La respuesta correcta es: ${q.options[q.correct]}. ${q.explanation}`;

    const penalty = G.hintUsed ? 0 : 15;
    G.points = Math.max(0, G.points - penalty);
    updateHUD();

    setTimeout(() => {
      fb.classList.add('hidden');
      opts.forEach(o => { o.classList.remove('selected','wrong','correct'); });
      G.selectedQuizOption = null;
    }, 3000);
  }
}

// ===== HINT =====
$('btn-hint').addEventListener('click', () => {
  const level = LEVELS.find(l => l.id === G.currentLevel);
  if (!level) return;
  G.hintUsed = true;

  const fb = $('battle-feedback');
  fb.classList.remove('hidden','error');

  if (level.spreadsheet) {
    fb.textContent = `💡 PISTA: ${level.spreadsheet.hint}`;
  } else if (level.quiz) {
    const q = level.quiz[currentQuizIndex];
    fb.textContent = `💡 PISTA: Pensá bien en la teoría. La respuesta correcta empieza con: "${q.options[q.correct].substring(0,20)}..."`;
  }

  G.points = Math.max(0, G.points - 5);
  updateHUD();
});

// ===== VICTORY =====
function showVictory(level, pts) {
  markCompleted(level.id);
  G.points += pts;
  G.xp += pts;
  updateHUD();

  $('scene-teach').classList.add('hidden');
  $('scene-battle').classList.add('hidden');
  $('scene-victory').classList.remove('hidden');

  const stars = pts >= 200 ? '⭐⭐⭐' : pts >= 100 ? '⭐⭐' : '⭐';
  $('victory-stars').textContent = stars;
  $('victory-title').textContent = level.id === 20 ? '¡¡REINO RESTAURADO!!' : level.id === 30 ? '¡¡MAESTRO SUPREMO!!' : '¡VICTORIA!';
  $('victory-pts').textContent = `+${pts} pts`;

  const msg = typeof level.victoryMsg === 'function' ? level.victoryMsg() :
    level.victoryMsg || `¡Excelente, ${G.playerName}! Completaste el nivel ${level.id}.`;
  $('victory-text').textContent = msg.replace(/<[^>]+>/g,'');
}

function markCompleted(id) {
  if (!G.completedLevels.includes(id)) G.completedLevels.push(id);
  // Unlock next
  if (id >= G.unlockedLevel) G.unlockedLevel = id + 1;
}

$('btn-back-map').addEventListener('click', () => {
  buildMap();
  showScreen('screen-map');
});

// ===== INIT =====
updateHUD();
