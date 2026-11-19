import {lesson,type Side} from './lesson.ts';
import {opposite,guardHands,neutralHands,type ArmKey,type ArmMotion,type SideKey,type SideMotion,type V3} from './movement-spec.ts';
export type {V3} from './movement-spec.ts';
export interface Foot {position:V3;yaw:number;pitch:number;}
export interface Pose {root:V3;yaw:number;twist:number;lean:V3;feet:Record<Side,Foot>;hands:Record<Side,V3>;open:Record<Side,number>;kneePoles?:Record<Side,V3>;armPoles?:Record<Side,V3>;handRoll?:Record<Side,number>;}
export const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export const smooth=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export const lerp=(a:V3,b:V3,t:number):V3=>a.map((v,i)=>mix(v,b[i],t)) as V3;
/** Smooth curved ankle trajectory between explicit technique poses. */
const quadratic=(a:V3,control:V3,b:V3,t:number):V3=>{
 const u=1-t;return a.map((v,i)=>u*u*v+2*u*t*control[i]+t*t*b[i]) as V3;
};
/** Rotate the shin direction on the sphere around a nearly fixed knee. */
const sphereArc=(start:V3,end:V3,t:number,length:number):V3=>{
 const na=Math.hypot(...start),nb=Math.hypot(...end);
 const a=start.map(v=>v/na) as V3,b=end.map(v=>v/nb) as V3;
 const dot=Math.max(-1,Math.min(1,a.reduce((s,v,i)=>s+v*b[i],0))),angle=Math.acos(dot);
 const wa=angle<1e-5?1-t:Math.sin((1-t)*angle)/Math.sin(angle);
 const wb=angle<1e-5?t:Math.sin(t*angle)/Math.sin(angle);
 return a.map((v,i)=>(v*wa+b[i]*wb)*length) as V3;
};
export function rotate(v:V3,y:number):V3{return [v[0]*Math.cos(y)+v[2]*Math.sin(y),v[1],-v[0]*Math.sin(y)+v[2]*Math.cos(y)];}
export const add=(a:V3,b:V3):V3=>a.map((v,i)=>v+b[i]) as V3;
const sub=(a:V3,b:V3):V3=>a.map((v,i)=>v-b[i]) as V3;
const copy=<T>(v:T):T=>structuredClone(v);
const delta=(a:number,b:number)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const foot=(x:number,z:number,yaw=0):Foot=>({position:[x,.09,z],yaw,pitch:0});
export const ready:Pose={root:[0,.91,-.8],yaw:0,twist:0,lean:[0,0,0],feet:{L:foot(-.19,-.8),R:foot(.19,-.8)},hands:{L:[-.32,.04,.28],R:[.32,.04,.28]},open:{L:0,R:0}};
export const hipPoint=(p:Pose,s:Side)=>add(p.root,rotate([s==='L'?-.14:.14,0,0],p.yaw));
// The foot box and plantar contact are shared with the renderer and tests.
export const footCenter=(f:Foot):V3=>add(f.position,rotate([0,-.04*Math.cos(f.pitch)-.065*Math.sin(f.pitch),-.04*Math.sin(f.pitch)+.065*Math.cos(f.pitch)],f.yaw));
export const soleHeight=(f:Foot)=>footCenter(f)[1]-.05*Math.abs(Math.cos(f.pitch))-.145*Math.abs(Math.sin(f.pitch));
export const plantarCenter=(f:Foot):V3=>{const c=footCenter(f);return [c[0],soleHeight(f),c[2]];};
function applyArmKey(p:Pose,key:ArmKey,side:Side){
 const other=opposite(side);p.hands[side]=copy(key.active);p.hands[other]=copy(key.other);
 p.open[side]=key.open;p.open[other]=0;p.twist=key.twist;
 p.handRoll={L:0,R:0};p.handRoll[side]=key.roll;
 p.armPoles={L:[-1,-.2,.25],R:[1,-.2,.25]};p.armPoles[side]=copy(key.pole);p.armPoles[other]=copy(key.otherPole);
}
function armSample(p:Pose,a:Pose,side:Side,t:number,motion:ArmMotion){
 let n=0;while(n<motion.phases.length-2&&t>motion.phases[n+1].at)n++;
 const k=motion.phases[n],next=motion.phases[n+1],u=smooth((t-k.at)/(next.at-k.at));
 const from=copy(a),to=copy(p);if(!k.fromPrevious)applyArmKey(from,k,side);applyArmKey(to,next,side);
 for(const s of ['L','R'] as Side[]){
  p.hands[s]=lerp(from.hands[s],to.hands[s],u);p.open[s]=mix(from.open[s],to.open[s],u);
  p.handRoll![s]=mix(from.handRoll?.[s]??0,to.handRoll?.[s]??0,u);
  const fallback:V3=[s==='L'?-1:1,-.2,.25];p.armPoles![s]=lerp(from.armPoles?.[s]??fallback,to.armPoles?.[s]??fallback,u);
 }
 p.twist=mix(from.twist,to.twist,u);
}
/** Reorient a planted foot around its sole centre, not around the ankle. */
function setFootYaw(f:Foot,yaw:number){const plant=plantarCenter(f);f.yaw=yaw;f.position=add(plant,rotate([0,.09,-.065],yaw));}
function endpoints(){
 const poses:Pose[]=[];let p=copy(ready);
 for(const m of lesson.movements){
  p=copy(p);delete p.kneePoles;const side=m.side,other=opposite(side),plan=m.plan,motion=plan.motion,dir=Math.cos(plan.identity.targetBearing);
  delete p.armPoles;p.handRoll={L:0,R:0};p.open={L:0,R:0};p.hands=copy(neutralHands);p.twist=0;p.lean=[0,0,0];
  switch(plan.base.placement){
   case 'middleTurn': {p.yaw=Math.PI/2;setFootYaw(p.feet[other],p.yaw);const s=p.feet[other].position;p.feet[side]=foot(s[0]+.02,s[2]+dir*plan.base.width,p.yaw);break;}
   case 'sideCycle': {if(motion.kind!=='side')break;const s=p.feet[other].position,a=p.feet[side].position;p.feet[other].position=lerp(s,a,motion.closing);p.feet[other].yaw=p.yaw;const support=p.feet[other].position;p.feet[side]=foot(support[0],support[2]+dir*motion.width,p.yaw);break;}
   case 'middleLand': {const s=p.feet[other].position;p.feet[side]=foot(s[0],s[2]+dir*plan.base.width,Math.PI/2);break;}
   case 'frontKick': break;
   default: {p.yaw=plan.identity.targetBearing;if(plan.base.placement!=='hold'){const s=p.feet[other].position;p.feet[side]=foot((side==='L'?-.2:.2)*dir,s[2]+dir*plan.base.stride,p.yaw);}setFootYaw(p.feet.L,p.yaw);setFootYaw(p.feet.R,p.yaw);}
  }
  if(motion.kind==='front'){const s=p.feet[other].position;p.root=[s[0],.92,s[2]];p.feet[side]={position:add(p.root,rotate(motion.chamber,p.yaw)),yaw:p.yaw,pitch:motion.pitch.chamber};}
  else {const a=p.feet.L.position,b=p.feet.R.position;p.root=[(a[0]+b[0])/2,.86,(a[2]+b[2])/2];}
  // A front stance loads the leading leg; a middle stance stays centred.
  if(motion.kind==='arm'&&plan.base.final==='Base frontal'){p.root[1]=.85;p.root[2]+=dir*.06;}
  if(motion.kind==='arm')applyArmKey(p,motion.phases.at(-1)!,side);
  else p.hands=copy(guardHands);
  poses.push(p);
 }
 return poses;
}
export const targets=endpoints();
function blend(a:Pose,b:Pose,t:number):Pose{
 const p=copy(a);delete p.kneePoles;p.armPoles={L:[-1,-.2,.25],R:[1,-.2,.25]};p.handRoll={L:0,R:0};p.root=lerp(a.root,b.root,t);p.yaw=mix(a.yaw,b.yaw,t);p.twist=mix(a.twist,b.twist,t);p.lean=lerp(a.lean,b.lean,t);
 for(const s of ['L','R'] as Side[]){p.feet[s]={position:lerp(a.feet[s].position,b.feet[s].position,t),yaw:mix(a.feet[s].yaw,b.feet[s].yaw,t),pitch:mix(a.feet[s].pitch,b.feet[s].pitch,t)};p.hands[s]=lerp(a.hands[s],b.hands[s],t);p.open[s]=mix(a.open[s],b.open[s],t);p.handRoll![s]=mix(a.handRoll?.[s]??0,b.handRoll?.[s]??0,t);const fallback:V3=[s==='L'?-1:1,-.2,.25];p.armPoles![s]=lerp(a.armPoles?.[s]??fallback,b.armPoles?.[s]??fallback,t);}
 return p;
}
function sideSample(index:number,t:number,a:Pose,b:Pose,motion:SideMotion):Pose{
 const plan=lesson.movements[index].plan,side=plan.identity.side,other=opposite(side),keys=motion.phases;
 let n=0;while(n<keys.length-2&&t>keys[n+1].at)n++;
 const k=keys[n],next=keys[n+1],u=smooth((t-k.at)/(next.at-k.at)),p=blend(a,b,0);
 const target=plan.identity.targetBearing,turn=delta(a.yaw,target);
 p.yaw=a.yaw+turn*mix(k.body.pelvisTowardTarget,next.body.pelvisTowardTarget,u);
 p.twist=a.yaw+turn*mix(k.body.thoraxTowardTarget,next.body.thoraxTowardTarget,u)-p.yaw;
 p.lean=lerp(k.body.lean,next.body.lean,u);
 const rootAt=(key:SideKey):V3=>{const anchor=key.body.anchor==='initial'?a.root:key.body.anchor==='active'?a.feet[side].position:key.body.anchor==='support'?b.feet[other].position:key.body.anchor==='landing'?lerp(b.feet[other].position,b.root,.55):b.root;return [anchor[0],key.body.height,anchor[2]];};
 p.root=lerp(rootAt(k),rootAt(next),u);
 // Enforce the declared balance envelope while both phase keys specify one support.
 if(k.contact==='support'&&next.contact==='support'){
  const anchor=plantarCenter(b.feet[other]),dx=p.root[0]-anchor[0],dz=p.root[2]-anchor[2],d=Math.hypot(dx,dz),radius=plan.constraints.supportRadius;
  if(d>radius){p.root[0]=anchor[0]+dx*radius/d;p.root[2]=anchor[2]+dz*radius/d;}
 }
 const step=mix(k.supportStep,next.supportStep,u),pivot=mix(k.supportPivot,next.supportPivot,u);
 const closed=b.feet[other],yaw=a.feet[other].yaw+delta(a.feet[other].yaw,target+Math.PI)*pivot;
 const plant=lerp(plantarCenter(a.feet[other]),plantarCenter(closed),step);
 const ankle=add(plant,rotate([0,.09,-.065],yaw));ankle[1]=.09+.09*Math.sin(Math.PI*step);
 p.feet[other]={position:ankle,yaw,pitch:0};
 const hip=hipPoint(p,side);
 const local=(key:SideKey):V3=>key.active.frame==='hip'?key.active.position:rotate(sub(key.active.frame==='initial'?a.feet[side].position:b.feet[side].position,hip),-p.yaw);
 p.feet[side].position=add(hip,rotate(lerp(local(k),local(next),u),p.yaw));
 const orient=(key:SideKey)=>key.active.orientation==='initial'?a.feet[side].yaw:key.active.orientation==='pelvis'?p.yaw:key.active.orientation==='target'?target:b.feet[side].yaw;
 const startYaw=orient(k);p.feet[side].yaw=startYaw+delta(startYaw,orient(next))*u;
 p.feet[side].pitch=mix(k.active.pitch,next.active.pitch,u);
 // Resolve the toe/heel box above the floor and clamp the anatomical reach.
 const f=p.feet[side];f.position[1]+=Math.max(0,plan.constraints.floor-soleHeight(f));
 const reach=sub(f.position,hip),length=Math.hypot(...reach);
 if(length>plan.constraints.maxReach)f.position=add(hip,reach.map(v=>v*plan.constraints.maxReach/length) as V3);
 p.kneePoles={L:[0,0,1],R:[0,0,1]};p.kneePoles[side]=rotate(lerp(k.active.knee,next.active.knee,u),p.yaw);p.kneePoles[other]=rotate([0,0,1],yaw);
 for(const s of ['L','R'] as Side[]){const hands=(key:SideKey)=>key.hands==='initial'?a.hands[s]:guardHands[s];p.hands[s]=lerp(hands(k),hands(next),u);p.open[s]=mix(a.open[s],0,smooth(t/.08));const reset=smooth(t/.22);p.handRoll![s]=(a.handRoll?.[s]??0)*(1-reset);p.armPoles![s]=lerp(a.armPoles?.[s]??[s==='L'?-1:1,-.2,.25],[s==='L'?-1:1,-.2,.25],reset);}
 return p;
}
export function sample(index:number,progress:number):Pose{
 index=Math.max(0,Math.min(targets.length-1,index));const t=Math.max(0,Math.min(1,progress));
 const a=index===0?ready:targets[index-1],b=targets[index],m=lesson.movements[index],motion=m.plan.motion;
 if(t===0)return copy(a);if(t===1)return copy(b);
 if(motion.kind==='side')return sideSample(index,t,a,b,motion);
 const move=smooth(t/(motion.kind==='front'?motion.transferEnd:motion.travelEnd)),p=blend(a,b,move);
 for(const s of ['L','R'] as Side[]){
  const from=a.feet[s],to=b.feet[s],plant=plantarCenter(from),nextPlant=plantarCenter(to);
  if(Math.hypot(...sub(plant,nextPlant))<1e-9&&soleHeight(from)<.001&&soleHeight(to)<.001){
   p.feet[s].position=add(plant,rotate([0,.09,-.065],p.feet[s].yaw));
  }else {
   const dist=Math.hypot(...sub(from.position,to.position));
   if(dist>.03&&from.position[1]<.11&&to.position[1]<.11)p.feet[s].position[1]+=.13*Math.sin(Math.PI*move);
  }
 }
 if(motion.kind==='front'){
  const side=m.side,sign=side==='L'?-1:1,other=opposite(side),chamber=add(b.root,rotate(motion.chamber,b.yaw)),extension=add(b.root,rotate(motion.extension,b.yaw));
  const c=motion.chamberEnd,e=motion.extensionEnd,r=motion.retractionEnd;
  // Lift low and forward first, then bring the ankle up into a stable chamber.
  const liftControl:V3=[
   mix(a.feet[side].position[0],chamber[0],.55),
   a.feet[side].position[1]+motion.arc.liftHeight,
   mix(a.feet[side].position[2],chamber[2],motion.arc.liftForward),
  ];
  // Resolve the knee only once at the chamber pose. Through the kick the
  // shin stays a constant-length radius around that pivot, instead of moving
  // the knee together with a linearly interpolated ankle target.
  const plan=m.plan,knee=solveIK(hipPoint(b,side),chamber,rotate([0,0,1],b.yaw),...plan.constraints.leg).joint;
  const shinStart=sub(chamber,knee),shinEnd=sub(extension,knee),shinLength=plan.constraints.leg[1];
  const aroundKnee=(from:V3,to:V3,u:number):V3=>add(knee,sphereArc(from,to,smooth(u),shinLength));
  p.feet[side].position=t<c
   ?quadratic(a.feet[side].position,liftControl,chamber,smooth(t/c))
   :t<e
    ?aroundKnee(shinStart,shinEnd,(t-c)/(e-c))
    :aroundKnee(shinEnd,shinStart,(t-e)/(r-e));
  p.feet[side].pitch=t<c?mix(a.feet[side].pitch,motion.pitch.chamber,smooth(t/c)):t<e?mix(motion.pitch.chamber,motion.pitch.strike,smooth((t-c)/(e-c))):mix(motion.pitch.strike,motion.pitch.chamber,smooth((t-e)/(r-e)));
  const body=motion.body,pulse=smooth((t-body.onset)/(body.loaded-body.onset))*(1-smooth((t-body.release)/(body.end-body.release)));
  p.root=add(p.root,rotate(body.translation.map(v=>v*pulse) as V3,b.yaw));p.yaw+=body.pelvis*pulse;p.twist+=body.thorax*pulse;p.lean=body.lean.map(v=>v*pulse) as V3;p.feet[other].yaw+=body.pivot*pulse;
  p.hands[side]=lerp(p.hands[side],[sign*.33,.36,.32],pulse);p.hands[other]=lerp(p.hands[other],[-sign*.32,.38,.33],pulse);
 }else armSample(p,a,m.side,t,motion);
 return p;
}
// Two-bone analytic IK: fixed lengths, stable pole direction, reachable target clamping.
export function solveIK(start:V3,end:V3,pole:V3,upper:number,lower:number):{joint:V3;end:V3}{
 const d=end.map((v,i)=>v-start[i]) as V3,raw=Math.hypot(...d),length=Math.max(.001,Math.min(upper+lower-.001,Math.max(Math.abs(upper-lower)+.001,raw)));
 const axis=d.map(v=>v/(raw||1)) as V3;
 if(raw<.001)axis[1]=-1;
 const dot=pole.reduce((s,v,i)=>s+v*axis[i],0);let bend=pole.map((v,i)=>v-dot*axis[i]) as V3;
 let norm=Math.hypot(...bend);if(norm<.001){bend=[axis[1],-axis[0],0];norm=Math.hypot(...bend);if(norm<.001){bend=[1,0,0];norm=1;}}
 bend=bend.map(v=>v/norm) as V3;
 const along=(upper*upper-lower*lower+length*length)/(2*length),height=Math.sqrt(Math.max(0,upper*upper-along*along));
 return {joint:start.map((v,i)=>v+axis[i]*along+bend[i]*height) as V3,end:add(start,axis.map(v=>v*length) as V3)};
}

// Shared upper-body transform: Y yaw, X pitch, Z lateral lean (YXZ Euler).
export function upperPoint(p:Pose,v:V3):V3 {
 const [pitch,,roll]=p.lean;
 const x=v[0]*Math.cos(roll)-v[1]*Math.sin(roll),y=v[0]*Math.sin(roll)+v[1]*Math.cos(roll);
 return add(p.root,rotate([x,y*Math.cos(pitch)-v[2]*Math.sin(pitch),y*Math.sin(pitch)+v[2]*Math.cos(pitch)],p.yaw+p.twist));
}
