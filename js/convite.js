// =============================================================
//  LÓGICA DO CONVITE
//  1. Lê o nome do link (?nome=...)
//  2. Faz o "Não" fugir algumas vezes antes de aceitar
//  3. Mostra a tela certa depois da resposta
//  4. Monta o link do WhatsApp com a resposta
//  Os textos e opções ficam em js/config.js.
// =============================================================

const nome = lerNome();
const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const telaConvite = document.getElementById("tela-convite");
const telaSim = document.getElementById("tela-sim");
const telaNao = document.getElementById("tela-nao");
const btnSim = document.getElementById("btn-sim");
const btnNao = document.getElementById("btn-nao");
const linkSim = document.getElementById("link-sim");
const linkNao = document.getElementById("link-nao");
const efeitos = document.getElementById("efeitos");

iniciar();

function iniciar() {
  // textContent (e não innerHTML) garante que o nome vindo do link
  // aparece só como texto, sem conseguir injetar HTML na página.
  document.getElementById("nome").textContent = nome;
  document.title = `Convite para ${nome}`;

  criarOpcoes("opcoes-dia", "dia", CONFIG.opcoesDeDia);
  criarOpcoes("opcoes-lugar", "lugar", CONFIG.opcoesDeLugar);

  // { once: true } faz o clique no Sim valer só uma vez
  btnSim.addEventListener("click", responderSim, { once: true });
  configurarBotaoNao();

  // Sempre que ela marcar uma opção, o link do WhatsApp é refeito
  telaSim.addEventListener("change", atualizarLinkSim);
  atualizarLinkSim();

  linkNao.href = linkWhatsApp(
    `Oi, ${CONFIG.seuNome}! Valeu pelo convite, mas dessa vez não vai rolar 🙂`
  );
}

// -------------------------------------------------------------
//  NOME PELO LINK
// -------------------------------------------------------------
function lerNome() {
  const parametros = new URLSearchParams(window.location.search);
  const nomeDoLink = (parametros.get("nome") || "").trim().slice(0, 30);
  return nomeDoLink || CONFIG.nomePadrao;
}

// -------------------------------------------------------------
//  RESPOSTAS
// -------------------------------------------------------------
function responderSim() {
  mostrarTela(telaSim);
  soltarCoracoes();
}

function responderNao() {
  mostrarTela(telaNao);
}

function mostrarTela(telaVisivel) {
  for (const tela of [telaConvite, telaSim, telaNao]) {
    tela.hidden = tela !== telaVisivel;
  }

  // Se o "Não" estava fugindo, ele está solto no <body>: some com ele
  btnNao.remove();

  // Leva o foco para o título da nova tela (ajuda leitores de tela)
  telaVisivel.querySelector("[tabindex='-1']").focus();
  window.scrollTo(0, 0);
}

// -------------------------------------------------------------
//  BOTÃO "NÃO" QUE FOGE
// -------------------------------------------------------------
function configurarBotaoNao() {
  const totalDeFugas = CONFIG.textosDoNao.length;
  let fugas = 0;
  let ultimaFuga = 0;

  // Mouse: foge quando o cursor encosta
  btnNao.addEventListener("pointerenter", (evento) => {
    if (evento.pointerType === "mouse" && fugas < totalDeFugas) fugir();
  });

  // Celular: foge quando o dedo toca (não existe "hover" no toque)
  btnNao.addEventListener("pointerdown", (evento) => {
    if (fugas < totalDeFugas) {
      evento.preventDefault();
      fugir();
    }
  });

  // Clique de verdade (ou Enter no teclado)
  btnNao.addEventListener("click", () => {
    // Ignora o clique que o navegador dispara logo depois do toque que fez fugir
    if (Date.now() - ultimaFuga < 400) return;

    if (fugas < totalDeFugas) {
      fugir();
    } else {
      responderNao();
    }
  });

  // Se a tela girar/redimensionar, traz o botão de volta para dentro
  window.addEventListener("resize", () => {
    if (btnNao.classList.contains("fugindo")) manterDentroDaTela(btnNao);
  });

  function fugir() {
    const estavaComFoco = document.activeElement === btnNao;

    soltarDoIngresso(btnNao);
    btnNao.textContent = CONFIG.textosDoNao[fugas];
    fugas++;
    ultimaFuga = Date.now();
    moverParaLugarAleatorio(btnNao);

    if (estavaComFoco) btnNao.focus({ preventScroll: true });
  }
}

