import {requireChatGPTUser,chatGPTSignOutPath} from '../chatgpt-auth';
import {isAdmin} from '../../lib/admin';
import Admin from './panel';
export const dynamic='force-dynamic';
export default async function Page(){
 await requireChatGPTUser('/admin');
 if(!await isAdmin())return <main style={{padding:60}}><h1>Owner access required</h1><p>Sign in with the ChatGPT account that owns Sabyakashi.</p><a href={chatGPTSignOutPath('/admin')} target="_top">Switch account</a></main>;
 return <Admin/>;
}
