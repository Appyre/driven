const StoreMap = new WeakMap();

module.exports = {
  getStore(obj) {
    return StoreMap.get(obj);
  },
  setStore(obj, store) {
    StoreMap.set(obj, store);
  }
};