import Waterline from 'waterline';
import _ from 'lodash';

export default function makeWaterlineCollection(model) {
  let collection = _.extend({}, model.schema, model.decorator, model.config);
  return Waterline.Collection.extend(collection);
}
