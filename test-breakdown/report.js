import {import_ens_normalize} from '../impls.js';
import LABELS from '../ens-labels/labels.js';
//import {explode_cp} from '../ens-normalize.js/src/utils.js';
import {mkdirSync, writeFileSync, readdirSync} from 'node:fs';
import {html_escape} from '../utils.js';
import {UNICODE} from '../ens-normalize.js/derive/unicode-version.js';
import {group_by, explode_cp, hex_cp} from '../ens-normalize.js/derive/utils.js';

let {ens_normalize} = await import_ens_normalize('dev');

let same = 0;
let diff = [];
let wholes = [];
let mixture = [];
let disallowed = [];
let placement = [];
let excess_cm = [];

let tally = {
	'different norm': diff,
	'whole-script confusable': wholes,
	'illegal mixture': mixture,
	'disallowed character': disallowed,
	'illegal placement': placement,
	'too many combining marks': excess_cm,
	'underscore allowed only at start': [],
	'invalid label extension': [],
};

for (let label of LABELS) {
	try {
		let norm = ens_normalize(label);
		if (norm === label) {
			same++;
		} else {
			diff.push({label, norm});
		}
	} catch (err) {
		let {message} = err;
		let index = message.indexOf(':');
		if (index == -1) {
			tally[message].push(label);
		} else {
			let type = message.slice(0, index);
			let error = message.slice(index + 1).trim();
			tally[type].push({label, error});
		}
	}
}

console.log('same', same);
for (let [type, bucket] of Object.entries(tally)) {
	console.log(type, bucket.length);
}



let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

writeFileSync(new URL('./tally.json', out_dir), JSON.stringify({same, ...tally}));
create_whole_report(new URL('./wholes.html', out_dir), wholes);
create_mixture_report(new URL('./mixtures.html', out_dir), mixture);
create_placement_report(new URL('./placement.html', out_dir), placement);
create_cm_report(new URL('./cm.html', out_dir), excess_cm);
create_disallowed_report(new URL('./disallowed.html', out_dir), disallowed);


function create_disallowed_report(file, errors) {
	let types = [...group_by(errors, x => x.error).entries()].map(([type, errors]) => {
		let slug = type.slice(type.indexOf('{') + 1, -1);
		let cp = parseInt(slug, 16);
		return {type, slug, cp, errors};
	}).sort((a, b) => {		
		let c = b.errors.length - a.errors.length;
		if (c == 0) c = a.cp - b.cp;
		return c;
	});
	writeFileSync(file, `
		${create_header(`Disallowed Characters (${errors.length})`)}
		<h2>Characters (${types.length})</h2>
		<div class="cloud">
		${types.map(({type, slug, errors}) => {
			return `<a href="#${slug}"><code>${type}</code> (${errors.length})</a>`;
		}).join('\n')},
		</div>
		${types.map(({type, slug, cp, errors}) => {
			return `
				<h2><a name="${slug}"><code>${type}</code> ${UNICODE.get_name(cp, true)} (${errors.length})</a></h2>
				<table>
					<tr><th>#</th><th>Label</th><th>Hex</th></tr>
					${errors.map(({label}, i) => {
						return `<tr>
							<td>${i+1}</td>
							<td class="form"><a class="limit" data-name="${encodeURIComponent(label)}">${html_escape(label)}</a></td>
							<td class="hex"><div class="limit">${explode_cp(label).map(x => {
								let hex = hex_cp(x);
								if (x === cp) hex = `<span>${hex}</span>`;
								return hex;
							}).join(' ')}</div></td>
						</tr>`;
					}).join('\n')}
				</table>
			`;
		}).join('\n')}
		</table>
		<script>
		for (let a of document.querySelectorAll('a[data-name]')) {
			a.target = '_blank';
			a.href = 'https://adraffy.github.io/ens-normalize.js/test/resolver.html#' + a.dataset.name;
		}
		</script>
		</body>
	`);
}

function create_cm_report(file, errors) {
	for (let x of errors) {
		x.group = x.error.split(' ', 2)[0];
	}
	writeFileSync(file, `
		${create_header(`Excess Combining Marks (${errors.length})`)}
		<table>
		<tr>
			<th>#</th>
			<th>Label</th>
			<th>Error</th>
		</tr>
		${errors.sort((a, b) => a.error.localeCompare(b.error)).map(({label, error, group}, i, v) => {
			return `<tr${i > 0 && v[i-1].group === group ? '' : ' class="sep"'}>
				<td class="idx">${i+1}</td>
				<td class="form"><a data-name="${encodeURIComponent(label)}">${html_escape(label)}</a></td>
				<td class="error">${error}</td>
			</tr>`;
		}).join('\n')}
		</table>
		<script>
		for (let a of document.querySelectorAll('a[data-name]')) {
			a.target = '_blank';
			a.href = 'https://adraffy.github.io/ens-normalize.js/test/resolver.html#' + a.dataset.name;
		}
		</script>
		</body>
	`);
}

