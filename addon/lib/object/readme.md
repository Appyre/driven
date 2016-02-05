# Driven Primitives

Primitives are Composable Objects.

The Driven Primitives are a new experiment in Object Composition.
Instead of `create` representing a factory, all new methods
of an object MUST have been previously defined via `compose`.

## Using Primitives

`new Primitive()` or `primitive.compose()` create and lock an internal Class definition.
```
const Foo = new Primitive({
  prop: 'hello',
  method() {}
});

const Bar = Foo.compose({
  prop: 'hello world',
  anotherMethod() {}
});
```


`reopen` adds to the locked Class prototype
```
Foo.reopen({
  anotherProp: 'bye',
  anotherMethod() {}
});


`create` returns a new instance of the internal Class. You can only pass properties
to `create` that have been previously defined on the class.  You cannot pass methods.
```
const props = {
  prop: 'world',
  anotherProp: 'what?'
};
const myInstance = Foo.create(props);
```


## Init
All instantiated Primitives have an `init` method that triggers after initial state
has been set.  This is your opportunity to invoke other methods during creation.
```
init() {}
```

There is no need to call `super` during init, unless you want to reference a separate `init`
within the composition chain.

## Inheritance

Internally, there is no inheritance.  When you `compose` with an existing,
object you take the original arguments used to create each primitive and replay them
to form the new internal class.

## Super

Primitives passed into `compose` are applied left to right and will overwrite each other.
Every method has access to `this._super.<method-name>` which you can use to access the
previous method declaration just as you would in ES6 `class` based inheritance.  You can
stash `super` for async usage by grabbing a reference to it in your method before you
do anything async.

```
method() {
  const _super = this._super.method;
}
```