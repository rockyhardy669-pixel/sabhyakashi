import {guard} from '../../../../lib/admin';
import {validateSettings} from '../../../../lib/site-settings';
import {renderStorefront} from '../../../../lib/render-storefront';
export async function POST(req:Request){const denied=await guard(req);if(denied)return denied;try{const data=await req.json() as {settings:unknown};const settings=validateSettings(data.settings);return new Response(renderStorefront(settings).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"sandbox; script-src 'none'; object-src 'none'"}})}catch(e){return Response.json({error:e instanceof Error?e.message:'Unable to preview.'},{status:400})}}
