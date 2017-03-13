const MetaMap = new WeakMap();

module.exports = function metaFor(object) {
  if (!MetaMap.has(object)) {
    MetaMap.set(object, Object.create(null));
  }

  return MetaMap.get(object);
};