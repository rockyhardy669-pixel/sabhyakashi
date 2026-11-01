import { env } from 'cloudflare:workers';
import { guard,validate } from '../../../../lib/admin';
export async function PUT(req:Request,{params}:{params:Promise<{id:string}>}){
 const denied=await guard(req);if(denied)return denied;
 try{const {id}=await params;if(!/^\d+$/.test(id))return Response.json({error:'Invalid product.'},{status:400});const data=await req.json() as Record<string,unknown>;const p=validate(data);if(!Number.isInteger(data.revision))throw new Error('Reload this product before saving.');
 const result=await env.DB!.prepare('UPDATE products SET name=?, description=?, price=?, category=?, image=?, status=?, revision=revision+1, updated_at=? WHERE id=? AND revision=? RETURNING *').bind(p.name,p.description,p.price,p.category,p.image,p.status,new Date().toISOString(),Number(id),data.revision).first();
 if(!result)return Response.json({error:'This product changed in another window. Refresh the list and reopen it before saving.'},{status:409});return Response.json({product:result});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Unable to save.'},{status:400});}
}
