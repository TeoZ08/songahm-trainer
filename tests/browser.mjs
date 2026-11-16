import { chromium, firefox } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';
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
      await route.fulfill({ body: await readFile(file), contentType: { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg':'image/svg+xml' }[path.extname(file)] || 'application/octet-stream' });
    } catch { await route.fulfill({ status: 404, body: 'Not found' }); }
  });
  await page.goto(process.env.TEST_URL || 'http://songahm.local/');
  await page.getByRole('heading', { name: 'Defesa alta', exact: true }).waitFor();
  assert.equal(await page.getByRole('region',{name:'Movimento atual'}).getAttribute('aria-live'),'polite');
  const surface = page.locator('.stage > canvas,.stage > svg');
  await surface.waitFor(); await page.waitForTimeout(200);
  assert.equal(await page.getByRole('alert').count(), 0);
  const renderer = await page.locator('.stage').getAttribute('data-renderer');
  assert.ok(['webgl', 'svg'].includes(renderer));
  if(process.env.RENDERER==='svg')assert.equal(renderer,'svg','Compatibility renderer must be exercised');
  if (chrome) assert.equal(renderer, 'webgl', 'Chrome must exercise WebGL');
  if (renderer === 'svg') assert.ok(await page.locator('.stage svg path').count() > 40);
  const folder = `artifacts/rev03-${renderer}`;
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
  await shot('desktop');
  const stageRect = await surface.boundingBox();
  assert.ok(stageRect.width >= 1279 && stageRect.height >= 899, 'Viewport fills window');
  await page.clock.install();
  for (const speed of ['0.25', '0.5', '0.75', '1']) await page.getByRole('combobox', { name: 'Velocidade' }).selectOption(speed);
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
  await page.getByRole('combobox', { name: 'Velocidade' }).selectOption('.75'.replace(/^\./, '0.'));
  assert.ok(Number(await page.getByRole('slider').inputValue()) >= beforeSpeed);
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
  for(const index of [7,16])for(const camera of ['Lateral','Topo']){
    await seek(index);await page.getByRole('button',{name:camera,exact:true}).click();
    for(const t of [.22,.40,.52,.66,.80,.96]){await scrub(t);await shot(`lateral-${index}-${camera}-${t}`);}
  }
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
  await seek(17); await page.getByRole('button', { name: 'Revisar', exact: true }).click();
  await page.getByRole('button', { name: 'Repetir técnica' }).click(); await page.clock.runFor(3300); assert.equal(await current(), '18');
  await page.clock.runFor(3300); assert.match(await page.locator('.phase').innerText(), /Aula concluída/);
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
      const r = await button.boundingBox(); assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.width <= width + 1 && r.y + r.height <= height + 1, `${width}: control stays inside viewport`);
    }
    await shot(`viewport-${width}`);
    await page.getByRole('button',{name:'Aprender',exact:true}).click();
    // Timeline may be collapsed in a narrow viewport; seek with its native navigation control.
    await page.getByRole('button',{name:'Próximo movimento',exact:true}).click();
    await page.locator('.preparation').waitFor();await page.clock.runFor(1000);
    assert.equal(await page.getByRole('button',{name:'Demonstrar',exact:false}).count(),1);
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
  assert.deepEqual(errors, []); assert.deepEqual(failedRequests, []);
  if(renderer==='webgl')assert.deepEqual(consoleErrors,[],'No WebGL application console errors');
  if (renderer === 'webgl' && !process.env.SKIP_CONTEXT_LOSS) {
    await page.evaluate(() => document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context')?.loseContext());
    await page.getByRole('alert').waitFor(); await page.reload(); await page.locator('.stage > canvas').waitFor(); assert.equal(await page.getByRole('alert').count(), 0);
  }
  console.log(`PASS ${renderer}: 18 movements, phases on both sides, live playback, practice/review, all controls, camera keys, overlays/dialog, desktop/mobile/landscape; ${folder}`);
} catch (e) { failed = true; console.error(e); }
finally { clearTimeout(watchdog); setTimeout(() => process.exit(failed ? 1 : 0), 1500); await browser.close(); process.exit(failed ? 1 : 0); }
