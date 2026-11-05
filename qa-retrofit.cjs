const {chromium}=require('playwright');const fs=require('node:fs');
const out='qa-v09';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1}),errors=[],failed=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>failed.push(r.url()));
 await page.addInitScript(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>{if(cb.name==='frame'){window.__frame=cb;return 0;}return raf(cb);};});
 await page.goto((process.env.CITYLAB_BASE||'http://127.0.0.1:8080/punkcity/')+'?capture=1',{waitUntil:'networkidle',timeout:90000});await page.waitForFunction(()=>window.citylab?.ready,null,{timeout:90000});
 const report={errors,failed,initial:await page.evaluate(()=>citylab.stats()),audit:await page.evaluate(()=>citylab.validate()),views:[]};
 const capture=async name=>{await page.evaluate(()=>window.__frame(performance.now()));await page.screenshot({path:out+'/'+name+'.png',timeout:90000});};
 await page.evaluate(()=>{citylab.setHUD(false);citylab.setView(7);citylab.lighting(0);citylab.setRetrofit(false);});await capture('cyber-street-before');
 const plan=await page.evaluate(()=>JSON.stringify(citylab.getRecipe()));
 await page.evaluate(()=>citylab.setRetrofit(true));await capture('cyber-street-after');
 await page.evaluate(()=>citylab.lighting(2));await capture('cyber-street-night');
 await page.evaluate(()=>{citylab.lighting(0);citylab.setView(0);});await capture('cyber-avenue');
 for(const type of['gallery','capsule','cooling-spine','blade-sign','display-wall']){
  const p=await page.evaluate(type=>{
   const p=citylab.getCompiled().retro.placements.filter(p=>p.type===type).sort((a,b)=>a.y-b.y)[0];if(!p)throw Error('Missing '+type);
   const c=Math.cos(p.rot),s=Math.sin(p.rot);citylab.setCamera([p.x+c*5+s*13,p.y+3.5,p.z-s*5+c*13],[p.x+s,p.y+1.7,p.z+c]);return p;
  },type);report.views.push(p);await capture('retrofit-'+type);
 }
 await page.evaluate(()=>{citylab.setView(1);citylab.setLayer('retrofit');});await capture('cyber-isolated');
 const visible=await page.evaluate(()=>{let layers=[];citylab.scene.traverse(o=>{if(o.isMesh&&o.visible&&o.userData.layer)layers.push(o.userData.layer);});return [...new Set(layers)];});
 if(visible.some(x=>x!=='retrofit'))throw Error('Isolation leak');
 await page.evaluate(()=>{citylab.setLayer('all');citylab.setView(1);citylab.setClay(true);});await capture('cyber-greybox');
 await page.evaluate(()=>{citylab.setClay(false);citylab.setView(7);citylab.setHUD(true);});await page.keyboard.press('KeyZ');if(await page.evaluate(()=>citylab.config.retrofit))throw Error('Z failed');await page.keyboard.press('KeyX');if(!await page.evaluate(()=>citylab.config.retrofit))throw Error('X did not restore retrofit');await capture('cyber-hud');
 if(plan!==await page.evaluate(()=>JSON.stringify(citylab.getRecipe())))throw Error('Inspection changed city layout');
 report.final=await page.evaluate(()=>citylab.stats());fs.writeFileSync(out+'/retrofit-browser.json',JSON.stringify(report,null,2));
 if(errors.length||failed.length||!report.audit.ok||!report.initial.retrofit.ok||report.initial.version!=='0.10.0')throw Error(JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
