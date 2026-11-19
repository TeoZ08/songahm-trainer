import { chromium, firefox } from 'playwright';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const watchdog = setTimeout(async () => { console.error('Browser test timed out'); setTimeout(()=>process.exit(1),2000);await browser.close();process.exit(1); }, 240000);
const chrome = process.env.BROWSER === 'chromium';
const browser = chrome
  ? await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] })
  : await firefox.launch({ headless: true,firefoxUserPrefs:process.env.RENDERER==='svg'?{'webgl.disabled':true}:{} });
let failed = false;
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const errors = [], failedRequests = [], consoleErrors = [];
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});
  page.on('pageerror', e => errors.push(e.message));
  page.on('requestfailed', r => failedRequests.push(r.url()));
  if (!process.env.TEST_URL) await page.route('http://songahm.local/**', async route => {
    try {
      const pathname = new URL(route.request().url()).pathname;
      const file = path.join(process.cwd(), 'dist', pathname === '/' ? 'index.html' : pathname);
      await route.fulfill({ body: await readFile(file), contentType: { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp' }[path.extname(file)] || 'application/octet-stream' });
    } catch { await route.fulfill({ status: 404, body: 'Not found' }); }
  });
  await page.goto(process.env.TEST_URL || 'http://songahm.local/');
  await page.getByRole('heading', { name: 'Defesa alta', exact: true }).waitFor();
  assert.equal(await page.getByRole('region',{name:'Movimento atual',includeHidden:true}).getAttribute('aria-live'),'polite');
  const surface = page.locator('.stage > canvas,.stage > svg');
  await surface.waitFor(); await page.waitForTimeout(200);
  assert.equal(await page.getByRole('alert').count(), 0);
  const renderer = await page.locator('.stage').getAttribute('data-renderer');
  assert.ok(['webgl', 'svg'].includes(renderer));
  if(process.env.RENDERER==='svg')assert.equal(renderer,'svg','Compatibility renderer must be exercised');
  if (chrome) assert.equal(renderer, 'webgl', 'Chrome must exercise WebGL');
  if (renderer === 'svg') assert.ok(await page.locator('.stage svg path').count() > 40);
  const folder = `artifacts/rev07-${renderer}`;
  await mkdir(folder, { recursive: true });
  const shot = name => page.screenshot({ path: `${folder}/${name}.png` });
  const current = () => page.locator('.step-list [aria-current="step"] span').innerText();
  const seek = index => page.getByRole('button', { name: `Movimento ${index}:`, exact: false }).click();
  const scrub = async fraction => {
    const input = page.getByRole('slider', { name: 'Instante da técnica' });
    const rect = await input.boundingBox();
    await input.click({ position: { x: 9 + (rect.width - 16) * fraction, y: rect.height / 2 } });
    assert.ok(Math.abs(Number(await input.inputValue()) / 3.2 - fraction) < .04);
    await page.waitForTimeout(60);
  };
  assert.ok(await page.locator('.master-logo').evaluate(img=>img.complete&&img.naturalWidth>0),'Authentic local logo loads');
  assert.equal(await page.locator('html').evaluate(el=>getComputedStyle(el).getPropertyValue('--master-red').trim()),'#e03841');
  const contrast=await page.locator('.preparation').evaluate(el=>{
    const luminance=color=>color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const ratio=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    const caption=getComputedStyle(el.querySelector('.prep-kicker')),panel=getComputedStyle(el);
    const selected=getComputedStyle(document.querySelector('.step-list [aria-current=step]'));
    return {caption:ratio(luminance(caption.color),luminance(panel.backgroundColor)),selection:ratio(luminance(selected.color),luminance(selected.backgroundColor))};
  });
  assert.ok(contrast.caption>=4.5&&contrast.selection>=4.5,'Brand captions and selected movement have AA contrast');
  if(renderer==='webgl')await page.locator('.stage[data-material=rubber]').waitFor();
  assert.equal(await page.getByRole('button',{name:'Trajetória',exact:true}).getAttribute('aria-pressed'),'false');
  await shot('desktop');
  await page.setViewportSize({width:1920,height:1080});await page.waitForTimeout(100);await shot('desktop-1920');
  await page.setViewportSize({width:1280,height:900});await page.waitForTimeout(100);
  const stageRect = await surface.boundingBox();
  assert.ok(stageRect.width >= 1279 && stageRect.height >= 899, 'Viewport fills window');
  const elapsed={};
  for(const speed of ['1','2']){
    await seek(1);await page.getByRole('combobox',{name:'Velocidade'}).selectOption(speed);
    await page.evaluate(()=>{
      const play=document.querySelector('.play');window.motionTiming={};
      play.addEventListener('click',()=>{window.motionTiming.start=performance.now();},{once:true});
      const observer=new MutationObserver(()=>{
        if(play.textContent.includes('Continuar')){window.motionTiming.end=performance.now();observer.disconnect();}
      });
      observer.observe(play,{childList:true,subtree:true,characterData:true});
    });
    await page.getByRole('button',{name:'Demonstrar',exact:true}).click();
    await page.getByRole('button',{name:'Continuar',exact:true}).waitFor({timeout:12000});
    elapsed[speed]=await page.evaluate(()=>window.motionTiming.end-window.motionTiming.start);
  }
  assert.ok(elapsed['2']/elapsed['1']>.35&&elapsed['2']/elapsed['1']<.70,'2× approximately halves wall-clock movement duration');
  await writeFile(`${folder}/timing.json`,JSON.stringify(elapsed));
  await seek(1);
  await page.clock.install();
  for (const speed of ['0.25', '0.5', '0.75', '1', '2']) await page.getByRole('combobox', { name: 'Velocidade' }).selectOption(speed);
  await page.getByRole('combobox',{name:'Velocidade'}).selectOption('1');
  await page.getByRole('button', { name: 'Demonstrar', exact: false }).click();
  await page.clock.runFor(800);
  await page.getByRole('button', { name: 'Pausar', exact: false }).click();
  const paused = await page.getByRole('slider').inputValue();
  await page.clock.runFor(300); assert.equal(await page.getByRole('slider').inputValue(), paused);
  await page.getByRole('button', { name: 'Instruções', exact: true }).click();
  await page.getByRole('complementary', { name: 'Instruções do movimento' }).waitFor();
  await page.getByRole('button', { name: 'Fechar instruções' }).click();

  // Replay an actual kick, including a mode/speed change during motion.
  await seek(3); await page.getByRole('button', { name: 'Repetir técnica' }).click();await page.getByRole('button',{name:'Demonstrar',exact:false}).click();
  await page.clock.runFor(700); await shot('front-moving-chamber');
  const beforeSpeed = Number(await page.getByRole('slider').inputValue());
  await page.getByRole('combobox', { name: 'Velocidade' }).selectOption('2');
  assert.ok(Number(await page.getByRole('slider').inputValue()) >= beforeSpeed);
  const speedStart=Number(await page.getByRole('slider').inputValue());await page.clock.runFor(100);
  assert.ok(Number(await page.getByRole('slider').inputValue())-speedStart>.15,'Changing to 2× during playback advances technique time twice as fast');
  await page.getByRole('combobox', { name: 'Velocidade' }).selectOption('1');
  await page.getByRole('button', { name: 'Praticar', exact: true }).click();
  await page.clock.runFor(2800);
  assert.equal(await current(), '03'); assert.match(await page.locator('.phase').innerText(), /Movimento concluído/);
  await page.getByRole('button', { name: 'Continuar', exact: false }).click(); assert.equal(await current(), '04');

  // Learning explicitly waits before both lateral demonstrations and the next movement.
  await page.getByRole('button',{name:'Aprender',exact:true}).click();
  for(const index of [7,16]){
    await seek(index);assert.equal(await page.locator('.preparation').count(),1);
    assert.match(await page.locator('.preparation').innerText(),index===7?/apoio esquerdo/:/apoio direito/);
    await page.clock.runFor(5000);assert.equal(Number(await page.getByRole('slider').inputValue()),0);
    await shot(`preparation-${index}`);
    await page.getByRole('button',{name:'Demonstrar',exact:false}).click();await page.clock.runFor(3400);
    await page.getByRole('button',{name:'Continuar',exact:false}).click();assert.equal(await current(),String(index+1).padStart(2,'0'));
    assert.equal(await page.locator('.preparation').count(),1);await page.clock.runFor(1000);assert.equal(Number(await page.getByRole('slider').inputValue()),0);
  }
  // Every movement renders through the learner's phase control, including both kick sides.
  for (let index = 1; index <= 18; index++) {
    await seek(index); await scrub(.75); assert.equal(await current(), String(index).padStart(2, '0'));
    if ([3, 7, 12, 16].includes(index)) for (const phase of ([7,16].includes(index)?[.05,.34,.655,.83,1]:[.05,.25,.56,.80,1])) {
      await scrub(phase); await shot(`movement-${index}-phase-${phase}`);
    }
    if ([1, 6, 8, 10, 15, 17].includes(index)) { await scrub(1); await shot(`arm-${index}`); }
  }
  for(const landing of [4,8,13,17]){await seek(landing);await scrub(.75);await shot(`landing-${landing}`);}
  for(const index of [7,16])for(const camera of ['Lateral','Frente','Costas','Topo']){
    await seek(index);await page.getByRole('button',{name:camera,exact:true}).click();
    for(const t of [.22,.40,.475,.52,.66,.80,.96]){await scrub(t);await shot(`lateral-${index}-${camera}-${t}`);}
  }
  await seek(7);await scrub(.475);
  const withoutPath=await surface.screenshot();
  await page.getByRole('button',{name:'Trajetória',exact:true}).click();await page.clock.runFor(100);
  assert.equal(await page.locator('.stage').getAttribute('data-trajectory'),'on');
  assert.equal(await page.locator('.stage').getAttribute('data-trajectory-movement'),'7');
  assert.ok(!withoutPath.equals(await surface.screenshot()),'Trajectory adds visible geometry');
  if(renderer==='svg')assert.ok(await surface.locator('path').evaluateAll(paths=>paths.some(p=>p.getAttribute('style')?.includes('stroke-dasharray:5,3'))),'SVG uses pixel-sized dashes');
  await shot('trajectory-chamber');
  await seek(16);await scrub(.475);await page.clock.runFor(100);
  assert.equal(await page.locator('.stage').getAttribute('data-trajectory-movement'),'16','Path updates with the selected movement');
  await page.getByRole('button',{name:'Trajetória',exact:true}).click();await page.clock.runFor(100);
  assert.equal(await page.locator('.stage').getAttribute('data-trajectory'),'off');
  await seek(7); await scrub(.65);
  let image = await surface.screenshot();
  for (const name of ['Frente', 'Lateral', 'Costas', 'Topo', 'Restaurar câmera']) {
    await page.getByRole('button', { name, exact: true }).click();
    const next = await surface.screenshot(); assert.ok(!image.equals(next), `${name} changes projection`); image = next;
  }
  await page.getByRole('button', { name: 'Frente', exact: true }).click();
  await surface.focus(); image = await surface.screenshot(); const beforeArrow = await current();
  await page.keyboard.press('ArrowRight'); await page.clock.runFor(100);
  assert.ok(!image.equals(await surface.screenshot())); assert.equal(await current(), beforeArrow);
  assert.equal(await page.getByRole('button', { name: 'Livre', exact: true }).getAttribute('aria-pressed'), 'true');
  image = await surface.screenshot(); await page.keyboard.press('='); await page.clock.runFor(100);
  assert.ok(!image.equals(await surface.screenshot())); await page.keyboard.press('Home'); await page.keyboard.press('Tab');
  assert.equal(await surface.evaluate(el => el === document.activeElement), false);
  await page.getByRole('button', { name: 'Recolher timeline', exact: false }).click();
  assert.equal(await page.getByRole('slider').count(), 0);
  await page.getByRole('button', { name: 'Expandir timeline', exact: false }).click();
  await page.getByRole('button', { name: 'Ocultar controles' }).click();
  assert.equal(await page.locator('.timeline').count(), 0); await shot('clean-viewport');
  await page.keyboard.press('Escape'); await page.locator('.timeline').waitFor();
  await seek(17); await page.getByRole('button', { name: 'Revisar', exact: true }).click();await page.getByRole('combobox',{name:'Velocidade'}).selectOption('2');
  await page.getByRole('button', { name: 'Repetir técnica' }).click(); await page.clock.runFor(1700); assert.equal(await current(), '18');
  await page.clock.runFor(1700); assert.match(await page.locator('.phase').innerText(), /Aula concluída/);
  await page.getByRole('button', { name: 'Reiniciar aula', exact: true }).click(); assert.equal(await current(), '01');
  await surface.focus(); await page.keyboard.press('Tab');
  // Global navigation outside the stage and native controls.
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('ArrowRight'); assert.equal(await current(), '02'); await page.keyboard.press('ArrowLeft'); assert.equal(await current(), '01');

  for (const [width, height] of [[390, 844], [320, 700], [844, 390]]) {
    await page.setViewportSize({ width, height }); await page.clock.runFor(100);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight), `${width}: no document overflow`);
    const viewport = await surface.boundingBox(); assert.ok(viewport.width >= width - 1 && viewport.height >= height - 1);
    for (const button of await page.locator('.topbar button,.transport button,.camera-bar button').all()) {
      if (!await button.isVisible()) continue;
      const r = await button.boundingBox(); if(width<=640)assert.ok(r.width>=43.5&&r.height>=43.5,`${width}: touch target at least 44px`);assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.width <= width + 1 && r.y + r.height <= height + 1, `${width}: control stays inside viewport`);
    }
    await shot(`viewport-${width}`);
    await page.getByRole('button',{name:'Aprender',exact:true}).click();
    // Timeline may be collapsed in a narrow viewport; seek with its native navigation control.
    await page.getByRole('button',{name:'Próximo movimento',exact:true}).click();
    await page.locator('.preparation').waitFor();await page.clock.runFor(1000);
    assert.equal(await page.getByRole('button',{name:'Demonstrar',exact:false}).count(),1);
    const rig=JSON.parse(await page.locator('.stage').getAttribute('data-body-bounds')),prep=await page.locator('.preparation').boundingBox(),controls=await page.locator('.timeline').boundingBox();
    if(width<=640)assert.ok(rig.top>=(await page.locator('.topbar').boundingBox()).height+4,'Rig below mobile header');
    if(width<=640)assert.ok(rig.bottom<=controls.y+4,`${width}: rig above preparation ${rig.bottom}/${controls.y}`);
    else {assert.ok(rig.left>=prep.x+prep.width-4,'Landscape rig outside preparation column');const header=await page.locator('.topbar').boundingBox();assert.ok(prep.y>=header.y+header.height+8,'Landscape preparation below header');}
    if(!await page.locator('#camera-presets').count())await page.locator('.camera-toggle').click();
    await page.clock.runFor(100);
    const cameraBounds=await page.locator('.camera-bar').boundingBox();
    assert.ok(cameraBounds.y+cameraBounds.height<=controls.y-6,`${width}: expanded camera clears the timeline`);
    const trace=page.getByRole('button',{name:'Trajetória',exact:true});
    await trace.click();assert.equal(await trace.getAttribute('aria-pressed'),'true');
    await trace.click();await page.locator('.camera-toggle').click();
    await shot(`preparation-${width}`);
    await page.locator('.preparation summary').click();await shot(`preparation-folded-${width}`);
    await page.getByRole('button',{name:'Revisar',exact:true}).click();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  if(await page.getByRole('button',{name:'Expandir timeline',exact:false}).count())await page.getByRole('button',{name:'Expandir timeline',exact:false}).click();
  for(const [index,phase] of [[3,.56],[7,.655]]){await seek(index);await scrub(phase);if(!await page.locator('#camera-presets').count())await page.locator('.camera-toggle').click();await page.getByRole('button',{name:'Livre',exact:true}).click();await page.locator('.camera-toggle').click();await shot(`mobile-kick-${index}`);}
  await page.getByRole('button', { name: 'Instruções', exact: true }).click();const panel=await page.locator('.info-panel').boundingBox(),bar=await page.locator('.timeline').boundingBox();assert.ok(panel.y+panel.height<=bar.y+1,'Instructions do not cover transport controls');await shot('mobile-instructions');
  await page.getByRole('button', { name: 'Fechar instruções' }).click();
  await page.locator('.source-link').click(); await page.getByRole('dialog').waitFor();
  assert.ok(await page.locator('.sources a[href*="atamartialarts"]').count() === 1);
  await shot('mobile-sources'); await page.keyboard.press('Escape'); assert.equal(await page.getByRole('dialog').isVisible(), false);
  if(chrome && process.env.TEST_URL){
    const touchPage=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    await touchPage.goto(process.env.TEST_URL);await touchPage.locator('.stage > canvas').waitFor();
    await touchPage.locator('.camera-toggle').tap();await touchPage.getByRole('button',{name:'Lateral',exact:true}).tap();await touchPage.locator('.camera-toggle').tap();
    const touchSurface=touchPage.locator('.stage > canvas');const beforeTouch=await touchSurface.screenshot();
    const cdp=await touchPage.context().newCDPSession(touchPage);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:155,y:350,id:1},{x:220,y:350,id:2}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:125,y:350,id:1},{x:250,y:350,id:2}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await touchPage.waitForTimeout(150);assert.ok(!beforeTouch.equals(await touchSurface.screenshot()),'Touch pinch changes the camera');
    assert.equal(await touchPage.evaluate(()=>visualViewport.scale),1,'Pinch operates the scene, not document zoom');
    await touchPage.locator('.camera-toggle').tap();assert.equal(await touchPage.getByRole('button',{name:'Livre',exact:true}).getAttribute('aria-pressed'),'true');await touchPage.locator('.camera-toggle').tap();
    await touchPage.getByRole('button',{name:'Instruções',exact:true}).tap();await touchPage.getByRole('button',{name:'Fechar instruções'}).tap();
    await touchPage.screenshot({path:`${folder}/touch-pinch.png`});await touchPage.close();
  }
  // Simulate CSS safe-area inputs, not a claim of testing physical iPhone OS chrome.
  for(const {width,height,top,right,bottom,left} of [
    {width:390,height:844,top:44,right:0,bottom:34,left:0},
    {width:844,height:390,top:0,right:44,bottom:21,left:44},
  ]){
    await page.setViewportSize({width,height});
    await page.evaluate(insets=>{for(const edge of ['top','right','bottom','left'])document.documentElement.style.setProperty(`--safe-${edge}`,`${insets[edge]}px`);window.dispatchEvent(new Event('resize'));},{top,right,bottom,left});
    await page.clock.runFor(150);
    for(const button of await page.locator('.topbar button,.transport button,.camera-bar button').all()){
      if(!await button.isVisible())continue;
      const r=await button.boundingBox();assert.ok(r.x>=left-1&&r.y>=top-1&&r.x+r.width<=width-right+1&&r.y+r.height<=height-bottom+1,'Controls respect simulated safe areas');
    }
    if(height<600)assert.equal(await page.locator('.timeline').getAttribute('data-collapsed'),'true','Rotation restores compact timeline');
    const safeHeader=await page.locator('.topbar').boundingBox(),safeCamera=await page.locator('.camera-bar').boundingBox();
    assert.ok(safeCamera.y>=safeHeader.y+safeHeader.height+8,'Camera follows safe-area header position');
    await shot(`safe-area-${width}`);
  }
  await page.evaluate(()=>{for(const edge of ['top','right','bottom','left'])document.documentElement.style.removeProperty(`--safe-${edge}`);window.dispatchEvent(new Event('resize'));});
  assert.deepEqual(errors, []); assert.deepEqual(failedRequests, []);
  if(renderer==='webgl')assert.deepEqual(consoleErrors,[],'No WebGL application console errors');
  if (renderer === 'webgl' && !process.env.SKIP_CONTEXT_LOSS) {
    await page.evaluate(() => document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context')?.loseContext());
    await page.getByRole('alert').waitFor();await shot('context-loss'); await page.reload(); await page.locator('.stage > canvas').waitFor(); assert.equal(await page.getByRole('alert').count(), 0);
  }
  console.log(`PASS ${renderer}: 18 movements, phases on both sides, live playback, practice/review, all controls, camera keys, overlays/dialog, desktop/mobile/landscape; ${folder}`);
} catch (e) { failed = true; console.error(e); }
finally { clearTimeout(watchdog); setTimeout(() => process.exit(failed ? 1 : 0), 1500); await browser.close(); process.exit(failed ? 1 : 0); }
