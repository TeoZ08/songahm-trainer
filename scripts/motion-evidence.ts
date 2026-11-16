// Reproduce simulator measurements only; these numbers are not reference angles.
import {mkdirSync,writeFileSync} from 'node:fs';
import {sample,hipPoint,plantarCenter,rotate,type V3} from '../src/motion.ts';
import {lesson} from '../src/lesson.ts';
import {phaseAt,opposite} from '../src/movement-spec.ts';
const deg=(r:number)=>Math.round(r*180/Math.PI*100)/100;
const rows=[6,15].flatMap(index=>[0,.22,.40,.52,.66,.80,.91,1].map(t=>{
 const m=lesson.movements[index],p=sample(index,t),support=opposite(m.side),hip=hipPoint(p,m.side);
 const ankleLocal=rotate(p.feet[m.side].position.map((v,j)=>v-hip[j]) as V3,-p.yaw);
 return {movement:m.id,t,phase:phaseAt(m.plan,t).label,active:m.side,support,target:m.direction,
  pelvisYaw:deg(p.yaw),thoraxYaw:deg(p.yaw+p.twist),supportYaw:deg(p.feet[support].yaw),attackYaw:deg(p.feet[m.side].yaw),
  supportPlant:plantarCenter(p.feet[support]),ankleLocal,reach:Math.hypot(...ankleLocal)};
}));
mkdirSync('artifacts/rev03',{recursive:true});
writeFileSync('artifacts/rev03/kinematics.json',JSON.stringify({notice:'Medições do simulador; não são ângulos medidos no vídeo ou certificados.',rows},null,2));
console.log('artifacts/rev03/kinematics.json: 16 poses, dois lados, yaw, planta e alcance.');
