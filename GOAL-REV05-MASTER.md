# GOAL REV 05 — MASTER • Songahm Trainer
## Redesign integral de identidade visual, estúdio 3D e experiência responsiva

### Missão — EXECUTAR, não apenas planejar
Transformar a interface publicada do Songahm Trainer em uma experiência de treino imersiva, profissional e integralmente coerente com a identidade visual da **MASTER — Escolas de Artes Marciais**, preservando seu objetivo: estudar e acompanhar as formas Songahm com instrutor 3D articulado.

Este é um trabalho real de redesign completo, não uma troca superficial de cores, um protótipo ou uma apresentação. O viewport 3D deve continuar sendo protagonista, com interface de ferramenta de treinamento, NÃO uma landing page ou dashboard de XP. Conduzir autonomamente implementação, validação visual, testes e publicação estável no GitHub Pages existente.

### Projeto existente
- Diretório: `/home/matteo/ProjetosPessoais/songahm-instructor`
- Repositório: `https://github.com/TeoZ08/songahm-trainer`
- Site: `https://teoz08.github.io/songahm-trainer/`
- Branch: `main`; commit atual previsto `828c742` (verificar de novo antes de editar).
- Ler e preservar `src/main.tsx`, `src/style.css`, `src/stage.ts`, `src/movement-spec.ts`, `tests/`, `package.json`, `QA.md`, `GOAL.md`, `GOAL-REV02.md`, `GOAL-REV03.md`, `.interface-design/system.md` e workflow GitHub Pages.
- Trabalhar SOMENTE neste projeto. Não alterar Songdrift, Memória Pessoal, portfólio ou configurações globais. Não iniciar outros Codex concorrentes no mesmo repositório.

### Fontes visuais AUTÊNTICAS a utilizar — importante
1. Site público da escola: `https://masterartesmarciais.com.br/` (disponível; título observado: “Artes Marciais - Master School”).
2. **Logo PNG original do site, já BAIXADA localmente:**
   - `brand-reference/master-site-original.png` — 1468 × 1317 RGBA, fundo transparente, logo vermelho com figura branca e lettering branco;
   - `brand-reference/master-site-1024.png` — versão reduzida;
   - URL de origem: `https://img1.wsimg.com/isteam/ip/cf277c04-e94d-46b5-b90a-ba638ceb5985/Logo%20MASTER%20black%20vertical.png`.
   - **A cor vermelha efetiva do logo medida no PNG é aproximadamente `#E03841`**, não inventar outro vermelho como identidade oficial. Conferir aplicação com a identidade real.
3. Duas capturas fornecidas pelo usuário da interface móvel privada da Master, vistas nesta conversa (não presentes automaticamente no filesystem remoto). Referência descritiva FIDEDIGNA:
   - App pessoal mobile dark: base preto quase puro, cabeçalho com logo compacto branco/vermelho, fundo com nuance vinho escuro, topo com ícones compactos; cards arredondados de grafite/preto e bordas vermelhas suaves; títulos brancos, infos secundárias cinza; vermelho de marca como seleção/ação; toques ocasionais de azul/verde/amarelo para estados sem rivalizar com vermelho.
   - Outra captura mostra marca institucional: **disco vermelho, silhueta de artista marcial chutando, texto MASTER e subtítulo “ESCOLAS DE ARTES MARCIAIS”**, em combinação vermelho/preto/branco. No PNG recuperado do site a versão é adequada ao fundo escuro (lettering branco).
   - A captura também mostrava recursos de XP, ranking, foto do aluno, eventos e perfil: **NÃO copiar esses módulos**. Foram referências de identidade, não requisitos do Songahm Trainer. Não inserir nome/foto/dados pessoais vistos no screenshot.
4. Se localizar no site uma versão melhor vetorial ou outra variação autêntica com fundo transparente, pode usar com rastreabilidade. Não redesenhar a marca livremente, não usar logo alheia nem baixar assets com direitos incertos. Não inventar permissão institucional para se apresentar como “app oficial” ou afiliado/certificado pela MASTER/ATA; manter no rodapé/modal técnico uma indicação discreta de projeto de treinamento independente inspirado na identidade da escola.

### Sistema visual recomendado (derivar tokens, não espalhar hex)
- `--master-red: #E03841` (vermelho real encontrado no logo);
- base preto profundo `#0B0B0D`, superfícies grafite `#151518` / `#1D1D22`, nuances vinho `#2A0E13`;
- branco quente `#F7F6F5`, texto secundário `#B8B4B8`, linhas `#393038`;
- selecionar/acento com vermelho; sinais verde, âmbar, azul apenas quando semanticamente úteis.
Esses outros hex são pontos de partida da proposta, NÃO cores supostamente oficiais. Refinar por contraste e inspeção visual. Evitar vermelho saturado onipresente, degradês chamativos, glow exagerado e contornos vermelhos em cada superfície.

### Redesign esperado — desktop e mobile
**A) Header/identidade**
- Remover ícone genérico atual e aplicar arquivo oficial Master, com proporção correta, resolução adequada e contraste em fundo escuro; otimizar o PNG para uso web sem perda perceptível.
- Nome pode ser “Songahm Trainer” acompanhado da marca MASTER, sem passar impressão de app corporativo certificado.
- Cabeçalho compacto e funcional, com seletor Aprender/Praticar/Revisar claro; botões e menus harmonizados. Logo não deve disputar espaço com personagem.
- Atualizar favicon, título, meta theme-color e, se houver PWA/manifests, demais detalhes de marca de forma consistente. Evitar criar recursos desnecessários.

