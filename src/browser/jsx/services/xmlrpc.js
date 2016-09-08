import _ from 'lodash';
import bluebird from 'bluebird';
import {Parser, Builder} from 'xml2js';

const staticHeaders = {
    'Content-Type': 'text/xml',
    'User-Agent': 'Rodeo'
  },
  compactTypes = {
    array: compactArray,
    base64: obj => obj[0],
    boolean: obj => obj[0] === '1',
    'dateTime.iso8601': obj => obj[0],
    double: obj => _.toNumber(obj[0]),
    i4: obj => _.toInteger(obj[0]),
    int: obj => _.toInteger(obj[0]),
    string: obj => obj,
    struct: compactStruct
  },
  expandTypes = {
    string: expandString,
    struct: expandStruct
  };

function convertObjectToXml(obj) {
  return new bluebird(function (resolve) {
    const builder = new Builder();

    resolve(builder.buildObject(obj));
  });
}

function convertXMLTextToObject(text) {
  return new bluebird(function (resolve, reject) {
    new Parser().parseString(text, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

function handleType(type, obj) {
  const value = obj[type][0];

  if (compactTypes[type]) {
    return compactTypes[type](value);
  }
}

function compactStruct(struct) {
  return _.reduce(struct.member, (obj, member) => {
    const name = _.get(member, 'name[0]'),
      value = _.get(member, 'value[0]'),
      type = _.head(Object.keys(value));

    if (compactTypes[type]) {
      obj[name] = handleType(type, value);
    }

    return obj;
  }, {});
}

function compactArray(obj) {
  // arrays always contain a single data element
  const arrayValues = _.get(obj, 'data[0].value');

  return _.map(arrayValues, value => {
    const type = _.head(Object.keys(value));

    return handleType(type, value);
  });
}

function compactResult(obj) {
  const value = _.get(obj, 'methodResponse.params[0].param[0].value[0]'),
    fault = _.get(obj, 'methodResponse.fault[0].value[0].struct[0]');

  if (fault) {
    return compactTypes.struct(fault);
  } else if (value) {
    const type = _.head(Object.keys(value));

    return handleType(type, value);
  }
}

function expandString(str) {
  return {string: str};
}

function expandStruct(obj) {
  return {struct: {member: _.map(obj, function (value, key) {
    if (_.isString(value)) {
      return {name: key, value: expandTypes.string(value)};
    }
  })}};
}

function expectStringArray(obj) {
  const values = _.get(obj, 'methodResponse.params[0].param[0].value[0].array[0].data[0].value');

  return _.map(values, value => {
    return _.get(value, 'string[0]');
  });
}

class Client {
  constructor(url) {
    this.url = url;
  }

  call(methodName, params) {
    params = {param: _.filter(_.map(params, arg => {
      let type;

      // todo: add more types
      if (_.isString(arg)) {
        type = 'string';
      } else if (_.isPlainObject(arg)) {
        type = 'struct';
      }

      return {value: expandTypes[type](arg)};
    }), _.identity)};

    return convertObjectToXml({methodCall: {methodName, params}})
      .then(body => {
        const method = 'POST',
          headers = _.assign({'Content-Length': body.length}, staticHeaders);

        return fetch(this.url, {method, body, headers});
      })
      .then(response => response.text())
      .then(convertXMLTextToObject)
      .then(compactResult);
  }
}

export default {
  Client,
  expectStringArray
};
