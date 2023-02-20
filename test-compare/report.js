import {IMPLS, require_impl} from '../impls.js';
import {read_labels} from '../ens-labels/labels.js';
import {mkdirSync, writeFileSync, readdirSync} from 'node:fs';
import {explode_cp} from '../ens-normalize.js/src/utils.js';
import {safe_str_from_cps} from '../ens-normalize.js/src/lib.js';
import {html_escape} from '../utils.js';

let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});

const LABELS = read_labels();

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
let a = require_impl('ens_normalize.git');
//let a = require_impl('ens_normalize.local');
let b = require_impl('eth-ens-namehash');
//let b = require_impl('UTS46');

let out_file = new URL(`./${a.slug}_vs_${b.slug}.html`, out_dir);
writeFileSync(out_file, create_html_report(a, b)); 

/*
let j = IMPLS.findIndex(x => x.name === 'ens_normalize' && x.primary); // quick hack
if (j == -1) throw new Error('wtf');
for (let i = 0; i < IMPLS.length; i++) {
	if (i == j) continue;
	if (i != 0) continue;
	
	let [a, b] = [IMPLS[i], IMPLS[j]].sort((a, b) => a.slug.localeCompare(b.slug));
	let out_file = new URL(`./${a.slug}_vs_${b.slug}.html`, out_dir);
	console.log(i, j, a.slug, b.slug);
	writeFileSync(out_file, create_html_report(a, b)); 
	throw 1;
}
*/

writeFileSync(new URL('./index.html', out_dir), create_html_index());

function create_html_index() {
	let names = readdirSync(out_dir).filter(x => x.includes('_') && x.endsWith('.html'));
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
	//let same_lib = A.name === B.name;
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
			table { border-collapse: collapse; width: 100%; table-layout: fixed; }
			td { border: 1px solid #aaa; line-break: anywhere; width: 25% }
			thead td { background: #ccc; font-weight: bold; }
			tbody tr:nth-child(odd) { background: #eee; }
			td.index { background: #ccc; text-align: center; white-space: pre; width: 60px; } 
			td.width { width: 32%; }
			tbody td.error { background: #fcc; }
			td div { max-height: 10rem; overflow-y: auto;  }
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
		return `<tr>${td}<td>${n}</td><td>${(100 * n / LABELS.length).toFixed(5)}%</td></tr>`;
	}
	let diff = Object.values(buckets).reduce((a, v) => a + v.length, 0);
	html += format_total('<td style="background-color: #cfc; font-weight: bold">Same</td>', LABELS.length - diff);
	html += format_total('<td style="background-color: #fcc; font-weight: bold">Different</td>', diff);
	for (let [type, bucket] of Object.entries(buckets)) {
		html += format_total(`<td><a href="#${type}">${format_type(type)}</a></td>`, bucket.length);
	}
	html += '</tbody></table>';

	for (let [type, bucket] of Object.entries(buckets)) {		
		html += `<a name="${type}"><h2>${format_type(type)} (${bucket.length})</h2></a>`;
		if (type === 'both-error') {
			bucket = bucket.filter(x => x.a.message !== x.b.message);
			html += `<h3>Showing ${bucket.length} differences</h3>`;
			if (bucket.length === 0) {
				continue;				
			}
		}
		let temp = `			
			<table id="${type}">
			<colgroup>
			<col width="50px">
			<col width="33%">
			<col width="33%">
			<col width="33%">
			</colgroup>
			<thead>
			<tr>
			<td class="index">#</td>
			<td class="name">Name</td>
			<td>${A.name} (${A.version})</td>
			<td>${B.name} (${B.version})</td>
			</tr>
			</thead>
			<tbody>
		`;
		temp += bucket.sort((a, b) => a.label.localeCompare(b.label)).map(({label, a, b}, i) => `<tr>
			<td class="index">${i+1}</td>
			<td class="name">${escape_name(label)}</td>
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
	return `<div>${html_escape(safe_str_from_cps(explode_cp(name)))}</div>`;
}

function format_result(x) {
	if (typeof x === 'string') {
		return `<td>${escape_name(x)}</td>`;
	} else {
		return `<td class="error"><div>${x.message}</div></td>`;
	}
}

