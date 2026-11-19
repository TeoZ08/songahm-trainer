# Songahm Trainer · Estúdio de formas

Revisão local 07. Instrutor 3D independente para estudar Songahm 1, com viewport integral, HUD recolhível, fases inspecionáveis e 18 movimentos rastreáveis. Interface PT-BR; sem login, câmera de avaliação ou serviços externos em runtime. Marca MASTER autêntica fornecida para esta revisão, com geometria 3D procedural e material CC0 local no tatame.

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

- **Aprender:** preparação recolhível antes de cada técnica; o aluno inicia com **Demonstrar**. Ritmo inicial 0,5×. Continuar abre a preparação seguinte, sem autoplay; repetir também permite reler. **Praticar:** demonstração que espera por você. **Revisar:** sequência contínua.
- Timeline: selecionar movimento, inspecionar o instante, pausar/retomar, anterior/próximo, repetir, reiniciar e ritmos 0,25×/0,5×/0,75×/1×/2×. O controle de instante pausa a animação para estudar uma fase.
- Câmera: órbita, zoom e presets relativos ao corpo. Com o palco focado por Tab: setas giram, +/− dão zoom, Home restaura e Tab sai. Fora do palco: setas navegam. Espaço reproduz/pausa. Esc fecha instruções ou restaura o HUD.
- **Trajetória**, nos controles de câmera: mostra o percurso aproximado da mão ou do tornozelo da técnica atual; começa desligada e acompanha a seleção de movimento.
- Instruções e fontes são recolhíveis. A timeline pode ser reduzida; em telas baixas inicia recolhida. “Ocultar controles” libera todo o palco. Reprodução sempre começa pausada, inclusive com movimento reduzido.

## Identidade e implementação

Identidade MASTER: logo transparente original otimizada para o cabeçalho/favicon, vermelho `#E03841`, superfícies pretas/grafite e controles compactos. Origem e limites em [brand-reference/README.md](brand-reference/README.md). Projeto independente, sem vínculo institucional. A revisão local preserva o corpo branco e os laterais elevados (tornozelo a 1,40 m no motor), corrigindo a câmara/retração que atravessava o tórax. A guarda e os ombros também foram ajustados para dar espaço aos braços. As pernas dos frontais 3/12, o apoio/pivô e o pico dos laterais permanecem iguais ao baseline `e6728c5`; a torção do tronco entra sem salto no frontal. O tatame usa dois mapas WebP de 512 px, cerca de 6 kB juntos, com luz de recorte e marcações de perímetro. [Origem e licença CC0](public/studio/LICENSES.md). Sem dependências novas.

React + Vite + TypeScript e Three.js direto, sem wrappers ou biblioteca de estado. `lesson.ts` guarda fatos e fontes; `movement-spec.ts` define fases, papéis, metas, limites e instruções dos 18 movimentos; `motion.ts` consome essa especificação e resolve transformações e IK analítica de dois segmentos; `rig.ts`, juntas e dimensões compartilhadas entre renderização e auditoria geométrica; `player.ts`, timeline determinística; `stage.ts`, cena/câmera; `main.tsx` e `style.css`, HUD responsivo. Não depende do Blender.

Nos laterais #7 (direito, apoio esquerdo) e #16 (esquerdo, apoio direito), o fechamento precede câmara/giro conjunto de pelve e tórax, pivô plantar, extensão no referencial local do quadril, recolhimento e aterrissagem. O apoio ciano tem seta dos dedos; o alvo mantém seta verde. A planta fica fixa durante o pivô, enquanto o tornozelo percorre seu arco. A aterrissagem é compartilhada com a entrada de 8/17; o golpe de braço só acontece nesses movimentos. Frontais conservam o recolhimento e apoiam em 4/13. Mão aberta (8/17) tem extensão própria; defesa interna (6/15) mantém flexão. WebGL é preferido (até 30 fps); SVGRenderer conserva geometria, projeção e órbita quando WebGL está indisponível (20 fps, materiais simples e sem sombras). Cenas paradas são renderizadas sob demanda; reprodução e câmera continuam atualizando.

