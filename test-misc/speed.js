import {IMPLS} from '../impls.js';

import LABELS from '../ens-labels/labels.js';

for (let impl of IMPLS) {
	let t = performance.now();
	for (let label of LABELS) {
		try {
			fn(label);
		} catch (err) {
		}
	}
	t = performance.now() - t;
	console.log(`${((t * 1000) / LABELS.length).toFixed(1).padStart(6)} μs/label | ${impl.name} (${impl.version})`);
}

/*
   3.9 μs/label | eth-ens-namehash (2.0.15)
   3.9 μs/label | ethers (5.7.0)
   4.2 μs/label | ens_normalize.git (1.8.2)
   4.2 μs/label | ens_normalize.local (1.8.2)
   4.2 μs/label | UTS46 (0.0.5)
   4.2 μs/label | ENS0 (0.0.5)
   4.2 μs/label | Strict 2008 (0.0.5)
*/