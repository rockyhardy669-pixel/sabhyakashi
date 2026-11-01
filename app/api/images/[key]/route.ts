import {env} from 'cloudflare:workers';
export async function GET(req:Request,{params}:{params:Promise<{key:string}>}){
 const {key}=await params;if(!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(key))return new Response('Not found',{status:404});
 const file=await env.BUCKET!.get(key);if(!file)return new Response('Not found',{status:404});
 return new Response(file.body,{headers:{'Content-Type':file.httpMetadata?.contentType||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=86400',ETag:file.httpEtag}});
}
