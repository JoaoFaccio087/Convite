# Convite 💌

Página de convite em formato de ingresso: a pessoa responde "Sim" ou "Não", escolhe dia e lugar, e a resposta chega pelo WhatsApp.

## Como mudar o nome

O nome vem do próprio link, no parâmetro `?nome=`:

```
https://joaofaccio087.github.io/Convite/?nome=Érika
https://joaofaccio087.github.io/Convite/?nome=Maria%20Eduarda
```

Espaço vira `%20`. Acentos funcionam direto, mas se o link quebrar no WhatsApp use a versão codificada (`É` vira `%C3%89`). Sem `?nome=`, aparece o `nomePadrao` do `js/config.js`.

## Como personalizar

Tudo que muda de um convite para outro fica em **`js/config.js`**: nome padrão, recado, seu nome, seu WhatsApp, os textos do botão "Não" e as opções de dia e lugar. Deixe `recado` como `""` para não mostrar nenhum aviso. As cores ficam nas variáveis do topo de **`css/estilo.css`**.

## Estrutura

```
index.html          as duas telas (convite e resposta)
css/estilo.css      visual do ingresso, botões e animações
js/config.js        configurações editáveis
js/convite.js       lógica: nome, botão que foge, WhatsApp, confetes
imagem/carimbo.svg  carimbo da tela do "Sim" (também é o ícone da aba)
imagem/preview.png  imagem que aparece quando o link é enviado
```

## Como funciona

- **Nome pelo link:** `URLSearchParams` lê o `?nome=` e o texto entra com `textContent`, que não interpreta HTML.
- **Botão "Não":** foge para sempre, com o mouse (`pointerenter`) e com o toque (`pointerdown`). Na primeira fuga ele vai para o `<body>` com `position: fixed`, e a posição é sorteada dentro da tela, sem cobrir o "Sim". Os `textosDoNao` ficam se repetindo em ciclo.
- **WhatsApp:** o link `https://wa.me/NUMERO?text=MENSAGEM` abre a conversa com a mensagem pronta. A mensagem passa por `encodeURIComponent` para acentos, emojis e quebras de linha funcionarem.
- **Confetes:** cada partícula tem animação finita, então o evento `animationend` dispara e ela é removida.
- **Acessibilidade:** botões de verdade, foco visível, opções como `radio` e sem animações para quem ativou "reduzir movimento".

## Publicação (GitHub Pages)

1. No repositório: **Settings → Pages**.
2. Em *Source*, escolha a branch `main` e a pasta `/ (root)`.
3. O site fica em `https://joaofaccio087.github.io/Convite/`.

O preview do link usa endereços absolutos nas tags `og:` do `index.html`. Se publicar em outro endereço, atualize `og:image` e `og:url`. O WhatsApp guarda o preview em cache, então mudanças podem demorar a aparecer.
