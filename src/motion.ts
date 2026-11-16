import { lesson, type Side } from './lesson.ts';
export type V3 = [number,number,number];
export interface Foot { position:V3; yaw:number; pitch:number; }
export interface Pose { root:V3; yaw:number; twist:number; lean:V3; feet:Record<Side,Foot>; hands:Record<Side,V3>; open:Record<Side,number>; }
export const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export const smooth=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export const lerp=(a:V3,b:V3,t:number):V3=>a.map((v,i)=>mix(v,b[i],t)) as V3;
export function rotate(v:V3,y:number):V3 {return [v[0]*Math.cos(y)+v[2]*Math.sin(y),v[1],-v[0]*Math.sin(y)+v[2]*Math.cos(y)];}
export const add=(a:V3,b:V3):V3=>a.map((v,i)=>v+b[i]) as V3;
const copy=<T>(v:T):T=>structuredClone(v);
const foot=(x:number,z:number,yaw=0):Foot=>({position:[x,0.09,z],yaw,pitch:0});
export const ready:Pose={root:[0,0.91,-0.8],yaw:0,twist:0,lean:[0,0,0],feet:{L:foot(-.19,-.8),R:foot(.19,-.8)},hands:{L:[-.24,-.13,.25],R:[.24,-.13,.25]},open:{L:0,R:0}};
// World-space feet stay fixed unless that foot takes a step. Distances are illustrative meters.
function endpoints(){
 const poses:Pose[]=[];let p=copy(ready);
 for(const m of lesson.movements){
  p=copy(p);const side=m.side,other=side==='L'?'R':'L';
  p.open={L:0,R:0};p.hands={L:[-.26,.02,.12],R:[.26,.02,.12]};p.twist=0;
  const dir=m.direction==='Leste'?1:-1;
  if(m.technique==='inner'){
   p.yaw=Math.PI/2;
   const support=p.feet[other].position;
   p.feet[side]=foot(support[0]+.02,support[2]+dir*.68,Math.PI/2);
   p.feet[other].yaw=Math.PI/2;
  }else if(m.technique==='sideKick'){
   // #3 approach is a schematic closing step; the supporting foot then remains planted.
   const support=p.feet[other].position,active=p.feet[side].position;
   p.feet[other].position=lerp(support,active,.52);
   p.feet[other].yaw=Math.PI/2;
  }else if(m.technique==='knife'){
   const support=p.feet[other].position;p.feet[side]=foot(support[0],support[2]+dir*.68,Math.PI/2);
  }else if(m.technique==='frontKick'){
   // Endpoint is a rechambered kick, not a fictitious extra numbered landing.
  }else{
   p.yaw=dir===1?0:Math.PI;
   if(m.step!=='hold'){
    const support=p.feet[other].position;
    p.feet[side]=foot((side==='L'?-.2:.2)*dir,support[2]+dir*.55,p.yaw);
   }
   p.feet.L.yaw=p.yaw;p.feet.R.yaw=p.yaw;
  }
  if(m.technique==='frontKick'||m.technique==='sideKick'){
   const support=p.feet[other].position;
   p.root=[support[0],.92,support[2]];
   p.feet[side]={position:add(p.root,rotate([side==='L'?-.18:.18,.0,.18],p.yaw)),yaw:p.yaw,pitch:-.65};
  }else{
   const a=p.feet.L.position,b=p.feet.R.position;p.root=[(a[0]+b[0])/2,.86,(a[2]+b[2])/2];
  }
  const sign=side==='L'?-1:1;
  if(m.technique==='high')p.hands[side]=[sign*.10,.98,.18];
  if(m.technique==='punch'){p.hands[side]=[sign*.22,m.height==='Alta'?.68:.30,.56];p.twist=sign*.09;}
  if(m.technique==='low')p.hands[side]=[sign*.34,-.18,.35];
  if(m.technique==='inner')p.hands[side]=[sign*.50,.70,.13];
  if(m.technique==='knife'){p.hands[side]=[sign*.855,.37,.08];p.open[side]=1;}
  if(['frontKick','sideKick'].includes(m.technique))p.hands={L:[-.31,.34,.32],R:[.31,.34,.32]};
  poses.push(p);
 }
 return poses;
}
export const targets=endpoints();
function blend(a:Pose,b:Pose,t:number):Pose{
 const p=copy(a);p.root=lerp(a.root,b.root,t);p.yaw=mix(a.yaw,b.yaw,t);p.twist=mix(a.twist,b.twist,t);p.lean=lerp(a.lean,b.lean,t);
 for(const s of ['L','R'] as Side[]){p.feet[s]={position:lerp(a.feet[s].position,b.feet[s].position,t),yaw:mix(a.feet[s].yaw,b.feet[s].yaw,t),pitch:mix(a.feet[s].pitch,b.feet[s].pitch,t)};p.hands[s]=lerp(a.hands[s],b.hands[s],t);p.open[s]=mix(a.open[s],b.open[s],t);}
 return p;
}
export function sample(index:number,progress:number):Pose{
 index=Math.max(0,Math.min(targets.length-1,index));const t=Math.max(0,Math.min(1,progress));
 const a=index===0?ready:targets[index-1],b=targets[index],m=lesson.movements[index];
 if(t===0)return copy(a);if(t===1)return copy(b);
 const isKick=m.technique==='frontKick'||m.technique==='sideKick';
 const move=smooth(t/(isKick?.32:.72)),p=blend(a,b,move);
 for(const s of ['L','R'] as Side[]){
  const dist=Math.hypot(...a.feet[s].position.map((v,i)=>v-b.feet[s].position[i]));
  if(dist>.03&&a.feet[s].position[1]<.11&&b.feet[s].position[1]<.11)p.feet[s].position[1]+=.13*Math.sin(Math.PI*move);
 }
 if(m.technique==='frontKick'||m.technique==='sideKick'){
  const side=m.side,sign=side==='L'?-1:1;
  const kt=m.technique==='sideKick'?Math.max(0,(t-.18)/.82):t;
  if(m.technique==='sideKick'){const other=side==='L'?'R':'L',step=smooth(t/.18);p.feet[other].position=lerp(a.feet[other].position,b.feet[other].position,step);p.feet[other].position[1]+=.09*Math.sin(Math.PI*step);}
  const chamber=add(b.root,rotate([sign*.18,0,.18],b.yaw));
  const extension=add(b.root,rotate(m.technique==='frontKick'?[sign*.18,.08,.85]:[sign*.975,.12,.04],b.yaw));
  const start=a.feet[side].position;
  p.feet[side].position=kt<.32?lerp(start,chamber,smooth(kt/.32)):kt<.58?lerp(chamber,extension,smooth((kt-.32)/.26)):lerp(extension,chamber,smooth((kt-.58)/.24));
  if(m.technique==='sideKick'){const outward=kt<.58?smooth((kt-.32)/.26):1-smooth((kt-.58)/.24);p.feet[side].yaw+=sign*Math.PI/2*outward;}
  const strikePitch=m.technique==='sideKick'?-1.15:-.70;
  p.feet[side].pitch=kt<.32?mix(a.feet[side].pitch,-.65,smooth(kt/.32)):kt<.58?mix(-.65,strikePitch,smooth((kt-.32)/.26)):mix(strikePitch,-.65,smooth((kt-.58)/.24));
  // Visual keyframes, not certified biomechanical measurements. Pulse is zero
  // at both boundaries so the next numbered landing remains continuous.
  const pulse=smooth((t-.18)/.30)*(1-smooth((t-.68)/.30));
  const lateral=m.technique==='sideKick';
  p.root=add(p.root,rotate(lateral?[-sign*.02*pulse,.015*pulse,0]:[0,.015*pulse,-.015*pulse],b.yaw));
  p.yaw+=sign*(lateral?.22:.06)*pulse;
  p.twist=-sign*(lateral?.12:.08)*pulse;
  p.lean=[-(lateral?.05:.14)*pulse,0,lateral?sign*.40*pulse:0];
  const other=side==='L'?'R':'L';
  p.feet[other].yaw+=sign*(lateral?-Math.PI/2:.12)*pulse;
  p.hands[side]=lerp(p.hands[side],[sign*.33,.36,.32],pulse);
  p.hands[other]=lerp(p.hands[other],[-sign*(lateral?.45:.32),lateral?.27:.38,lateral?.15:.33],pulse);

 }else{
  // A distinct preparation then delivery gives each technique a readable rhythm.
  const chamber:V3=[m.side==='L'?-.17:.17,.28,.28];
  p.hands[m.side]=t<.28?lerp(a.hands[m.side],chamber,smooth(t/.28)):lerp(chamber,b.hands[m.side],smooth((t-.28)/.42));
 }
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
