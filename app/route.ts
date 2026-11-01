import {readSettings} from '../lib/settings-store';
import {renderStorefront} from '../lib/render-storefront';
export const dynamic='force-dynamic';
export async function GET(){const {settings}=await readSettings();return new Response(renderStorefront(settings),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})}