A verificação do corpo usa cápsulas e caixas orientadas, com raios/dimensões do renderizador. Os testes percorrem 1.001 instantes por técnica, verificam comprimento ósseo e continuidade, e auditam contatos entre membros distintos. São envelopes aproximados: excluem a união proximal de 18 cm da coxa e 13 cm do braço, o par anatômico coxa/pelve e encontros dentro da mesma cadeia. Não é um simulador físico nem garantia contínua para poses arbitrárias. Evidência reproduzível: `node --experimental-strip-types scripts/rig-evidence.ts` gera `artifacts/rev07/rig.json`.

Para reproduzir as medidas do simulador: `node --experimental-strip-types scripts/motion-evidence.ts`. O JSON fica em `artifacts/rev03/kinematics.json`; são medidas do motor, não ângulos medidos nas referências.

## Fontes e limites

Consultadas em 16/11/2026:
- [ATA — Songahm #1](https://media.atamartialarts.com/media/11789/9th-grade-white-belt-form-songahm-1final.pdf), páginas 1–2: ordem, membros, bases, direções e alturas; cada movimento remete ao mesmo número no PDF.
- [My ATA School — Songahm Il-Jahng](http://www.myataschool.com/pdf/Songahm_1.pdf), páginas 1–2: corroboração da sequência. O app escolhe altura média nos frontais e alta nos laterais, opções permitidas pela fonte primária; as poses continuam aproximadas.
- [Schafer’s ATA — Songahm 1 (Full Form)](https://www.youtube.com/watch?v=71d4-MkyZs0): player público inspecionado; quadros nominais em 15/15,25/15,5/16,5 s (frontal) e 22/22,5/23/23,5/25 s (lateral/retorno). Observados elevação/recolhimento, mudança de orientação do apoio e inclinação do tronco; a vista posterior oculta parte das juntas. São estimativas visuais, não medições de ângulo. Licença de reutilização não identificada: sem download do arquivo de vídeo nem redistribuição de quadros. Capturas de estudo ficam somente em `artifacts/`. A fotografia citada no briefing não estava disponível; apenas sua descrição foi considerada.

Leitura relativa dos quadros (sem medidas certificadas):

| Trecho | Orientações observadas / adotadas | Limite da evidência |
| --- | --- | --- |
| Frontal, 15–16,5 s | Joelho sobe antes da abertura; tronco recua levemente e guarda acompanha. Pé de ataque sobe e recolhe; apoio persiste até a nova base. | Quadril e tornozelo parcialmente vistos por trás; dedos/ângulos finos não resolvidos. |
| Lateral, 22–25 s | Base se fecha; apoio muda de orientação, quadril gira, tronco e linha dos ombros inclinam. Recolhimento precede o retorno à base. | Parte do joelho/pé atacante fica encurtada pela perspectiva ou ocluída. A extensão máxima não é uma medição recuperável desses quadros. |
| Braços, 20 e 25–25,5 s | Defesa interna mantém cotovelo flexionado; o golpe de mão aberta é identificado como 8/17 pela sequência documentada. | Vista posterior não resolve todo o punho. Extensão do boneco é uma aproximação procedural, não cópia de coordenadas do vídeo. |

**A animação não tem validação marcial.** Ângulos, preparação, pivôs, passada #3, distribuição de peso, alcance, orientação fina dos pés/punhos e tempos continuam aproximações de keyframes. O retorno Bah Ro não é animado. Confirme a execução com seu instrutor. Sem afiliação, certificação ou endosso da ATA. Testes de software não certificam técnica; viewport móvel e toque emulados não comprovam iPhone físico.

Esta entrega é local, sem push ou deploy. A publicação existente usa GitHub Pages e a workflow `.github/workflows/deploy.yml`; o comando de build da workflow define a base `/songahm-trainer/`. O histórico de `.git-local` já está integrado ao `.git` principal; o diretório auxiliar é apenas um registro antigo ignorado.
