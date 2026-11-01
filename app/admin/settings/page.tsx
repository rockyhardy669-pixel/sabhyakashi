import {requireChatGPTUser,chatGPTSignOutPath} from '../../chatgpt-auth';
import {isAdmin} from '../../../lib/admin';
import Settings from './settings-panel';
export const dynamic='force-dynamic';
export default async function Page(){await requireChatGPTUser('/admin/settings');if(!await isAdmin())return <main style={{padding:60}}><h1>Owner access required</h1><a href={chatGPTSignOutPath('/admin/settings')} target="_top">Switch account</a></main>;return <Settings/>}
