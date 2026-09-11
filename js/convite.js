const nome = lerNome();
const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const telaConvite = document.getElementById("tela-convite");
const telaSim = document.getElementById("tela-sim");
const btnSim = document.getElementById("btn-sim");
const btnNao = document.getElementById("btn-nao");
const linkSim = document.getElementById("link-sim");
const efeitos = document.getElementById("efeitos");

iniciar();

function iniciar() {
  document.getElementById("nome").textContent = nome;
  document.title = `Convite para ${nome}`;
  mostrarRecado();

  criarOpcoes("opcoes-dia", "dia", CONFIG.opcoesDeDia);
  criarOpcoes("opcoes-lugar", "lugar", CONFIG.opcoesDeLugar);

  btnSim.addEventListener("click", responderSim, { once: true });
  configurarBotaoNao();

  telaSim.addEventListener("change", atualizarLinkSim);
  atualizarLinkSim();
}

function lerNome() {
  const parametros = new URLSearchParams(window.location.search);
  const nomeDoLink = (parametros.get("nome") || "").trim().slice(0, 30);
  return nomeDoLink || CONFIG.nomePadrao;
}

function mostrarRecado() {
  const recado = document.getElementById("recado");
  if (CONFIG.recado) {
    recado.textContent = CONFIG.recado;
  } else {
    recado.remove();
  }
}

function responderSim() {
  telaConvite.hidden = true;
  telaSim.hidden = false;
  btnNao.remove();
  document.getElementById("titulo-sim").focus();
  window.scrollTo(0, 0);
  soltarCoracoes();
}

function configurarBotaoNao() {
  let fugas = 0;
  let ultimaFuga = 0;

  btnNao.addEventListener("pointerenter", (evento) => {
    if (evento.pointerType === "mouse") fugir();
  });

  btnNao.addEventListener("pointerdown", (evento) => {
    evento.preventDefault();
    fugir();
  });

  btnNao.addEventListener("click", fugir);

  window.addEventListener("resize", () => {
    if (btnNao.isConnected && btnNao.classList.contains("fugindo")) manterDentroDaTela(btnNao);
  });

  function fugir() {
    if (Date.now() - ultimaFuga < 350) return;
    ultimaFuga = Date.now();

    const estavaComFoco = document.activeElement === btnNao;

    soltarDoIngresso(btnNao);
    btnNao.textContent = CONFIG.textosDoNao[fugas % CONFIG.textosDoNao.length];
    fugas++;
    moverParaLugarAleatorio(btnNao);

    if (estavaComFoco) btnNao.focus({ preventScroll: true });
  }
}

function soltarDoIngresso(botao) {
  if (botao.classList.contains("fugindo")) return;

  const posicao = botao.getBoundingClientRect();
  document.body.appendChild(botao);
  botao.classList.add("fugindo");
  botao.style.left = `${posicao.left}px`;
  botao.style.top = `${posicao.top}px`;
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

function atualizarLinkSim() {
  const mensagem =
    `Oi, ${CONFIG.seuNome}! Aceito sair com você 😊\n\n` +
    `Dia: ${opcaoEscolhida("dia")}\n` +
    `Lugar: ${opcaoEscolhida("lugar")}`;

  linkSim.href = linkWhatsApp(mensagem);
}

function linkWhatsApp(mensagem) {
  const numero = CONFIG.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

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

    particula.addEventListener("animationend", () => particula.remove());
    efeitos.appendChild(particula);
  }
}

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
