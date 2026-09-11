// =============================================================
//  CONFIGURAÇÕES DO CONVITE
//  Tudo que você pode querer mudar fica aqui. O resto do código
//  (js/convite.js) só lê estes valores.
// =============================================================

const CONFIG = {
  // Nome usado quando o link não tem "?nome=..." no final.
  // Com o link terminando em ?nome=Ana, aparece "Ana" no lugar deste.
  nomePadrao: "Érika",

  // Seu nome. Aparece nas mensagens do WhatsApp.
  seuNome: "João",

  // Seu WhatsApp: 55 + DDD + número, só dígitos. Ex: "5565999998888".
  // Se ficar vazio, o WhatsApp abre e pede para ela escolher o contato.
  whatsapp: "",

  // O que o botão "Não" vai dizendo a cada fuga.
  // Ele foge uma vez para cada texto; depois do último, aceita o clique.
  textosDoNao: ["Tem certeza?", "Pensa bem…", "Sério mesmo?", "Tá, pode clicar 🙂"],

  // Opções que aparecem depois do "Sim".
  opcoesDeDia: ["Sexta à noite", "Sábado", "Domingo", "Durante a semana"],
  opcoesDeLugar: ["Cinema", "Um café", "Sorvete ou açaí", "Jantar", "Você escolhe"],

  // Texto usado na mensagem quando ela não escolhe nenhuma opção.
  semEscolha: "a gente combina",
};
