
### Schema

```
driven g schema foo
```

The above command generates the following files.

```
|–– app
    |–– data
    |   |–– foo
    |       |–– schema.js
    |       |–– decorator.js
    |
    |–– endpoints
    |   |–– foo
    |      |–– list.js
    |      |–– single.js
    |      |–– create.js
    |      |–– update.js
    |      |–– delete.js
```

Is also adds the following endpoint and associated actions to `app/router.js`.

```
this.endpoint('foo', { path: '/foos' }, function() {
  this.action('list', { path: '/', method: 'GET' });
  this.action('single', { path: '/:id', method: 'GET' });
  this.action('create', { path: '/', method: 'POST' });
  this.action('update', { path: '/:id', method: 'PUT' });
  this.action('delete', { path: '/:id', method: 'DELETE' });
});
```

Driven uses `waterline` as an ORM.  Currently, Schema is a pretty syntax
overtop of `Waterline.Collection`.

```
import Schema from 'driven/schema';

export default new Schema({
  identity: 'foo',
  connection: 'local-postgresql',
  attributes: {}
});
```

However, as more features are added some 
