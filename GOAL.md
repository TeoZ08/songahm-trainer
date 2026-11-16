# GOAL — Instrutor virtual de formas Songahm

## Missão
Implementar um produto web funcional, independente e utilizável para ensinar, praticar e revisar formas do Taekwondo Songahm com instrutor 3D minimalista articulado. Este não é um editor de formas, ferramenta de autoria ou jogo. Iniciar pela forma Songahm 1; preparar estrutura de dados reutilizável para outras formas sem adicioná-las agora.

## Local e limites
- Trabalhar SOMENTE em /home/matteo/ProjetosPessoais/songahm-instructor.
- Criar repositório Git local e commits coerentes; não modificar projetos vizinhos, configurações globais, credenciais ou a sessão gráfica do usuário.
- Não publicar, fazer push, criar deploy nem usar serviços pagos. Não pedir ao usuário para modelar no Blender.
- Evitar protótipos descartáveis, mockups enganosos e documentação/relatórios extensos. Entregar aplicação rodável e verificável.
- Se for útil criar/exportar assets de maneira procedural no Blender, usar Blender em background por scripts. Preferir geração diretamente no Three.js quando isso reduzir atrito sem comprometer qualidade.
- Não usar ativos protegidos de terceiros sem licença explícita; não copiar material oficial extenso. Não apresentar afiliação, certificação ou endosso da ATA.

## Experiência do produto
1. Interface responsiva em português do Brasil, limpa e agradável (desktop e iPhone), com navegação simples, palco 3D, painel de instrução e barra de controles. Evitar visual de dashboard genérico.
2. Instrutor 3D minimalista legível com tronco, cabeça, ombros, braços, cotovelos, antebraços, punhos, mãos orientáveis, quadris, coxas, joelhos, canelas, tornozelos e pés orientáveis. Proporções estáveis, sem necessidade de personagem detalhado.
3. Motor de animação determinístico por poses, transições e técnicas reutilizáveis, com tempos naturais, controle de juntas, giro de tronco/quadril, apoio do pé, deslocamento e rotação no tatame. Aplicar IK/constraints somente onde trouxer benefício real. Evitar interpenetração grosseira, deslizamento de pés e interpolação instantânea.
4. Câmera Orbit livre com presets frente/lateral/costas/topo e reset. Tatame com marcadores discretos de orientação, direção de deslocamento e posicionamento dos pés.
5. Songahm 1 como aula principal com sequência técnica baseada em fontes legítimas, com ordem, base, direção, membros envolvidos e anotações curtas; identificar fonte e status de validação por movimento. Não inventar posturas, golpes, contagens ou alegar execução correta quando houver dúvida. Se a sequência não puder ser confirmada, implementar o motor e os movimentos confirmados e identificar precisamente o que ainda precisa de revisão — NÃO preencher lacunas com movimentos fictícios.
6. Modos Aprender (explicações + demonstração lenta, passo a passo), Praticar (pausa entre movimentos, continuar quando desejado) e Revisar (execução contínua). Controles: reproduzir/pausar, reiniciar, anterior/próximo, repetir técnica, velocidades 0,25×/0,5×/0,75×/1×, navegação por movimentos e estado visível. Teclado acessível, feedback claro.
7. Identificar movimento atual e apresentar instruções acessíveis, incluindo indicação de lado, base, giro e pontos de atenção. Focar em treino autônomo; não criar avaliação por câmera agora.
8. Estados robustos: mudar modo e velocidade durante reprodução, pausar e voltar, avançar/retroceder, retomar, mudar câmera e redimensionar tela sem travar.

## Stack e estrutura sugeridas
Vite + React + TypeScript, React Three Fiber + drei/Three.js, CSS cuidadosamente desenhado e biblioteca mínima de estado quando necessária. Dados das técnicas/poses separados da renderização e do conteúdo didático. Você pode ajustar a stack justificadamente se melhorar a entrega. Evitar dependências desnecessárias e arquivos gerados de baixa utilidade.

## Sequência autônoma de execução
1. Inspecionar máquina e ferramentas (Node, npm, Blender, Playwright/browser), inicializar projeto limpo e Git dentro da pasta.
2. Estabelecer dados de referência para Songahm 1 de fontes identificáveis e separar fatos de hipóteses; sem depender de transcrição extensa de material protegido.
3. Construir esqueleto articulado 3D, controlador de poses/transições e técnicas testáveis; verificar orientação corporal e apoio dos pés.
4. Construir interface final, controles e modos didáticos; realizar integração completa, não deixar botões falsos.
5. Verificar build, lint/types, testes unitários de timeline/estado e teste real de interação/browser em desktop e viewport móvel. Inspecionar screenshots reais e consertar problemas visuais identificados.
6. Documentar em README curto como instalar, rodar, arquitetura resumida, fontes consultadas e limites de precisão técnica. Commitar localmente e registrar claramente o que está efetivamente funcional, sem confundir validação de software com certificação marcial.

## Critérios de conclusão
- Aplicação inicia localmente por comando documentado sem intervenção manual no Blender.
- Instrutor 3D completo e controle de câmera/membros funcionando, com interface profissional e responsiva.
- Modos de treino e todos os controles funcionam; transições não quebram o estado.
- Sequência de Songahm 1 implementada na extensão realmente verificável, com informações técnicas rastreáveis e lacunas explicitadas; sem simular precisão não demonstrada.
- Build e testes passam; teste de interação real e screenshot revisados.
- Não alterar outros projetos; não publicar sem pedido posterior.

## Atuação
Esta é uma meta de execução, não um pedido para produzir apenas plano/relatório. Trabalhe continuamente no produto, corrija falhas, faça commits locais e evolua até cumprir critérios. Se uma dependência externa ou a validação marcial impedir algum item, avance nas partes independentes e relate o bloqueio concreto com a menor lista de pendências possível. Preserve qualquer trabalho preexistente fora desta pasta.
