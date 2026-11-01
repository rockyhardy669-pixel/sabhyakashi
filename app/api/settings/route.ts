import {env} from 'cloudflare:workers';
import {guard,isAdmin} from '../../../lib/admin';
import {validateSettings} from '../../../lib/site-settings';
import {readSettings} from '../../../lib/settings-store';
export const dynamic='force-dynamic';
export async function GET(){if(!await isAdmin())return Response.json({error:'Owner sign-in required.'},{status:403});return Response.json(await readSettings(),{headers:{'Cache-Control':'no-store'}})}
export async function PUT(req:Request){
 const denied=await guard(req);if(denied)return denied;
 try{const data=await req.json() as {settings:unknown;revision:number};const settings=validateSettings(data.settings);if(!Number.isInteger(data.revision)||data.revision<0)throw Error('Reload website settings before saving.');
 const json=JSON.stringify(settings),now=new Date().toISOString();
 const row=data.revision===0?await env.DB!.prepare('INSERT INTO site_settings (id,value,revision,updated_at) VALUES (1,?,1,?) ON CONFLICT(id) DO NOTHING RETURNING revision').bind(json,now).first():await env.DB!.prepare('UPDATE site_settings SET value=?, revision=revision+1, updated_at=? WHERE id=1 AND revision=? RETURNING revision').bind(json,now,data.revision).first();
 if(!row)return Response.json({error:'Website settings changed in another window. Reload the saved version before publishing.'},{status:409});
 return Response.json({settings,revision:row.revision});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Unable to save settings.'},{status:400})}
}
