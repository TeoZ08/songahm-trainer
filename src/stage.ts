import * as THREE from 'three';
import { SVGRenderer, SVGObject } from 'three/addons/renderers/SVGRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { add, rotate, sample, upperPoint, footCenter, plantarCenter, type V3 } from './motion.ts';
import { duration, type Player } from './player.ts';
import {resolveRig,rigShape,rigRadii,handSize,footSize} from './rig.ts';
import { lesson, type Side } from './lesson.ts';
export type CameraView='Livre'|'Frente'|'Lateral'|'Costas'|'Topo';
export function createStage(host:HTMLDivElement,getPlayer:()=>Player,onError:(message:string)=>void,onCameraInteraction?:()=>void){
 const theme=getComputedStyle(host),color=(token:string)=>theme.getPropertyValue(token).trim();
 const palette={background:color('--stage-bg'),mat:color('--stage-mat'),grid:color('--stage-grid'),line:color('--stage-line'),body:color('--rig-body'),active:color('--active'),support:color('--support'),target:color('--stage-target'),light:color('--stage-light'),groundLight:color('--stage-ground-light'),floorTint:color('--stage-floor-tint'),rim:color('--stage-rim'),trim:color('--stage-trim')};
 const scene=new THREE.Scene();scene.background=new THREE.Color(palette.background);
 scene.fog=new THREE.Fog(palette.background,9,20);
 const camera=new THREE.PerspectiveCamera(36,1,.05,60);camera.position.set(2.6,2.3,3.4);
 let renderer:THREE.WebGLRenderer|SVGRenderer;let compatible=false;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;}catch{renderer=new SVGRenderer();renderer.setQuality('high');renderer.setPrecision(3);renderer.overdraw=.75;compatible=true;}
 host.dataset.renderer=compatible?'svg':'webgl';
 renderer.domElement.setAttribute('aria-label','Instrutor 3D articulado no tatame. Arraste para girar e use a roda ou pinça para aproximar.');renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('tabindex','0');renderer.domElement.setAttribute('aria-keyshortcuts','ArrowLeft ArrowRight ArrowUp ArrowDown + - Home');renderer.domElement.setAttribute('aria-describedby','camera-help');host.appendChild(renderer.domElement);
 let dirty=true;const invalidate=()=>{dirty=true;};
 const controls=new OrbitControls(camera,renderer.domElement);controls.addEventListener('change',invalidate);controls.target.set(0,.91,-.8);controls.minDistance=2.5;controls.maxDistance=12;controls.maxPolarAngle=Math.PI*.49;controls.enableDamping=true;controls.enablePan=true;
 const ambient=compatible?new THREE.AmbientLight(0xffffff,.65):new THREE.HemisphereLight(0xffffff,palette.groundLight,2.2);scene.add(ambient);
 const light=new THREE.DirectionalLight(palette.light,compatible?.45:2.6);light.position.set(-3,7,4);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-5,right:5,top:5,bottom:-5});light.shadow.normalBias=.025;scene.add(light);
 if(!compatible){const rim=new THREE.DirectionalLight(palette.rim,1.2);rim.position.set(2,3,-4);scene.add(rim);}
 const surface=(color:string,roughness:number)=>compatible?new THREE.MeshLambertMaterial({color}):new THREE.MeshStandardMaterial({color,roughness});
 const materials={body:surface(palette.body,.73),active:surface(palette.active,.65),support:surface(palette.support,.65),mat:compatible?new THREE.MeshBasicMaterial({color:palette.mat}):new THREE.MeshStandardMaterial({color:palette.mat,roughness:1}),mark:new THREE.MeshBasicMaterial({color:palette.line,transparent:true,opacity:.42})};
 const geo={sphere:new THREE.SphereGeometry(1,compatible?20:32,compatible?16:24),segment:new THREE.CylinderGeometry(1,1,1,24),box:new THREE.BoxGeometry(1,1,1)};
 const mesh=(g:THREE.BufferGeometry,mat:THREE.Material|THREE.Material[])=>{const m=new THREE.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;};
 const mat=mesh(geo.box,materials.mat);mat.position.y=-.055;mat.scale.set(4.3,.1,6.6);mat.renderOrder=-100;
 const assetTextures:THREE.Texture[]=[];
 if(!compatible){
  const floor=new THREE.MeshStandardMaterial({color:palette.mat,roughness:.9});
  mat.material=[materials.mat,materials.mat,floor,materials.mat,materials.mat,materials.mat];
  const loader=new THREE.TextureLoader();
  const load=(name:string,apply:(texture:THREE.Texture)=>void)=>{
   const texture=loader.load(`${import.meta.env.BASE_URL}studio/${name}.webp`,()=>{
    if(disposed){texture.dispose();return;}
    apply(texture);floor.needsUpdate=true;invalidate();
   },undefined,()=>{/* Keep the plain, usable floor if an optional texture fails. */});
   texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(2.15,3.3);
   texture.anisotropy=Math.min(4,(renderer as THREE.WebGLRenderer).capabilities.getMaxAnisotropy());
   assetTextures.push(texture);
  };
  load('rubber-color',texture=>{texture.colorSpace=THREE.SRGBColorSpace;floor.map=texture;floor.color.set(palette.floorTint);host.dataset.material='rubber';});
  load('rubber-normal',texture=>{floor.normalMap=texture;floor.normalScale.set(.35,.35);});
 }
 // Low perimeter registration marks frame the training area without adding obstacles.
 const trimMaterial=new THREE.MeshBasicMaterial({color:palette.trim});
 for(const x of [-1,1])for(const z of [-1,1])for(const horizontal of [true,false]){
  const corner=mesh(geo.box,trimMaterial);corner.castShadow=false;
  corner.position.set(x*(horizontal?1.9:2.08),.002,z*(horizontal?3.22:3.04));
  corner.scale.set(horizontal?.38:.024,.012,horizontal?.024:.38);
 }
 const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo.box),new THREE.LineBasicMaterial({color:palette.line,transparent:true,opacity:.35}));edge.position.copy(mat.position);edge.scale.copy(mat.scale);scene.add(edge);
 const grid=new THREE.GridHelper(6,12,palette.grid,palette.grid);(grid.material as THREE.LineBasicMaterial).color.set(palette.grid);(grid.material as THREE.LineBasicMaterial).opacity=.28;(grid.material as THREE.LineBasicMaterial).transparent=true;grid.position.y=.006;grid.renderOrder=-90;grid.visible=compatible;scene.add(grid);
 const path=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,.012,-3),new THREE.Vector3(0,.012,3)]),new THREE.LineDashedMaterial({color:palette.line,dashSize:.07,gapSize:.09}));path.renderOrder=-80;path.computeLineDistances();scene.add(path);
 const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,1),new THREE.Vector3(0,.04,0),.7,palette.target,.16,.12);scene.add(arrow);
 const supportArrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,1),new THREE.Vector3(),.4,palette.support,.12,.10);scene.add(supportArrow);
 const labelTextures:THREE.Texture[]=[];
 for(const [text,z] of [['LESTE',3.0],['OESTE',-3.0]] as [string,number][]){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const ctx=canvas.getContext('2d')!;ctx.fillStyle=palette.line;ctx.font='500 30px sans-serif';ctx.textAlign='center';ctx.fillText(text,128,42);
  if(compatible){const textNode=document.createElementNS('http://www.w3.org/2000/svg','text');textNode.textContent=text;textNode.setAttribute('fill',palette.line);textNode.setAttribute('font-size','10');textNode.setAttribute('text-anchor','middle');const label=new SVGObject(textNode);label.position.set(0,.02,z);scene.add(label);continue;}
  const texture=new THREE.CanvasTexture(canvas);labelTextures.push(texture);const label=new THREE.Mesh(new THREE.PlaneGeometry(.7,.175),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));label.rotation.x=-Math.PI/2;label.position.set(0,.022,z);scene.add(label);
 }
 const trajectory=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineDashedMaterial({color:palette.active,transparent:true,opacity:.75,dashSize:compatible?5:.045,gapSize:compatible?3:.025}));
 const trajectoryDot=mesh(geo.sphere,new THREE.MeshBasicMaterial({color:palette.active}));trajectoryDot.scale.setScalar(.025);trajectoryDot.castShadow=false;
 trajectory.visible=trajectoryDot.visible=false;scene.add(trajectory);
 let trajectoryEnabled=false,trajectoryIndex=-1;
 const parts:Record<string,THREE.Mesh>={};
 for(const name of ['head','neck','chest','hips'])parts[name]=mesh(name==='head'||name==='neck'?geo.sphere:geo.box,materials.body);
 for(const s of ['L','R'])for(const n of ['shoulder','elbow','wrist','hip','knee','ankle','clavicle','upperArm','forearm','thigh','shin','hand','foot','marker'])parts[s+n]=mesh(['shoulder','elbow','wrist','hip','knee','ankle'].includes(n)?geo.sphere:['clavicle','upperArm','forearm','thigh','shin'].includes(n)?geo.segment:geo.box,n==='marker'?materials.mark:materials.body);
 // Separate overlapping torso faces by 2.5 mm; preserve all bone anchors.
 for(const part of Object.values(parts))part.receiveShadow=false;
 const set=(name:string,pos:V3,size:V3,yaw=0)=>{const m=parts[name];m.position.set(...pos);m.scale.set(...size);m.rotation.set(0,yaw,0);};
 const link=(name:string,a:V3,b:V3,radius:number)=>{const m=parts[name];m.position.set(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5);const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));m.scale.set(radius,d.length(),radius);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());};
 let lastRoot:V3=[...sample(0,0).root];
 function draw(){
  const state=getPlayer(),p=sample(state.index,state.time/duration),bodyYaw=p.yaw+p.twist;
  const travel=new THREE.Vector3(...p.root).sub(new THREE.Vector3(...lastRoot));camera.position.add(travel);controls.target.add(travel);lastRoot=[...p.root];
  const at=(v:V3,yaw?:number)=>yaw===undefined?upperPoint(p,v):add(p.root,rotate(v,yaw));
  set('hips',at(rigShape.pelvis.center,p.yaw),rigShape.pelvis.half.map(v=>v*2) as V3,p.yaw);
  set('chest',at(rigShape.chest.center),rigShape.chest.half.map(v=>v*2) as V3,bodyYaw);
  set('neck',at([0,.61,0]),[.08,.10,.08],bodyYaw);set('head',at([0,.77,0]),[.14,.18,.14],bodyYaw);
  for(const name of ['chest','neck','head'])parts[name].rotation.set(p.lean[0],bodyYaw,p.lean[2],'YXZ');
  const movement=lesson.movements[state.index],rig=resolveRig(p,movement.plan);
  trajectory.visible=trajectoryDot.visible=trajectoryEnabled;
  if(trajectoryEnabled){
   const side=movement.side,kick=movement.plan.motion.kind!=='arm';
   if(trajectoryIndex!==state.index){
    const points=Array.from({length:121},(_,n)=>{
     const pose=sample(state.index,n/120),r=resolveRig(pose,movement.plan)[side];
     return new THREE.Vector3(...(kick?r.leg.end:r.arm.end));
    });
    trajectory.geometry.dispose();trajectory.geometry=new THREE.BufferGeometry().setFromPoints(points);trajectory.computeLineDistances();trajectoryIndex=state.index;host.dataset.trajectoryMovement=String(movement.id);
   }
   trajectoryDot.position.set(...(kick?rig[side].leg.end:rig[side].arm.end));
  }
  for(const side of ['L','R'] as Side[]){
   const movement=lesson.movements[state.index],kick=movement.technique.includes('Kick');
   for(const limb of ['shoulder','upperArm','elbow','forearm','wrist','hand','hip','thigh','knee','shin','ankle','foot'])parts[side+limb].material=side===movement.side&&(kick?['hip','thigh','knee','shin','ankle','foot'].includes(limb):['shoulder','upperArm','elbow','forearm','wrist','hand'].includes(limb))?materials.active:materials.body;
   const sign=side==='L'?-1:1,{shoulder,hip,leg,arm}=rig[side];
   link(side+'clavicle',at([sign*.19,.52,0]),shoulder,.07);
   for(const [name,pos,r] of [['shoulder',shoulder,rigRadii.shoulder],['elbow',arm.joint,rigRadii.elbow],['wrist',arm.end,rigRadii.wrist],['hip',hip,rigRadii.hip],['knee',leg.joint,rigRadii.knee],['ankle',leg.end,rigRadii.ankle]] as [string,V3,number][])set(side+name,pos,[r,r,r]);
   link(side+'upperArm',shoulder,arm.joint,rigRadii.upperArm);link(side+'forearm',arm.joint,arm.end,rigRadii.forearm);link(side+'thigh',hip,leg.joint,rigRadii.thigh);link(side+'shin',leg.joint,leg.end,rigRadii.shin);
   const hand=parts[side+'hand'];hand.position.set(...arm.end);hand.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...arm.end).sub(new THREE.Vector3(...arm.joint)).normalize());hand.rotateY(p.open[side]*Math.PI/2);hand.scale.set(...handSize(p.open[side]));
   const f=p.feet[side],footPos=footCenter({...f,position:leg.end});set(side+'foot',footPos,footSize,f.yaw);parts[side+'foot'].rotateX(f.pitch);
   if(kick&&movement.plan.roles.supportFoot===side){parts[side+'foot'].material=materials.support;parts[side+'ankle'].material=materials.support;}
   const plant=plantarCenter(f);set(side+'marker',[plant[0],.016,plant[2]],[.19,.012,.34],f.yaw);parts[side+'marker'].renderOrder=-60;parts[side+'marker'].visible=plant[1]<.02;

  }
  arrow.position.set(p.root[0]+.6,.04,p.root[2]);arrow.setDirection(new THREE.Vector3(0,0,lesson.movements[state.index].direction==='Leste'?1:-1));
  const support=lesson.movements[state.index].plan.roles.supportFoot;supportArrow.visible=support!=='both';if(support!=='both'){const f=p.feet[support],plant=plantarCenter(f);supportArrow.position.set(plant[0],.035,plant[2]);supportArrow.setDirection(new THREE.Vector3(...rotate([0,0,1],f.yaw)));}
  controls.update();renderer.render(scene,camera);
  // Screen-space bounds let browser QA detect HUD occlusion of the actual rig.
  const bounds={left:Infinity,top:Infinity,right:-Infinity,bottom:-Infinity};
  for(const [name,part] of Object.entries(parts)){
   if(name.endsWith('marker'))continue;
   const box=new THREE.Box3().setFromObject(part);
   for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
    const q=new THREE.Vector3(x,y,z).project(camera),sx=(q.x+1)*host.clientWidth/2,sy=(1-q.y)*host.clientHeight/2;
    bounds.left=Math.min(bounds.left,sx);bounds.right=Math.max(bounds.right,sx);bounds.top=Math.min(bounds.top,sy);bounds.bottom=Math.max(bounds.bottom,sy);
   }
  }
  host.dataset.bodyBounds=JSON.stringify(bounds);
 }
 let frame=0,disposed=false,last=0;
 let topInset=0,bottomInset=0;
 let lastIndex=-1,lastTime=-1;
 // Static poses render on demand. Orbit damping, playback and resize still invalidate.
 const render=(now=0)=>{if(disposed)return;try{
  if(now-last>=(compatible?50:1000/30)){
   controls.update();const state=getPlayer();
   if(dirty||state.index!==lastIndex||state.time!==lastTime){draw();dirty=false;lastIndex=state.index;lastTime=state.time;}
   last=now;
  }
  frame=requestAnimationFrame(render);
 }catch{onError('A renderização 3D foi interrompida.');}};
 function projection(){
  dirty=true;
  const {width,height}=host.getBoundingClientRect();if(!width||!height)return;
  const available=Math.max(80,height-topInset-bottomInset);
  // Keep the full-size viewport; shift its optical center into the free HUD area.
  camera.fov=Math.max(36,Math.min(135,THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(18))*height/available*.72))));
  const center=topInset+available/2;
  camera.setViewOffset(width,height,0,height/2-center,width,height);
  renderer.setSize(width,height);
 }
 const resize=new ResizeObserver(projection);resize.observe(host);
 const lost=(e:Event)=>{e.preventDefault();onError('O contexto 3D está indisponível. Recarregue a página para tentar novamente.');};renderer.domElement.addEventListener('webglcontextlost',lost);
 render();
 function preset(view:CameraView){const s=getPlayer(),p=sample(s.index,s.time/duration);controls.target.set(...p.root);lastRoot=[...p.root];const yaw=p.yaw;const pos:V3=view==='Topo'?[0,5.2,.001]:rotate(view==='Costas'?[0,1.2,-4.6]:view==='Lateral'?[4.6,1.2,0]:view==='Livre'?[2.6,1.4,4.2]:[0,1.2,4.6],yaw);camera.position.set(...add(p.root,pos));controls.update();draw();}
 const manualCamera=()=>onCameraInteraction?.();
 controls.addEventListener('start',manualCamera);
 const keyboardCamera=(event:Event)=>{
  const e=event as KeyboardEvent;
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','_','Home'].includes(e.key))return;
  e.preventDefault();e.stopPropagation();manualCamera();
  if(e.key==='Home'){preset('Livre');return;}
  const orbit=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  if(e.key==='ArrowLeft')orbit.theta-=.12;
  if(e.key==='ArrowRight')orbit.theta+=.12;
  if(e.key==='ArrowUp')orbit.phi=Math.max(.04,orbit.phi-.12);
  if(e.key==='ArrowDown')orbit.phi=Math.min(controls.maxPolarAngle,orbit.phi+.12);
  if(['+','='].includes(e.key))orbit.radius=Math.max(controls.minDistance,orbit.radius*.9);
  if(['-','_'].includes(e.key))orbit.radius=Math.min(controls.maxDistance,orbit.radius/ .9);
  camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(orbit));controls.update();draw();
 };
 renderer.domElement.addEventListener('keydown',keyboardCamera);
 return {compatible,preset,setTrajectory(enabled:boolean){trajectoryEnabled=enabled;host.dataset.trajectory=enabled?'on':'off';invalidate();},setFraming(top:number,bottom:number){topInset=Math.max(0,top);bottomInset=Math.max(0,bottom);projection();draw();},dispose(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();controls.removeEventListener('start',manualCamera);controls.removeEventListener('change',invalidate);controls.dispose();renderer.domElement.removeEventListener('keydown',keyboardCamera);renderer.domElement.removeEventListener('webglcontextlost',lost);scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});labelTextures.forEach(t=>t.dispose());assetTextures.forEach(t=>t.dispose());if(renderer instanceof THREE.WebGLRenderer)renderer.dispose();renderer.domElement.remove();}};
}
