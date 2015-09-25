### Actions

Actions are controllers for a specific PATH + METHOD combination.
They operate on the request and generate the response.

Unless you need to specifically alter what is included in the response,
you can rely on the auto-generated actions.


```
import Action from 'driven/action';

let FooIndex = class FooIndex extends Action {
  handle(page /*,params, body*/) {
    return this.data.all('foo', { page: page.number });
  }
}

export default FooIndex;
```

In a departure from `JSON-API`, all GET `Action`s are capable of functioning
as view-based APIs via `` params
