const DAG = require('dag-map').default;

module.exports = function dagSort(arr, cb) {
  const graph = new DAG();
  const sorted = [];

  arr.forEach((item) => {
    const module = item.module;
    const { name, after, before } = module;

    graph.add(name, module, before, after);
  });

  graph.topsort((vertex, value) => {
    sorted.push(value);
  });

  return sorted.reduce((cur, next)  => {
    return cur.then(() => { return cb(next); });
  }, Promise.resolve());
};
