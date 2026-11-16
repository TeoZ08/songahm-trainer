export type Mode = 'Aprender' | 'Praticar' | 'Revisar';
export interface Player { index:number; time:number; playing:boolean; mode:Mode; speed:number; finished:boolean; }
export const duration = 3.2;
export const initial:Player = {index:0,time:0,playing:false,mode:'Aprender',speed:0.5,finished:false};
export type Action = {type:'tick';delta:number} | {type:'toggle'|'restart'|'repeat'} | {type:'seek';index:number} | {type:'mode';mode:Mode} | {type:'speed';speed:number};
export function update(s:Player,a:Action,count=18):Player {
  switch(a.type){
    case 'restart': return {...s,index:0,time:0,playing:false,finished:false};
    case 'seek': return {...s,index:Math.max(0,Math.min(count-1,a.index)),time:0,playing:false,finished:false};
    case 'repeat': return {...s,time:0,playing:true,finished:false};
    case 'mode': return {...s,mode:a.mode};
    case 'speed': return [0.25,0.5,0.75,1].includes(a.speed)?{...s,speed:a.speed}:s;
    case 'toggle':
      if(s.time>=duration){if(s.index===count-1)return {...s,index:0,time:0,playing:true,finished:false};return {...s,index:s.index+1,time:0,playing:true,finished:false};}
      return {...s,playing:!s.playing};
    case 'tick': {
      if(!s.playing||!Number.isFinite(a.delta)||a.delta<=0)return s;
      let time=s.time+a.delta*s.speed,index=s.index;
      if(time>=duration){
        if(s.mode!=='Revisar')return {...s,time:duration,playing:false,finished:index===count-1};
        while(time>=duration){if(index===count-1)return {...s,time:duration,index,playing:false,finished:true};time-=duration;index++;}
      }
      return {...s,time,index};
    }
  }
}
