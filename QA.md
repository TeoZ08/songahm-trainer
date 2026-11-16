# Validação local

- `npm run build`: TypeScript e bundle de produção aprovados. Aviso de tamanho: bundle principal ~777 kB / 211 kB gzip, incluindo Three.js e renderizador de compatibilidade.
- `npm run lint`: aprovado.
- `npm test`: 12 testes; timeline, modos, velocidades, limites, continuidade, IK e apoios.
- `npm run test:browser`: Firefox real, bundle de produção via interceptação HTTP do Playwright; 1440×1000 e 390×844. Os 18 movimentos, reprodução/pausa, repetição, navegação, modos, velocidades, câmera livre/presets, teclado e fontes foram exercitados. Capturas locais em `artifacts/`.
- Capturas revisadas: palco, defesa alta, chutes e layout móvel. Corrigidos enquadramento, iluminação, ordenação do tatame, posição da defesa alta e acesso móvel aos controles.
- Renderização efetivamente testada: cena Three.js via SVGRenderer, com órbita e projeção 3D. WebGL/recuperação de contexto não foram comprovados neste ambiente; Chrome é impedido por restrições de sockets, e Firefox não expõe WebGL.
- `npm run dev` bloqueado pelo ambiente: `listen EPERM` na porta 5173. Nenhuma publicação.
- `.git` original é somente leitura. Commits locais em `.git-local`; integração ao histórico original pendente de escrita autorizada pelo ambiente.
- Não comprova precisão marcial nem funcionamento em iPhone físico. Lacunas de técnica descritas na interface e no README.
