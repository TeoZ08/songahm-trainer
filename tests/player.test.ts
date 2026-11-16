import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,update,duration,type Mode} from '../src/player.ts';
test('Aprender e Praticar param em cada movimento; continuar avança',()=>{for(const mode of ['Aprender','Praticar'] as Mode[]){const s=update({...initial,mode,playing:true,awaitingPreparation:false},{type:'tick',delta:20});assert.equal(s.index,0);assert.equal(s.time,duration);assert.equal(s.playing,false);const next=update(s,{type:'toggle'});assert.equal(next.index,1);assert.equal(next.time,0);assert.equal(next.playing,mode!=='Aprender');assert.equal(next.awaitingPreparation,mode==='Aprender');}});
test('Revisar consome excedente e termina na última técnica',()=>{const s=update({...initial,mode:'Revisar',speed:1,playing:true,awaitingPreparation:false},{type:'tick',delta:7});assert.equal(s.index,2);assert.ok(Math.abs(s.time-.6)<1e-8);const end=update(s,{type:'tick',delta:100});assert.equal(end.index,17);assert.equal(end.finished,true);assert.equal(end.playing,false);assert.equal(update(end,{type:'toggle'}).index,0);});
test('pausa e mudanças de modo/velocidade preservam a posição',()=>{let s=update({...initial,playing:true,awaitingPreparation:false},{type:'tick',delta:2});assert.equal(s.time,1);s=update(s,{type:'toggle'});assert.deepEqual(update(s,{type:'tick',delta:10}),s);s=update(s,{type:'mode',mode:'Revisar'});s=update(s,{type:'speed',speed:.25});assert.equal(s.time,1);assert.equal(s.playing,false);s=update(s,{type:'toggle'});assert.equal(update(s,{type:'tick',delta:2}).time,1.5);});
test('seek limita índices, repetir e reiniciar funcionam',()=>{const s=update({...initial,playing:true,awaitingPreparation:false,time:1},{type:'seek',index:99});assert.equal(s.index,17);assert.equal(s.playing,false);assert.equal(s.time,0);assert.equal(update(s,{type:'seek',index:-5}).index,0);assert.equal(update(s,{type:'repeat'}).playing,false);assert.equal(update(s,{type:'repeat'}).awaitingPreparation,true);assert.equal(update(s,{type:'restart'}).index,0);});
test('deltas inválidos e velocidades não permitidas são ignorados',()=>{for(const delta of [NaN,-1,Infinity])assert.deepEqual(update({...initial,playing:true,awaitingPreparation:false},{type:'tick',delta}),{...initial,playing:true,awaitingPreparation:false});assert.deepEqual(update(initial,{type:'speed',speed:9}),initial);});

test('inspeção de fases pausa e limita o instante sem mudar a técnica',()=>{const s={...initial,index:2,playing:true,awaitingPreparation:false};const p=update(s,{type:'scrub',time:1.8});assert.equal(p.index,2);assert.equal(p.time,1.8);assert.equal(p.playing,false);assert.equal(update(s,{type:'scrub',time:-1}).time,0);assert.equal(update(s,{type:'scrub',time:99}).time,duration);assert.equal(update({...s,index:17},{type:'scrub',time:duration}).finished,true);assert.deepEqual(update(s,{type:'scrub',time:NaN}),s);});

test('Aprender aguarda leitura antes de cada demonstração, inclusive ao repetir e navegar',()=>{
 for(let index=0;index<18;index++){
  let s=update(initial,{type:'seek',index});assert.equal(s.awaitingPreparation,true);
  assert.deepEqual(update(s,{type:'tick',delta:90}),s);
  s=update(s,{type:'toggle'});assert.equal(s.playing,true);assert.equal(s.awaitingPreparation,false);
  s=update(s,{type:'tick',delta:90});assert.equal(s.time,duration);assert.equal(s.playing,false);
  s=update(s,{type:'toggle'});assert.equal(s.index,(index+1)%18);assert.equal(s.awaitingPreparation,true);assert.equal(s.playing,false);
 }
});
test('trocar para Aprender pausa; Praticar e Revisar não criam preparação',()=>{
 for(const mode of ['Praticar','Revisar'] as Mode[]){
  const s=update({...initial,playing:true,awaitingPreparation:false,time:1},{type:'mode',mode});
  assert.equal(s.playing,true);assert.equal(s.awaitingPreparation,false);
  const learn=update(s,{type:'mode',mode:'Aprender'});assert.equal(learn.time,1);assert.equal(learn.playing,false);assert.equal(learn.awaitingPreparation,true);
 }
});
