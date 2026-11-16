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

Node 22.18+ (testes TypeScript nativos) ou Node 24. Navegador moderno; WebGL 2 preferido, com renderização SVG de compatibilidade quando indisponível. O teste de navegador usa Playwright e Firefox instalado pelo Playwright (`npx playwright install firefox`, se ausente). Para testar WebGL no Chrome: `BROWSER=chromium npm run test:browser` (`CHROME_PATH` altera o executável). O app não depende do Blender. React + Vite + TypeScript + Three.js direto: dispensa wrappers e biblioteca de estado; OrbitControls e SVGRenderer vêm do próprio Three.js. O modo SVG conserva geometria e órbita 3D, com materiais simplificados, sem sombras e atualização limitada a 20 fps.

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

## Git e validação neste ambiente

O diretório `.git` original está montado somente para leitura: `git add` falha ao criar `index.lock`. Os commits foram preservados em **`.git-local`**, dentro desta pasta. Para consultá-los: `git --git-dir=.git-local --work-tree=. log --oneline`. Não houve push ou deploy. A integração desse histórico ao `.git` original exige uma sessão com escrita nesse diretório.

Neste ambiente também não é permitido abrir a porta 5173. O teste de navegador carrega o bundle de produção via interceptação HTTP local do Playwright, sem servidor nem publicação. Firefox executou o modo 3D SVG real; Chrome falhou por restrição de sockets e o caminho WebGL não foi validado visualmente. Capturas em `artifacts/` (ignoradas pelo Git). Validação em iPhone físico e revisão marcial continuam pendentes.
