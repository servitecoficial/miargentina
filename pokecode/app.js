// ==========================================
// ESTADO GLOBAL Y MOTOR DEL JUEGO
// ==========================================
const Game = {
    trainer: "",
    starter: "",
    level: 0,
    exp: 0,
    workspace: null,
    typeWriterInterval: null,
    previewTimer: null
};

const Pokedex = {
    charmander: [4, 5, 6],
    bulbasaur: [1, 2, 3],
    squirtle: [7, 8, 9],
    pikachu: [25, 26, 26]
};

// ==========================================
// CURRICULO SUPREMO: 30 NIVELES
// ==========================================
const Niveles = [
    { name: "1. Etiqueta Raiz", obj: "<html>", dialogue: "Fuerza {trainer}. Todo cuerpo necesita un esqueleto. Arrastra la etiqueta <html> al lienzo.", check: () => hasBlock("t_html") },
    { name: "2. Head y Body", obj: "<head> y <body>", dialogue: "Bien. El HTML se divide en <head> y <body>. Ponlos dentro de <html>.", check: () => isInside("t_head", "t_html") && isInside("t_body", "t_html") },
    { name: "3. Titulo de Pestana", obj: "<title>", dialogue: "Agrega un <title> dentro de tu <head>. Esto nombra la pestana del navegador.", check: () => isInside("t_title", "t_head") },
    { name: "4. Titulo Principal", obj: "<h1>", dialogue: "A la accion. Agrega un <h1> dentro del <body>. La vista previa se actualiza sola.", check: () => isInside("t_h1", "t_body") },
    { name: "5. Subtitulo", obj: "<h2>", dialogue: "Los <h2> son titulos secundarios. Agrega uno debajo de tu h1, siempre dentro del <body>.", check: () => isInside("t_h2", "t_body") },
    { name: "6. Parrafo", obj: "<p>", dialogue: "Excelente. Anade un <p> en el <body>. Escribe una historia sobre tu Pokemon.", check: () => isInside("t_p", "t_body") },
    { name: "7. Negritas", obj: "<b>", dialogue: "Demos impacto. Usa la etiqueta <b> dentro del <body> para un texto fuerte.", check: () => isInside("t_b", "t_body") },
    { name: "8. Cursivas", obj: "<i>", dialogue: "Ahora usa <i> dentro del <body> para un texto inclinado.", check: () => isInside("t_i", "t_body") },
    { name: "9. Imagenes", obj: "<img>", dialogue: "Musculos visuales. Anade una <img> dentro del <body>.", check: () => isInside("t_img", "t_body") },
    { name: "10. Enlaces", obj: "<a>", dialogue: "Conecta tu web con el mundo usando <a> dentro del <body>.", check: () => isInside("t_a", "t_body") },
    { name: "11. Botones", obj: "<button>", dialogue: "Agrega un <button> dentro de <body>.", check: () => isInside("t_button", "t_body") },
    { name: "12. Cajas", obj: "<div>", dialogue: "El <div> agrupa elementos. Pon un <div> dentro de tu <body>.", check: () => isInside("t_div", "t_body") },
    { name: "13. Menu", obj: "<nav>", dialogue: "Vamos a crear un menu superior. Agrega un contenedor <nav> en tu <body>.", check: () => isInside("t_nav", "t_body") },
    { name: "14. Lista", obj: "<ul>", dialogue: "Un menu es un grupo de botones. Mete una lista <ul> dentro de tu <nav>.", check: () => isInside("t_ul", "t_nav") },
    { name: "15. Item Lista", obj: "<li>", dialogue: "Agrega un <li> dentro de tu <ul>.", check: () => isInside("t_li", "t_ul") },
    { name: "16. Enlace Menu", obj: "<a>", dialogue: "Pon un enlace <a> dentro de tu <li> para que el menu sea clickeable.", check: () => isInside("t_a", "t_li") },
    { name: "17. Formulario", obj: "<form>", dialogue: "Quieres pedir datos. Agrega un <form> dentro de tu <body>.", check: () => isInside("t_form", "t_body") },
    { name: "18. Caja Texto", obj: "<input>", dialogue: "Coloca un <input> dentro del <form>.", check: () => isInside("t_input", "t_form") },
    { name: "19. Pie de pagina", obj: "<footer>", dialogue: "Toda web tiene un final. Agrega un <footer> al final de tu <body>.", check: () => isInside("t_footer", "t_body") },
    { name: "20. Estilos", obj: "<style>", dialogue: "Llegamos al nivel 20, {trainer}. Hora de pintar. Arrastra <style> dentro del <head>.", check: () => isInside("t_style", "t_head") },
    { name: "21. Regla Body", obj: "Regla CSS: body", dialogue: "Agrega una Regla CSS dentro de <style>. En el selector escribe body para pintar el fondo.", check: () => hasCSSRule("body") },
    { name: "22. Color Fondo", obj: "background-color", dialogue: "En esa regla, anade una Propiedad. Elige color de fondo y escribe black o lightblue.", check: () => hasCSSProp("background-color") },
    { name: "23. Regla H1", obj: "Regla CSS: h1", dialogue: "Crea otra Regla CSS dentro de <style>. Escribe h1 en el selector.", check: () => hasCSSRule("h1") },
    { name: "24. Color Texto", obj: "color", dialogue: "Dentro del h1, usa color de texto para cambiar como se lee el titulo.", check: () => hasCSSProp("color") },
    { name: "25. Centrar", obj: "text-align", dialogue: "Agrega en tu h1 la propiedad alineacion y escribe center.", check: () => hasCSSProp("text-align") },
    { name: "26. Bordes", obj: "border-radius", dialogue: "Crea una Regla para img. Usa radio de borde y ponle 20px.", check: () => hasCSSProp("border-radius") },
    { name: "27. Regla UL", obj: "Regla CSS: ul", dialogue: "Tu menu es vertical. Crea una regla para ul.", check: () => hasCSSRule("ul") },
    { name: "28. Menu Flex", obj: "display: flex", dialogue: "En ul, usa tipo de display y ponle flex.", check: () => hasCSSProp("display") },
    { name: "29. Quitar Puntos", obj: "list-style", dialogue: "Usa estilo de lista en ul y ponle none.", check: () => hasCSSProp("list-style") },
    { name: "30. Master Web", obj: "Libre", dialogue: "Eres un maestro, {trainer}. Has conquistado HTML y CSS. Juega libremente y evalua cuando estes feliz.", check: () => true }
];

