"use strict";

const ContainerObject = require('../lib/object/container-object');
const EmptyObject = require('../utils/empty-object');
const RSVP = require('rsvp');
const inject = require('../lib/object/inject');

module.exports = ContainerObject.compose({

    _records: null,
    _models: null,

    _createModel(modelName, Schema) {
        let Model = function() {};
        this._models[modelName] = Model;
    },

    modelFor(modelName) {
        if (this._models[modelName]) {
            return Promise.resolve(this._models[modelName]);
        }
        return this.container.lookup(`schema:${modelName}`)
            .then((Schema) => {
                this._createModel(modelName, Schema);
                return this._models[modelName];
            });
    },

    findRecord(modelName, id) {
        return this.modelFor(modelName).then(
            (Model) => {
                return new Model({ id: id })
                    .fetch({
                        require: true
                    });
            });
    },

    findRecords(modelName, ids) {
        return this.modelFor(modelName).then(
            (Model) => {
                const promises = ids.map((id) => {
                    return new Model({ id: id })
                        .fetch({ require: true });
                });
                return RSVP.allSettled(promises);
            });
    },

    query(modelName, query) {
        return this.modelFor(modelName).then(
            (Model) => {
                return new Model(query)
                    .fetch({});
            });
    },

    queryRecord(modelName, query) {
        return this.modelFor(modelName).then(
            (Model) => {
                return new Model(query)
                    .fetchOne({})
            });
    },

    updateRecord() {},
    removeRecord() {},
    createRecord() {},

    seed() {},

    init() {
        this._records = new EmptyObject();
        this._schema = new EmptyObject();
    }

});