import {readFileSync} from 'node:fs';

// found through NameRegistered event
export const REGISTERED = JSON.parse(readFileSync(new URL('./registered.json', import.meta.url)));

// found through reverse records
export const REVERSE = JSON.parse(readFileSync(new URL('./reverse.json', import.meta.url)));

//export default JSON.parse(readFileSync(new URL('./db.json', import.meta.url)));
export default [...new Set([REGISTERED, REVERSE].flat().flatMap(s => s.split('.')))];
