import { getChatGPTUser } from '../app/chatgpt-auth';
export const OWNER_EMAIL = 'owner@example.invalid';
export async function isAdmin() {
 const user = await getChatGPTUser();
 return !!user && user.email.toLowerCase() === OWNER_EMAIL;
}
export async function guard(request: Request) {
 if (!await isAdmin()) return Response.json({error:'Owner sign-in required.'}, {status:403});
 const origin=request.headers.get('origin');
 if (!origin || origin!==new URL(request.url).origin) return Response.json({error:'Invalid request origin.'},{status:403});
 return null;
}
export function validate(data:any) {
 const name=typeof data.name==='string'?data.name.trim():'';
 const description=typeof data.description==='string'?data.description.trim():'';
 if(!name || name.length>100 || description.length>1200) throw new Error('Enter a name up to 100 characters and a description up to 1,200 characters.');
 if(!Number.isInteger(data.price)||data.price<1||data.price>100000000) throw new Error('Enter a valid price between ₹0.01 and ₹10,00,000.');
 if(!['Bridal','Occasion','Everyday'].includes(data.category)) throw new Error('Choose a collection.');
 if(!['draft','published','archived'].includes(data.status)) throw new Error('Choose a valid status.');
 if(typeof data.image!=='string'||!/^\/api\/images\/[a-f0-9-]+\.(jpg|png|webp)$/.test(data.image)) throw new Error('Upload a saree photograph.');
 return {name,description,price:data.price,category:data.category,image:data.image,status:data.status};
}
