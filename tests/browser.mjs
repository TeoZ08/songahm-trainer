import {chromium,firefox} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const watchdog=setTimeout(()=>{console.error('Browser test timed out');process.exit(1)},90000);
const useChrome=process.env.BROWSER==='chromium';
const browser=useChrome?await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']}):await firefox.launch({headless:true});
let failed=false;
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://songahm.local/**',async route=>{try{const pathname=new URL(route.request().url()).pathname;const file=path.join(process.cwd(),'dist',pathname==='/'?'index.html':pathname);const data=await readFile(file);const ext=path.extname(file);await route.fulfill({body:data,contentType:{'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'}[ext]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'Not found'});}});
 await page.goto('http://songahm.local/');await page.getByRole('heading',{name:'Um movimento de cada vez.'}).waitFor();
 console.log('App loaded');await page.waitForTimeout(700);
 if(await page.getByRole('alert').count())throw Error(await page.getByRole('alert').innerText());
 await page.locator('.stage > canvas,.stage > svg').waitFor();
 const renderer=await page.locator('.stage').getAttribute('data-renderer');console.log('Renderer:',renderer);
 if(renderer==='svg')assert.ok(await page.locator('.stage svg path').count()>40,'Articulated geometry must be visible');
 assert.equal(await page.getByRole('alert').count(),0,'WebGL must render');
 await mkdir('artifacts',{recursive:true});
 await page.screenshot({path:'artifacts/desktop.png',fullPage:true});
 await page.clock.install();
 await page.getByRole('button',{name:'Reproduzir',exact:false}).click();await page.clock.runFor(4800);
 await page.getByRole('button',{name:'Pausar',exact:false}).click();const paused=Number(await page.locator('progress').getAttribute('value'));assert.ok(paused>0);await page.clock.runFor(500);assert.equal(Number(await page.locator('progress').getAttribute('value')),paused);
 await page.screenshot({path:'artifacts/high-block.png',fullPage:true});
 for(const speed of ['0.25','0.5','0.75','1']){await page.getByRole('combobox').selectOption(speed);assert.equal(await page.getByRole('combobox').inputValue(),speed);}
 await page.getByRole('button',{name:'Movimento 3:',exact:false}).click();
 await page.getByRole('button',{name:'Repetir técnica'}).click();await page.clock.runFor(750);const beforeSpeed=await page.locator('progress').getAttribute('value');await page.getByRole('combobox').selectOption('0.75');const afterSpeed=Number(await page.locator('progress').getAttribute('value'));assert.ok(afterSpeed>=Number(beforeSpeed)&&afterSpeed-Number(beforeSpeed)<.3,'Changing speed preserves progress while playback advances');assert.match(await page.locator('.play').innerText(),/Pausar/);await page.getByRole('combobox').selectOption('1');await page.clock.runFor(1000);
 await page.screenshot({path:'artifacts/front-kick.png',fullPage:true});
 await page.getByRole('button',{name:'Praticar',exact:false}).click();await page.clock.runFor(2000);assert.match(await page.locator('.stage-top').innerText(),/Movimento concluído/);assert.equal(await page.locator('[aria-current="step"] span').innerText(),'03');
 await page.getByRole('button',{name:'Continuar',exact:false}).click();assert.equal(await page.locator('[aria-current="step"] span').innerText(),'04');
 await page.getByRole('button',{name:'Movimento 7:',exact:false}).click();await page.getByRole('button',{name:'Repetir técnica'}).click();await page.clock.runFor(2100);await page.getByRole('button',{name:'Pausar',exact:false}).click();
 const renderSurface=page.locator('.stage > canvas,.stage > svg');
 let previousCamera=await renderSurface.screenshot();
 for(const name of ['Frente','Lateral','Costas','Topo','Restaurar câmera']){await page.getByRole('button',{name,exact:true}).click();const nextCamera=await renderSurface.screenshot();assert.ok(!previousCamera.equals(nextCamera),`${name} changes the rendered camera`);previousCamera=nextCamera;}
 await page.screenshot({path:'artifacts/side-kick.png',fullPage:true});
 const canvas=page.locator('.stage > canvas,.stage > svg');const box=await canvas.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+90,box.y+box.height/2+30,{steps:5});await page.mouse.up();await page.clock.runFor(150);const orbitImage=await canvas.screenshot();assert.ok(!previousCamera.equals(orbitImage),'Orbit drag changes projection');await page.mouse.wheel(0,-200);await page.clock.runFor(150);assert.ok(!orbitImage.equals(await canvas.screenshot()),'Wheel zoom changes projection');
 await page.getByRole('button',{name:'Revisar',exact:false}).click();await page.getByRole('button',{name:'Movimento 18:',exact:false}).click();await page.getByRole('button',{name:'Repetir técnica'}).click();await page.clock.runFor(3400);assert.match(await page.locator('.stage-top').innerText(),/Aula concluída/);
 await page.getByRole('button',{name:'Reiniciar aula',exact:true}).click();assert.equal(await page.locator('[aria-current="step"] span').innerText(),'01');
 await page.locator('h1').click();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[aria-current="step"] span').innerText(),'02');await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('[aria-current="step"] span').innerText(),'01');await page.keyboard.press('Space');await page.clock.runFor(500);assert.match(await page.locator('.play').innerText(),/Pausar/);await page.keyboard.press('Space');
 await page.getByRole('button',{name:'Reiniciar aula',exact:true}).click();await page.getByRole('button',{name:'Aprender',exact:false}).click();
 for(let index=1;index<=18;index++){await page.getByRole('button',{name:`Movimento ${index}:`,exact:false}).click();await page.getByRole('button',{name:'Repetir técnica'}).click();await page.clock.runFor(3300);assert.equal(await page.locator('[aria-current=step] span').innerText(),String(index).padStart(2,'0'));if([6,9,15,17,18].includes(index))await page.locator('.stage-wrap').screenshot({path:`artifacts/pose-${index}.png`});}
 await page.getByRole('button',{name:'Reiniciar aula',exact:true}).click();
 await page.setViewportSize({width:390,height:844});await page.clock.runFor(100);await page.screenshot({path:'artifacts/mobile.png',fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
 for(const b of await page.locator('.transport button,.step-list button,.modes button').all()){const r=await b.boundingBox();assert.ok(r.height>=44,'Touch target at least 44 px tall');}
 await page.getByRole('button',{name:'Fontes e limites',exact:false}).click();assert.equal(await page.locator('.sources a').count(),2);await page.screenshot({path:'artifacts/mobile-sources.png',fullPage:true});
 await page.setViewportSize({width:320,height:700});await page.clock.runFor(100);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'320 px layout fits');for(const button of await page.locator('.camera-bar button').all()){const r=await button.boundingBox();assert.ok(r.x>=0&&r.x+r.width<=320,'Camera controls remain inside small viewport');}
 assert.deepEqual(errors,[]);
 if(renderer==='webgl'){await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2');gl.getExtension('WEBGL_lose_context')?.loseContext();});await page.clock.runFor(100);await page.getByRole('alert').waitFor();}
 console.log('Browser: desktop/mobile, playback, pause, practice gate, review end, navigation, repeat, speeds, camera, keyboard, sources passed. WebGL loss is checked only with the WebGL renderer. Screenshots: artifacts/.');
}catch(e){failed=true;console.error(e);}finally{clearTimeout(watchdog);setTimeout(()=>process.exit(failed?1:0),1500);await browser.close();process.exit(failed?1:0);}
