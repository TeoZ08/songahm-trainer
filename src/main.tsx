import React, { useEffect, useReducer, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { lesson, sideName, sources } from './lesson.ts';
import { duration, initial, update, type Action, type Mode } from './player.ts';
import { createStage, type CameraView } from './stage.ts';
import {phaseAt,sideWord} from './movement-spec.ts';
import {Icon} from './icons.tsx';
import './style.css';

function App() {
  const [player, dispatch] = useReducer((s: typeof initial, a: Action) => update(s, a), initial);
  const [view, setView] = useState<CameraView>('Livre');
  const [compatible, setCompatible] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(false);
  const [hud, setHud] = useState(true);
  const [timeline, setTimeline] = useState(true);
  const [cameraTools,setCameraTools]=useState(()=>!matchMedia('(max-width: 640px), (max-height: 600px)').matches);
  const [showSources, setShowSources] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const live = useRef(player);
  const stage = useRef<ReturnType<typeof createStage> | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const showHud = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  live.current = player;
  const m = lesson.movements[player.index];
  const status = player.finished ? 'Aula concluída' : player.awaitingPreparation ? 'Leia a preparação' : player.playing ? 'Demonstrando' : player.time >= duration ? 'Movimento concluído' : player.time > 0 ? 'Pausado' : 'Pronto para começar';
  const progress = player.time / duration;
  const phase = phaseAt(m.plan,progress).label;
  const modes: Record<Mode, string> = {
    Aprender: 'Demonstração lenta, um movimento por vez. Continue quando estiver pronto.',
    Praticar: 'Faça junto. A demonstração espera por você entre os movimentos.',
    Revisar: 'Execução contínua dos 18 movimentos. Pause quando precisar.',
  };

  useEffect(() => {
    let frame = 0, last = 0;
    const tick = (now: number) => {
      if (last) dispatch({ type: 'tick', delta: Math.min((now - last) / 1000, .1) });
      last = now; frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!host.current) return;
    try {
      stage.current = createStage(host.current, () => live.current, setError, () => setView('Livre'));
      setCompatible(stage.current.compatible);
    } catch {
      setError('Não foi possível iniciar o 3D. Tente outro navegador; as instruções continuam disponíveis.');
    }
    return () => stage.current?.dispose();
  }, []);
  useEffect(()=>{
    const root=host.current?.parentElement;if(!root)return;
    const adapt=()=>{
      const bounds=root.getBoundingClientRect();
      const header=root.querySelector('.topbar')?.getBoundingClientRect();
      root.style.setProperty('--header-bottom',`${header?header.bottom-bounds.top:0}px`);
      const movement=root.querySelector('.movement-hud')?.getBoundingClientRect();
      const controls=root.querySelector('.timeline')?.getBoundingClientRect();
      const top=hud?Math.max(header?.bottom??0,bounds.width<640?movement?.bottom??0:0)-bounds.top+12:0;
      const bottom=hud&&controls?bounds.bottom-controls.top+12:0;
      root.style.setProperty('--controls-top',`${controls?controls.top-bounds.top:bounds.height}px`);
      stage.current?.setFraming(top,bottom);
    };
    const resize=new ResizeObserver(adapt);resize.observe(root);
    for(const element of root.querySelectorAll('.topbar,.movement-hud,.timeline'))resize.observe(element);
    window.addEventListener('resize',adapt);window.visualViewport?.addEventListener('resize',adapt);
    adapt();return()=>{resize.disconnect();window.removeEventListener('resize',adapt);window.visualViewport?.removeEventListener('resize',adapt);};
  },[hud,timeline]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !dialog.current?.open) { setInfo(false); setHud(true); return; }
      if (e.target instanceof HTMLElement && ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'].includes(e.target.tagName)) return;
      if (dialog.current?.open) return;
      if (e.code === 'Space') { e.preventDefault(); dispatch({ type: 'toggle' }); }
      if (e.code === 'ArrowRight') { e.preventDefault(); dispatch({ type: 'seek', index: live.current.index + 1 }); }
      if (e.code === 'ArrowLeft') { e.preventDefault(); dispatch({ type: 'seek', index: live.current.index - 1 }); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  useEffect(() => {
    if (showSources) dialog.current?.showModal(); else dialog.current?.close();
  }, [showSources]);
  useEffect(() => { if (!hud) showHud.current?.focus(); }, [hud]);
  useEffect(()=>{const compact=matchMedia('(max-width: 640px), (max-height: 600px)');const adapt=()=>{if(compact.matches)setCameraTools(false);};compact.addEventListener('change',adapt);return()=>compact.removeEventListener('change',adapt);},[]);
  useEffect(() => {
    const shortViewport=matchMedia('(max-height: 600px), (max-width: 640px)');
    let compact=shortViewport.matches,landscape=innerWidth>innerHeight;
    if(compact)setTimeline(false);
    const adapt=()=>{
      const nextCompact=shortViewport.matches,nextLandscape=innerWidth>innerHeight;
      if(nextCompact&&(!compact||nextLandscape!==landscape))setTimeline(false);
      compact=nextCompact;landscape=nextLandscape;
    };
    shortViewport.addEventListener('change',adapt);window.addEventListener('resize',adapt);
    return()=>{shortViewport.removeEventListener('change',adapt);window.removeEventListener('resize',adapt);};
  }, []);
  useEffect(() => {
    list.current?.querySelector('[aria-current="step"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [player.index]);
  function camera(v: CameraView) { setView(v); stage.current?.preset(v); }

  return <main className="studio" aria-label="Songahm Trainer · estúdio de treino" data-hud={hud ? 'on' : 'off'} data-info={info ? 'on' : 'off'}>
    <div className="stage" ref={host} />
    <span id="camera-help" className="sr-only">Palco 3D: Tab para focar. Setas giram a câmera; mais e menos dão zoom; Home restaura; Tab sai do palco. Espaço reproduz ou pausa.</span>
    {error && <div className="stage-error" role="alert">{error}</div>}
    {!hud && <button className="restore-hud glass" ref={showHud} onClick={() => setHud(true)}><Icon name="eye"/>Mostrar controles <kbd>Esc</kbd></button>}
    {hud && <>
      <header className="topbar glass">
        <div className="brand"><img className="master-logo" src={`${import.meta.env.BASE_URL}brand/master-240.png`} srcSet={`${import.meta.env.BASE_URL}brand/master-480.png 2x`} alt="MASTER · Escolas de Artes Marciais" width="80" height="72" /><span className="brand-divider"/><div className="brand-copy"><small>ESTÚDIO DE TREINO</small><strong>Songahm Trainer</strong></div></div>
        <nav className="modes" aria-label="Modo de treino">
          {(['Aprender', 'Praticar', 'Revisar'] as Mode[]).map(mode => <button key={mode} aria-pressed={player.mode === mode} title={modes[mode]} onClick={() => dispatch({ type: 'mode', mode })}>{mode}</button>)}
        </nav>
        <div className="top-tools"><button aria-label="Instruções" aria-expanded={info} aria-controls="instructions" onClick={() => setInfo(!info)}><Icon name="info"/><span>Instruções</span></button><button aria-label="Ocultar controles" title="Ocultar controles; Esc restaura" onClick={() => setHud(false)}><Icon name="hide"/></button></div>
      </header>

      <section className="movement-hud glass" aria-label="Movimento atual" aria-live="polite" aria-atomic="true">
        <div className="step-header"><span className="eyebrow">SONGAHM 1<span>FAIXA BRANCA</span></span><span className="step-index"><b>{String(m.id).padStart(2, '0')}</b><small> / 18</small></span></div>
        <h1>{m.title}</h1><div className="movement-progress" aria-hidden="true"><span style={{width:`${progress*100}%`}}/></div>
        <p>{sideName(m.side)} · {m.stance} · {m.direction}</p>
        {m.plan.roles.supportFoot!=='both'&&<p className="support-cue">Apoio {sideWord(m.plan.roles.supportFoot)} · pé {sideWord(m.side)} golpeia</p>}
        <div className="phase"><i className={player.playing ? 'live-dot playing' : 'live-dot'} /><span>{status}</span><span>{compatible ? '3D compatível' : '3D'}</span></div>
      </section>

      <nav className="camera-bar glass" aria-label="Câmera" data-expanded={cameraTools}>
        <button className="camera-toggle" aria-expanded={cameraTools} aria-controls="camera-presets" onClick={()=>setCameraTools(!cameraTools)}><Icon name="camera"/><span>Câmera</span><Icon name={cameraTools?'up':'down'}/></button>
        {cameraTools&&<div className="camera-presets" id="camera-presets">
        {(['Livre', 'Frente', 'Lateral', 'Costas', 'Topo'] as CameraView[]).map(v => <button key={v} aria-pressed={view === v} onClick={() => camera(v)}>{v}</button>)}
        <button onClick={() => camera('Livre')} aria-label="Restaurar câmera" title="Restaurar câmera"><Icon name="restart"/></button></div>}
      </nav>
      <div className="stage-legend" aria-label="Legenda do instrutor"><span><i className="active-swatch"/>Membro ativo</span><span><i className="support-swatch"/>Pé de apoio</span></div><span className="orbit-hint">Arraste para orbitar · pinça para zoom · Tab para câmera</span>

      {info && <aside className="info-panel glass" id="instructions" aria-label="Instruções do movimento">
        <div className="panel-title"><h2>Estudar a técnica</h2><button onClick={() => setInfo(false)} aria-label="Fechar instruções"><Icon name="close"/></button></div>
        <p className="mode-help">{modes[player.mode]}</p>
        <dl><div><dt>Lado ativo</dt><dd>{sideName(m.side)}</dd></div><div><dt>Base</dt><dd>{m.stance}</dd></div><div><dt>Direção / altura</dt><dd>{m.direction} · {m.height}</dd></div><div><dt>Passo e giro</dt><dd>{m.turn}</dd></div></dl>
        <p>{m.plan.instruction.support}</p><p>{m.plan.instruction.body}</p><p>{m.plan.instruction.trajectory}</p><p>{m.plan.instruction.hands}</p>
        <ol className="phase-list">{m.plan.motion.phases.map(p=><li key={p.at} aria-current={phase===p.label?'step':undefined}>{p.label}</li>)}</ol>
        <p className="eyebrow">OBSERVE</p><p className="attention">{m.plan.instruction.cues.join(' · ')}</p><p className="attention">{m.note}</p>
        <div className="validation"><strong>Sequência conferida</strong><p>{m.source} · movimento {m.id}.<br />{m.plan.instruction.uncertainty} Sem revisão marcial.</p><button className="text-button" onClick={() => setShowSources(true)}>Fontes e limites <Icon name="external"/></button></div>
        <p className="keyboard-help">Fora do palco: ← → navegam. No palco: setas giram, +/− dão zoom e Home restaura. Espaço pausa.</p>
      </aside>}

      <section className="timeline glass" aria-label="Controles de treino" data-collapsed={!timeline}>
        {player.mode==='Aprender'&&player.awaitingPreparation&&<details className="preparation" open key={m.id}>
          <summary><span className="prep-kicker">PREPARAÇÃO · {String(m.id).padStart(2,'0')} / 18</span><h2 className="preparation-title">{m.title}</h2><span className="prep-action">Leia antes de demonstrar</span></summary>
          <div><p><strong>{sideName(m.side)} · {m.plan.base.final} · alvo {m.direction.toLowerCase()}</strong></p>
          <p>{m.plan.instruction.support}</p><p>{m.plan.instruction.body} {m.plan.instruction.trajectory}</p><p>{m.plan.instruction.hands}</p></div>
        </details>}
        <div className="timeline-header"><span><b>{String(m.id).padStart(2, '0')}</b> / 18 <span className="phase-name">· {phase}</span></span><button onClick={() => setTimeline(!timeline)} aria-expanded={timeline} aria-controls="technique-timeline">{timeline ? 'Recolher timeline' : 'Expandir timeline'}<Icon name={timeline?'down':'up'}/></button></div>
        {timeline && <div id="technique-timeline">
          <div className="scrub"><label htmlFor="technique-time">Instante da técnica</label><input id="technique-time" type="range" min="0" max={duration} step="0.01" value={player.time} aria-valuetext={`${player.time.toFixed(2)} segundos; ${phase}`} onChange={e => dispatch({ type: 'scrub', time: Number(e.target.value) })} /><output>{player.time.toFixed(1)}s</output></div>
          <div className="step-list" ref={list} aria-label="Movimentos da forma">{lesson.movements.map((step, i) => <button key={step.id} aria-label={`Movimento ${step.id}: ${step.title}, ${sideName(step.side)}`} aria-current={player.index === i ? 'step' : undefined} title={`${step.title} · ${sideName(step.side)}`} onClick={() => dispatch({ type: 'seek', index: i })}><span>{String(step.id).padStart(2, '0')}</span><small>{step.side === 'L' ? 'E' : 'D'}</small></button>)}</div>
        </div>}
        <div className="transport">
          <div className="transport-main"><button aria-label="Reiniciar aula" title="Reiniciar aula" onClick={() => dispatch({ type: 'restart' })}><Icon name="restart"/></button><button disabled={player.index === 0} aria-label="Movimento anterior" onClick={() => dispatch({ type: 'seek', index: player.index - 1 })}><Icon name="previous"/></button><button className="play" onClick={() => dispatch({ type: 'toggle' })}><Icon name={player.playing?'pause':'play'}/><span>{player.awaitingPreparation ? 'Demonstrar' : player.playing ? 'Pausar' : player.time >= duration && !player.finished ? 'Continuar' : player.finished ? 'Rever aula' : 'Reproduzir'}</span></button><button disabled={player.index === 17} aria-label="Próximo movimento" onClick={() => dispatch({ type: 'seek', index: player.index + 1 })}><Icon name="next"/></button><button className="repeat" aria-label="Repetir técnica" title="Repetir técnica" onClick={() => dispatch({ type: 'repeat' })}><Icon name="repeat"/><span>Repetir técnica</span></button></div>
          <label className="speed"><span>Ritmo</span><select aria-label="Velocidade" value={player.speed} onChange={e => dispatch({ type: 'speed', speed: Number(e.target.value) })}>{[.25, .5, .75, 1].map(s => <option key={s} value={s}>{String(s).replace('.', ',')}×</option>)}</select></label>
          <button className="source-link" onClick={() => setShowSources(true)}>Fontes e limites <Icon name="external"/></button>
        </div>
      </section>
    </>}

    <dialog className="sources glass" ref={dialog} aria-labelledby="source-title" onClose={() => setShowSources(false)}>
      <div className="panel-title"><h2 id="source-title">Referências e limites</h2><button onClick={() => setShowSources(false)} aria-label="Fechar fontes"><Icon name="close"/></button></div>
      <div className="sources-brand"><img src={`${import.meta.env.BASE_URL}brand/master-240.png`} alt="MASTER" width="80" height="72"/><p>Projeto de treinamento independente, inspirado na identidade da MASTER. Sem afiliação, certificação ou endosso institucional.</p></div>
      <p>A ordem dos 18 movimentos, membros, bases, direções e alturas foi conferida nos documentos abaixo. Cada número da aula corresponde ao mesmo número nas fontes.</p>
      {sources.map(s => <p key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a><br /><small>{s.detail}</small></p>)}
      <p><strong>Execução visual aproximada.</strong> Preparação, ângulos, pivôs, passada #3, distribuição de peso e tempos exigem revisão de instrutor. O controle de instante ajuda a observar fases; não representa medição biomecânica.</p>
      <p>Chutes frontais terminam recolhidos e apoiam em 4/13. Nos laterais, a aterrissagem é compartilhada com a entrada de 8/17; o golpe de braço ocorre somente nesses movimentos. Retorno Bah Ro ainda não é animado. Produto independente, sem afiliação, certificação ou endosso da ATA.</p>
    </dialog>
  </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
