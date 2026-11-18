# GOAL REV 06 — Chutes laterais mais altos, velocidade 2× e instrutor branco liso

## Missão
Implementar integralmente a nova revisão do Songahm Trainer após aprovação visual da identidade MASTER. O usuário gostou da Rev05 e quer preservar o estúdio, mas solicita três mudanças específicas: elevar os chutes laterais, adicionar reprodução 2× e simplificar o boneco para um visual branco liso, mantendo destaques cromáticos funcionais. Entregar produto final testado e publicado no GitHub Pages existente, não uma proposta.

## Projeto
- /home/matteo/ProjetosPessoais/songahm-instructor
- https://github.com/TeoZ08/songahm-trainer
- https://teoz08.github.io/songahm-trainer/
- HEAD atual observado e4b3eed; verificar novamente. Trabalhar somente neste repo. Preservar a identidade MASTER, suas logos, a interface imersiva, a preparação didática e todos os controles.
- Ler GOAL-REV05-MASTER.md (se presente), QA.md, README.md, src/motion.ts, src/movement-spec.ts, src/stage.ts, src/player.ts, src/main.tsx, tests/ e o workflow existente. Não recriar projeto, não modificar outros projetos.

## 1. Instrutor branco liso — revisão visual
- Remover linhas, costuras aparentes, marcas decorativas, contornos desnecessários e detalhes que não ajudam a ler movimentos; examinar o modelo real em todos os ângulos. Manter articulações e proporções necessárias ao rig.
- Corpo predominantemente branco/off-white uniforme e liso, materiais com iluminação e contraste adequados ao estúdio escuro. Não adicionar textura, rosto realista, roupa detalhada ou ornamentos.
- Manter as cores de destaque dos membros ativos e do pé de apoio já aprovadas. Articulações devem permanecer inteligíveis; não remover componentes biomecânicos apenas por estética.
- Revisar tanto WebGL quanto representação SVG, inclusive seleção de movimento, repouso, defesa e chutes. Não remover marcações técnicas do ambiente que são úteis ao treino por engano.

## 2. Velocidade 2×
- Adicionar 2× ao seletor de ritmo, preservando todas as opções anteriores (0,25×, 0,5×, 0,75×, 1×).
- Atualizar validação do player, tipos/constantes, interfaces e testes. O controle de tempo deve manter consistência em todos os modos, mudanças de velocidade em reprodução, replay, avanço e transições, sem pular estados ou remover a preparação.
- Testar a execução contínua em 2× e confirmar que o tempo real do movimento é aproximadamente metade de 1×. Preservar scrub em tempo da técnica, independente da velocidade.

## 3. Chutes laterais mais altos (07 e 16)
- O usuário considera a biomecânica atual do chute lateral satisfatória. Aumentar de modo perceptível a altura do membro atacante no pico e ajustar a preparação/recolhimento de forma contínua.
- Preservar o pivô do apoio, a orientação do quadril/tronco, o chamber lateral, a extensão lateral e a posição do calcanhar acima da ponta conforme correção anterior. Não transformar o lateral em chute frontal nem produzir um pé mais alto por teletransporte ou alongamento de membros.
- Ajustar parâmetros declarativos e constraints de alcance; se necessário, reduzir moderadamente o alcance horizontal para respeitar o comprimento ósseo, mantendo a técnica visualmente mais alta e lateral. Testar o espelhamento e o contato do pé de apoio.
- Medir altura anterior e nova do tornozelo/pé, ângulo no pico e comprimento das pernas; registrar comparação objetiva. Escolher altura tecnicamente plausível, não arbitrariamente máxima. Inspecionar screenshots no pico e durante preparação/retração em vista lateral e frontal, ambos os lados.
- NÃO alterar a biomecânica do chute frontal (03/12), especialmente o joelho praticamente fixo na extensão e a ausência de pivô do apoio, que foram aprovados. A altura do frontal poderá ser tratada separadamente.

## Validação / entrega
1. Revisar estado Git e capturar baseline se útil; implementar três melhorias, preservando comportamento restante.
2. Executar npm run build, npm run lint, npm test, BROWSER=chromium npm run test:browser e RENDERER=svg npm run test:browser, nos ambientes suportados. Adicionar testes relevantes de 2×, altura, simetria e invariantes.
3. Inspecionar visualmente o boneco, as fases dos laterais e todos os controles em desktop/mobile; corrigir problemas encontrados. Não confiar apenas em testes numéricos.
4. Manter design MASTER, viewport dominante, 18 movimentos e modos Aprender/Praticar/Revisar, preparação e timeline funcionais. Não criar novos recursos fora do escopo.
5. Atualizar sucintamente QA se necessário, fazer commits coerentes e, após validação, push na main do mesmo repo. Confirmar GitHub Actions, Pages, assets e console público. Não abrir outro deploy.
6. Não alegar precisão marcial certificada; informar limitações reais. Não solicitar aprovações intermediárias para ajustes normais. Execute até o produto final, sem relatórios volumosos.