// ==========================================
// VALIDACIONES QA
// ==========================================
function hasBlock(type) {
    return Game.workspace.getAllBlocks(false).some(block => block.type === type);
}

function isInside(childType, parentType) {
    const blocks = Game.workspace.getAllBlocks(false);
    const children = blocks.filter(block => block.type === childType);
    if (children.length === 0) return false;

    for (const child of children) {
        let parent = child.getSurroundParent();
        while (parent) {
            if (parent.type === parentType) return true;
            parent = parent.getSurroundParent();
        }
    }

    return false;
}

function hasCSSRule(selector) {
    return Game.workspace.getAllBlocks(false).some(block => block.type === "css_rule" && block.getFieldValue("SELECTOR").trim().toLowerCase() === selector.toLowerCase());
}

function hasCSSProp(propName) {
    return Game.workspace.getAllBlocks(false).some(block => block.type === "css_prop" && block.getFieldValue("PROP") === propName);
}

// ==========================================
// MOTOR HTML Y BLOQUES
// ==========================================
Blockly.HTML = new Blockly.Generator("HTML");
Blockly.HTML.scrub_ = function(block, code, opt_thisOnly) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = opt_thisOnly ? "" : Blockly.HTML.blockToCode(nextBlock);
    return code + nextCode;
};

