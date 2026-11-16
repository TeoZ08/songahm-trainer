import test from 'node:test';
import assert from 'node:assert/strict';
import { sample, targets, ready, solveIK, add, rotate, upperPoint, hipPoint, plantarCenter, soleHeight, type V3 } from '../src/motion.ts';
import {lesson,type Side} from '../src/lesson.ts';
const distance=(a:V3,b:V3)=>Math.hypot(...a.map((v,i)=>v-b[i]));
test('18 movimentos com ordem, lado e rastreabilidade',()=>{assert.equal(lesson.movements.length,18);assert.deepEqual(lesson.movements.filter(m=>m.technique.includes('Kick')).map(m=>[m.id,m.side]),[[3,'R'],[7,'R'],[12,'L'],[16,'L']]);for(const m of lesson.movements){assert.ok(m.source.includes('ATA'));assert.ok(m.validation.includes('aproximada'));}assert.equal(lesson.movements[8].height,'Alta');assert.equal(lesson.movements[17].height,'Alta');});
test('amostragem determinística e continuidade nas fronteiras',()=>{for(let i=0;i<18;i++){assert.deepEqual(sample(i,.4),sample(i,.4));const a=sample(i,0),b=i?sample(i-1,1):ready;assert.deepEqual(a,b);assert.deepEqual(sample(i,1),targets[i]);}});
test('IK conserva comprimentos e produz juntas finitas',()=>{for(const target of [[.5,-.4,.2],[0,0,0],[0,0,5],[0,-.8,0]] as V3[]){const start:V3=[0,0,0],r=solveIK(start,target,[0,0,1],.44,.44);assert.ok(Math.abs(distance(start,r.joint)-.44)<1e-8);assert.ok(Math.abs(distance(r.joint,r.end)-.44)<1e-8);assert.ok(r.joint.every(Number.isFinite));}});
test('apoio dos chutes frontais permanece no tatame e alcançável por IK',()=>{for(const i of [2,11]){const side=lesson.movements[i].side==='L'?'R':'L';for(let frame=0;frame<=100;frame++){const p=sample(i,frame/100);assert.deepEqual(p.feet[side].position,targets[i-1].feet[side].position);const hip=add(p.root,rotate([side==='L'?-.14:.14,0,0],p.yaw));assert.ok(distance(hip,p.feet[side].position)<.88);}}});
test('poses sem NaN, pés no tatame e comprimentos de perna alcançáveis',()=>{for(let i=0;i<18;i++)for(let frame=0;frame<=50;frame++){const p=sample(i,frame/50);for(const s of ['L','R'] as Side[]){assert.ok(p.feet[s].position.every(Number.isFinite));assert.ok(p.feet[s].position[1]>=.089);const hip=add(p.root,rotate([s==='L'?-.14:.14,0,0],p.yaw));assert.ok(distance(hip,p.feet[s].position)<=.879+1e-12,`perna fora de alcance: ${i+1}, ${frame}, ${s}`);}}});

test('sem salto de posição ou tornozelo no início de cada técnica',()=>{for(let i=0;i<18;i++){const a=sample(i,0),b=sample(i,.0001);assert.ok(distance(a.root,b.root)<.002);for(const s of ['L','R'] as Side[]){assert.ok(distance(a.feet[s].position,b.feet[s].position)<.002);assert.ok(Math.abs(a.feet[s].pitch-b.feet[s].pitch)<.002);}}});
test('chute lateral mantém um pé apoiado durante a aproximação',()=>{for(const i of [6,15])for(let f=0;f<=100;f++){const p=sample(i,f/100);assert.ok(Math.min(p.feet.L.position[1],p.feet.R.position[1])<.091);}});

