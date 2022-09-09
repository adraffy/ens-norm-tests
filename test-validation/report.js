import {IMPLS} from '../impls.js';
import {escape_for_html, escape_unicode} from '../utils.js';
import {run_tests} from '@adraffy/ensip-norm';
import {mkdir, writeFile, readdir} from 'node:fs/promises';

let out_dir = new URL('./output/', import.meta.url);

await mkdir(out_dir, {recursive: true});

for (let impl of IMPLS) {
	if (impl.prior) continue; // dont generate old reports
	await writeFile(new URL(`./${impl.slug}.html`, out_dir), create_html_report(impl)); 
}

await writeFile(new URL('./index.html', out_dir), await create_html_index());

async function create_html_index() {
	let names = (await readdir(out_dir)).filter(x => x.includes('_') && x.endsWith('.html'));
	let html = names.map(name => {
		return `<li><a href="./${name}">${name}</a></li>`;
	}).join('');
	let title = `Validation Reports (${names.length})`;
	return `
		<!doctype html>
		<html>
		<head>
		<meta charset="utf-8">
		<title>${title}</title>
		</head>
		<body>
		<h1>${title}</h1>
		<ul>
		${html}
		</ul>
		</body>
	`;
}

function escape_name(name) {
	return `<div>${escape_for_html(name)}</div>`;
}

function error_tds(error) {
	switch (error.type) {
		case 'unexpected error': 
			return `
				<td class="expect">${escape_name(escape_unicode(error.norm ?? error.name))}</td>
				<td class="result error">${error.result}</td>
			`;
		case 'expected error': 
			return `
				<td class="expect error"></td>
				<td class="result">${escape_name(escape_unicode(error.result))}</td>
			`;
		case 'wrong norm': 
			return `
				<td class="expect">${escape_name(escape_unicode(error.norm ?? error.name))}</td>
				<td class="result">${escape_name(escape_unicode(error.result))}</td>
			`;
		default: throw new TypeError('wtf');
	}
}

function create_html_report({name, fn, version}) {
	let errors = run_tests(fn);
	let html;
	if (errors.length == 0) {
		html = `<div id="pass">0 Errors!</div>`
	} else {
		html = errors.map((x, i) => `
			<tr class="${x.type.replace(' ', '-')}">
			<td class="index">${i+1}</td>
			<td class="type">${x.type}</td>
			<td class="name">${escape_name(x.name)}</td>
			<td class="escaped">${escape_name(escape_unicode(x.name))}</td>
			${error_tds(x)}
			<td class="comment">${x.comment ?? ''}</td>
			</tr>
		`).join('');
		html = `
			<h2>Errors (${errors.length})</h2>
			<table>
			<thead>
			<tr>
			<td class="index">#</td>
			<td class="type">Type</td>
			<td class="name">Name</td>
			<td class="escaped">Escaped</td>
			<td class="expect">Expect</td>
			<td class="result">Result</td>
			<td class="comment">Comment</td>
			</tr>
			</thead>
			<tbody>
			${html}
			</tbody>
			</table>
		`;
	}
	let title = `Validation: ${name} (${version}) @ ${new Date().toJSON()}`;
	return `
		<!doctype html>
		<html>
		<head>
		<meta charset="utf-8">
		<title>${title}</title>
		<style>
			body { margin: 1rem; }
			table { border-collapse: collapse; width: 100%; }
			thead td { font-weight: bold; background: #ccc; }
			td { border: 1px solid #aaa; line-break: anywhere; }
			td.index { text-align: center; background: #ccc; white-space: pre; }
			td.type { text-align: center; white-space: pre; }
			tr.expected-error td.type { background: #f66; }
			tr.expected-error td.expect { background: #fcc; }
			tr.expected-error td.result { background: #ffc; }
			tr.unexpected-error td.type { background: #66f; }
			tr.unexpected-error td.expect { background: #cfc; }
			tr.unexpected-error td.result { background: #fcc; } 
			tr.wrong-norm td.type { background: #f90; }
			tr.wrong-norm td.expect { background: #cfc; }
			tr.wrong-norm td.result { background: #ffc; }
			td div { max-height: 10rem; overflow: auto; max-width: 25vw; }
			tbody tr:nth-child(odd) { background: #eee; }            
			#pass { font-size: 72px; color: #0a0; }
		</style>
		</head>
		<body>
		<h1>${title}</h1>
		${html}
		</body>
		</html>
	`;
}