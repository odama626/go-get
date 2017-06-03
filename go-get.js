
var go = {};

go._status = (r) => {
	if (!r.ok) throw { status: r.status, msg: r.statusText};
	let c = r.headers.get('content-type');
	if (c) {
		if (c.indexOf('application/json') !== -1) return r.json();
	}
	throw { status: r.status, msg: 'only json responses are currently supported', response: r};
}

go._checkEmpty = (r) => {
	if (Object.keys(r).length === 0 && r.constructor === Object) {
		throw { status: 1000, msg: 'empty response'};
	}
	return r;
}

go._buildRequest = (url, json, method) => {
	let data = null;
	let request = {
		credentials: 'include',
	}
	if (json) {
		let keys = Object.keys(json);
		data = new FormData();
		for (let i = 0; i < keys.length; i ++) {
			data.append(keys[i], json[keys[i]]);
		}
	}


	if (data) {
		request.body = data;
		if (method !== 'POST') {
			console.warn('go', 'get requests cannot use json! use query or post', '-- using post instead');
			method = 'POST';
		}
	}
	if (method) request.method = method;

	let chain = fetch(url, request)
	.then(go._status)
	.then(go._checkEmpty);
	return chain;
}

go.get = (url, json) => {
	return go._buildRequest(url, json, 'GET');
}

go.post = (url, json) => {
	return go._buildRequest(url, json, 'POST');
}

go.query = (url, query, json, method = 'GET') => {
	if (!query) { return Promise.reject({ status: 0, msg: 'query required, did you mean to use get?'}) }
	let keys = Object.keys(query);
	let q = url+keys.reduce(
		(accum, val, i)=> accum+(i==0? '' : '&')+`${encodeURIComponent(val)}=${encodeURIComponent(query[val])}`, '?');
	return go._buildRequest(q, json, method);
}
