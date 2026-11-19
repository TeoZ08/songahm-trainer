import {add,rotate,lerp,solveIK,hipPoint,upperPoint,footCenter,type Pose,type V3} from './motion.ts';
import type {MovementPlan,Side} from './movement-spec.ts';
// Metres. These match the visible chest/pelvis meshes, including their orientation.
export const rigShape={chest:{center:[0,.32,0] as V3,half:[.225,.24,.12] as V3},pelvis:{center:[0,.02,0] as V3,half:[.17,.10,.1175] as V3}};
export interface Capsule {name:string;a:V3;b:V3;radius:number;}
export interface Volume {name:string;half:V3;local:(v:V3)=>V3;}
const sub=(a:V3,b:V3):V3=>a.map((v,i)=>v-b[i]) as V3;
const dot=(a:V3,b:V3)=>a.reduce((n,v,i)=>n+v*b[i],0);
export function upperLocal(p:Pose,v:V3):V3{
 const r=rotate(sub(v,p.root),-p.yaw-p.twist),[pitch,,roll]=p.lean;
 const x=r[0],y=r[1]*Math.cos(pitch)+r[2]*Math.sin(pitch),z=-r[1]*Math.sin(pitch)+r[2]*Math.cos(pitch);
 return [x*Math.cos(roll)+y*Math.sin(roll),-x*Math.sin(roll)+y*Math.cos(roll),z];
}
export function bodyVolumes(p:Pose):Volume[]{
 return [
  {name:'chest',half:rigShape.chest.half,local:v=>sub(upperLocal(p,v),rigShape.chest.center)},
  {name:'pelvis',half:rigShape.pelvis.half,local:v=>sub(rotate(sub(v,p.root),-p.yaw),rigShape.pelvis.center)},
  {name:'head',half:[.14,.18,.14],local:v=>sub(upperLocal(p,v),[0,.77,0])},
 ];
}
/** Exact distance to a solid AABB: split at slab crossings, minimize each quadratic interval. */
export function segmentBoxDistance(a:V3,b:V3,half:V3):number{
 const d=sub(b,a),breaks=[0,1];
 for(let i=0;i<3;i++)if(Math.abs(d[i])>1e-12)for(const face of [-half[i],half[i]]){const t=(face-a[i])/d[i];if(t>0&&t<1)breaks.push(t);}
 breaks.sort((x,y)=>x-y);
 const squared=(t:number)=>a.reduce((sum,v,i)=>sum+Math.max(0,Math.abs(v+d[i]*t)-half[i])**2,0);
 let best=Infinity;
 for(let n=0;n<breaks.length-1;n++){
  const lo=breaks[n],hi=breaks[n+1],mid=(lo+hi)/2;let aa=0,bb=0;
  for(let i=0;i<3;i++){const v=a[i]+d[i]*mid;if(Math.abs(v)>half[i]){const offset=a[i]-Math.sign(v)*half[i];aa+=d[i]*d[i];bb+=offset*d[i];}}
  const t=aa?Math.max(lo,Math.min(hi,-bb/aa)):lo;best=Math.min(best,squared(lo),squared(hi),squared(t));
 }
 return Math.sqrt(best);
}
export const capsuleClearance=(c:Capsule,v:Volume)=>segmentBoxDistance(v.local(c.a),v.local(c.b),v.half)-c.radius;
export function segmentDistance(a:V3,b:V3,c:V3,d:V3):number{
 const u=sub(b,a),v=sub(d,c),w=sub(a,c),aa=dot(u,u),bb=dot(u,v),cc=dot(v,v),dd=dot(u,w),ee=dot(v,w);
 const clamp=(x:number)=>Math.max(0,Math.min(1,x));let s=0,t=0;
 if(aa<1e-12)t=cc?clamp(ee/cc):0;
 else if(cc<1e-12)s=clamp(-dd/aa);
 else {const denominator=aa*cc-bb*bb;s=denominator>1e-12?clamp((bb*ee-cc*dd)/denominator):0;t=(bb*s+ee)/cc;if(t<0){t=0;s=clamp(-dd/aa);}else if(t>1){t=1;s=clamp((bb-dd)/aa);}}
 return Math.hypot(...sub(add(a,u.map(x=>x*s) as V3),add(c,v.map(x=>x*t) as V3)));
}
/** Shared by the visible meshes and geometric regression tests. No physics timestep. */
export function resolveRig(p:Pose,plan:MovementPlan){
 const sides={} as Record<Side,{shoulder:V3;hip:V3;leg:ReturnType<typeof solveIK>;arm:ReturnType<typeof solveIK>}>;
 for(const side of ['L','R'] as Side[]){
  // A short clavicle joins this shoulder anchor to the chest in the renderer.
  const sign=side==='L'?-1:1,hip=hipPoint(p,side),shoulder=upperPoint(p,[sign*.33,.54,0]),kick=plan.motion.kind!=='arm';
  const leg=solveIK(hip,p.feet[side].position,p.kneePoles?.[side]??rotate([0,0,1],kick&&side!==plan.identity.side?p.feet[side].yaw:p.yaw),...plan.constraints.leg);
  const arm=solveIK(shoulder,upperPoint(p,p.hands[side]),rotate([sign*1,-.2,.25],p.yaw+p.twist),...plan.constraints.arm);
  sides[side]={hip,shoulder,leg,arm};
 }
 return sides;
}
const trim=(a:V3,b:V3,length:number):V3=>lerp(a,b,Math.min(1,length/(Math.hypot(...sub(b,a))||1)));
export function limbCapsules(p:Pose,plan:MovementPlan):Capsule[]{
 const rig=resolveRig(p,plan),capsules:Capsule[]=[];
 for(const side of ['L','R'] as Side[]){
  const {hip,shoulder,leg,arm}=rig[side],f=p.feet[side],axis=rotate([0,-Math.sin(f.pitch),Math.cos(f.pitch)],f.yaw),center=footCenter({...f,position:leg.end});
  capsules.push(
   // Proximal unions: 18 cm at the hip/abdomen seam; 13 cm at the shoulder.
   // Distal thigh, knee, shin and foot remain checked against the torso.
   {name:side+'thigh',a:trim(hip,leg.joint,.18),b:leg.joint,radius:.09},
   {name:side+'shin',a:leg.joint,b:leg.end,radius:.065},
   {name:side+'knee',a:leg.joint,b:leg.joint,radius:.10},
   {name:side+'foot',a:add(center,axis.map(v=>v*-.145) as V3),b:add(center,axis.map(v=>v*.145) as V3),radius:Math.hypot(.07,.05)},
   {name:side+'upperArm',a:trim(shoulder,arm.joint,.13),b:arm.joint,radius:.073},
   {name:side+'forearm',a:arm.joint,b:arm.end,radius:.057},
   {name:side+'elbow',a:arm.joint,b:arm.joint,radius:.08},
   {name:side+'ankle',a:leg.end,b:leg.end,radius:.075},
   {name:side+'hand',a:arm.end,b:arm.end,radius:Math.hypot(.0525,.06+p.open[side]*.04,.0475-p.open[side]*.0275)},
  );
 }
 return capsules;
}
export function selfContacts(p:Pose,plan:MovementPlan){
 const contacts:{limb:string;body:string;clearance:number}[]=[];
 for(const capsule of limbCapsules(p,plan))for(const volume of bodyVolumes(p)){
  // Pelvis and its own thighs form an anatomical connected union.
  if(capsule.name.endsWith('thigh')&&volume.name==='pelvis')continue;
  const clearance=capsuleClearance(capsule,volume);
  if(clearance<0)contacts.push({limb:capsule.name,body:volume.name,clearance});
 }
 return contacts;
}
