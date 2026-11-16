# GOAL REV 02 — SONGAHM TRAINER
## Instrutor 3D imersivo, biomecânica dos chutes, braços e revisão visual

### Missão
Transformar a primeira versão funcional do Songahm Trainer em uma ferramenta imersiva de treinamento de formas Songahm. A aplicação deve parecer um software de visualização/estudo 3D (referência conceitual: viewport do Blender), NÃO uma landing page com um quadrado 3D encaixado entre textos.

A revisão é de **produto final implementado e testado**, não de planejamento, prototipação ou apresentação. Preserve o Songahm 1 e seus 18 movimentos e entregue a revisão com qualidade perceptivelmente superior.

### Projeto e fluxo
- Diretório: `/home/matteo/ProjetosPessoais/songahm-instructor`.
- Repositório remoto existente: `https://github.com/TeoZ08/songahm-trainer`.
- Publicação existente: `https://teoz08.github.io/songahm-trainer/` (GitHub Pages).
- Trabalhar NESTE repositório, sem recriar projeto, sem tocar Songdrift, Memória Pessoal ou portfólio 3D.
- Ler `GOAL.md`, `README.md`, `QA.md`, `src/`, `tests/`, `.github/workflows/deploy.yml` e o estado real do Git ANTES de alterações. Há alterações locais originadas da execução anterior; preservar, integrar ou consolidar, NUNCA sobrescrever cegamente.
- O projeto foi publicado através de commits remotos após um histórico de Git alternativo (`.git-local`), posteriormente conectado ao `.git` principal. Verificar alinhamento entre HEAD local/remoto antes de commitar e publicar; não apagar trabalho.
- Manter o fluxo via **Codex App / Goal nativo**. Não criar execuções paralelas no mesmo repositório.
- Não criar arquivos de relatório volumosos, diretórios temporários permanentes nem demos falsas. Manter commits legíveis e README/QA sucintos.

### Feedback factual do usuário
- No app publicado, **o chute parece movimentar só a perna**, deixando quadril, tronco e pé base excessivamente estáticos.
- Um golpe/bloqueio de braço (descrito pelo usuário como "golpe de canto") precisa parecer mais estendido e alinhado; verificar qual técnica ele está visualizando antes de editar sem critério.
- O usuário quer **a tela praticamente inteira dedicada ao ambiente 3D**, com modais/painéis/controles flutuantes sobre o viewport, como em softwares de modelagem 3D.
- O texto editorial e os blocos grandes devem perder protagonismo; a interface deve parecer um instrutor virtual, não uma homepage.
- Referência fotográfica do usuário: imagem ilustrativa de chute lateral com perna de ataque estendida lateralmente, corpo inclinado, pé de apoio pivotado, braços ajudando equilíbrio. Se o anexo da conversa não estiver acessível ao agente, tratar essa descrição como referência parcial, sem fingir que a imagem foi analisada.
- Referência de vídeo YouTube fornecida: `https://youtu.be/71d4-MkyZs0`. Identificar tecnicamente o golpe mostrado no vídeo, verificar permissões de download, e tentar analisar quadros reais, sem inventar observações sobre vídeos inacessíveis.
- O objetivo é **orientação técnica e memorização**; não vender fidelidade marcial certificada sem revisão de instrutor.

### Frente 1 — Biomecânica e animações
Refatorar as animações das técnicas importantes para que o movimento seja corporal, sem deslizamento excessivo nem teletransporte:

**Chute frontal**
1. Base/apoio; 2. Elevação do joelho (chamber); 3. Extensão do membro; 4. Recolhimento; 5. Apoio final com transição à base.
Incluir reação plausível do quadril e tronco, alinhamento de tornozelo e pé e braços de equilíbrio. Manter origem de apoio estável via IK/constraints. Usar fases temporais distinguíveis.

**Chute lateral**
1. Base e preparação; 2. Elevação e fechamento do joelho; 3. Rotação do quadril com pivô do pé de apoio; 4. Extensão LATERAL real da perna; 5. Ajuste do tronco/ombros; 6. Recolhimento; 7. Retorno controlado.
Corrigir ângulo, orientação do pé atacante e a direção do golpe. Não substituir automaticamente a biomecânica do chute frontal pela do lateral; são técnicas distintas. Priorizar anatomia simplificada consistente com o boneco.

**Braços, socos e bloqueios**
- Melhorar extensão de cotovelo quando a técnica exigir, alinhamento ombro–cotovelo–punho, orientação dos punhos, movimento de ombro e guarda do outro braço.
- Verificar explicitamente as técnicas de bloqueio/canto e a correspondência com a referência da forma; evitar retificar excessivamente técnicas que exigem flexão.
- Reaproveitar movimentos procedurais validados entre as 18 etapas; manter a distinção entre dados técnicos da forma e interpolação visual.

**Estabilidade e qualidade**
- Respeitar limites de alcance e integridade do esqueleto; manter pés coerentes com o tatame.
- Evitar penetrações grosseiras, clipping, giros bruscos, poses rígidas e braços que atravessam o tronco.
- Inspecionar animação em andamento, não apenas quadro final. Comparar, quando possível, quadros de pré-chute, preparação, pico, recolhimento e retorno.
- Cobrir lado esquerdo/direito, direções e câmeras diferentes.

