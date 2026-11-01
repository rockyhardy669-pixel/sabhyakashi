import { env } from 'cloudflare:workers';
import { guard,isAdmin,validate } from '../../../lib/admin';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const admin=new URL(req.url).searchParams.get('admin')==='1';
 if(admin&&!await isAdmin())return Response.json({error:'Owner sign-in required.'},{status:403});
 const rows=await env.DB!.prepare(admin?'SELECT * FROM products ORDER BY id DESC':"SELECT id,name,description,price,category,image FROM products WHERE status='published' ORDER BY id DESC").all();
 return Response.json({products:rows.results},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:Request){
 const denied=await guard(req);if(denied)return denied;
 try{const p=validate(await req.json());const result=await env.DB!.prepare('INSERT INTO products (name,description,price,category,image,status,revision,updated_at) VALUES (?,?,?,?,?,?,1,?) RETURNING *').bind(p.name,p.description,p.price,p.category,p.image,p.status,new Date().toISOString()).first();return Response.json({product:result},{status:201});}
 catch(e){return Response.json({error:e instanceof Error?e.message:'Unable to save product.'},{status:400});}
}
