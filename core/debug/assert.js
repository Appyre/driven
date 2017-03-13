module.exports = function assert(msg, test) {
  if (!test) {
    throw new Error(msg);
  }
};