# GOAL REV 03 — Songahm Trainer | Especificação técnica declarativa e correção biomecânica

## Missão
Implementar uma revisão completa, verificável e utilizável do instrutor 3D Songahm para corrigir a execução do chute lateral e tornar **cada movimento descrito antes de executado**, tanto na experiência do aluno quanto no motor de animação. Não entregar apenas um plano ou um texto. Aplique mudanças reais, com testes e inspeção visual de poses intermediárias.

## Contexto já aprovado
Projeto: /home/matteo/ProjetosPessoais/songahm-instructor
GitHub: https://github.com/TeoZ08/songahm-trainer
Site: https://teoz08.github.io/songahm-trainer/
Último commit conhecido: c086fe2. Preservar a interface imersiva, o histórico Git, os 18 movimentos Songahm 1, os modos Aprender/Praticar/Revisar, o controle de câmera e o fluxo automático de GitHub Pages.
Ler GOAL.md, GOAL-REV02.md, src/lesson.ts, src/motion.ts, src/stage.ts, src/player.ts, src/main.tsx, testes e QA.md antes de alterar.

## Feedback do usuário, observado em screenshots da interface publicada
- Mesmo após a Rev02, o chute lateral parece uma simples elevação/flexão da perna, sem preparação corporal integrada.
- Na preparação, o abdômen/pelve e o tronco devem orientar-se juntos para o lado correto do golpe. O usuário descreveu giro para a direita na vista observada; não fixar isso como eixo absoluto, pois a direção depende da câmera, do lado e da técnica.
- O pé de apoio deve realizar o pivô técnico VISÍVEL. O usuário observou que o pé direito não está girando no caso que visualizou.
- O objetivo não é melhorar apenas o quadro final; corrigir **as fases, orientação espacial e timing** ao longo de TODO o chute.
- O usuário propôs descrever explicitamente cada movimento ANTES de reproduzi-lo.

## Importante: identificação de lado
O Songahm 1 do projeto contém chute lateral nos movimentos **7 (perna direita)** e **16 (perna esquerda)**, conforme src/lesson.ts; conferir fontes primárias da forma.
No chute com perna DIREITA, o pé de apoio é normalmente o ESQUERDO; no chute com perna ESQUERDA, o apoio é normalmente o DIREITO. Portanto, a observação do usuário de que 'o pé direito não gira' deve ser examinada em especial na execução #16, mas testar os DOIS lados. Não confundir 'perna que chuta', 'pé de apoio', direção global e lado da tela.
Na descrição didática, nomear explicitamente **pé de apoio**, **pé que golpeia**, **sentido do pivô** e **direção do alvo**. Não inventar valor de rotação; calibrar conforme referências.

## Frente A — Modelo formal de movimento
Criar um esquema declarativo, tipado e testável para cada técnica/movimento; ele deve ser a fonte de verdade para a engine e para a descrição didática, em vez de espalhar valores arbitrários em condicionais.
Cada descrição deve registrar:
- identificação (forma, índice, técnica, lado, direção e fontes/nível de confiança)
- base inicial/final, pé de apoio, pé ativo, objetivo da técnica e orientação relativa ao alvo
- lista ordenada de fases com tempos relativos, key poses, metas espaciais e transições
- orientação de pelve, tórax/abdômen e ombros; inclinação e compensação corporal
- pivô yaw/pitch do pé de apoio, posição plantar e continuidade do contato com o solo
- posição, trajetória e orientação de joelho, tornozelo e pé atacante
- alvo/posição de cada mão, guarda e extensão ou flexão de cotovelos
- constraints de alcance, comprimento de segmentos, equilíbrio e contato do pé
- explicação curta para o aluno, palavras-chave de observação e incertezas.

Evitar catálogo artificial de dezenas de parâmetros sem implementação. Preferir estrutura enxuta, extensível, semanticamente útil, orientada por fases e testada. Aplicar a mesma estrutura aos 18 movimentos, reutilizando definições comuns onde possível. Para demais movimentos, preservar o comportamento atual se não houver referência para correção.

## Frente B — Chute lateral realmente lateral (#7 e #16)
Projetar e implementar sequência com:
1. base inicial e posicionamento;
2. preparação/fechamento da distância, sem teletransporte;
3. chamber do joelho apropriado ao chute lateral, com orientação lateral relativa ao alvo;
4. rotação acoplada de pelve e tronco/abdômen (inclinação e contra-rotação de ombros só quando tecnicamente apropriadas);
5. pivô progressivo do pé de apoio com planta fixada no chão e rotação da orientação, em fase sincronizada;
6. extensão lateral com linha de golpe coerente e quadril participando;
7. instante de extensão máxima, em que o alinhamento é visivelmente distinto do chute frontal;
8. recolhimento à câmara;
9. aterrissagem e reconstrução da base, sem salto brusco.

