# Songahm Trainer · Estúdio de formas

Revisão 02 conforme [GOAL-REV02.md](GOAL-REV02.md). Instrutor 3D independente para estudar Songahm 1, com viewport integral, HUD recolhível, fases inspecionáveis e 18 movimentos rastreáveis. Interface PT-BR; sem login, câmera de avaliação, serviços externos em runtime ou assets de terceiros.

```sh
npm ci
npm run dev
# http://127.0.0.1:5173
npm run build
npm run lint
npm test
npm run test:browser
RENDERER=svg npm run test:browser
# WebGL e servidor local real:
BROWSER=chromium TEST_URL=http://127.0.0.1:5173 npm run test:browser
```

Node 22.18+ ou 24. O teste padrão usa Firefox do Playwright (`npx playwright install firefox`, se ausente). `BROWSER=chromium` usa Chrome em `/usr/bin/google-chrome`; `CHROME_PATH` permite outro caminho. Sem `TEST_URL`, o teste serve o bundle de produção por interceptação HTTP. As capturas ficam em `artifacts/`, ignorado pelo Git.

- **Aprender:** explicações, ritmo inicial 0,5× e pausa a cada técnica. **Praticar:** demonstração que espera por você. **Revisar:** sequência contínua.
- Timeline: selecionar movimento, inspecionar o instante, pausar/retomar, anterior/próximo, repetir, reiniciar e ritmos 0,25×/0,5×/0,75×/1×. O controle de instante pausa a animação para estudar uma fase.
- Câmera: órbita, zoom e presets relativos ao corpo. Com o palco focado por Tab: setas giram, +/− dão zoom, Home restaura e Tab sai. Fora do palco: setas navegam. Espaço reproduz/pausa. Esc fecha instruções ou restaura o HUD.
- Instruções e fontes são recolhíveis. A timeline pode ser reduzida; em telas baixas inicia recolhida. “Ocultar controles” libera todo o palco. Reprodução sempre começa pausada, inclusive com movimento reduzido.

## Implementação

React + Vite + TypeScript e Three.js direto, sem wrappers ou biblioteca de estado. `lesson.ts` guarda conteúdo e fontes; `motion.ts` contém poses, fases, transformações do tronco e IK analítica de dois segmentos; `player.ts`, timeline determinística; `stage.ts`, cena/câmera; `main.tsx` e `style.css`, HUD responsivo. Não depende do Blender.

Chutes frontal/lateral têm trajetórias distintas, recolhimento, reação do quadril/tronco, guarda e pivô do apoio. Pés de apoio usam coordenadas do tatame. A aterrissagem conserva a numeração oficial: 4/8 e 13/17. Mão aberta (8/17) tem extensão própria; defesa interna (6/15) mantém flexão. WebGL é preferido (até 30 fps); SVGRenderer conserva geometria, projeção e órbita quando WebGL está indisponível (20 fps, materiais simples e sem sombras).

## Fontes e limites

Consultadas em 16/11/2026:
- [ATA — Songahm #1](https://media.atamartialarts.com/media/11789/9th-grade-white-belt-form-songahm-1final.pdf), páginas 1–2: ordem, membros, bases, direções e alturas; cada movimento remete ao mesmo número no PDF.
- [My ATA School — Songahm Il-Jahng](http://www.myataschool.com/pdf/Songahm_1.pdf), páginas 1–2: corroboração da sequência. O app escolhe altura média nos chutes, permitida pela fonte primária.
- [Schafer’s ATA — Songahm 1 (Full Form)](https://www.youtube.com/watch?v=71d4-MkyZs0): player público inspecionado; quadros nominais em 15/15,25/15,5/16,5 s (frontal) e 22/22,5/23/23,5/25 s (lateral/retorno). Observados elevação/recolhimento, mudança de orientação do apoio e inclinação do tronco; a vista posterior oculta parte das juntas. São estimativas visuais, não medições de ângulo. Licença de reutilização não identificada: sem download do arquivo de vídeo nem redistribuição de quadros. Capturas de estudo ficam somente em `artifacts/`. A fotografia citada no briefing não estava disponível; apenas sua descrição foi considerada.

Leitura relativa dos quadros (sem medidas certificadas):

| Trecho | Orientações observadas / adotadas | Limite da evidência |
| --- | --- | --- |
| Frontal, 15–16,5 s | Joelho sobe antes da abertura; tronco recua levemente e guarda acompanha. Pé de ataque sobe e recolhe; apoio persiste até a nova base. | Quadril e tornozelo parcialmente vistos por trás; dedos/ângulos finos não resolvidos. |
| Lateral, 22–25 s | Base se fecha; apoio muda de orientação, quadril gira, tronco e linha dos ombros inclinam. Recolhimento precede o retorno à base. | Parte do joelho/pé atacante fica encurtada pela perspectiva ou ocluída. A extensão máxima não é uma medição recuperável desses quadros. |
| Braços, 20 e 25–25,5 s | Defesa interna mantém cotovelo flexionado; o golpe de mão aberta é identificado como 8/17 pela sequência documentada. | Vista posterior não resolve todo o punho. Extensão do boneco é uma aproximação procedural, não cópia de coordenadas do vídeo. |

**A animação não tem validação marcial.** Ângulos, preparação, pivôs, passada #3, distribuição de peso, alcance, orientação fina dos pés/punhos e tempos continuam aproximações de keyframes. O retorno Bah Ro não é animado. Confirme a execução com seu instrutor. Sem afiliação, certificação ou endosso da ATA. Testes de software não certificam técnica; viewport móvel e toque emulados não comprovam iPhone físico.

A publicação existente usa GitHub Pages e a workflow `.github/workflows/deploy.yml`; o comando de build da workflow define a base `/songahm-trainer/`. O histórico de `.git-local` já está integrado ao `.git` principal; o diretório auxiliar é apenas um registro antigo ignorado.
