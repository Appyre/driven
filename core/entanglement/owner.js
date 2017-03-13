const OwnerMap = new WeakMap();

module.exports = {
  getOwner(object) {
    return OwnerMap.get(object);
  },

  setOwner(object, parent) {
    OwnerMap.set(object, parent);
  }
};