export type Side = 'L' | 'R';
export type Technique = 'high' | 'punch' | 'frontKick' | 'low' | 'inner' | 'sideKick' | 'knife';
export type V3 = [number, number, number];
export interface MovementIdentity {
  id:number; technique:Technique; side:Side; title:string; stance:string;
  direction:'Leste'|'Oeste'; height:string; step:'hold'|'advance'|'land'|'turn'|'kick'; source:string;
}
export interface Phase { at:number; label:string; cue:string; }
export interface BodyKey {
  /** Root position relative to a named contact, never a screen-space axis. */
  anchor:'initial'|'active'|'support'|'landing'|'stance'; height:number;
  pelvisTowardTarget:number; thoraxTowardTarget:number; lean:V3;
}
export interface SideKey extends Phase {
  body:BodyKey;
  supportStep:number; supportPivot:number;
  active:{frame:'initial'|'hip'|'landing'; position:V3; knee:V3; pitch:number; orientation:'initial'|'pelvis'|'target'|'stance'};
  contact:'both'|'active'|'support';
  hands:'initial'|'guard';
}
export interface ArmMotion {
  kind:'arm'; phases:Phase[]; travelEnd:number; preparationEnd:number; deliveryEnd:number;
  chamber:V3; finish:V3; open:number; torsoTwist:number;
}
export interface FrontMotion {
  kind:'front'; phases:Phase[]; transferEnd:number; chamberEnd:number; extensionEnd:number; retractionEnd:number;
  chamber:V3; extension:V3; pitch:{chamber:number; strike:number};
  /** Knee lifts into a stable chamber; the ankle then revolves about that joint. */
  arc:{liftForward:number;liftHeight:number};
  body:{onset:number; loaded:number; release:number; end:number; pelvis:number; thorax:number; lean:V3; translation:V3; pivot:number};
}
export interface SideMotion {kind:'side'; phases:SideKey[]; closing:number; width:number;}
export interface MovementPlan {
  identity:{form:'songahm-1';index:number;technique:Technique;side:Side;targetBearing:number;source:string;confidence:'ordem documentada; keyframes aproximados'};
  roles:{activeFoot:Side|null;supportFoot:Side|'both';activeLimb:'braço'|'perna'};
  base:{initial:string;final:string;placement:'hold'|'front'|'middleTurn'|'middleLand'|'frontKick'|'sideCycle';stride:number;width:number;boundaryOwner?:number};
  constraints:{leg:[number,number];arm:[number,number];maxReach:number;supportRadius:number;floor:number};
  motion:ArmMotion|FrontMotion|SideMotion;
  instruction:{goal:string;body:string;support:string;trajectory:string;hands:string;cues:string[];uncertainty:string};
}
export const opposite=(s:Side):Side=>s==='L'?'R':'L';
export const sideWord=(s:Side)=>s==='L'?'esquerdo':'direito';
const phase=(at:number,label:string,cue=label):Phase=>({at,label,cue});
const limits:MovementPlan['constraints']={leg:[.44,.44],arm:[.31,.30],maxReach:.879,supportRadius:.22,floor:0};
const guard:Record<Side,V3>={L:[-.31,.34,.32],R:[.31,.34,.32]};
export const neutralHands:Record<Side,V3>={L:[-.30,.06,.28],R:[.30,.06,.28]};
export const guardHands=guard;

