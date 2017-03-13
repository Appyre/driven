const getStore = require('../get-store');

class Reference {
  constructor(type, id) {
    this.type = type;
    this.id = id;
  }

  fetch() {
    return getStore(this).findRecord(type, id);
  }
}