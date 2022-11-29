import {import_ens_normalize} from '../impls.js';
import {read_labels} from '../ens-labels/labels.js';
//import {explode_cp} from '../ens-normalize.js/src/utils.js';
import {mkdirSync, writeFileSync, readdirSync} from 'node:fs';
import {html_escape} from '../utils.js';
import {UNICODE} from '../ens-normalize.js/derive/unicode-version.js';
import {group_by, explode_cp, hex_cp, parse_cps, compare_arrays} from '../ens-normalize.js/derive/utils.js';

let {ens_normalize, ens_tokenize} = await import_ens_normalize('dev');

let same = 0;
let diff_case = 0;
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

let labels = read_labels();
for (let label of labels) {
	try {
		let norm = ens_normalize(label);
		if (norm === label) {
			same++;
		} else if (label.toLowerCase() === norm) {
			diff_case++;
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

console.log({same, diff_case});
for (let [type, bucket] of Object.entries(tally)) {
	console.log(type, bucket.length);
}



let out_dir = new URL('./output/', import.meta.url);
mkdirSync(out_dir, {recursive: true});
writeFileSync(new URL('./tally.json', out_dir), JSON.stringify({same, diff_case, ...tally}));
create_whole_report(new URL('./wholes.html', out_dir), wholes);
create_mixture_report(new URL('./mixtures.html', out_dir), mixture);
create_placement_report(new URL('./placement.html', out_dir), placement);
create_cm_report(new URL('./cm.html', out_dir), excess_cm);
create_disallowed_report(new URL('./disallowed.html', out_dir), disallowed);
create_diff_report(new URL('./diff.html', out_dir), diff);


function create_diff_report(file, errors) {
	// TODO: can we auto-derive this from chars-mapped.js with an extra annotation?
	let cats = [
		{name: 'Arabic', cps: '6F0..6F3 6F7..6F9'},
		{name: 'Hyphen', cps: '2010..2015 2212 2043 FE58 23E4 23AF 2E3A 2E3B'},
		{name: 'Apostrophe', cps: '27'},
		{name: 'Negative Circled Digit', cps: '24FF 24EB..24F4'},
		{name: 'Double Circled Digit', cps: '24F5..24FE'},
		{name: 'Dingbat Negative Circled Digit', cps: '2776..277F'},
		{name: 'Dingbat Circled Sans-serif Digit', cps: '1F10B 2780..2789'},
		{name: 'Dingbat Negative Circled Sans-serif Digit', cps: '1F10C 278A..2793'},
		{name: 'Dingbat Negative Circled Sans-serif Letter', cps: '1F150..1F169'},
		{name: '[IDNA] Circled Letter', cps: '24D0..24E9'},
		{name: '[IDNA] Demoji', cps: '2122 2139 24C2 3297 3299 1F201 1F202 1F21A 1F22F 1F232 1F233 1F234 1F235 1F236 1F237 1F238 1F239 1F23A 1F250 1F251'},
	];
	let catchall = [];
	let wrong_emoji = [];
	for (let cat of cats) {
		cat.set = new Set(parse_cps(cat.cps));
		cat.errors = [];
	}
	for (let error of errors) {
		let {label, norm} = error;
		let tokens = error.tokens = ens_tokenize(label);
		let normed = new Set(explode_cp(norm));		
		let complement = [...new Set(explode_cp(label))].filter(cp => !normed.has(cp));
		let matched = cats.filter(cat => complement.some(cp => cat.set.has(cp)));
		if (matched.length === 1) {
			matched[0].errors.push(error);
		} else if (tokens.some(t => t.emoji && compare_arrays(t.input, t.cps)) && norm === String.fromCodePoint(...tokens.flatMap(t => t.emoji ? t.cps : (t.cps || t.cp)))) {
			wrong_emoji.push(error);
		} else {
			catchall.push(error);
		}
	}
	const EMOJI = 'Unnormalized Emoji';
	cats.push({name: EMOJI, errors: wrong_emoji});
	cats.push({name: 'Everything Else', errors: catchall});
	for (let cat of cats) {		
		cat.slug = cat.name.toLowerCase().replaceAll(' ', '_');
	}
	cats.sort((a, b) => b.errors.length - a.errors.length);

	function hex_diff(tokens) {
		return tokens.map(t => {
			if (t.type === 'emoji' && compare_arrays(t.input, t.cps)) {
				return `<span class="emoji">[${t.input.map(hex_cp).join(' ')} → ${t.cps.map(hex_cp).join(' ')}]</span>`;
			} else if (t.type === 'nfc') {
				return `<span class="nfc">${t.input.map(hex_cp).join(' ')} → ${t.cps.map(hex_cp).join(' ')}</span>`;
			} else if (t.type === 'mapped') {
				return `<span class="mapped">[${hex_cp(t.cp)} → ${t.cps.map(hex_cp).join(' ')}]</span>`;
			} else if (t.type === 'ignored') {
				return `<span class="ignored">[${hex_cp(t.cp)}]</span>`;
			} else {
				return t.cps.map(hex_cp).join(' ');
			}
		}).join(' ');
	}

	writeFileSync(file, `
		${create_header(`Different Norm(${errors.length})`)}
		<ul>
		${cats.map(({name, slug, errors}) => {
			return `<li><a href="#${slug}">${name} (${errors.length})</a></li>`;
		}).join('\n')}
		</ul>
		${cats.map(({name, slug, set, errors}) => {	
			let html;
			if (set) {
				html = `
					<ol>
						${[...set].map(cp => `<li><code>${hex_cp(cp)}</code> (${UNICODE.safe_str(cp)}) ${UNICODE.get_name(cp)}</li>`).join('\n')}
					</ol>
					<table>
						<tr><th>#</th><th>Before</th><th>After</th><th>Hex Diff</th></tr>
						${errors.map(({label, norm, tokens}, i) => {
							return `<tr>
								<td>${i+1}</td>
								<td class="form"><a class="limit" data-name="${encodeURIComponent(label)}">${html_escape_marked_tokens(tokens, set, false)}</a></td>
								<td class="form"><a class="limit" data-name="${encodeURIComponent(norm)}">${html_escape_marked_tokens(tokens, set, true)}</a></td>
								<td class="hex">${hex_diff(tokens)}</td>
							</tr>`;
						}).join('\n')}
					</table>
				`;
			} else if (name === EMOJI) {
				function mark_emoji(tokens, norm) {
					return tokens.map(t => {
						if (t.emoji && compare_arrays(t.input, t.cps)) {
							return `<span>${(norm ? t.cps : t.input).map(hex_cp).join(' ')}</span>`;
						} else {
							return (t.cps ?? [t.cp]).map(hex_cp).join(' ');
						}
					}).join(' ');
				}
				html = `<table>
					<tr><th>#</th><th>Form</th><th>Hex Diff</th></tr>
					${errors.map(({label, tokens}, i) => {
						return `<tr>
							<td>${i+1}</td>
							<td class="form"><a class="limit" data-name="${encodeURIComponent(label)}">${html_escape(label)}</a></td>	
							<td class="hex">${hex_diff(tokens)}</td>
						</tr>`;
					}).join('\n')}
				</table>`;
			} else { 
				html = `<table>
					<tr><th>#</th><th>Before</th><th>After</th><th>Hex Diff</th></tr>
					${errors.map(({label, norm, tokens}, i) => {
						return `<tr>
							<td>${i+1}</td>
							<td class="form"><a class="limit" data-name="${encodeURIComponent(label)}">${html_escape(label)}</a></td>	
							<td class="form"><a class="limit" data-name="${encodeURIComponent(norm)}">${html_escape(norm)}</a></td>	
							<td class="hex">${hex_diff(tokens)}</td>
						</tr>`;
					}).join('\n')}
				</table>`;
			}
			return `<h2><a name="${slug}">${name} (${errors.length})</a></h2>${html}`;
		}).join('\n')}
		<script>
		for (let a of document.querySelectorAll('a[data-name]')) {
			a.target = '_blank';
			a.href = 'https://adraffy.github.io/ens-normalize.js/test/resolver.html#' + a.dataset.name;
		}
		</script>
		</body>
		</html>
	`);
}

function html_escape_marked_tokens(tokens, set, norm) {
	return tokens.map(t => {
		if (t.type === 'mapped' && set.has(t.cp)) {
			return `<span>${html_escape(String.fromCodePoint(...(norm ? t.cps : [t.cp])))}</span>`;
		} else {
			return html_escape(String.fromCodePoint(...(t.cps ?? [t.cp])));
		}	
	}).join('');
}


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
		</html>
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
		</html>
	`);
}

function create_placement_report(file, errors) {
	let types = [...group_by(errors, x => x.error.split(':', 2)[0]).entries()].map(([type, errors]) => {
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
		</html>
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
		</html>
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
		</html>
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
			color: #000;
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
		td span.emoji {
			color: #00f;
		}
		td span.ignored {
			color: #aaa;
		}
		td span.nfc {
			color: #c80;
		}
		td span.mapped {
			color: #66f;
		}
		td.hex {
			text-align: left;
			font: 10pt monospace;
		}
		td.error {
			white-space: nowrap;
		}
	</style>
	</head>
	<body>
	<h1>${title}</h1>`;
}
