/** Reproducible, renderer-shared geometric evidence; not martial certification. */
import {mkdirSync,writeFileSync} from 'node:fs';
import {sample} from '../src/motion.ts';
import {lesson} from '../src/lesson.ts';
import {resolveRig,selfContacts} from '../src/rig.ts';
const samples=1001;
const movements=lesson.movements.map((m,i)=>{
 let contacts=0,worstJointStep=0;
 let previous=resolveRig(sample(i,0),m.plan);
 for(let n=0;n<samples;n++){
  const p=sample(i,n/(samples-1)),rig=resolveRig(p,m.plan);
  contacts+=selfContacts(p,m.plan).length;
  for(const side of ['L','R'] as const)for(const chain of ['leg','arm'] as const){
   const delta=rig[side][chain].joint.map((v,j)=>v-previous[side][chain].joint[j]);
   worstJointStep=Math.max(worstJointStep,Math.hypot(...delta));
  }
  previous=rig;
 }
 return {movement:m.id,contacts,worstJointStepMetres:worstJointStep};
});
mkdirSync('artifacts/rev08',{recursive:true});
writeFileSync('artifacts/rev08/rig.json',JSON.stringify({samplesPerMovement:samples,proximalExclusionsMetres:{hip:.18,shoulder:.13},adjacentPairExclusion:'thigh/pelvis',movements},null,2));
console.log(`${movements.reduce((s,m)=>s+m.contacts,0)} contacts across ${18*samples} poses; artifacts/rev08/rig.json`);
