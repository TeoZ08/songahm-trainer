# Songahm Trainer

Sala de treino independente em PT-BR, com Songahm 1, instrutor procedural articulado e controle de ritmo. Sem serviços externos em runtime e sem assets de terceiros.

```sh
npm ci
npm run dev
# abrir http://127.0.0.1:5173
npm run build
npm run lint
npm test
npm run test:browser
```

Node 22.18+ (testes TypeScript nativos) ou Node 24. Navegador com WebGL 2. O teste de navegador usa Playwright e um Firefox instalado por ele (`npx playwright install firefox`, se necessário). O app não depende do Blender. React + Vite + TypeScript + Three.js direto: dispensa wrappers e biblioteca de estado; OrbitControls vem do próprio Three.js.

- **Aprender:** explicação, velocidade inicial 0,5×, um movimento por vez.
- **Praticar:** demonstração com pausa entre técnicas; Continuar avança quando você desejar.
- **Revisar:** sequência contínua. Todos os modos permitem pausar, mudar velocidade, navegar e repetir.
- Espaço reproduz/pausa; setas navegam fora dos controles nativos. Câmera livre por arraste/pinça, presets relativos ao corpo e reset. Reprodução começa pausada, inclusive com preferência por movimento reduzido.

`src/lesson.ts` contém os fatos e referências; `motion.ts`, poses, preparação/extensão/recolhimento e IK analítica de dois segmentos; `player.ts`, estado determinístico; `stage.ts`, renderização e câmera; `main.tsx` e `style.css`, interface. Pés em coordenadas do tatame preservam apoio; juntas são resolvidas a cada amostra sem física acumulativa. A arquitetura permite novas aulas, mas inclui somente Songahm 1.

## Fontes e precisão

Consultadas em 16/11/2026, páginas 1–2, movimentos 1–18:
- [ATA — Songahm #1 “Pine Tree and Rock”](https://media.atamartialarts.com/media/11789/9th-grade-white-belt-form-songahm-1final.pdf): referência primária de ordem, lados, bases, direções e alturas.
- [My ATA School — Songahm Il-Jahng](http://www.myataschool.com/pdf/Songahm_1.pdf): corrobora a sequência. A fonte primária permite altura média ou alta nos chutes; o app escolhe média.

Cada movimento remete ao seu número nas duas fontes. As instruções em português são sínteses próprias; não redistribuímos PDFs, imagens ou vídeos. **A animação é uma aproximação, sem revisão marcial**: ângulos, preparação, rotação dos punhos, pivôs, passada #3, distribuição do peso, distâncias e tempos permanecem pendentes. Retorno Bah Ro descrito nas fontes ainda não é animado, e não constitui um 19º movimento. O 3D apoia a memorização; confirme a execução com um instrutor. Sem afiliação, certificação ou endosso da ATA.

Os testes verificam software e invariantes geométricos, não correção marcial. Viewport móvel simulado não comprova funcionamento em iPhone físico.