Não mover a ponta do pé por coordenadas mundiais independentes do quadril. Considerar hierarquia de transformações (pelve/torso e membro), orientação do pé base, IK e limites ósseos para que o movimento seja corporal e não apenas do joelho. Evitar que os pés atravessem o chão, atravessamentos do tronco, saltos de posição, torsões irreais ou giros no sentido errado. Se necessário, refatorar o rig, não apenas aumentar o valor de `p.yaw` ou `feet[other].yaw`.

As fases de rotação e do pivô devem ser observáveis em câmera frontal, lateral e superior. Verificar espelhamento correto dos dois chutes, distinguindo referencial do personagem de referencial da câmera.

## Frente C — Descrever para o aluno ANTES de executar
Implementar no modo Aprender um **cartão/painel compacto de preparação** integrado à interface fullscreen: antes de cada técnica, apresentar nome/número, lado, base, orientação, pé de apoio, ação de quadril/tronco, trajetória-chave, posição de braços e objetivo. Instruções concisas e escritas para o aluno, não só dados de engenharia.
Permitir que o aluno leia e dê Continuar/Demonstrar, sem autoplay que elimine o tempo de leitura; poder voltar e repetir. Durante a execução, mostrar fase atual e, quando útil, destacar discretamente pé de apoio e direção/pivô no palco 3D. O modo Revisar permanece contínuo, sem telas interrompendo; Praticar mantém seus controles de pausa; evitar repetição excessiva do texto.
Não voltar ao estilo landing page: o modelo 3D continua predominante; explicação em overlay recolhível, nunca bloqueando vista.

## Frente D — Referências e validação
Revisitar fonte ATA citada em src/lesson.ts e vídeo https://www.youtube.com/watch?v=71d4-MkyZs0. O vídeo foi previamente analisado por quadros no projeto; utilizar evidências disponíveis, sem afirmar precisão de ângulos não medidos. Se conseguir, comparar frames da sequência do chute lateral (aproximação, chamber, pivô, extensão máxima, retração, retorno) com snapshots reais do motor.
Gerar um conjunto pequeno de screenshots para #7 e #16 em múltiplos instantes e vista superior/lateral. Comparar explicitamente yaw do pé base, rotação da pelve, yaw do tronco e orientação do ataque. Se a técnica vista no vídeo ou imagem não corresponder exatamente à sequência Songahm, não copiar indiscriminadamente.
Além de screenshots, incluir testes numéricos de fase e invariantes para ambos os lados. Documentar o que é técnica fundamentada vs aproximação do simulador.

## Critérios de aceitação
- O usuário consegue selecionar #7 ou #16, ler uma explicação técnica ANTES de executar e observar a demonstração faseada.
- Durante o chute lateral, quadril/tronco mudam orientação de forma perceptível e coerente; o pé de apoio pivota de maneira inequívoca e mantém contato com o chão.
- A extensão lateral NÃO parece um chute frontal reorientado de maneira arbitrária.
- A trajetória, a aterrissagem e o estado final são contínuos em câmera lateral e superior, nos dois lados.
- Os 18 movimentos continuam acessíveis e modos/timeline/câmera/atalhos não regridem.
- Testes de timeline, constraints, chutes espelhados, invariantes e navegador em desktop e mobile aprovados.
- `npm ci`, `npm run build`, `npm run lint`, `npm test`, `npm run test:browser` e inspeção com navegador real revisados.
- Commits locais em main coerentes. Se comprovadamente estável, push ao mesmo GitHub e verificar a atualização do GitHub Pages e o console público; não abrir repositório ou deploy alternativo.
- README/QA enxutos; sem relatórios volumosos.

## Execução autônoma
Não pedir aprovação em etapas normais, não entregar só proposta. Avaliar código existente, refatorar o motor e interface, validar técnica com evidências, construir e testar até os critérios objetivos. Se referência ou ferramenta impedir precisão em algum detalhe, registrar limites e continuar com os demais itens; não inventar fidelidade marcial. Não desativar testes, não fingir verificações, não alterar outros projetos.
