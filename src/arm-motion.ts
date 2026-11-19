import type {ArmKey,ArmMotion,MovementIdentity,V3} from './movement-spec.ts';

/** Qualitative choreography from Master T and Schafer's ATA; metres are rig adaptations. */
export function armMotion(m:MovementIdentity):ArmMotion {
 const sign=m.side==='L'?-1:1;
 const v=(x:number,y:number,z:number):V3=>[sign*x,y,z];
 const hip=v(.34,.12,.15),otherHip=v(-.34,.12,.15);
 const pole=v(1,-.2,.25),otherPole=v(-1,-.2,.25);
 const key=(at:number,label:string,active:V3,other:V3,open=0,roll=0,twist=0,elbow=pole):ArmKey=>({at,label,cue:label,active,other,open,roll:sign*roll,twist:sign*twist,pole:elbow,otherPole});
 const start=key(0,'Base de entrada',hip,otherHip);start.fromPrevious=true;
 let phases:ArmKey[];
 switch(m.technique){
  case 'high': phases=[start,
   key(.20,'Preparar a mão na cintura',hip,v(-.08,.98,.30)),
   key(.28,'Elevar à frente do tronco',v(.22,.28,.36),v(-.10,.80,.46)),
   key(.38,'Trocar os braços à frente',v(.02,.48,.38),v(-.10,.58,.53)),
   key(.72,'Elevar o antebraço sobre a testa',v(.08,.99,.30),otherHip,0,-.5),
   key(1,'Firmar a defesa alta',v(.08,.99,.30),otherHip,0,-.5),
  ];break;
  case 'low': phases=[start,
   key(.27,'Preparar junto à orelha oposta',v(-.12,.70,.34),v(-.22,.16,.51)),
   key(.48,'Varrer à frente do corpo',v(.10,.27,.45),v(-.34,.14,.21)),
   key(.73,'Defender abaixo da cintura',v(.34,-.18,.35),otherHip,0,.6),
   key(1,'Assentar a base e a defesa baixa',v(.34,-.18,.35),otherHip,0,.6),
  ];break;
  case 'inner': phases=[start,
   key(.14,'Trazer os braços à frente',v(.28,.26,.36),v(-.08,.55,.54)),
   key(.28,'Cruzar com o braço ativo por baixo',v(-.06,.32,.39),v(.04,.56,.53)),
   key(.40,'Recolher o braço oposto',v(.28,.47,.43),v(-.30,.52,.22)),
   key(.48,'Abrir o cotovelo durante o giro',v(.36,.44,.38),v(-.34,.16,.22)),
   key(.73,'Elevar o antebraço flexionado',v(.50,.70,.13),otherHip,0,.5),
   key(1,'Firmar a base média',v(.50,.70,.13),otherHip,0,.5),
  ];break;
  case 'knife': phases=[start,
   key(.30,'Preparar a mão aberta junto à orelha',v(-.08,.73,.34),v(-.22,.28,.51),1,-.5),
   key(.50,'Abrir em arco para o alvo',v(.42,.59,.37),v(-.34,.14,.22),1,.3),
   key(.76,'Golpear lateralmente em altura média',v(.90,.37,.08),otherHip,1,Math.PI/2),
   key(1,'Estabilizar a mão aberta e a base',v(.90,.37,.08),otherHip,1,Math.PI/2),
  ];break;
  default: {
   const height=m.height==='Alta'?.66:.30;
   // Centre-line target at a near-extended, still reachable arm length.
   const reach=.08+Math.sqrt(.604**2-(.33-.08)**2-(.54-height)**2);
   phases=[start,
    key(.18,'Apontar com a mão oposta',hip,v(-.20,height,.53),0,0,.04),
    key(.34,'Alinhar o punho com o centro',v(.29,height,.21),v(-.27,height*.7,.36),0,0,.02),
    key(.68,'Socar e recolher a mão oposta',v(.08,height,reach),otherHip,0,Math.PI/2,-.08),
    key(1,'Firmar o soco e a base',v(.08,height,reach),otherHip,0,Math.PI/2,-.08),
   ];
  }
 }
 if(m.technique==='knife')for(const k of phases)k.pole=k.at<=.3?v(1,1,1):v(.2,-1,1);
 return {kind:'arm',travelEnd:m.step==='hold'?1:.72,phases};
}
