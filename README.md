koa-mongo-sanitize
===
Sanitize koa payload for mongodb, works with koa-{body, bodyparser}

# Install
```
npm i --save koa-mongo-sanitize
```


# Usage
```js
const app = require('koa')()
const KoaBody = require('koa-body')
const MongoSanitize = require('koa-mongo-sanitize')

app.use( KoaBody() )
app.use( MongoSanitize() )
```

### Options
You can optionally pass options to `MongoSanitize()`:
#### reject: an object of `{ code, body }`
Sets the status code and response body for rejected requests.  
`body` can be anything that koa accepts for `response.body`.


# Explanation
Checks each key in `this.request.body` for leading `$`. If found, rejects with 400 status.


# LICENSE
MIT