function sideMotion(sign:number):SideMotion {
  // Fractions of the *target-relative* turn. These keyframes are a visual
  // calibration from the rear-view reference, not measured martial angles.
  const key=(at:number,label:string,anchor:BodyKey['anchor'],height:number,turn:number,roll:number,
    supportStep:number,supportPivot:number,frame:SideKey['active']['frame'],position:V3,knee:V3,pitch:number,
    orientation:SideKey['active']['orientation'],contact:SideKey['contact']):SideKey=>({
    at,label,cue:label,body:{anchor,height,pelvisTowardTarget:turn,thoraxTowardTarget:turn,lean:[0,0,sign*roll]},
    supportStep,supportPivot,active:{frame,position,knee,pitch,orientation},contact,hands:at===0?'initial':'guard',
  });
  // Keep the folding leg outside the abdomen; bend out/back in hip space.
  // Outward intermediate poles avoid passing through a collinear IK singularity.
  const chamber:V3=[sign*.35,.08,.30],knee:V3=[sign*1,.5,-2];
  return {kind:'side',closing:.52,width:.68,phases:[
    key(0,'Base inicial','initial',.86,0,0,0,0,'initial',[0,0,0],[0,0,1],0,'initial','both'),
    key(.08,'Transferir o peso','active',.78,0,0,0,0,'initial',[0,0,0],[0,0,1],0,'initial','both'),
    key(.22,'Fechar a distância','active',.84,0,0,1,0,'initial',[0,0,0],[0,0,1],0,'initial','both'),
    key(.28,'Assumir o apoio','support',.88,0,0,1,0,'initial',[0,0,0],[sign*2,0,1],0,'initial','both'),
    key(.40,'Câmara e giro conjunto','support',.88,.55,.12,1,.4,'hip',chamber,knee,-.65,'pelvis','support'),
    key(.52,'Pivô do apoio','support',.90,.30,.25,1,1,'hip',[sign*.32,.10,.25],knee,-.18,'target','support'),
    // Higher diagonal extension: trade horizontal reach for elevation within the same bones.
    // Visual training approximation, not a measured or certified martial angle.
    // Turn the striking foot around its ankle: heel higher than the toes.
    // The body turn and planted-foot pivot of the lateral kick remain intact.
    key(.64,'Extensão lateral','support',.92,0,.40,1,1,'hip',[sign*.72,.48,0],[sign*1,.5,-2],.44,'target','support'),
    key(.68,'Extensão máxima','support',.92,0,.40,1,1,'hip',[sign*.72,.48,0],[sign*1,.5,-2],.44,'target','support'),
    key(.80,'Recolher à câmara','support',.88,.25,.16,1,1,'hip',chamber,knee,-.65,'pelvis','support'),
    key(.91,'Apoio na entrada da próxima técnica','landing',.76,0,0,1,0,'landing',[0,0,0],[sign*2,0,1],0,'stance','both'),
    key(1,'Reconstruir a base','stance',.86,0,0,1,0,'landing',[0,0,0],[0,0,1],0,'stance','both'),
  ]};
}

