import {readFileSync} from 'node:fs';

export const REGISTERED = JSON.parse(readFileSync(new URL('./registered.json', import.meta.url)));

export const REVERSE = JSON.parse(readFileSync(new URL('./reverse.json', import.meta.url)));

export default [...new Set([REGISTERED, REVERSE].flat().flatMap(s => s.split('.')))];