function defineBlocks() {
    const createTag = (type, tag, color, isContainer, hasText = false, textDefault = "") => {
        Blockly.Blocks[type] = {
            init: function() {
                const input = this.appendDummyInput().appendField(`<${tag}>`);
                if (hasText) input.appendField(new Blockly.FieldTextInput(textDefault), "TEXT");
                if (isContainer) this.appendStatementInput("CONTENT");
                this.appendDummyInput().appendField(`</${tag}>`);
                this.setPreviousStatement(true);
                this.setNextStatement(true);
                this.setColour(color);
            }
        };

        Blockly.HTML[type] = function(block) {
            const content = isContainer ? Blockly.HTML.statementToCode(block, "CONTENT") : "";
            const text = hasText ? block.getFieldValue("TEXT") : "";
            return `<${tag}>\n${text}\n${content}</${tag}>\n`;
        };
    };

    createTag("t_html", "html", "#D32F2F", true);
    createTag("t_head", "head", "#D32F2F", true);
    createTag("t_body", "body", "#D32F2F", true);
    createTag("t_footer", "footer", "#D32F2F", true);
    createTag("t_title", "title", "#FBC02D", false, true, "Mi PokeWeb");
    createTag("t_h1", "h1", "#FBC02D", false, true, "Bienvenido al Lab");
    createTag("t_h2", "h2", "#FBC02D", false, true, "Subtitulo de seccion");
    createTag("t_p", "p", "#FBC02D", false, true, "Mi texto genial.");
    createTag("t_b", "b", "#FBC02D", false, true, "Texto fuerte");
    createTag("t_i", "i", "#FBC02D", false, true, "Texto cursivo");
    createTag("t_div", "div", "#4CAF50", true);
    createTag("t_button", "button", "#4CAF50", false, true, "Haz Click");
    createTag("t_form", "form", "#FF9800", true);

    Blockly.Blocks.t_input = {
        init: function() {
            this.appendDummyInput().appendField("<input type='text' placeholder='Escribe aqui...'>");
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour("#FF9800");
        }
    };
    Blockly.HTML.t_input = () => `<input type="text" placeholder="Escribe aqui..." style="padding: 8px 10px;" />\n`;

    Blockly.Blocks.t_img = {
        init: function() {
            this.appendDummyInput()
                .appendField("<img src='")
                .appendField(new Blockly.FieldTextInput("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"), "URL")
                .appendField("'>");
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour("#4CAF50");
        }
    };
    Blockly.HTML.t_img = block => `<img src="${block.getFieldValue("URL")}" style="max-width: 100%; height: auto;" />\n`;

    createTag("t_nav", "nav", "#3F51B5", true);
    createTag("t_ul", "ul", "#3F51B5", true);
    createTag("t_li", "li", "#3F51B5", true);

    Blockly.Blocks.t_a = {
        init: function() {
            this.appendDummyInput()
                .appendField("<a href='#'>")
                .appendField(new Blockly.FieldTextInput("Inicio"), "TEXT")
                .appendField("</a>");
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour("#3F51B5");
        }
    };
    Blockly.HTML.t_a = block => `<a href="#">${block.getFieldValue("TEXT")}</a>\n`;

    createTag("t_style", "style", "#9C27B0", true);
    Blockly.Blocks.css_rule = {
        init: function() {
            this.appendDummyInput()
                .appendField("Selector:")
                .appendField(new Blockly.FieldTextInput("body"), "SELECTOR")
                .appendField("{");
            this.appendStatementInput("CONTENT").setCheck("CSS_PROP");
            this.appendDummyInput().appendField("}");
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour("#7B1FA2");
        }
    };
    Blockly.HTML.css_rule = block => `${block.getFieldValue("SELECTOR")} {\n${Blockly.HTML.statementToCode(block, "CONTENT")}}\n`;

    Blockly.Blocks.css_prop = {
        init: function() {
            this.appendDummyInput()
                .appendField("Prop:")
                .appendField(new Blockly.FieldDropdown([
                    ["color de fondo", "background-color"],
                    ["color de texto", "color"],
                    ["alineacion", "text-align"],
                    ["tipo de display", "display"],
                    ["radio de borde", "border-radius"],
                    ["espacio flex", "gap"],
                    ["estilo de lista", "list-style"]
                ]), "PROP")
                .appendField(":")
                .appendField(new Blockly.FieldTextInput("red"), "VALUE")
                .appendField(";");
            this.setPreviousStatement(true, "CSS_PROP");
            this.setNextStatement(true, "CSS_PROP");
            this.setColour("#4A148C");
        }
    };
    Blockly.HTML.css_prop = block => `${block.getFieldValue("PROP")}: ${block.getFieldValue("VALUE")};\n`;
}

