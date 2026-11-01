import {env} from 'cloudflare:workers';
import {defaultSettings,validateSettings} from './site-settings';
export async function readSettings(){
 const row=await env.DB!.prepare('SELECT value,revision FROM site_settings WHERE id=1').first<{value:string;revision:number}>();
 return {settings:row?validateSettings(JSON.parse(row.value)):defaultSettings,revision:row?.revision??0};
}