function create_placement_report(file, errors) {
	let types = [...group_by(errors, x => x.error).entries()].map(([type, errors]) => {
		return {type, slug: type.replace(/\s+/, '_'), errors};
	}).sort((a, b) => b.errors.length - a.errors.length);
	writeFileSync(file, `
		${create_header(`Illegal Placement (${errors.length})`)}
		<ul>
		${types.map(({type, slug, errors}) => {
			return `<li><a href="#${slug}">${type} (${errors.length})</a></li>`;
		}).join('\n')}
		</ul>
		${types.map(({type, slug, errors}) => `
			<h2><a name="${slug}">${type} (${errors.length})</a></h2>
			<table>
				<tr><th>#</th><th>Label</th></tr>
				${errors.map(({label}, i) => {
					return `<tr><td>${i+1}</td><td class="form"><a data-name="${encodeURIComponent(label)}">${html_escape(label)}</a></td></tr>`;
				}).join('\n')}
			</table>
		`).join('\n')}
		</table>
		<script>
		for (let a of document.querySelectorAll('a[data-name]')) {
			a.target = '_blank';
			a.href = 'https://adraffy.github.io/ens-normalize.js/test/resolver.html#' + a.dataset.name;
		}
		</script>
		</body>
	`);
}

function create_mixture_report(file, errors) {
	writeFileSync(file, `
		${create_header(`Illegal Mixtures (${errors.length})`)}
		<table>
		<tr>
			<th>#</th>
			<th>Label</th>
			<th>Error</th>
		</tr>
		${errors.sort((a, b) => a.error.localeCompare(b.error)).map(({label, error}, i, v) => {
			return `<tr${i > 0 && v[i-1].error === error ? '' : ' class="sep"'}>
				<td class="idx">${i+1}</td>
				<td class="form"><a data-name="${encodeURIComponent(label)}">${html_escape(label)}</a></td>
				<td class="error">${error}</td>
			</tr>`;
		}).join('\n')}
		</table>
		<script>
		for (let a of document.querySelectorAll('a[data-name]')) {
			a.target = '_blank';
			a.href = 'https://adraffy.github.io/ens-normalize.js/test/resolver.html#' + a.dataset.name;
		}
		</script>
		</body>
	`);
}

function create_whole_report(file, errors) {
	writeFileSync(file, `
		${create_header(`Whole-script Confusables (${errors.length})`)}
		<table>
		<tr>
			<th>#</th>
			<th>Label</th>
			<th>Conflict</th>
		</tr>
		${errors.sort((a, b) => a.error.localeCompare(b.error)).map(({label, error}, i, v) => {
			return `<tr${i > 0 && v[i-1].error === error ? '' : ' class="sep"'}>
				<td class="idx">${i+1}</td>
				<td class="form"><a data-name="${encodeURIComponent(label)}">${html_escape(label)}</a></td>
				<td>${error}</td>
			</tr>`;
		}).join('\n')}
		</table>
		<script>
		for (let a of document.querySelectorAll('a[data-name]')) {
			a.target = '_blank';
			a.href = 'https://adraffy.github.io/ens-normalize.js/test/confused.html#' + a.dataset.name;
		}
		</script>
		</body>
	`);
}

function create_header(title) {
	return `
	<!doctype html>
	<html>
	<head>
	<meta charset="utf-8">
	<title>${title}</title>
	<style>
		body {
			margin: 3rem;
		}
		.cloud {
			display: flex;
			flex-wrap: wrap;
			gap: 4px;
		}
		.cloud a {
			background: #eee;
			border: 1px solid #ccc;
			padding: 2px 4px;
			border-radius: 4px;
			text-decoration: none;
		}
		.cloud a:hover {
			cursor: pointer;
			background: #cff;
		}
		table {
			border-collapse: collapse;
			border: 2px solid #888;
		}
		table a {
			text-decoration: none;
		}
		table a:hover {
			text-decoration: underline;
			cursor: pointer;
		}
		tr.sep {
			border-top: 2px solid #888;
		}
		tr:nth-child(odd) { 
			background: #eee; 
		}
		th, td {
			border: 1px solid #ccc;
			padding: 2px 4px;
			text-align: center;
		}
		.limit {
			display: block;
			max-height: 8rem;
			overflow-y: auto;
			overflow-wrap: anywhere;
		}
		td.idx {
			color: #888;
		}
		td.form {
			font-size: 20pt;
		}
		td.hex {
			text-align: left;
			font: 10pt monospace;
		}
		td.hex span {
			color: #d00;
		}
		td.error {
			white-space: nowrap;
		}
	</style>
	</head>
	<body>
	<h1>${title}</h1>`;
}
