const ContainerObject = require('../../lib/object/container-object');
const Model = require('./model');
const inject = require('../../lib/object/inject');

module.exports = ContainerObject.compose({

    table: null,
    attributes: null,

    modelName: null,
    schema: null,
    tableInfo: null,
    model: null,

    store: inject('service:store'),


    getSchema() {
        if (!this.schema) {
            this.schema = this.attributes.create();
        }
        return this.schema;
    },

    getTable() {
        if (!this.tableInfo) {
            this.tableInfo = this.table.create();
        }
        return this.tableInfo;
    },

    checkSchema() {
        const schema = this.getSchema();
        // generate a new schema.json from attributes

        // validate against the existing schema.json

        // warn on attributes missing from Schema, migrations must be done manually
        //  and models are allowed to not include attributes present in the schema.json
        // error on attributes missing from schema.json
    },

    checkTable() {
        // generate a new table definition from the Table and Schema

        // validate against the database

        // error on differences
    },

    createModelClass() {
        const schema = this.getSchema();
        return Model.compose({
            meta: {
                modelName: this.modelName,
                schema: schema
            }
        });
    },

    getModel() {
      // generate a Model Class
        if (!this.model) {
            this.model = this.createModelClass();
        }
        return this.model;
    },

    registerModel() {
      this.container.register(`model:${this.modelName}`, this.getModel(), {
          singleton: false,
          instantiate: false
      });
    },

    init() {
        if (!this.modelName) {
            throw "Model instances expect a modelName";
        }
        this.checkSchema();
        this.checkTable();
        this.registerModel();
    }

});