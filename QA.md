# QA — revisão 03 · 16/11/2026

- `npm ci`, `npm run build`, `npm run lint` e `npm test` aprovados. São 22 testes: estado/gates, 18 especificações, continuidade, IK/alcance, contato real das caixas dos pés, espelhamento, giro conjunto, pivô plantar e aterrissagem. Nenhuma dependência adicionada.
- Poses fora dos laterais e suas aterrissagens comparadas à Rev02 em cinco instantes: maior diferença numérica 2,23e−16. Não houve tentativa de corrigir técnicas sem nova evidência.
- Navegador real: Chrome WebGL/SwiftShader e Firefox SVG. Seleção dos 18 movimentos, leitura antes de Demonstrar (#7/#16), espera sem autoplay, Continuar/repetir, execução em andamento, modos/ritmos, câmera/teclado, HUD/timeline, fontes e instruções.
- Viewports 1280×900, 390×844, 320×700 e 844×390; preparação aberta/recolhida, sem overflow ou controles fora da janela. Landscape mantém preparação na coluna esquerda. Pinça/toque emulados e perda/recuperação do contexto exercitados na suíte Chrome com URL real.
- Capturas privadas em `artifacts/rev03-webgl/` e `artifacts/rev03-svg/`: #7/#16, aproximação, câmara, pivô, extensão, recolhimento e reconstrução, vistas lateral/superior; interface desktop/mobile revista. Apoio ciano e seta dos dedos distinguem o pivô da seta verde do alvo.
- Reprodução: `BROWSER=chromium npm run test:browser`; `RENDERER=svg npm run test:browser`. `node --experimental-strip-types scripts/motion-evidence.ts` gera `artifacts/rev03/kinematics.json`.

Comparação explícita **do simulador** (yaw em graus no tatame; zero aponta leste, 180 oeste). Não são ângulos medidos no vídeo ou prescrições técnicas:

| Movimento / instante relativo | Pelve / tórax | Apoio | Pé atacante |
| --- | --- | --- | --- |
| 7 / 0,40 · câmara | 139,5 / 139,5 | esquerdo 54 | 139,5 |
| 7 / 0,52 · pivô | 117 / 117 | esquerdo 0 | 180 |
| 7 / 0,66 · extensão | 90 / 90 | esquerdo 0 | 180 |
| 16 / 0,40 · câmara | 40,5 / 40,5 | direito 126 | 40,5 |
| 16 / 0,52 · pivô | 63 / 63 | direito 180 | 0 |
| 16 / 0,66 · extensão | 90 / 90 | direito 180 | 0 |

A planta do apoio permanece fixa do instante 0,28 ao 0,80. A extensão do tornozelo no referencial do quadril é lateral (x ±0,86; z 0), em oposição à trajetória frontal. Ambos os pés tocam o chão na key pose 0,91 e a base é reconstruída até 1; essa transição pertence à entrada de 8/17, sem antecipar o golpe de braço.

Fonte ATA novamente conferida: #7 direito, #16 esquerdo, aterrissagens em 8/17. Quadros privados já disponíveis do vídeo de Schafer (22–25 s) revistos: fechamento, mudança de orientação do apoio, inclinação, recolhimento e retorno sustentam a comparação qualitativa. A vista posterior oculta joelho/tornozelo em parte; não permite recuperar valores exatos. Pelve/tórax acoplados e timings são keyframes aproximados, pendentes de revisão marcial. Sem redistribuir quadros/vídeo.

Limites: sem avaliação de instrutor ou iPhone físico; retorno Bah Ro não animado. Aviso de bundle >500 kB permanece. A instalação informa sete avisos moderados na cadeia de ferramentas de lint (não no runtime); não foram feitas atualizações de dependências fora desta revisão.
