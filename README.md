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


## View Aware

Model based APIs are useful, but in order to eek that last bit of performance out of
your application you often need to reduce the number of API calls you make at once.

`Driven` comes with three ways to help you reduce API request.

### Sideloading




## RealTime

### WebSockets

All of your endpoints are `WebSocket` accessible out of the box.

### Change Tracking

Utilize intelligent data syncing with your API's app clients by alerting
connected clients in real time to data changes and keeping a handy change
record for clients that need to catch up later.