**B) Viewport/estúdio 3D**
- Ocupação efetiva da tela inteira, sem caixas editoriais grandes ou rolagem desnecessária.
- Tatame, grid, linhas de direção, sombras e iluminação redesenhados em grafite/pretos e tons neutros; evitar contraste que esconda a posição das mãos e pés.
- Marca Master como elemento visual discreto e pertinente (por exemplo painel do estúdio/HUD) apenas se não comprometer a leitura da técnica.
- Boneco continua contrastante, sem banhá-lo em vermelho. Diferenciar membros ativo/apoio por cores técnicas com boa leitura e acessibilidade.
- Melhorar a composição de câmera e dimensões para visualizar o corpo inteiro durante a forma. Não modificar biomecânica dos 18 movimentos neste objetivo.

**C) HUD e informação**
- Painel do movimento ativo, progresso 01/18, técnica, lado, pé de apoio, preparação antes do movimento e informação técnica em **overlays compactos** na mesma linguagem visual.
- Hierarquia mais forte, tipografia limpa e peso esportivo moderado; info secundária discreta, legível.
- Modo Aprender deve manter o cartão de explicação prévia legível e recolhível, sem ocupar o corpo do boneco em telas estreitas.
- Interações com estado hover/focus/ativo/desabilitado coerentes, sem excesso de animações.

**D) Timeline e controles**
- Barra flutuante inferior refinada, visual próximo do portal Master mas com densidade funcional de software 3D.
- Movimento selecionado em vermelho Master; play/pausa como ação principal. Ícones limpos, textos acessíveis, velocidade, repetir, anterior/próximo e scrub preservados.
- Expandir/recolher timeline e ocultar interface funcionam. Não reduzir hit areas a alvos pequenos em celular.

**E) Responsividade**
- Conferir em 1280×900/1920×1080 e mobile 390×844, 320×700, 844×390. Safe areas/notch e barra do navegador não podem ocultar controles.
- Priorizar usabilidade mobile real: logo compacta, painéis recolhíveis, sem colisão com personagem, botões ao alcance e contraste suficiente.
- Nenhum conteúdo essencial fora da viewport, sem scroll de página que quebre órbita do 3D.

**F) Consistência de produto**
- Revisar paleta, tipografia, ícones, espaçamento, bordas, sombras, superfícies e animações de entrada/seleção quando úteis.
- Redesenhar também modais de fontes, ajuda, controles recolhidos, preparação, conclusão de movimento e estados vazios/falha.
- Preservar texto em português do Brasil e funcionalidade de todas as telas.
- Sem módulos sociais, gamificação, XP, autenticação, anúncios ou links desnecessários.

### Fora de escopo nesta revisão
- Altura do chute frontal: usuário observou que está baixa, mas pediu para **deixar esse ajuste para depois**. NÃO modificar trajetórias, a fixação do joelho, o pivô ou parâmetros do chute frontal/lateral agora.
- Editor de movimentos, novas formas, treino pela câmera, login, novo repositório ou novo provedor de hospedagem.
- Não dizer que a técnica foi certificada; ensino correto exige validação marcial externa.

### Procedimento de execução autônoma
1. Auditar estado do Git, CSS, componentes, assets de marca e screenshots existentes; manter tudo no mesmo repositório.
2. Montar tokens/componentes de design reutilizáveis; produzir layout final master-branded e viewport 3D coerente.
3. Integrar **a imagem real recuperada** da marca (PNG local) e otimizar quando necessário; aplicar aos contextos corretos, com alternativa sem perda de contraste.
4. Realizar revisão visual real com o navegador disponível no Codex App: capturas desktop/mobile, interações, modais, timeline aberta/fechada, câmera e modo Aprender; revisar e corrigir antes de encerrar.
5. Executar `npm ci`, `npm run build`, `npm run lint`, `npm test`, `BROWSER=chromium npm run test:browser`, `RENDERER=svg npm run test:browser` quando os ambientes suportarem. Não falsear resultados ou desabilitar testes para facilitar aprovação.
6. Inspecionar criticamente o resultado em vez de confiar só em testes: o uso do vermelho é equilibrado? A logo é legível? O boneco continua protagonista? A interface remete à escola sem ser um clone visual? Funciona no iPhone?
7. Fazer commit(s) local(is) coerentes, atualizar sucintamente QA/README apenas no necessário.
8. Após validação, enviar à `main` do mesmo GitHub e verificar o deploy no GitHub Actions, o endereço existente, CSS/JS e console da versão pública.
9. Se o limite do Codex ou rede impedir completar, salvar alterações seguras, informar exatamente o bloqueio e não alegar publicação.

### Critérios de conclusão
- Identidade imediatamente reconhecível da Master (logo autêntica e paleta bem aplicada), sem texto ou dados pessoais copiados de capturas.
- Layout completo, consistente, premium, esportivo e claro; não apenas paleta trocada.
- Viewport 3D domina; HUD, modais e timeline parecem parte de uma ferramenta de treino.
- Mobile e desktop aprovados visualmente e funcionalmente; sem regressão nos 18 movimentos e nos três modos.
- Build, lint, suíte de testes e verificações reais do navegador realizados; versão pública atualizada, com HEAD e deploy confirmados.

**AÇÃO: implementar o produto final de ponta a ponta. Não retornar apenas plano, sugestões ou protótipos.**
