# go-get
fetch wrapper, with client side asynchronous filtering

It's pretty fetch

##### new Go(url = '', options ={})
- Options accept all fetch options

##### .get(url) => Promise

##### .post(url, Object) => Promise

##### .filter( filterObject) => Promise
- filter can be chained like .then and .catch after .get or .post

##### Examples
```javascript
let go = new Go('https://api.whatdoestrumpthinkcom/api/');
go.get('v1/quotes').then(result => console.log(result));
// Result { messages: {non_personalized: Array(48), personalized: Array(573)}}
```
```javascript
let go = new Go('https://api.whatdoestrumpthinkcom/api/');

let myFilter = {
  messages: {
   non_personalized: {$first: 10},
   personalized: {$last: 10}
  }
}

go.get('v1/quotes').filter(myFilter)
  .then(result => console.log(result));
// Result { messages: { non_personalized: Array(10) ~first 10~, personalized: Array(10) ~last 10~}}
```
