import {env} from 'cloudflare:workers';
import {guard} from '../../../lib/admin';
export async function POST(req:Request){
 const denied=await guard(req);if(denied)return denied;
 if(Number(req.headers.get('content-length'))>9*1024*1024)return Response.json({error:'Maximum image size is 8 MB.'},{status:413});
 try{const form=await req.formData();const file=form.get('image');if(!(file instanceof File)||file.size<12||file.size>8*1024*1024)return Response.json({error:'Choose a JPG, PNG or WebP image up to 8 MB.'},{status:400});
 const bytes=new Uint8Array(await file.arrayBuffer());let type='',ext='';
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255){type='image/jpeg';ext='jpg'}
 else if([137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b)){type='image/png';ext='png'}
 else if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP'){type='image/webp';ext='webp'}
 else return Response.json({error:'Unsupported image. Use JPG, PNG or WebP.'},{status:400});
 const key=crypto.randomUUID()+'.'+ext;await env.BUCKET!.put(key,bytes,{httpMetadata:{contentType:type}});return Response.json({image:'/api/images/'+key});
 }catch(error){console.error('Image upload failed',error);return Response.json({error:'Upload failed. Please try again.'},{status:500});}
}
