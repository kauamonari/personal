# André Rocha — Elite Performance (site 3D cinematográfico)

Landing page de exemplo para um programa de coaching de performance de elite, criada como peça de portfólio de alto padrão — WebGL/Three.js + Tailwind CSS + glassmorphism. Dados, nome, depoimentos e preços são fictícios.

**[Ver demo ao vivo](#)** — publique com GitHub Pages e cole o link aqui.

## Stack

- **Three.js** (via CDN, ES modules) — cena 3D no fundo da tela inteira, persistente durante o scroll
- **Tailwind CSS** — pré-compilado em build (ver abaixo), não via CDN runtime
- **JavaScript puro** — sem framework, sem bundler para o site em si

## Estrutura

```
index.html
css/
  style.css            componentes customizados (tokens, glass, botões, nav...)
  tailwind-input.css    fonte do build do Tailwind (@import "tailwindcss";)
  tailwind.css          CSS do Tailwind já compilado — versionado, pronto pra usar
js/
  scene.js              gate leve (WebGL? mobile? reduced-motion?) — decide se carrega o 3D
  three-scene.js         cena Three.js de verdade (só baixado quando o gate passa)
  ui.js                  menu, scroll reveal, contadores, formulário
package.json             script para recompilar o Tailwind se você mudar classes no HTML
```

## Por que o Tailwind é pré-compilado (e não `cdn.tailwindcss.com`)

O CDN "Play" do Tailwind compila as classes **no navegador, em tempo real**, lendo o HTML renderizado. Nesta página — que usa bastante sintaxe de valor arbitrário (`text-[clamp(...)]`, `before:content-['']`, `[writing-mode:vertical-rl]`) — o compilador do navegador **descartou silenciosamente** algumas classes (sem nenhum erro no console), incluindo `hidden sm:inline-flex` no botão do header, que ficava sempre visível no mobile. A própria documentação do Tailwind não recomenda o Play CDN em produção por causa desse tipo de instabilidade.

A solução: compilar o CSS uma vez, em build, e versionar o resultado (`css/tailwind.css`). Mais confiável, mais leve (sem JIT rodando no cliente) e sem dependência de CDN para o CSS.

Se você editar classes no `index.html` e quiser recompilar:

```bash
npm install
npm run build:css
```

## Sobre a cena 3D

- Kettlebell construído proceduralmente (`LatheGeometry` + `TorusGeometry`, sem modelo externo), material metálico PBR com clearcoat
- Anel "de vidro" orbitando (clearcoat + transparência — evitei `transmission` de verdade porque ela força uma cópia do framebuffer a cada frame e trava dispositivos sem GPU dedicada)
- Ambiente de iluminação gerado via `RoomEnvironment` do próprio Three.js (reflexos realistas sem precisar de um arquivo HDRI externo)
- Sombra suave via `VSMShadowMap`
- Câmera anima suavemente com o **scroll** (uma "batida de câmera" por seção) e com o **mouse** (paralaxe sutil)

## Performance / mobile

`js/scene.js` é o único script carregado de cara: ele decide se o dispositivo é desktop, tem WebGL e não pediu `prefers-reduced-motion` — **só então** ele importa dinamicamente `three-scene.js` (e, com isso, a biblioteca Three.js inteira). Em mobile, a biblioteca nunca é baixada: a cena é substituída por um "orbe" CSS puro (gradiente cônico animado) com o mesmo visual de fundo.

## Rodando localmente

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```
