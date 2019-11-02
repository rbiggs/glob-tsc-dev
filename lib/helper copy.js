var glob, execa

var Helper = {};

/**
 * Find tsc file executable path
 *
 * @returns {string}
 */
Helper.getTSCCommand = function () {
  // NOTE: This will throw an error if no valid tsc CLI program is found.
  // FUTURE TODO: show more descriptive error and test it in the test suite
  console.info('checking for valid `tsc` CLI program');
  // @ts-ignore
  execa.commandSync('tsc --version', { stdio: 'inherit' });
  console.info('valid `tsc` CLI program found');

  return 'tsc';
};

/**
 * Resolve ts file paths
 *
 * @returns {Array}
 */
Helper.resolveTSFiles = function () {
  var files = [];

  resolveGlobs().forEach(function (pattern) {
    glob.sync(pattern).forEach(function (file) {
      files.push(file);
    });
  });

  return files
};

/**
 * Get command options
 * @returns {Command}
 */
Helper.getOptions = function () {
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
};

/**
 * @typedef {object} Helper
 * @prop {() => string} getTSCCommand
 * @prop {() => any[]} resolveTSFiles
 * @prop {() => Command} getOptions
 */
/**
 * @type {Helper}
 */
module.exports = Helper;