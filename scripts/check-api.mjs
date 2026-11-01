import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {Miniflare}=require(require.resolve('miniflare',{paths:[require.resolve('wrangler/package.json')]}));
const modules=fs.readdirSync('dist/server',{recursive:true}).filter(p=>/\.(m?js)$/.test(p)).map(p=>({type:'ESModule',path:process.cwd()+'/dist/server/'+p,contents:fs.readFileSync('dist/server/'+p,'utf8')}));modules.sort((a,b)=>a.path===process.cwd()+'/dist/server/index.js'?-1:b.path===process.cwd()+'/dist/server/index.js'?1:0);
const mf=new Miniflare({modules,modulesRoot:'dist/server',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'test-products'},r2Buckets:['BUCKET'],cf:false});
try{
 const db=await mf.getD1Database('DB');for(const migration of fs.readdirSync('drizzle').filter(p=>p.endsWith('.sql')).sort())await db.exec(fs.readFileSync('drizzle/'+migration,'utf8').replace(/\n/g,' '));
 const origin='https://sabyakashi.test';const owner={'oai-authenticated-user-id':'test-owner','oai-authenticated-user-email':'owner@example.invalid',Origin:origin};
 const other={...owner,'oai-authenticated-user-email':'someone@example.test'};
 const call=async(path,method='GET',body,headers={})=>{if(body instanceof FormData){const request=new Request(origin+path,{method,headers,body});return mf.dispatchFetch(origin+path,{method,headers:Object.fromEntries(request.headers),body:await request.arrayBuffer()})}return mf.dispatchFetch(origin+path,{method,headers:{...headers,...(body&&typeof body==='string'?{'Content-Type':'application/json'}:{})},body})};
 {const check=await call('/api/products?admin=1');assert.equal(check.status,403,await check.text())}
 assert.equal((await call('/api/products?admin=1','GET',undefined,other)).status,403);
 assert.equal((await call('/api/products','POST','{}',other)).status,403);
 assert.equal((await call('/api/products','POST','{}',{...owner,Origin:'https://bad.test'})).status,403);
 let form=new FormData();form.set('image',new File([new Uint8Array(20)],'bad.png',{type:'image/png'}));assert.equal((await call('/api/uploads','POST',form,owner)).status,400);
 form=new FormData();form.set('image',new File([fs.readFileSync('public/assets/hero.jpg')],'test.jpg',{type:'image/jpeg'}));let r=await call('/api/uploads','POST',form,owner);assert.equal(r.status,200,await r.clone().text());const {image}=await r.json();assert.equal((await call(image)).status,200);
 let p={name:'Local QA saree',description:'Preview only',price:890050,category:'Bridal',image,status:'draft'};r=await call('/api/products','POST',JSON.stringify(p),owner);assert.equal(r.status,201,await r.clone().text());p=(await r.json()).product;
 assert.equal((await (await call('/api/products')).json()).products.length,0);
 r=await call('/api/products/'+p.id,'PUT',JSON.stringify({...p,status:'published'}),owner);assert.equal(r.status,200,await r.clone().text());const saved=(await r.json()).product;
 assert.equal((await (await call('/api/products')).json()).products[0].price,890050);
 assert.equal((await call('/api/products/'+p.id,'PUT',JSON.stringify(p),owner)).status,409);
 r=await call('/api/products/'+p.id,'PUT',JSON.stringify({...saved,status:'archived',price:990000}),owner);assert.equal(r.status,200,await r.clone().text());
 assert.equal((await (await call('/api/products')).json()).products.length,0);
 r=await call('/admin','GET',undefined,owner);assert.equal(r.status,200);assert.match(await r.text(),/Your collection, beautifully managed/);

 assert.equal((await call('/api/settings')).status,403);
 assert.equal((await call('/api/settings','GET',undefined,other)).status,403);
 let initial=await (await call('/api/settings','GET',undefined,owner)).json();assert.equal(initial.revision,0);
 let settings=structuredClone(initial.settings);settings.texts.heroTitle='Silk <script>alert(1)</script> & stories';settings.texts.imageCaption='New caption';settings.texts.emptyCollection='<img src=x onerror=alert(1)>';settings.colors.primary='#234537';settings.headingFont='heritage';
 assert.equal((await call('/api/settings','PUT',JSON.stringify({settings,revision:0}),other)).status,403);
 assert.equal((await call('/api/settings','PUT',JSON.stringify({settings,revision:0}),{...owner,Origin:'https://bad.test'})).status,403);
 const preview=await call('/api/settings/preview','POST',JSON.stringify({settings}),owner);assert.equal(preview.status,200);const previewHtml=await preview.text();assert.ok(!previewHtml.includes('<script>'));assert.ok(previewHtml.includes('New caption'));
 assert.equal((await (await call('/api/settings','GET',undefined,owner)).json()).revision,0);
 r=await call('/api/settings','PUT',JSON.stringify({settings,revision:0}),owner);assert.equal(r.status,200,await r.clone().text());let savedSettings=await r.json();assert.equal(savedSettings.revision,1);
 const html=await (await call('/')).text();assert.ok(html.includes('Silk &lt;script&gt;alert(1)&lt;/script&gt; &amp; stories'));assert.ok(!html.includes('<script>alert(1)</script>'));assert.ok(html.includes('--wine:#234537'));assert.ok(html.includes('Palatino'));assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));assert.ok(!html.includes('{{'));
 assert.equal((await call('/api/settings','PUT',JSON.stringify({settings,revision:0}),owner)).status,409);
 assert.equal((await call('/api/settings','PUT',JSON.stringify({settings:{...settings,headingFont:'bad-font'},revision:1}),owner)).status,400);
 assert.equal((await call('/api/settings','PUT',JSON.stringify({settings:{...settings,colors:{...settings.colors,primary:'red;}</style>'}},revision:1}),owner)).status,400);
 settings.texts.heroTitle='A new chapter';r=await call('/api/settings','PUT',JSON.stringify({settings,revision:1}),owner);assert.equal(r.status,200);assert.equal((await r.json()).revision,2);
 assert.equal((await call('/admin/settings','GET',undefined,owner)).status,200);

 assert.equal((await call('/api/settings','PUT',JSON.stringify({settings:{...settings,whatsapp:{number:'javascript:bad'}},revision:2}),owner)).status,400);
 const waPreview=await call('/api/settings/preview','POST',JSON.stringify({settings:{...settings,whatsapp:{number:'+1 (202) 555-0100'}}}),owner);assert.equal(waPreview.status,200);const waHtml=await waPreview.text();assert.ok(waHtml.includes('https://wa.me/12025550100?text='));assert.ok(waHtml.includes('Enquire on WhatsApp'));
 const pendingHtml=await (await call('/')).text();assert.ok(pendingHtml.includes('WhatsApp enquiries coming soon'));assert.ok(pendingHtml.includes('ENQUIRE ON WHATSAPP'));assert.ok(!pendingHtml.includes('ADD TO BAG +'));
 console.log('Passed WhatsApp number validation, country-code normalization, configured link preview and unconfigured catalogue state.');
 console.log('Passed settings integration: owner-only writes, CSRF, non-publishing preview, durable save, stale edit conflict, safe text rendering, colour/font validation and settings page render.');
 console.log('Passed API integration: unauthorized/non-owner writes, CSRF, image rejection, R2 upload/read, D1 create/draft/publish/price/archive, stale edit conflicts and owner dashboard render.');
}finally{await mf.dispose()}
