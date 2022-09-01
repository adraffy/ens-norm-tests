import {readFileSync} from 'node:fs';
import {parse_cp_range} from '@adraffy/ens-norm-uts46';
export const CM = new Set(Object.entries(JSON.parse(readFileSync(new URL('./DerivedGeneralCategory.json', import.meta.url))))
	.flatMap(([k, v]) => k.startsWith('M') ? v.flatMap(parse_cp_range) : []));
