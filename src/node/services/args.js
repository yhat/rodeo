import _ from 'lodash';
import yargs from 'yargs';

function getArgv() {
  let sliceNum;

  if (_.endsWith(process.argv[0], 'Electron')) {
    sliceNum = 2;
  } else {
    sliceNum = 1;
  }

  return yargs
    .env('RODEO')
    .boolean('dev').default('dev', false)
    .option('startup', {
      default: true,
      type: 'boolean',
      describe: 'Show startup screen when not given file or path'
    })
    .option('dev', {
      default: false,
      type: 'boolean',
      describe: 'Show development tools'
    })
    .epilogue('RODEO_* environment variables work as well, i.e., RODEO_DEV=true')
    .help('h')
    .alias('h', 'help')
    .version()
    .wrap(null)
    .parse(process.argv.slice(sliceNum));
}

export default {
  getArgv: _.memoize(getArgv)
};
