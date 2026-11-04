const {chromium}=require('playwright');
const fs=require('node:fs');
const crypto=require('node:crypto');
const files=['citylab.js','districts.js','urbanism.js','facades.js'];
const digest=text=>{const b=Buffer.from(text);return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');};
(async()=>{
 const base=process.env.LIVE_BASE||'https://tront.xyz/punkcity/';
 const expected=Object.fromEntries(files.map(name=>[name,digest(fs.readFileSync(name))]));
 const version=/const VERSION='([^']+)'/.exec(fs.readFileSync('citylab.js','utf8'))?.[1];
 if(!version)throw Error('No source version');
 let ready=false;
 for(let i=0;i<30;i++){
  try{
   const responses=await Promise.all(['index.html',...files].map(p=>fetch(new URL(p+'?release='+Date.now(),base),{signal:AbortSignal.timeout(12000)})));
   if(responses.every(r=>r.ok)){
    const [html,...code]=await Promise.all(responses.map(r=>r.text()));
    ready=html.includes('./vendor/build/three.module.js')&&code.every((s,j)=>digest(s)===expected[files[j]]);
   }
  }catch(e){console.log('Deployment not ready:',e.message);}
  if(ready)break;
  await new Promise(r=>setTimeout(r,6000));
 }
 if(!ready)throw Error('Live site did not serve the checked-out source within the deployment window');
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const errors=[],failed=[],requests=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>{if(r.url().startsWith('http'))requests.push(r.url());});
  page.on('requestfailed',r=>failed.push({url:r.url(),error:r.failure()}));
  page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
  await page.addInitScript(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>{if(cb.name==='frame'){window.__testFrame=cb;return 0;}return raf(cb);};});
  const response=await page.goto(base+'?capture=1&release='+version,{waitUntil:'networkidle',timeout:60000});
  await page.waitForFunction(()=>window.citylab?.ready,null,{timeout:45000});
  await page.evaluate(()=>window.__testFrame(performance.now()));
  fs.mkdirSync('qa-v03',{recursive:true});
  await page.screenshot({path:'qa-v03/live.png',timeout:60000});
  const stats=await page.evaluate(()=>citylab.stats()),audit=await page.evaluate(()=>citylab.validate());
  const outside=requests.filter(u=>!u.startsWith(base));
  const report={url:page.url(),status:response.status(),coreHashesVerified:true,verifiedFiles:files,errors,failed,outsideAssetRequests:outside,requestCount:requests.length,stats,audit};
  fs.writeFileSync('qa-v03/live-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  if(response.status()!==200||errors.length||failed.length||outside.length||stats.version!==version||stats.districts!==6||stats.blocks!==36||!audit.ok||audit.groundStairs!==6)throw Error('Live verification failed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
