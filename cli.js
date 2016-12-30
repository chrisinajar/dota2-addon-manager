#!/usr/bin/env node
// lol, lets see what that does in windows ^
// cli interface for the library
var Manager = require('./');
var yargs = require('yargs')
  .help('help')
  .alias('h', 'help')
  .option('dir', {
    alias: 'd',
    default: '.',
    global: true,
    describe: '"dota 2 beta" folder.'
  })
  .command('list', 'List all available addons')
  .command('link [name]', 'Iterate over all addons and ensure their symlinks are setup')
  .command('create <name>', 'Create directory stub for an addon with a given name')
  .demand(1);
var argv = yargs.argv;
var command = argv._[0];

var manager = Manager(argv, true);

if (!manager[command]) {
  console.error('Unknown command:', command);
  console.error();
  yargs.showHelp();
  process.exit(1);
}

var results;
switch (command) {
  case 'list':
    results = manager.list();
    console.log();
    console.log('Available mods:');
    if (results.length) {
      console.log(' *', results.join('\n * '));
    } else {
      console.log('None');
    }
    break;
  case 'link':
    results = manager.link(argv.name);
    break;
  case 'create':
    results = manager.create(argv.name);
    break;
  default:
    console.error('No interpreter for', command);
    console.log(manager[command]());
}