// Na primeira fuga, o botão sai do ingresso e vai para o <body>
// com position: fixed, começando exatamente de onde estava.
function soltarDoIngresso(botao) {
  if (botao.classList.contains("fugindo")) return;

  const posicao = botao.getBoundingClientRect();
  document.body.appendChild(botao);
  botao.classList.add("fugindo");
  botao.style.left = `${posicao.left}px`;
  botao.style.top = `${posicao.top}px`;

  // Força o navegador a aplicar a posição inicial antes de mudar,
  // senão a transição (animação do movimento) não acontece.
  botao.getBoundingClientRect();
}

function moverParaLugarAleatorio(botao) {
  const margem = 16;
  const largura = botao.offsetWidth;
  const altura = botao.offsetHeight;
  const maxX = Math.max(margem, document.documentElement.clientWidth - largura - margem);
  const maxY = Math.max(margem, window.innerHeight - altura - margem);

  const atual = botao.getBoundingClientRect();
  const areaDoSim = btnSim.getBoundingClientRect();

  // Sorteia até achar um lugar que não cubra o "Sim" e fique longe de onde estava
  let x;
  let y;
  for (let tentativa = 0; tentativa < 30; tentativa++) {
    x = sortear(margem, maxX);
    y = sortear(margem, maxY);

    const novo = { left: x, top: y, right: x + largura, bottom: y + altura };
    const distancia = Math.hypot(x - atual.left, y - atual.top);

    if (!seSobrepoem(novo, areaDoSim, 12) && distancia > 120) break;
  }

  botao.style.left = `${x}px`;
  botao.style.top = `${y}px`;
}

function manterDentroDaTela(botao) {
  const margem = 16;
  const maxX = document.documentElement.clientWidth - botao.offsetWidth - margem;
  const maxY = window.innerHeight - botao.offsetHeight - margem;
  botao.style.left = `${limitar(parseFloat(botao.style.left), margem, maxX)}px`;
  botao.style.top = `${limitar(parseFloat(botao.style.top), margem, maxY)}px`;
}

// -------------------------------------------------------------
//  OPÇÕES DE DIA E LUGAR
// -------------------------------------------------------------
function criarOpcoes(idDoContainer, grupo, opcoes) {
  const container = document.getElementById(idDoContainer);

  for (const texto of opcoes) {
    const label = document.createElement("label");
    label.className = "opcao";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = grupo;
    input.value = texto;

    const span = document.createElement("span");
    span.textContent = texto;

    label.append(input, span);
    container.appendChild(label);
  }
}

function opcaoEscolhida(grupo) {
  const marcada = document.querySelector(`input[name="${grupo}"]:checked`);
  return marcada ? marcada.value : CONFIG.semEscolha;
}

// -------------------------------------------------------------
//  WHATSAPP
// -------------------------------------------------------------
function atualizarLinkSim() {
  const mensagem =
    `Oi, ${CONFIG.seuNome}! Aceito sair com você 😊\n\n` +
    `Dia: ${opcaoEscolhida("dia")}\n` +
    `Lugar: ${opcaoEscolhida("lugar")}`;

  linkSim.href = linkWhatsApp(mensagem);
}

function linkWhatsApp(mensagem) {
  const numero = CONFIG.whatsapp.replace(/\D/g, ""); // deixa só os dígitos
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

// -------------------------------------------------------------
//  CORAÇÕES E CONFETES
// -------------------------------------------------------------
function soltarCoracoes() {
  if (reduzirMovimento) return;

  const cores = ["#C8102E", "#FFF6EE", "#F2B544", "#4A0A1C"];

  for (let i = 0; i < 48; i++) {
    const particula = document.createElement("span");
    const ehCoracao = i % 3 === 0;

    particula.className = ehCoracao ? "particula particula--coracao" : "particula particula--confete";
    if (ehCoracao) particula.textContent = "♥";

    particula.style.left = `${sortear(0, 100)}vw`;
    particula.style.setProperty("--cor", cores[i % cores.length]);
    particula.style.setProperty("--deriva", `${sortear(-90, 90)}px`);
    particula.style.setProperty("--giro", `${sortear(-540, 540)}deg`);
    particula.style.animationDuration = `${sortear(2200, 3800)}ms`;
    particula.style.animationDelay = `${sortear(0, 700)}ms`;

    // A animação não é infinita, então "animationend" dispara e a partícula some
    particula.addEventListener("animationend", () => particula.remove());
    efeitos.appendChild(particula);
  }
}

// -------------------------------------------------------------
//  AJUDANTES
// -------------------------------------------------------------
function sortear(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function limitar(valor, min, max) {
  return Math.min(Math.max(valor, min), max);
}

function seSobrepoem(a, b, folga) {
  return !(
    a.right + folga < b.left ||
    a.left - folga > b.right ||
    a.bottom + folga < b.top ||
    a.top - folga > b.bottom
  );
}
