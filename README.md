# Driven

<div style="text-align: center;">
  <img src="./assets/driven.png" alt="Driven" title="Driven">
</div>

An unassuming but opinionated framework for building real-time APIs

------------------------------------------------------------------



## Installation

Driven is provided by [driven-cli](https://github.com/appyre/driven-cli), a complete
toolchain and addon infrastructure based on [ember-cli](https://github.com/ember-cli/ember-cli).

To use `driven`, install `driven-cli`.

```
npm install -g driven-cli
```

The rest of the documents here assume the usage of `driven-cli`.

## Features

- Schema based modeling
- Action based APIs
- Json API
- "View aware" endpoints 
- WebSocket Support
- JWT Sessions
- Change Tracking
- ES6/ES7 including `import` and `export`



## Unassuming

You'll find that each of the concepts utilized to build your API are
flexible and lightweight, giving you structure and reducing boilerplate
while staying out of your way so you can prototype quickly without
fighting to solve tricky edge cases.



## Opinionated

Carefully chosen concepts delineate your APIs concerns and fit into an
approachable file organization that lets new developers level up quickly.



## Versioning

Need to build a new version of your API?  You can easily create and use versions
to namespace your Endpoints and Actions.



## View Aware

Model based APIs are useful, but in order to eek that last bit of performance out of
your application you often need to reduce the number of API calls you make at once.

In addition to WebSocket support, `Driven` comes with two ways to help you reduce
the number of requests it takes to get the data you need.

#### Sideloading via `includes`

See [fetching-includes](http://jsonapi.org/format/#fetching-includes)


#### View based coalescing

Each api `version` namespace includes a special `view` action by default.
A POST Request to this action with a JSON object let's you perform multiple `GET` actions at once.

Your JSON Object should contain an object with a single `urls` property. The payload returned
from this endpoint will be the coalesced version of the returns from each of the included URLs.

Meta and links from each endpoint are preserved.

```
POST api/<version>/view

{
  urls: [
     foo/bar?includes[],
     ham/eggs?page[]
  ]
}
```

#### 


## RealTime

### WebSockets

All of your endpoints are `WebSocket` accessible out of the box.

### Change Tracking

Utilize intelligent data syncing with your API's app clients by alerting
connected clients in real time to data changes and keeping a handy change
record for clients that need to catch up later.