// ==========================================
// RENDERIZADO WEB EN VIVO Y ROBUSTO
// ==========================================
const PREVIEW_BASE_CSS = `
    :root { color-scheme: light; }
    html, body {
        background: #ffffff;
        color: #000000;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        min-height: 100%;
    }
    body {
        min-height: 100vh;
        padding: 16px;
        overflow-wrap: anywhere;
    }
    * {
        box-sizing: border-box;
    }
    img, video, iframe {
        max-width: 100%;
        height: auto;
    }
`;

function stripOuterTag(source, tagName) {
    const regex = new RegExp(`^\\s*<${tagName}[^>]*>([\\s\\S]*)<\\/${tagName}>\\s*$`, "i");
    const match = source.match(regex);
    return match ? match[1].trim() : source.trim();
}

function extractSegments(source, tagName) {
    const regex = new RegExp(`<${tagName}[^>]*>[\\s\\S]*?<\\/${tagName}>`, "gi");
    return [...source.matchAll(regex)].map(match => stripOuterTag(match[0], tagName));
}

function createPreviewDocument(headContent = "", bodyContent = "") {
    const safeBody = bodyContent.trim() || `<div style="color:#6b7280;font-size:14px;">La vista previa aparecera aca mientras armas la pagina con bloques.</div>`;
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${PREVIEW_BASE_CSS}</style>
    ${headContent}
</head>
<body>
    ${safeBody}
</body>
</html>`;
}

function injectPreviewStyles(documentHtml) {
    let html = documentHtml.trim();
    if (!/^<!doctype/i.test(html)) {
        html = `<!DOCTYPE html>\n${html}`;
    }

    const previewHead = `<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${PREVIEW_BASE_CSS}</style>`;

    if (/<head[\s\S]*?>/i.test(html)) {
        return html.replace(/<head(\s[^>]*)?>/i, match => `${match}\n    ${previewHead}`);
    }

    if (/<html[\s\S]*?>/i.test(html)) {
        return html.replace(/<html(\s[^>]*)?>/i, match => `${match}\n<head>\n    ${previewHead}\n</head>`);
    }

    return createPreviewDocument("", html);
}

function buildPreviewHTML(rawCode) {
    const code = rawCode.trim();
    if (!code) return createPreviewDocument();

    if (/<html[\s\S]*?<\/html>/i.test(code)) {
        return injectPreviewStyles(code);
    }

    const headSections = extractSegments(code, "head");
    const bodySections = extractSegments(code, "body");
    const looseContent = code
        .replace(/<head[\s\S]*?<\/head>/gi, "")
        .replace(/<body[\s\S]*?<\/body>/gi, "")
        .replace(/<\/?html[^>]*>/gi, "")
        .trim();

    const headContent = headSections.join("\n").trim();
    const bodyContent = [bodySections.join("\n").trim(), looseContent].filter(Boolean).join("\n");
    return createPreviewDocument(headContent, bodyContent);
}

function updateBrowserChrome(html) {
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const customTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
    const browserLabel = customTitle || "Tu Pagina Web";
    document.querySelector(".browser-url").textContent = `Tu Pagina Web: ${browserLabel} | Vista previa automatica`;
}

function updatePreview() {
    if (!Game.workspace) return;

    try {
        const code = Blockly.HTML.workspaceToCode(Game.workspace);
        const previewHTML = buildPreviewHTML(code);
        const iframe = document.getElementById("web-preview");
        iframe.srcdoc = previewHTML;
        updateBrowserChrome(previewHTML);
    } catch (error) {
        console.warn("Generando vista previa fallida.", error);
    }
}

function schedulePreviewUpdate(delay = 120) {
    clearTimeout(Game.previewTimer);
    Game.previewTimer = setTimeout(updatePreview, delay);
}

function stabilizeFlyoutScale() {
    if (!Game.workspace || typeof Game.workspace.getFlyout !== "function") return;

    const flyout = Game.workspace.getFlyout();
    if (!flyout || !flyout.workspace_) return;

    flyout.workspace_.scale = 1;
    if (typeof flyout.reflow === "function") flyout.reflow();
    if (typeof flyout.position === "function") flyout.position();
}

// ==========================================
// CONTROL DE UI Y JUEGO
// ==========================================
function switchScreen(screenId) {
    document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");
}

function typeWriter(text, elementId, speed = 25) {
    const element = document.getElementById(elementId);
    const finalText = text.replace(/{trainer}/g, Game.trainer);
    let index = 0;

    element.textContent = "";
    clearInterval(Game.typeWriterInterval);

    Game.typeWriterInterval = setInterval(() => {
        if (index < finalText.length) {
            element.textContent += finalText.charAt(index);
            index += 1;
            return;
        }

        clearInterval(Game.typeWriterInterval);
    }, speed);
}

function actualizarEscenario() {
    const evoIndex = Game.level >= 20 ? 2 : (Game.level >= 10 ? 1 : 0);
    const pkID = Pokedex[Game.starter][evoIndex];

    document.getElementById("pk-sprite").src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkID}.png`;
    document.getElementById("ui-exp").innerText = Game.exp;
    document.getElementById("level-selector").value = Game.level;

    if (Game.level < Niveles.length) {
        typeWriter(Niveles[Game.level].dialogue, "txt-mensaje");
    }
}