test('frontais seguem arco ascendente sem pivô do pé de apoio',()=>{
 for(const i of [2,11]){
  const m=lesson.movements[i],front=m.plan.motion;
  assert.equal(front.kind,'front');
  if(front.kind!=='front')continue;
  const other=m.side==='L'?'R':'L',base=sample(i,0),chamber=sample(i,front.chamberEnd),peak=sample(i,front.extensionEnd);
  const mid=sample(i,(front.chamberEnd+front.extensionEnd)/2);
  const a=chamber.feet[m.side].position,b=peak.feet[m.side].position;
  assert.ok(mid.feet[m.side].position[1]>a[1]+.03&&mid.feet[m.side].position[1]<b[1],'extensão segue arco ascendente');
  assert.ok(b[1]>a[1]+.18,'pé sobe durante a extensão');
  const direction=Math.cos(m.plan.identity.targetBearing);
  assert.ok((b[2]-a[2])*direction>.35,'pé avança ao redor do joelho em direção ao alvo');
  assert.ok(Math.hypot(...mid.lean)>.1,'tronco participa');
  for(let n=0;n<=100;n++){
   const p=sample(i,n/100);
   assert.ok(Math.abs(p.feet[other].yaw-base.feet[other].yaw)<1e-10,'sem pivô no frontal');
   assert.ok(distance(p.feet[other].position,base.feet[other].position)<1e-9);
  }
 }
});
test('frontais mantêm o joelho quase fixo durante extensão e recolhimento',()=>{
 for(const i of [2,11]){
  const m=lesson.movements[i],front=m.plan.motion;
  if(front.kind!=='front')assert.fail('front plan');
  const side=m.side,pole=(p:ReturnType<typeof sample>)=>rotate([0,0,1],p.yaw);
  const joint=(t:number)=>{const p=sample(i,t);return solveIK(hipPoint(p,side),p.feet[side].position,pole(p),...m.plan.constraints.leg).joint};
  const fixed=joint(front.chamberEnd);
  let lastForward=-Infinity,lastHeight=-Infinity;
  const direction=Math.cos(m.plan.identity.targetBearing);
  for(let n=0;n<=30;n++){
   const t=front.chamberEnd+(front.extensionEnd-front.chamberEnd)*n/30,p=sample(i,t),k=joint(t),ankle=p.feet[side].position;
   assert.ok(distance(k,fixed)<.055,'o joelho não deve acompanhar o pé na extensão');
   assert.ok(Math.abs(distance(k,ankle)-m.plan.constraints.leg[1])<.002,'canela mantém comprimento');
   assert.ok(ankle[1]>=lastHeight-1e-8,'arco do pé sobe progressivamente');
   assert.ok(ankle[2]*direction>=lastForward-1e-8,'pé avança progressivamente');
   lastForward=ankle[2]*direction;lastHeight=ankle[1];
  }
  for(let n=0;n<=30;n++){
   const t=front.extensionEnd+(front.retractionEnd-front.extensionEnd)*n/30;
   assert.ok(distance(joint(t),fixed)<.055,'joelho estável no recolhimento');
  }
 }
});

test('mão aberta estende o cotovelo; defesa interna preserva flexão',()=>{for(const i of [7,16,5,14]){const p=sample(i,1),side=lesson.movements[i].side,sign=side==='L'?-1:1,shoulder=upperPoint(p,[sign*.27,.5,0]),hand=upperPoint(p,p.hands[side]),r=solveIK(shoulder,hand,rotate([sign*.7,-.4,-.6],p.yaw+p.twist),.31,.30),a=r.joint.map((v,j)=>v-shoulder[j]),b=r.end.map((v,j)=>v-r.joint[j]),dot=a.reduce((n,v,j)=>n+v*b[j],0)/(.31*.30);if(i===7||i===16)assert.ok(dot>.9);else assert.ok(dot<.8);}});

