export type Side = 'L' | 'R';
export type Technique = 'high' | 'punch' | 'frontKick' | 'low' | 'inner' | 'sideKick' | 'knife';
export const sources = [
  { id: 'ATA', title: 'ATA · Songahm #1 “Pine Tree and Rock”', url: 'https://media.atamartialarts.com/media/11789/9th-grade-white-belt-form-songahm-1final.pdf', detail: 'Páginas 1–2: movimentos 1–18; ordem, lado, base, direção e altura.' },
  { id: 'SCHOOL', title: 'My ATA School · Songahm Il-Jahng (1)', url: 'http://www.myataschool.com/pdf/Songahm_1.pdf', detail: 'Página 2: sequência descritiva; página 1: tabela técnica. Corrobora a ordem.' },
];
export interface Movement { id: number; technique: Technique; side: Side; title: string; stance: string; direction: 'Leste' | 'Oeste'; turn: string; note: string; height: string; step: 'hold' | 'advance' | 'land' | 'turn' | 'kick'; source: string; validation: string; }
const names: Record<Technique,string> = { high:'Defesa alta', punch:'Soco', frontKick:'Chute frontal #2', low:'Defesa baixa', inner:'Defesa com antebraço interno', sideKick:'Chute lateral #3', knife:'Golpe com mão aberta' };
const rows: [Technique,Side][] = [['high','L'],['punch','R'],['frontKick','R'],['low','R'],['punch','L'],['inner','R'],['sideKick','R'],['knife','R'],['punch','L'],['high','R'],['punch','L'],['frontKick','L'],['low','L'],['punch','R'],['inner','L'],['sideKick','L'],['knife','L'],['punch','R']];
export const lesson = { id:'songahm-1', title:'Songahm 1', movements: rows.map(([technique,side],i): Movement => ({
  id:i+1, technique, side, title:names[technique]+([1,10].includes(i)?' reverso':''),
  stance:['frontKick','sideKick'].includes(technique)?'Apoio unipodal': ['inner','knife'].includes(technique)?'Base média':'Base frontal',
  direction:i<5||i>=14?'Leste':'Oeste',
  turn:i===5?'Giro horário para base média':i===14?'Giro anti-horário para base média':[1,10].includes(i)?'Sem passo':i===3||i===12?'Aterrissar com o pé do chute':i===7||i===16?'Aterrissar em base média':'Seguir a linha leste–oeste',
  height:['high','inner'].includes(technique)||[8,17].includes(i)?'Alta':technique==='low'?'Baixa':'Média',
  note: technique==='sideKick'?'A fonte indica deslocamento #3 e kihap. Passada de aproximação e pivô são esquemáticos; conferir com instrutor.':technique==='frontKick'?'Elevar o joelho, estender e recolher antes de apoiar. Altura média escolhida entre as opções da fonte.':technique==='high'?'Observar o antebraço acima da cabeça. Ângulo do punho e preparação precisam de revisão marcial.':technique==='low'?'Observar a defesa baixa e o apoio ao terminar o chute. Não travar o joelho.':technique==='inner'?'A técnica aponta para o lado do deslocamento, com o tronco em base média.':'Observar o membro ativo e o recolhimento do braço oposto. Alcance e rotação são ilustrativos.',
  step:['frontKick','sideKick'].includes(technique)?'kick':technique==='inner'?'turn':['low','knife'].includes(technique)?'land':[1,10].includes(i)?'hold':'advance',
  source:'ATA + SCHOOL', validation:'Sequência conferida · execução 3D aproximada',
})) };
export const sideName = (s:Side) => s==='L'?'Esquerdo':'Direito';
