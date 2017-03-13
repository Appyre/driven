module.exports = {
  initializer: {
    singleton: false,
    instantiate: false
  },
  middleware: {
    singleton: false,
    instantiate: false
  },
  service: {
    singleton: true,
    instantiate: true
  },
  action: {
    singleton: true,
    instantiate: true,
    subTree: 'endpoints'
  },
  endpoint: {
    singleton: true,
    instantiate: true,
    subTree: 'endpoints'
  },
  'default': {
    singleton: false,
    instantiate: false
  },
  adapter: {
    singleton: true,
    instantiate: true,
    subTree: 'data'
  },
  serializer: {
    singleton: true,
    instantiate: true,
    subTree: 'data'
  },
  decorator: {
    singleton: true,
    instantiate: true,
    subTree: 'data'
  },
  schema: {
    singleton: true,
    instantiate: true,
    subTree: 'data'
  },
  normalizer: {
    singleton: true,
    instantiate: true,
    subTree: 'data'
  }
};
