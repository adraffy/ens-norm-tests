import {readFile} from 'node:fs/promises';
export default JSON.parse(await readFile(new URL('./db.json', import.meta.url)));