### Frente 2 — Análise visual quadro a quadro
- Tentar acessar `https://youtu.be/71d4-MkyZs0`, verificar o que realmente é demonstrado e se o conteúdo pode ser processado de forma legítima para estudo.
- Se viável, usar `yt-dlp` / `ffmpeg` ou ferramentas equivalentes para estudo privado local. Não redistribuir vídeo ou quadros de terceiros no site ou repositório.
- Extrair quadros de referência nos momentos inicial, chamber, máxima extensão, retração e aterrissagem. Mapear orientações relativas de quadril, ombro, joelho, tornozelo, pé de apoio e tronco (estimativas visuais, não medidas biomecânicas certificadas).
- Para o chute lateral, considerar também a imagem fornecida pelo usuário (perna lateral alta, tronco inclinado, pé base pivoteado) se disponível. Se não estiver, não alegar que a inspecionou.
- Se download/vídeo for inacessível, seguir com referências legítimas e a evidência da screenshot do app, explicitando a limitação. Não bloquear o restante do Goal por esse ponto.
- Preservar referência e rastreabilidade de fontes, separando fatos documentados de aproximações de keyframes.

### Frente 3 — Redesign completo para viewport 3D imersivo
**Meta visual:** abrir o app deve parecer abrir um estúdio técnico de visualização 3D. O personagem e o tatame ocupam o palco principal.

- Viewport 3D cobrindo praticamente toda a janela (desktop e mobile). Controlar safe areas/notch, cabeçalho mínimo ou recolhível.
- Deixar o boneco maior, bem iluminado e legível; câmera e alvo acompanhando movimentos sem corte. Preservar zoom/orbit.
- HUD flutuante: modo Aprender/Praticar/Revisar, movimento atual, contagem 01/18, técnica, lado, base, direção, instruções concisas e referência.
- Painel de informações lateral transparente/colapsável ou "drawer" sobreposto, sem comprimir o palco como coluna fixa.
- Timeline inferior flutuante com seleção dos 18 movimentos, reproduzir/pausar, anterior/próximo, repetir, velocidade e reset. Pode ser recolhida quando não necessária.
- Presets câmera Frente/Lateral/Costas/Topo/Livre e reset em ferramentas compactas dentro da cena, como viewport de software 3D.
- Controles de desktop com mouse/teclado e mobile com toque/pinça, botões adequados e sem colisão com o personagem; overlays devem poder ser ocultados.
- Remover herói editorial, rodapé institucional e espaços vazios desnecessários. Evitar ícones/painéis decorativos que não tenham função.
- Legibilidade, contraste, estados de foco, acessibilidade, reduced-motion e UX responsiva. Não esconder funcionalidades existentes.
- Design coeso e profissional, evitando copiar marca/recursos proprietários do Blender. Buscar inspiração funcional, não imitação visual literal.
- Manter a interface PT-BR.

### Preservação funcional obrigatória
- Os 18 movimentos e suas instruções/rastreabilidade existentes.
- Modos Aprender, Praticar, Revisar e regras de pausa/continuação.
- Navegação por movimento, replay, repetir técnica, velocidade, controle de câmera, atalhos e estados robustos.
- Fonte oficial e avisos de que a simulação não é certificação técnica; app independente da ATA.
- Sem editor de movimentos, sem login, sem avaliação por câmera, sem nova forma e sem expansão de escopo.

### Execução, testes e entrega
1. Inspecionar execução atual, estado Git, configuração Vite/Pages e limitações do WebGL/SVG detectadas em `QA.md`.
2. Reproduzir problemas atuais no navegador, capturando referências locais de pose e interface.
3. Implementar melhorias de biomecânica e sincronização com timeline; adicionar/ajustar testes de continuidade, suporte do pé, fases de chute e estados.
4. Recriar interface fullscreen com overlays, preservando os controles existentes e o fluxo de estudo.
5. Executar `npm run build`, `npm run lint`, `npm test`, `npm run test:browser`, e testes manuais reais em desktop e viewport móvel. Repetir inspeção/correção de capturas para cada técnica importante e o layout final. Verificar cliques, superposições, tela estreita e fluxo completo.
6. Se houver diferença SVG/WebGL, testar ambos quando possível; registrar limitações sem inventar sucesso. O site deve funcionar na versão pública sem depender de GPU especializada.
7. Consolidar commits locais coerentes na `main` do repositório existente, preservando o histórico; corrigir pendências do Git local sem perder arquivos.
8. **Após testes aprovados**, publicar revisão no repositório remoto `TeoZ08/songahm-trainer` e validar o GitHub Pages existente `https://teoz08.github.io/songahm-trainer/` incluindo HTTP, JS/CSS, render e console de navegador.
9. Verificar diff e se não houve exclusão acidental da workflow `.github/workflows/deploy.yml`. Não publicar se não houver testes suficientes, mas avançar em tudo que seja independente.
10. Fornecer resumo conciso do resultado real, limitações técnicas, evidência de testes e endereço publicado. Sem relatórios volumosos.

### Critérios para encerrar
- Visualização 3D é claramente protagonista, com HUD flutuante e sem aparência de landing page.
- Chutes frontal/lateral mostram participação perceptível de quadril/tronco/pé base, extensão e recolhimento diferenciados.
- Braços/bloqueios mais convincentes, sem trocar técnicas nem inventar precisão.
- Controles funcionando e regressões inexistentes, em desktop e mobile.
- Testes automatizados aprovados, capturas reais revistas, commits íntegros, e GitHub Pages atualizado e verificado.

### Modo de execução
**Execute de forma autônoma, não apenas planeje.** Faça implementação de ponta a ponta, pesquisas/inspeções necessárias, itere e faça testes reais. Não solicite aprovação intermediária para ajustes normais. Diante de bloqueios de ambiente ou de vídeo, explique somente o bloqueio concreto e continue nas demais frentes. Não gere provas de sucesso fictícias.
