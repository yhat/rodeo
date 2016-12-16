import _ from 'lodash';

const packageInstallerCommands = {
  conda: (packageName, version) => {
    if (version) {
      return  `! conda install ${packageName}==${version}`;
    }

    return `! conda install ${packageName}`;
  },
  pip: (packageName, version) => {
    if (version) {
      return  `! pip install --disable-pip-version-check -qq ${packageName}==${version}`;
    }

    return `! pip install ${packageName}`;
  }
};

/**
 * @param {object} args
 * @returns {object}
 */
function toPythonArgs(args) {
  return _.reduce(args, function (obj, value, key) {
    obj[_.snakeCase(key)] = value;
    return obj;
  }, {});
}

/**
 * @param {string} line
 * @returns {boolean}
 */
function isCodeLine(line) {
  if (!line.length) {
    return false;
  }

  const firstRealChar = _.trimStart(line)[0];

  return firstRealChar !== '#' && /\S/.test(firstRealChar);
}

/**
 * Some lines in python are runnable, but only some are runnable as a first line of a python block
 * @param {string} line
 * @returns {boolean}
 */
function isRunnableFirstLine(line) {
  return line.length && line[0] !== '#' && /\S/.test(line[0]) && line.substr(0, 4) !== 'else';
}

/**
 * @param {ace.session} session
 * @param {string} line
 * @returns {number}
 */
function getIndentLevel(session, line) {
  line = _.trimEnd(line); // line of all spaces doesn't count
  const tabSize = session.getTabSize();
  let match = line.match(/(^[ \t]*)/),
    indent = match && match[1] || '';

  // replace tabs with spaces
  indent = indent.replace('\t', _.repeat(' ', tabSize));

  return indent.length;
}

/**
 *
 * @param {string} packageName
 * @param {string} [version]
 * @param {string} [packageInstaller='pip']
 * @returns {string}
 */
export function getPackageInstallCommand(packageName, version, packageInstaller) {
  packageInstaller = packageInstaller || 'pip';

  if (packageInstallerCommands[packageInstaller]) {
    return packageInstallerCommands[packageInstaller](packageName, version);
  }
}

export default {
  getIndentLevel,
  isCodeLine,
  isRunnableFirstLine,
  toPythonArgs
};