export function createPlan(m:MovementIdentity):MovementPlan {
  const handSide=m.side==='L'?'esquerda':'direita';
  const sign=m.side==='L'?-1:1,other=opposite(m.side),kick=m.technique==='sideKick'||m.technique==='frontKick';
  const targetBearing=m.direction==='Leste'?0:Math.PI;
  const placement:MovementPlan['base']['placement']=m.technique==='sideKick'?'sideCycle':m.technique==='frontKick'?'frontKick':m.technique==='inner'?'middleTurn':m.technique==='knife'?'middleLand':m.step==='hold'?'hold':'front';
  let motion:MovementPlan['motion'];
  if(m.technique==='sideKick')motion=sideMotion(sign);
  else if(m.technique==='frontKick')motion={
    kind:'front',transferEnd:.32,chamberEnd:.36,extensionEnd:.64,retractionEnd:.86,
    // Knee loads first; ankle travels a rising forward arc, not the lateral trajectory.
    // The chamber places the knee forward and leaves the lower leg nearly vertical.
    chamber:[sign*.18,-.43,.45],extension:[sign*.18,-.11,.77],pitch:{chamber:-.38,strike:-.28},
    arc:{liftForward:.67,liftHeight:.035},
    // A front kick has no support-foot pivot.
    body:{onset:.18,loaded:.48,release:.70,end:.98,pelvis:0,thorax:-sign*.07,lean:[-.12,0,0],translation:[0,0,0],pivot:0},
    phases:[phase(0,'Transferir o peso'),phase(.16,'Elevar o joelho'),phase(.36,'Preparar o chute frontal'),phase(.49,'Estender em arco para a frente'),phase(.64,'Recolher a perna'),phase(.86,'Manter a câmara'),phase(1,'Câmara final')],
  };
  else {
    const finish:Record<Exclude<Technique,'frontKick'|'sideKick'>,V3>={high:[sign*.10,.98,.30],punch:[sign*.22,m.height==='Alta'?.68:.30,.56],low:[sign*.34,-.18,.35],inner:[sign*.50,.70,.13],knife:[sign*.90,.37,.08]};
    motion={kind:'arm',travelEnd:.72,preparationEnd:.28,deliveryEnd:.70,chamber:[sign*.25,.28,.30],finish:finish[m.technique],open:m.technique==='knife'?1:0,torsoTwist:m.technique==='punch'?sign*.09:0,
      phases:[phase(0,'Preparação'),phase(.28,'Executar a técnica'),phase(.72,'Estabilizar a base'),phase(1,'Base final')]};
  }
  const support=kick?`Pé de apoio ${sideWord(other)}; pé que golpeia ${sideWord(m.side)}.`:'Distribua o apoio entre os dois pés ao terminar a base.';
  return {
    identity:{form:'songahm-1',index:m.id,technique:m.technique,side:m.side,targetBearing,source:m.source,confidence:'ordem documentada; keyframes aproximados'},
    roles:{activeFoot:kick||m.step!=='hold'?m.side:null,supportFoot:kick?other:'both',activeLimb:kick?'perna':'braço'},
    base:{initial:m.id===1?'Base paralela':m.technique==='sideKick'?'Base média':m.technique==='frontKick'?'Base frontal':'Base do movimento anterior',final:m.technique==='sideKick'?'Base média na entrada da próxima técnica':m.stance,placement,stride:.55,width:.68,...(m.technique==='sideKick'?{boundaryOwner:m.id+1}:{})},
    constraints:{...limits},motion,
    instruction:{
      goal:`${m.title} em altura ${m.height.toLowerCase()}, para ${m.direction.toLowerCase()}.`,
      body:m.technique==='sideKick'?'Oriente pelve e abdômen juntos na câmara; abra o quadril para estender lateralmente e incline o tronco para equilibrar.':m.technique==='frontKick'?'Transfira o peso ao apoio, eleve o joelho e acompanhe com uma pequena compensação do tronco.':'Prepare o braço sem perder a base; acompanhe o alcance com o ombro e o tronco.',
      support:m.technique==='sideKick'?`${support} Pivô para fora: afaste os dedos do alvo e oriente o calcanhar para ele, mantendo a planta no chão.`:support,
      trajectory:m.technique==='sideKick'?`Feche a distância, recolha o joelho, gire o conjunto, estenda para ${m.direction.toLowerCase()} e recolha antes de apoiar na entrada do movimento ${m.id+1}.`:m.technique==='frontKick'?`Joelho sobe, perna estende para a frente e recolhe; o apoio vem no movimento ${m.id+1}.`:`Leve a mão ${handSide} ao alvo; ${m.technique==='inner'||m.technique==='high'?'preserve a flexão do cotovelo.':'estenda sem travar o cotovelo.'}`,
      hands:kick?'Mantenha a guarda e use o braço oposto para equilibrar, sem cruzar o tronco.':`Mão ${handSide} executa a técnica; o outro braço recolhe para a guarda.`,
      cues:m.technique==='sideKick'?[`Apoio ${sideWord(other)}`,`Alvo ${m.direction.toLowerCase()}`,'Calcanhar ao alvo','Quadril e abdômen juntos']:['Base estável','Lado do corpo, não da tela','Recolher com controle'],
      uncertainty:m.technique==='sideKick'?`Tempos, amplitudes e passada #3 são aproximações. A aterrissagem é compartilhada com a entrada do movimento ${m.id+1}; o golpe de braço só ocorre nele.`:'Sequência documentada; preparação, ângulos e tempos do boneco são aproximações visuais.',
    },
  };
}

/** The engine and the HUD use this same ordered phase list. */
export function phaseAt(plan:MovementPlan,t:number):Phase {
  const phases=plan.motion.phases;let selected:Phase=phases[0];
  for(const p of phases){if(t+1e-9>=p.at)selected=p;else break;}
  return selected;
}
