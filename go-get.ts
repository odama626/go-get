declare var Promise;
declare var window;


  /** 
   * Filter get and post request results
   * 
   * @param {Object} data object to be filtered
   * @param {Object} filter json object used to filter other objects
   *  Use -  key: val | $in: [] | $range: [min, max]
   * 
   *  key: val only returns objects with matching values
   *  $in: [] filter out results not in array 
   *  $range: [min, max] filter out numbers not in range
   */
export function filter(filter): Promise<any> {
  var self = this;
  // this.map: [this.$*] 

  this.$first = (data, filter) => data.slice(0, filter);
  this.$last =  (data, filter) => data.slice(data.length-filter, data.length);


  this.recurse = function(data, filter) {
    let keys = Object.keys(filter).sort();
    let i = 0, m = 0, func = false;

    for (; i < keys.length; i++) {
      let d = data[keys[i]], f = filter[keys[i]];
      for (; m < self.map.length; m++) {
        if (keys[i] === self.map[m]) {
          data = self[self.map[m]](data, f);
          func = true;
          break;
        }
      }
      if (!func && typeof d === 'object' && typeof f === 'object') {
        data[keys[i]] = self.recurse(d, f);
      }
    }
    return data;
  }
  this.go = function(data) {
    return self.recurse(data, filter);
  }


  // create map of all $ functions
  this.map = Object.keys(this).filter(val => val.indexOf('$') === 0);
  // Attach filter to promise
  let r = this.then(this.go);
  return r;
}

export class Go {
  private baseUrl: string;
  private options: object;

  constructor(baseUrl = '', options = {}) {
    this.baseUrl = baseUrl;
    this.options = options;
  }

  get(urlEndpoint: string = ''): Promise<object> {
    return this.buildRequest(urlEndpoint, undefined, 'GET');
  }

  post(urlEndpoint: string, json: object|null): Promise<object> {
    return this.buildRequest(urlEndpoint, json, 'POST');
  }

  query(url: string, query, json: object|null, method: 'GET'|'POST' = 'GET'): Promise<any> {
    if (query == null || typeof query === 'undefined') return Promise.reject({ status: 0, msg: 'query required, did you mean to use get?'});
    let keys = Object.keys(query);
    let q = url+keys.reduce((acc, val, i) => acc+(i==0? '' : '&') + `${encodeURIComponent(val)}=${encodeURIComponent(query[val])}`, '?')
    return this.buildRequest(q, json, method);
  }

  private buildRequest(url: string, json: object|null, method: 'GET'|'POST'): Promise<any> {
    let data: FormData;
    let request = JSON.parse(JSON.stringify(this.options));
    //request.credentials = 'include';

    if (json !== null && typeof json !== 'undefined') {
      let keys = Object.keys(json);
      data = new FormData();
      for (let i = 0; i < keys.length; i++ ) {
        data.append(keys[i], json[keys[i]]);
      }
    }

    if (data !== null && typeof data !== 'undefined') {
      request.body = data as FormData;
      if (method !== 'POST') {
        console.warn('Go', '- GET requests cannot include data (json)! use query or post.', '-- using post instead');
        method = 'POST';
      }
    }

    if (typeof method !== 'undefined' && method !== null) {
      request.method = method;
    }

    let chain: any = fetch(this.baseUrl+url, request)
      .then(this.checkStatus)
      .then(this.checkEmpty)

    chain.__proto__.filter = filter;
    return chain;
  }


  private checkStatus(r: Response) {
    if (!r.ok) throw { status: r.status, msg: r.statusText, response: r };
    return r.json();
  }

  private checkEmpty(r: any) {
    if (Object.keys(r).length === 0 && r.constructor === Object) {
      throw { status: 1000, msg: 'empty response', response: r};
    }
    return r;
  }

  // postSimple(url, body) {
  //   let request = JSON.parse(JSON.stringify(this.options));
  //   request.body = body;
  //   request.method = 'POST';
  //   request.mode = 'no-cors';
  //   request['Access-Control-Allow-Origin'] = '*';
  //   return fetch(this.baseUrl+url, request);
  // }
}

window.Go = Go;
