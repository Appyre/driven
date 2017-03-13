class LifecycleToken {
  constructor(parent) {
    this._parent = parent;
    this._cancelled = false;
  }

  get cancelled() {
    return this._cancelled || (this._cancelled = this._parent ? this._parent.cancelled : false);
  }

  get isAlive() {
    return !this.cancelled;
  }

  cancel() {
    this._cancelled = true;
  }
}

module.exports = LifecycleToken;