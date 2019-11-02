
const execa = require('execa');
const glob = require('glob');
const fs = require('fs');
const path = require('path');
/**
 * @typedef {import('commander').Command} Command
 */
/**
 * Throw error and stop process.
 */
function error() {
  var args = Array.prototype.slice.call(arguments);
  throw ['ERROR:', args.join(' ')].join(' ')
}

/**
 * Resolve file globs based in command line or tsconfig.json file.
 * @returns {Array}
 */
function resolveGlobs() {
  var options = Helper.getOptions(),
    tsConfigFile,
    tsConfig;

  if (options['filesGlob'] && options['filesGlob'].length) {
    return options['filesGlob'];
  } else {
    tsConfigFile = path.join(process.cwd(), options['tsconfigFile']);
    try {
      fs.accessSync(tsConfigFile, fs.constants.R_OK);
      tsConfig = require(tsConfigFile);

      if (!tsConfig['filesGlob'] || !(tsConfig['filesGlob'] instanceof Array)) {
        error('Property "filesGlob" not found in tsconfig.json');
      }

      return tsConfig['filesGlob'];
    } catch (err) {
      error('tsconfig.json file is not accessible.', err);
    }
  }
}


/**
 * Check if a file exists
 * @param cmdPath
 * @returns {boolean}
 */
function fileExists(cmdPath) {
  try {
    fs.accessSync(cmdPath, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * @typedef {object} HelperType
 * @prop {() => string} getTSCCommand
 * @prop {() => string[]} resolveTSFiles
 * @prop {() => Command} getOptions
 */

/** @type {HelperType} */
var Helper = {
  /**
   * Find tsc file executable path
   *
   * @returns {string}
   */
  getTSCCommand: function () {
    // NOTE: This will throw an error if no valid tsc CLI program is found.
    // FUTURE TODO: show more descriptive error and test it in the test suite
    console.info('checking for valid `tsc` CLI program');
    execa.commandSync('tsc --version', { stdio: 'inherit' });
    console.info('valid `tsc` CLI program found');

    return 'tsc';
  },
  /**
   * Resolve ts file paths
   *
   * @returns {Array}
   */
  resolveTSFiles: function () {
    var files = [];

    resolveGlobs().forEach(function (pattern) {
      glob.sync(pattern).forEach(function (file) {
        files.push(file);
      });
    });

    return files
  },
  /**
   * Get command options
   * @returns {Command}
   */
  getOptions: function () {
    var commander = require('commander')
      .command('glob-tsc')
      .version(require('../package.json').version)
      .usage('[options]')
      .allowUnknownOption(true)
      .option('-f, --tsconfig-file <path>', 'tsconfig.json file location. Default ./tsconfig.json', 'tsconfig.json')
      .option('-g, --files-glob <globs>', 'File globs', function (val) {
        return val.split(',');
      }, []).parse(process.argv);

    commander.unknown = commander.parseOptions(process.argv).unknown;

    return commander;
  }
};




module.exports = Helper;