test('especificação dos 18 movimentos fornece fases, fontes, papéis e limites',()=>{
 for(const {plan:p,id} of lesson.movements){
  assert.equal(p.identity.index,id);assert.match(p.identity.source,/ATA/);
  assert.equal(p.motion.phases[0].at,0);assert.equal(p.motion.phases.at(-1)!.at,1);
  p.motion.phases.forEach((phase,i)=>{assert.ok(phase.label&&phase.cue);if(i)assert.ok(phase.at>p.motion.phases[i-1].at);});
  assert.ok(p.instruction.goal&&p.instruction.support&&p.instruction.hands&&p.instruction.uncertainty);
  assert.ok(p.constraints.maxReach<p.constraints.leg[0]+p.constraints.leg[1]);
 }
});
test('laterais acoplam pelve e tórax, pivotam a planta e estendem no referencial do quadril',()=>{
 for(const i of [6,15]){
  const m=lesson.movements[i],active=m.side,other=active==='L'?'R':'L',initial=sample(i,0),chamber=sample(i,.4),strike=sample(i,.66);
  assert.equal(m.plan.roles.supportFoot,other);
  assert.ok(Math.abs(chamber.yaw-initial.yaw)>.7);assert.equal(chamber.twist,0);
  assert.ok(Math.abs(chamber.yaw-strike.yaw)>.7);
  const pivot=sample(i,.52),anchor=plantarCenter(pivot.feet[other]);
  assert.ok(Math.abs(pivot.feet[other].yaw-initial.feet[other].yaw)>1.5);
  for(let f=28;f<=80;f++){const p=sample(i,f/100);assert.ok(distance(plantarCenter(p.feet[other]),anchor)<1e-9);assert.ok(Math.hypot(p.root[0]-anchor[0],p.root[2]-anchor[2])<=m.plan.constraints.supportRadius);}
  const relative=rotate(strike.feet[active].position.map((v,j)=>v-hipPoint(strike,active)[j]) as V3,-strike.yaw);
  assert.ok(Math.abs(relative[0])>.84);assert.ok(Math.abs(relative[2])<1e-8);assert.equal(Math.sign(relative[0]),active==='R'?1:-1);
  assert.ok(Math.hypot(...strike.lean)>.39);assert.ok(Math.abs(strike.feet[active].yaw-m.plan.identity.targetBearing)<1e-8);
  assert.ok(soleHeight(sample(i,1).feet.L)>-1e-9&&soleHeight(sample(i,1).feet.R)>-1e-9);
 }
});
test('laterais mostram o calcanhar acima da ponta na extensão',()=>{
 for(const i of [6,15]){
  const side=lesson.movements[i].side,f=sample(i,.66).feet[side];
  assert.ok(f.pitch>.35,'calcanhar acima da ponta');
  assert.ok(.29*Math.sin(f.pitch)>.10,'diferença de altura perceptível');
 }
});

test('plantas não penetram e poses são contínuas entre fases e aterrissagens',()=>{
 for(let i=0;i<18;i++)for(let f=0;f<=1000;f++){const p=sample(i,f/1000);for(const s of ['L','R'] as Side[])assert.ok(soleHeight(p.feet[s])>=-1e-9, `${i+1}/${f}/${s}`);}
 for(const i of [6,15]){
  for(const key of lesson.movements[i].plan.motion.phases){const before=sample(i,Math.max(0,key.at-1e-6)),after=sample(i,Math.min(1,key.at+1e-6));assert.ok(distance(before.root,after.root)<.0001);for(const s of ['L','R'] as Side[])assert.ok(distance(before.feet[s].position,after.feet[s].position)<.0001);}
 }
});
test('chutes laterais espelham trajetória local e pivô para fora nos dois alvos',()=>{
 for(const t of [.4,.52,.66,.8]){
  const r=sample(6,t),l=sample(15,t),local=(p:ReturnType<typeof sample>,s:Side)=>rotate(p.feet[s].position.map((v,j)=>v-hipPoint(p,s)[j]) as V3,-p.yaw);
  const ar=local(r,'R'),al=local(l,'L');assert.ok(Math.abs(ar[0]+al[0])<1e-8);assert.ok(Math.abs(ar[1]-al[1])<1e-8);assert.ok(Math.abs(ar[2]-al[2])<1e-8);
  assert.ok(Math.abs(r.feet.L.yaw+l.feet.R.yaw-Math.PI)<1e-8);
  assert.ok(Math.abs(r.yaw+l.yaw-Math.PI)<1e-8);
 }
});

test('contatos declarados nas key poses laterais correspondem às plantas renderizadas',()=>{
 for(const index of [6,15]){
  const motion=lesson.movements[index].plan.motion;if(motion.kind!=='side')assert.fail('side spec');
  const side=lesson.movements[index].side,other=side==='L'?'R':'L';
  for(const key of motion.phases){
   const p=sample(index,key.at);
   assert.ok(Math.abs(soleHeight(p.feet[other]))<1e-9, `apoio ${index+1}/${key.at}`);
   if(key.contact==='both')assert.ok(Math.abs(soleHeight(p.feet[side]))<1e-9,`aterrissagem ${index+1}/${key.at}`);
   else if(key.contact==='support')assert.ok(soleHeight(p.feet[side])>.1);
  }
 }
});
