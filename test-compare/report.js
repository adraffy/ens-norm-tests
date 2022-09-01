import {IMPLS} from '../impls.js';
import LABELS from '../eth-labels/db.js';
import {escape_for_html, escape_unicode} from '../utils.js';
import {mkdir, writeFile, readdir} from 'node:fs/promises';

let out_dir = new URL('./output/', import.meta.url);

await mkdir(out_dir, {recursive: true});

// pairwise
/*
for (let j = 1; j < IMPLS.length; j++) {
	for (let i = 0; i < j; i++) {
		let [a, b] = [IMPLS[i], IMPLS[j]].sort((a, b) => a.slug.localeCompare(b.slug));
		let out_file = new URL(`./${a.slug}_${a.version}_vs_${b.slug}_${b.version}.html`, out_dir);
		await writeFile(out_file, create_html_report(a, b)); 
		console.log(i, j, a.name, b.name);
	}
}
*/

let j = IMPLS.findIndex(x => x.name === 'ens_normalize');
if (j == -1) throw new Error('wtf');
for (let i = 0; i < IMPLS.length; i++) {
	if (i == j) continue;
	let [a, b] = [IMPLS[i], IMPLS[j]].sort((a, b) => a.slug.localeCompare(b.slug));
	let out_file = new URL(`./${a.slug}_${a.version}_vs_${b.slug}_${b.version}.html`, out_dir);
	await writeFile(out_file, create_html_report(a, b)); 
	console.log(i, j, a.name, b.name);
}


await writeFile(new URL('./index.html', out_dir), await create_html_index());

async function create_html_index() {
	let names = (await readdir(out_dir)).filter(x => x.includes('_') && x.endsWith('.html'));
	let html = names.map(name => {
		return `<li><a href="./${name}">${name}</a></li>`;
	}).join('');
	let title = `Comparison Reports (${names.length})`;
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

function create_html_report(A, B) {
	let buckets = {};
	for (let label of LABELS) {
		let a_norm, a_error;
		try {
			a_norm = A.fn(label);
		} catch (err) {
			a_error = err;
		}
		let b_norm, b_error;
		try {
			b_norm = B.fn(label);
		} catch (err) {
			b_error = err;
		}
		let type;
		let ret;
		if (a_error) {
			if (b_error) {
				type = 'both-error';
				ret = {a: a_error, b: b_error};
			} else {
				type = 'a-error';
				ret = {a: a_error, b: b_norm};
			}
		} else if (b_error) {
			type = 'b-error';
			ret = {a: a_norm, b: b_error};
		} else if (a_norm !== b_norm) {
			type = 'diff-norm';
			ret = {a: a_norm, b: b_norm};
		} else {
			//type = 'same-norm';
			continue;
		}
		ret.label = label;
		let bucket = buckets[type];
		if (!bucket) buckets[type] = bucket = [];
		bucket.push(ret);
	}
	
	let title = `${A.name} (${A.version}) vs ${B.name} (${B.version}) [${LABELS.length} labels] @ ${new Date().toJSON()}`;

	let html = `
		<!doctype html>
		<html>
		<head>
		<meta charset="utf-8">
		<title>${title}</title>
		<style>
			body { margin: 1rem; }
			table { border-collapse: collapse; width: 100%; }
			td { border: 1px solid #aaa; line-break: anywhere; }
			thead td { background: #ccc; font-weight: bold; }
			tbody tr:nth-child(odd) { background: #eee; }
			td.index { background: #ccc; text-align: center; white-space: pre; } 
			tbody td.error { background: #fcc; }
			td div { max-height: 10rem; overflow: auto; max-width: 25vw; }
			#overall td { text-align: right; }
		</style>
		</head>
		<body>
		<h1>${title}</h1>
	`;

	function format_type(type) {
		switch (type) {
			case 'a-error': return `${A.slug}-error`;
			case 'b-error': return `${B.slug}-error`;
			default: return type;
		}
	}

	html += `
		<table id="overall">
		<thead>
		<tr>
		<td>Type</td>
		<td>#</td>
		<td>%</td>
		</tr>
		</thead>
		<tbody>
	`;
	function format_total(td, n) {
		return `<tr>${td}<td>${n}</td><td>${(100 * n / LABELS.length).toFixed(3)}%</td></tr>`;
	}
	let diff = Object.values(buckets).reduce((a, v) => a + v.length, 0);
	html += format_total('<td style="background-color: #cfc; font-weight: bold">Same</td>', LABELS.length - diff);
	html += format_total('<td style="background-color: #fcc; font-weight: bold">Different</td>', diff);
	for (let [type, bucket] of Object.entries(buckets)) {
		html += format_total(`<td><a href="#${type}">${format_type(type)}</a></td>`, bucket.length);
	}
	html += '</tbody></table>';

	for (let [type, bucket] of Object.entries(buckets)) {
		let temp = `
			<a name="${type}"><h2>${format_type(type)} (${bucket.length})</h2></a>
			<table id="${type}">
			<thead>
			<tr>
			<td class="index">#</td>
			<td class="name">Name</td>
			<td>Escaped</td>
			<td>${A.name}</td>
			<td>${B.name}</td>
			</tr>
			</thead>
			<tbody>
		`;
		temp += bucket.sort((a, b) => a.label.localeCompare(b.label)).map(({label, a, b}, i) => `<tr>
			<td class="index">${i+1}</td>
			<td class="name">${escape_name(label)}</td>
			${format_result(label)}
			${format_result(a)}
			${format_result(b)}
		</tr>`).join('');
		temp += '</tbody></table>';
		html += temp;
	}
	html += `</body></html>`;
	return html;
}

function escape_name(name) {
	return `<div>${escape_for_html(name)}</div>`;
}

function format_result(x) {
	if (typeof x === 'string') {
		return `<td>${escape_name(escape_unicode(x))}</td>`;
	} else {
		return `<td class="error">${x.message}</td>`;
	}
}
