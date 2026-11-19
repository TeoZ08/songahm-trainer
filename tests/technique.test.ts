import test from 'node:test';
import assert from 'node:assert/strict';
import {lesson} from '../src/lesson.ts';
import {sample,hipPoint,plantarCenter,rotate,type V3} from '../src/motion.ts';
import {resolveRig} from '../src/rig.ts';
const distance=(a:V3,b:V3)=>Math.hypot(...a.map((v,i)=>v-b[i]));

test('alta troca braço alto e mão na cintura; baixa prepara na orelha oposta',()=>{
 for(const i of [0,9]){
  const side=lesson.movements[i].side,other=side==='L'?'R':'L',prep=sample(i,.20),end=sample(i,1);
  assert.ok(prep.hands[side][1]<.2&&prep.hands[other][1]>.9);
  assert.ok(end.hands[side][1]>.95&&end.hands[other][1]<.2);
 }
 for(const i of [3,12]){
  const side=lesson.movements[i].side,sign=side==='R'?1:-1,prep=sample(i,.27),end=sample(i,1);
  assert.ok(prep.hands[side][0]*sign<0,'preparação cruza até o lado da orelha oposta');
  assert.ok(prep.hands[side][1]>.6&&prep.hands[side][2]>.25);
  assert.ok(end.hands[side][1]<0,'varredura termina abaixo da cintura');
 }
});
test('interna cruza por baixo e recolhe o outro braço; mão aberta usa câmara alta e arco',()=>{
 for(const i of [5,14]){
  const side=lesson.movements[i].side,other=side==='L'?'R':'L',prep=sample(i,.28),end=sample(i,1);
  assert.ok(prep.hands[side][1]<prep.hands[other][1]-.15);
  assert.ok(end.hands[other][1]<.2&&end.hands[side][1]>.6);
 }
 for(const i of [7,16]){
  const side=lesson.movements[i].side,prep=sample(i,.3),arc=sample(i,.5),end=sample(i,1);
  assert.equal(prep.open[side],1);assert.equal(end.open[side],1);
  assert.ok(prep.hands[side][1]>arc.hands[side][1]&&arc.hands[side][1]>end.hands[side][1]);
  assert.ok(Math.abs(prep.hands[side][0])<.2&&Math.abs(end.hands[side][0])>.8);
 }
});
test('seis socos seguem linha central, giram o punho e quase estendem sem clamp',()=>{
 for(const i of [1,4,8,10,13,17]){
  const m=lesson.movements[i],side=m.side,other=side==='L'?'R':'L',a=sample(i,.34),b=sample(i,.68),end=sample(i,1),r=resolveRig(end,m.plan)[side];
  assert.ok(Math.abs(a.hands[side][1]-b.hands[side][1])<1e-12,'trajetória de entrega mantém o nível');
  assert.ok(b.hands[side][2]>a.hands[side][2]+.3);
  assert.ok(Math.abs(end.hands[side][0])<.1,'punho termina no centro do tronco');
  assert.ok(end.hands[other][1]<.2&&end.hands[other][2]<.2);
  assert.ok(Math.abs(end.handRoll![side])>1.4);
  const local=rotate(r.shoulder.map((v,j)=>v-end.root[j]) as V3,-end.yaw);
  assert.ok(local[2]>.08,'ombro ativo avança em vez de recuar durante o soco');
  assert.ok(distance(r.shoulder,r.arm.end)>.6&&distance(r.shoulder,r.arm.end)<.609);
  assert.ok(Math.abs(end.hands[side][1]-(m.height==='Alta'?.66:.30))<1e-12);
 }
});
test('base frontal carrega a frente; reversos 2/11 não dão passo',()=>{
 for(const m of lesson.movements.filter(m=>m.stance==='Base frontal')){
  const p=sample(m.id-1,1),lead=m.step==='hold'?(m.side==='L'?'R':'L'):m.side,rear=lead==='L'?'R':'L';
  assert.ok(distance(hipPoint(p,lead),p.feet[lead].position)<distance(hipPoint(p,rear),p.feet[rear].position),'perna dianteira mais flexionada');
 }
 for(const i of [1,10])for(let n=0;n<=100;n++)assert.deepEqual(sample(i,n/100).feet,sample(i,0).feet);
});
test('pé que sustenta os passos e giros mantém seu centro plantar',()=>{
 for(const m of lesson.movements.filter(m=>m.plan.motion.kind==='arm')){
  const i=m.id-1,other=m.side==='L'?'R':'L',anchor=plantarCenter(sample(i,0).feet[other]);
  for(let n=0;n<=100;n++)assert.ok(distance(plantarCenter(sample(i,n/100).feet[other]),anchor)<1e-9,`${m.id}/${n}`);
 }
});
test('frontal sobe moderadamente e mantém apoio, câmara e recolhimento nos dois lados',()=>{
 for(const i of [2,11]){
  const m=lesson.movements[i],side=m.side,other=side==='L'?'R':'L',chamber=sample(i,.36),peak=sample(i,.64),retract=sample(i,.86);
  assert.ok(peak.feet[side].position[1]>.90&&peak.feet[side].position[1]<.95);
  assert.ok(distance(chamber.feet[side].position,retract.feet[side].position)<1e-9);
  assert.deepEqual(peak.feet[other],sample(i,0).feet[other]);
 }
});
test('orientação dos punhos não salta entre técnicas ou fases',()=>{
 for(let i=0;i<18;i++){
  let previous=sample(i,0);
  for(let n=1;n<=1000;n++){
   const p=sample(i,n/1000);
   for(const side of ['L','R'] as const)assert.ok(Math.abs((p.handRoll?.[side]??0)-(previous.handRoll?.[side]??0))<.12);
   previous=p;
  }
 }
});
