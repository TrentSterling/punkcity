const {chromium}=require('playwright');const fs=require('node:fs');
(async()=>{const out='qa-v08';fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});try{
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>{if(cb.name==='frame'){window.__frame=cb;return 0;}return raf(cb);};});
await page.goto((process.env.CITYLAB_BASE||'http://127.0.0.1:8080/punkcity/')+'?capture=1',{waitUntil:'networkidle',timeout:90000});await page.waitForFunction(()=>citylab?.ready,null,{timeout:60000});
const capture=async(name,fn,arg)=>{await page.evaluate(fn,arg);await page.evaluate(()=>window.__frame(performance.now()));await page.screenshot({path:out+'/'+name+'.png',timeout:60000});console.log(name);if(errors.length)throw Error(errors[0]);};
await capture('variety-overview',()=>{citylab.setHUD(false);citylab.setCamera([318,255,370],[0,25,0]);});
await capture('variety-overhead',()=>citylab.setCamera([90,390,230],[0,0,0]));
await capture('variety-greybox',()=>citylab.setClay(true));
await capture('variety-street',()=>{citylab.setClay(false);citylab.setView(0);});
const inspected=[];for(let n=0;n<8;n++){await capture('family-'+n,n=>{citylab.visitBuilding(n);citylab.setHUD(true);},n);inspected.push(await page.evaluate(()=>citylab.stats().camera));}
await page.keyboard.press('KeyM');await page.keyboard.press('Shift+KeyM');
const report={version:await page.evaluate(()=>citylab.version),errors,audit:await page.evaluate(()=>citylab.validate()),stats:await page.evaluate(()=>citylab.stats()),familiesInspected:inspected.length};
fs.writeFileSync(out+'/variety-browser.json',JSON.stringify(report,null,2));if(errors.length||!report.audit.ok||report.version!=='0.8.0')throw Error('Variety viewer failed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