function populateLevelSelector() {
    const selector = document.getElementById("level-selector");
    selector.innerHTML = "";

    Niveles.forEach((level, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.innerText = level.name;
        selector.appendChild(option);
    });

    selector.addEventListener("change", event => {
        Game.level = parseInt(event.target.value, 10);
        actualizarEscenario();
    });
}

document.getElementById("btn-next-intro").addEventListener("click", () => {
    const name = document.getElementById("trainer-name").value.trim();
    if (!name) {
        alert("Dime tu nombre. El entrenamiento exige disciplina.");
        return;
    }

    Game.trainer = name;
    document.getElementById("ui-trainer-name").innerText = Game.trainer;
    switchScreen("screen-selection");
});

document.querySelectorAll(".pk-card").forEach(card => {
    card.addEventListener("click", () => {
        Game.starter = card.dataset.pk;
        switchScreen("screen-main");
        iniciarIDE();
    });
});

function iniciarIDE() {
    defineBlocks();
    populateLevelSelector();

    Game.workspace = Blockly.inject("blocklyDiv", {
        toolbox: document.getElementById("toolbox"),
        renderer: "zelos",
        move: { scrollbars: true, drag: true, wheel: true },
        trashcan: true,
        zoom: { controls: true, wheel: false, startScale: 0.85, minScale: 0.65, maxScale: 1.35, scaleSpeed: 1.08 }
    });

    Game.workspace.addChangeListener(event => {
        if (event.type === Blockly.Events.VIEWPORT_CHANGE) {
            stabilizeFlyoutScale();
            return;
        }

        if (event.isUiEvent || event.type === Blockly.Events.FINISHED_LOADING) {
            return;
        }

        schedulePreviewUpdate();
    });

    actualizarEscenario();

    setTimeout(() => {
        Blockly.svgResize(Game.workspace);
        stabilizeFlyoutScale();
        updatePreview();
    }, 200);
}

// ==========================================
// EVALUACION DE MISION
// ==========================================
document.getElementById("btn-eval").addEventListener("click", () => {
    updatePreview();

    if (Game.level >= Niveles.length) return;
    const nivelActual = Niveles[Game.level];

    if (nivelActual.check()) {
        Game.exp += 150;
        typeWriter(`CORRECTO, ${Game.trainer}. Tienes un codigo fuerte. +150 EXP.`, "txt-mensaje", 20);

        setTimeout(() => {
            if (Game.level < Niveles.length - 1) {
                Game.level += 1;
                actualizarEscenario();
            }
        }, 2500);
        return;
    }

    typeWriter(`MAS FUERZA, ${Game.trainer}. Revisa que agregaste '${nivelActual.obj}' dentro del lugar correcto y vuelve a evaluar.`, "txt-mensaje", 20);
});
