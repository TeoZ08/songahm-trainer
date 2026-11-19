import test from 'node:test';
import assert from 'node:assert/strict';
import {sample,upperPoint,add,rotate,type V3} from '../src/motion.ts';
import {lesson} from '../src/lesson.ts';
import {segmentBoxDistance,segmentDistance,upperLocal,resolveRig,selfContacts,limbCapsules} from '../src/rig.ts';
const distance=(a:V3,b:V3)=>Math.hypot(...a.map((v,i)=>v-b[i]));

test('distâncias geométricas detectam interior, tangência, canto e segmentos degenerados',()=>{
 const h:V3=[1,1,1];
 assert.equal(segmentBoxDistance([-2,0,0],[2,0,0],h),0);
 assert.equal(segmentBoxDistance([1,-2,0],[1,2,0],h),0);
 assert.equal(segmentBoxDistance([3,0,0],[3,0,0],h),2);
 assert.ok(Math.abs(segmentBoxDistance([2,2,-2],[2,2,2],h)-Math.SQRT2)<1e-12);
 assert.equal(segmentDistance([0,0,0],[1,0,0],[.5,-1,0],[.5,1,0]),0);
 assert.equal(segmentDistance([0,0,0],[1,0,0],[0,2,0],[1,2,0]),2);
 assert.equal(segmentDistance([0,0,0],[0,0,0],[0,3,0],[0,3,0]),3);
});
test('volumes orientados usam a inversa da transformação visível do tronco',()=>{
 const p=sample(6,.47);p.twist=.19;p.lean=[.2,0,-.4];
 for(const v of [[.2,.6,.1],[-.1,.05,-.1],[0,.77,0]] as V3[])assert.ok(distance(v,upperLocal(p,upperPoint(p,v)))<1e-12);
});
test('o audit detecta a antiga câmara com joelho atravessando o tórax',()=>{
 const p=sample(6,.475),rig=resolveRig(p,lesson.movements[6].plan);
 p.feet.R.position=add(rig.R.hip,rotate([.12,.08,.16],p.yaw));
 p.kneePoles!.R=rotate([.55,.75,.35],p.yaw);
 assert.ok(selfContacts(p,lesson.movements[6].plan).some(c=>c.body==='chest'&&/Rknee|Rshin/.test(c.limb)));
});
test('18 técnicas: cápsulas fora do corpo, ossos constantes e juntas contínuas em 1001 instantes',()=>{
 for(let i=0;i<18;i++){
  const plan=lesson.movements[i].plan;
  let previous=resolveRig(sample(i,0),plan);
  for(let n=0;n<=1000;n++){
   const p=sample(i,n/1000),rig=resolveRig(p,plan),label=`movimento ${i+1}, fase ${n/1000}`;
   assert.deepEqual(selfContacts(p,plan),[],label);
   for(const side of ['L','R'] as const){
    const r=rig[side];
    assert.ok(Math.abs(distance(r.hip,r.leg.joint)-.44)<1e-10,label);
    assert.ok(Math.abs(distance(r.leg.joint,r.leg.end)-.44)<1e-10,label);
    assert.ok(Math.abs(distance(r.shoulder,r.arm.joint)-.31)<1e-10,label);
    assert.ok(Math.abs(distance(r.arm.joint,r.arm.end)-.30)<1e-10,label);
    for(const limb of ['leg','arm'] as const)assert.ok(distance(r[limb].joint,previous[side][limb].joint)<.016,label+' '+side+' '+limb);
   }
   previous=rig;
  }
 }
});
test('membros distintos não se atravessam durante a sequência completa',()=>{
 const isArm=(name:string)=>/Arm|forearm|elbow|hand/.test(name);
 for(let i=0;i<18;i++)for(let n=0;n<=200;n++){
  const capsules=limbCapsules(sample(i,n/200),lesson.movements[i].plan);
  for(let a=0;a<capsules.length;a++)for(let b=a+1;b<capsules.length;b++){
   const x=capsules[a],y=capsules[b];
   // Segments within the same anatomical chain meet at their joint by design.
   if(x.name[0]===y.name[0]&&isArm(x.name)===isArm(y.name))continue;
   const gap=segmentDistance(x.a,x.b,y.a,y.b)-x.radius-y.radius;
   assert.ok(gap>=-.002,`${i+1}/${n}: ${x.name}, ${y.name}: ${gap}`);
  }
 }
});
