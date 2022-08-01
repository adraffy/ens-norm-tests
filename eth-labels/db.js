import {readFileSync} from 'node:fs';
export default JSON.parse(readFileSync(new URL('./db.json', import.meta.url)));