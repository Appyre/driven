"use strict";

const ContainerObject = require('./container-object');
const Computed = require('./computed');

module.exports = function inject(module) {
    return new Computed(function() {
        const shell = ContainerObject.create();
        return shell.container.lookupSync(module);
    });
};