const {chromium}=require('playwright');
const fs=require('node:fs');const path=require('node:path');
const out='qa-v08';fs.mkdirSync(out,{recursive:true});
const pause=()=>{const native=requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>{if(cb.name==='frame'){window.__frame=cb;return 0;}return native(cb);};};
const timer=setTimeout(()=>{console.error('Bounded QA timeout');process.exit(2);},450000);timer.unref();
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const errors=[],failed=[];const saveError=e=>{errors.push(String(e));fs.writeFileSync(out+'/errors.json',JSON.stringify(errors,null,2));};
  page.on('pageerror',saveError);page.on('console',m=>{if(m.type()==='error')saveError(m.text());});
  page.on('requestfailed',r=>failed.push(r.url()));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  await page.addInitScript(pause);
  const url=process.env.CITYLAB_BASE||'http://127.0.0.1:8080/punkcity/';
  await page.goto(url+'?capture=1',{waitUntil:'networkidle',timeout:60000});await page.waitForFunction(()=>window.citylab?.ready,null,{timeout:45000});
  const report={version:await page.evaluate(()=>citylab.version),errors,failed,audit:await page.evaluate(()=>citylab.validate()),views:[]};
  const names=['avenue','overview','upper-street','foundry','crown','relay','stacks','market','garden'];
  for(let i=0;i<names.length;i++){
   console.log('Capture '+names[i]);await page.evaluate(i=>{citylab.setView(i);citylab.setHUD(false);window.__frame(performance.now());},i);
   await page.screenshot({path:out+'/'+names[i]+'.png',timeout:45000});report.views.push({view:names[i],...await page.evaluate(()=>citylab.stats())});if(errors.length)throw Error(errors[0]);
  }
  await page.evaluate(()=>{citylab.setView(2);citylab.setHUD(true);window.__frame(performance.now());});await page.screenshot({path:out+'/hud.png',timeout:45000});
  await page.evaluate(()=>{citylab.setHUD(false);citylab.setView(1);citylab.setClay(true);window.__frame(performance.now());});await page.screenshot({path:out+'/greybox.png',timeout:45000});
  await page.evaluate(()=>{citylab.setClay(false);citylab.setView(7);citylab.lighting(2);window.__frame(performance.now());});await page.screenshot({path:out+'/night.png',timeout:45000});
  report.isolation=[];const planBefore=await page.evaluate(()=>JSON.stringify(citylab.getRecipe()));
  for(const layer of ['frontage','services','rooftops','traversal','armor']){
   await page.evaluate(layer=>{citylab.setView(1);citylab.setLayer(layer);window.__frame(performance.now());},layer);
   const visible=await page.evaluate(()=>{const a=[];citylab.scene.traverse(o=>{if(o.isMesh&&o.visible&&o.userData.layer)a.push(o.userData.layer);});return [...new Set(a)];});
   report.isolation.push({layer,visible});if(visible.some(x=>x!==layer))throw Error('Generator isolation leak: '+layer);
   await page.screenshot({path:out+'/isolate-'+layer+'.png',timeout:45000});
  }
  await page.evaluate(()=>{citylab.setLayer('all');citylab.lighting(0);});
  if(planBefore!==await page.evaluate(()=>JSON.stringify(citylab.getRecipe())))throw Error('Layer selection changed recipe');
  report.closeViews=[];
  for(let n=0;n<10;n++){
   const place=await page.evaluate(n=>{const p=citylab.visitInfill(n);window.__frame(performance.now());return p;},n);
   if(!place)throw Error('No frontage tour target');report.closeViews.push(place);
   await page.screenshot({path:out+'/infill-close-'+n+'.png',timeout:45000});
  }
  await page.keyboard.press('KeyU');if(await page.evaluate(()=>citylab.config.infill))throw Error('U toggle failed');
  await page.keyboard.press('KeyK');if(!await page.evaluate(()=>citylab.config.infill))throw Error('K tour did not restore infill');
  report.regeneration=[];for(const seed of['HP-QA-1','HP-QA-2','HP-QA-99']){await page.evaluate(s=>{citylab.regenerate(s);window.__frame(performance.now());},seed);report.regeneration.push(await page.evaluate(()=>({audit:citylab.validate(),stats:citylab.stats()})));}
  await page.keyboard.press('KeyB');await page.keyboard.press('Digit3');report.equipment=await page.evaluate(()=>citylab.player.gear);
  await page.evaluate(()=>{citylab.regenerate('HACKERPUNK-02');citylab.lighting(0);citylab.setView(2);});const pos=await page.evaluate(()=>citylab.camera.position.toArray());
  for(let i=0;i<3;i++){await page.evaluate(({p,i})=>{citylab.camera.position.set(p[0]+i*.12,p[1],p[2]);window.__frame(performance.now());},{p:pos,i});await page.screenshot({path:out+'/motion-'+i+'.png',timeout:45000});}
  await page.evaluate(()=>{citylab.setHUD(false);citylab.setCamera([318,255,370],[0,25,0]);window.__frame(performance.now());});await page.screenshot({path:out+'/overview-matched.png',timeout:45000});
  const context=await browser.newContext({offline:true,viewport:{width:960,height:600}}),offline=await context.newPage(),offErrors=[];
  offline.on('pageerror',e=>offErrors.push(String(e)));await offline.addInitScript(pause);await offline.goto('file://'+path.resolve('HACKERPUNK-Citylab-v0.8.html'),{waitUntil:'load',timeout:60000});await offline.waitForFunction(()=>window.citylab?.ready,null,{timeout:45000});await offline.evaluate(()=>window.__frame(performance.now()));
  report.offline={errors:offErrors,version:await offline.evaluate(()=>citylab.version)};if(report.version!=='0.8.0'||report.offline.version!=='0.8.0')throw Error('Version mismatch');
  fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  if(errors.length||failed.length||offErrors.length||!report.audit.ok||report.regeneration.some(r=>!r.audit.ok)||report.equipment!==2)throw Error('QA assertions failed');
 }finally{await browser.close();clearTimeout(timer);}
})().catch(e=>{console.error(e);process.exitCode=1;});
