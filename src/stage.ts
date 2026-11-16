import * as THREE from 'three';
import { SVGRenderer, SVGObject } from 'three/addons/renderers/SVGRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { add, rotate, sample, solveIK, type V3 } from './motion.ts';
import { duration, type Player } from './player.ts';
import { lesson, type Side } from './lesson.ts';
export type CameraView='Livre'|'Frente'|'Lateral'|'Costas'|'Topo';
export function createStage(host:HTMLDivElement,getPlayer:()=>Player,onError:(message:string)=>void){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e9ebe4');
 const camera=new THREE.PerspectiveCamera(36,1,.05,60);camera.position.set(2.6,2.3,3.4);
 let renderer:THREE.WebGLRenderer|SVGRenderer;let compatible=false;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;}catch{renderer=new SVGRenderer();renderer.setQuality('high');renderer.setPrecision(3);compatible=true;}
 host.dataset.renderer=compatible?'svg':'webgl';
 renderer.domElement.setAttribute('aria-label','Instrutor 3D articulado no tatame. Arraste para girar e use a roda ou pinça para aproximar.');renderer.domElement.setAttribute('role','img');host.appendChild(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.9,-.8);controls.minDistance=2.5;controls.maxDistance=12;controls.maxPolarAngle=Math.PI*.49;controls.enableDamping=true;controls.enablePan=true;
 const ambient=compatible?new THREE.AmbientLight(0xffffff,.8):new THREE.HemisphereLight(0xffffff,0x7c897d,2.6);scene.add(ambient);
 const light=new THREE.DirectionalLight(0xfff7e9,compatible?.55:3.2);light.position.set(-3,7,4);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-5,right:5,top:5,bottom:-5});light.shadow.normalBias=.025;scene.add(light);
 const surface=(color:string,roughness:number)=>compatible?new THREE.MeshLambertMaterial({color}):new THREE.MeshStandardMaterial({color,roughness});
 const materials={body:surface('#394c45',.73),joint:surface('#9da99f',.65),active:surface('#57876b',.65),belt:surface('#f4f1e7',1),mat:compatible?new THREE.MeshBasicMaterial({color:'#d9ded2'}):new THREE.MeshStandardMaterial({color:'#d9ded2',roughness:1}),mark:new THREE.MeshBasicMaterial({color:'#8d9e8b',transparent:true,opacity:.42})};
 const geo={sphere:new THREE.SphereGeometry(1,compatible?10:16,compatible?8:12),segment:new THREE.CylinderGeometry(1,1,1,12),box:new THREE.BoxGeometry(1,1,1)};
 const mesh=(g:THREE.BufferGeometry,mat:THREE.Material)=>{const m=new THREE.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;};
 const mat=mesh(geo.box,materials.mat);mat.position.y=-.055;mat.scale.set(4.3,.1,6.6);mat.renderOrder=-100;
 const grid=new THREE.GridHelper(6,12,0xb8c2b3,0xc7cfbf);(grid.material as THREE.LineBasicMaterial).color.set('#aab6a1');(grid.material as THREE.LineBasicMaterial).opacity=.45;(grid.material as THREE.LineBasicMaterial).transparent=true;grid.position.y=.006;grid.renderOrder=-90;scene.add(grid);
 const path=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,.012,-3),new THREE.Vector3(0,.012,3)]),new THREE.LineDashedMaterial({color:0x8c9e86,dashSize:.07,gapSize:.09}));path.renderOrder=-80;path.computeLineDistances();scene.add(path);
 const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,1),new THREE.Vector3(0,.04,0),.7,0x497355,.16,.12);scene.add(arrow);
 const labelTextures:THREE.Texture[]=[];
 for(const [text,z] of [['LESTE',3.0],['OESTE',-3.0]] as [string,number][]){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#52684d';ctx.font='500 30px sans-serif';ctx.textAlign='center';ctx.fillText(text,128,42);
  if(compatible){const textNode=document.createElementNS('http://www.w3.org/2000/svg','text');textNode.textContent=text;textNode.setAttribute('fill','#52684d');textNode.setAttribute('font-size','10');textNode.setAttribute('text-anchor','middle');const label=new SVGObject(textNode);label.position.set(0,.02,z);scene.add(label);continue;}
  const texture=new THREE.CanvasTexture(canvas);labelTextures.push(texture);const label=new THREE.Mesh(new THREE.PlaneGeometry(.7,.175),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));label.rotation.x=-Math.PI/2;label.position.set(0,.022,z);scene.add(label);
 }
 const parts:Record<string,THREE.Mesh>={};
 for(const name of ['head','neck','chest','hips','belt','face'])parts[name]=mesh(name==='head'||name==='neck'?geo.sphere:geo.box,name==='belt'?materials.belt:materials.body);
 parts.face.material=materials.belt;
 for(const s of ['L','R'])for(const n of ['shoulder','elbow','wrist','hip','knee','ankle','upperArm','forearm','thigh','shin','hand','foot','marker'])parts[s+n]=mesh(['shoulder','elbow','wrist','hip','knee','ankle'].includes(n)?geo.sphere:['upperArm','forearm','thigh','shin'].includes(n)?geo.segment:geo.box,n==='marker'?materials.mark:['shoulder','elbow','wrist','hip','knee','ankle'].includes(n)?materials.joint:materials.body);
 const set=(name:string,pos:V3,size:V3,yaw=0)=>{const m=parts[name];m.position.set(...pos);m.scale.set(...size);m.rotation.set(0,yaw,0);};
 const link=(name:string,a:V3,b:V3,radius:number)=>{const m=parts[name];m.position.set(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5);const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));m.scale.set(radius,d.length(),radius);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());};
 let lastRoot:V3=[...sample(0,0).root];
 function draw(){
  const state=getPlayer(),p=sample(state.index,state.time/duration),bodyYaw=p.yaw+p.twist;
  const travel=new THREE.Vector3(...p.root).sub(new THREE.Vector3(...lastRoot));camera.position.add(travel);controls.target.add(travel);lastRoot=[...p.root];
  const at=(v:V3,yaw=bodyYaw)=>add(p.root,rotate(v,yaw));
  set('hips',at([0,.02,0],p.yaw),[.34,.2,.24],p.yaw);
  set('chest',at([0,.32,0]),[.45,.48,.24],bodyYaw);set('belt',at([0,.11,0]),[.46,.048,.26],bodyYaw);
  set('neck',at([0,.61,0]),[.08,.10,.08],bodyYaw);set('head',at([0,.77,0]),[.14,.18,.14],bodyYaw);set('face',at([0,.78,.133]),[.13,.035,.02],bodyYaw);
  for(const side of ['L','R'] as Side[]){
   const movement=lesson.movements[state.index],kick=movement.technique.includes('Kick');
   for(const limb of ['upperArm','forearm','hand','thigh','shin','foot'])parts[side+limb].material=side===movement.side&&(kick?['thigh','shin','foot'].includes(limb):['upperArm','forearm','hand'].includes(limb))?materials.active:materials.body;
   const sign=side==='L'?-1:1,shoulder=at([sign*.27,.5,0]),hip=at([sign*.14,0,0],p.yaw),ankle=p.feet[side].position;
   const leg=solveIK(hip,ankle,rotate([0,0,1],p.yaw),.44,.44);
   const handTarget=at(p.hands[side]);const arm=solveIK(shoulder,handTarget,rotate([sign*.7,-.4,-.6],bodyYaw),.31,.30);
   for(const [name,pos,r] of [['shoulder',shoulder,.085],['elbow',arm.joint,.062],['wrist',arm.end,.045],['hip',hip,.085],['knee',leg.joint,.065],['ankle',leg.end,.049]] as [string,V3,number][])set(side+name,pos,[r,r,r]);
   link(side+'upperArm',shoulder,arm.joint,.073);link(side+'forearm',arm.joint,arm.end,.057);link(side+'thigh',hip,leg.joint,.09);link(side+'shin',leg.joint,leg.end,.065);
   const hand=parts[side+'hand'];hand.position.set(...arm.end);hand.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...arm.end).sub(new THREE.Vector3(...arm.joint)).normalize());hand.rotateY(p.open[side]*Math.PI/2);hand.scale.set(.085,.10+p.open[side]*.08,.075-p.open[side]*.045);
   const f=p.feet[side],footPos=add(leg.end,rotate([0,-.037,.065],f.yaw));set(side+'foot',footPos,[.14,.10,.29],f.yaw);parts[side+'foot'].rotateX(f.pitch);
   set(side+'marker',[f.position[0],.016,f.position[2]],[.19,.012,.34],f.yaw);parts[side+'marker'].renderOrder=-60;parts[side+'marker'].visible=f.position[1]<.12;
  }
  arrow.position.set(p.root[0]+.6,.04,p.root[2]);arrow.setDirection(new THREE.Vector3(0,0,lesson.movements[state.index].direction==='Leste'?1:-1));
  controls.update();renderer.render(scene,camera);
 }
 let frame=0,disposed=false,last=0;
 const render=(now=0)=>{if(disposed)return;try{if(!compatible||now-last>=50){draw();last=now;}frame=requestAnimationFrame(render);}catch{onError('A renderização 3D foi interrompida.');}};
 const resize=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();renderer.setSize(width,height);});resize.observe(host);
 const lost=(e:Event)=>{e.preventDefault();onError('O contexto 3D está indisponível. Recarregue a página para tentar novamente.');};renderer.domElement.addEventListener('webglcontextlost',lost);
 render();
 return {compatible,preset(view:CameraView){const s=getPlayer(),p=sample(s.index,s.time/duration);controls.target.set(p.root[0],p.root[1],p.root[2]);lastRoot=[...p.root];const yaw=p.yaw;const pos:V3=view==='Topo'?[0,5.2,.001]:rotate(view==='Costas'?[0,1.2,-4.6]:view==='Lateral'?[4.6,1.2,0]:view==='Livre'?[2.6,1.4,4.2]:[0,1.2,4.6],yaw);camera.position.set(...add(p.root,pos));controls.update();draw();},dispose(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();controls.dispose();renderer.domElement.removeEventListener('webglcontextlost',lost);scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});labelTextures.forEach(t=>t.dispose());if(renderer instanceof THREE.WebGLRenderer)renderer.dispose();renderer.domElement.remove();}};
}
