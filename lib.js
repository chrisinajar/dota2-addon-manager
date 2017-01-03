var fs = require('fs');
var fsExtra = require('fs-extra');
var path = require('path');
var partial = require('ap').partial;

module.exports = {
  initializeAddonDirectory: initializeAddonDirectory,
  exitWithError: exitWithError,
  check: check,
  list: list,
  link: link,
  create: create
};

function check (state) {
  if (!state.addonDir) {
    initializeAddonDirectory(state);
  }
  if (!state.definition) {
    initializeAddonDefinitions(state);
  }
}

// list all addons available
function list (state) {
  check(state);

  return fs.readdirSync(state.addonDir)
    .filter(function (name) {
      return fs.statSync(path.join(state.addonDir, name)).isDirectory();
    });
}

// create a new directory structure and symlink it
function create (state, name) {
  check(state);

  var dirName = path.join(state.addonDir, name);

  try {
    fs.statSync(dirName);
    exitWithError(state, ['Directory', dirName, 'already exists'].join(' '));
  } catch (e) {
    if (e.code !== 'ENOENT') {
      exitWithError(state, e);
    }
  }

  try {
    console.log('Creating directories...');
    logAndCreate();
    Object.keys(state.definition).forEach(logAndCreate);
    console.log();
  } catch (e) {
    exitWithError(state, e);
  }

  return link(state, name);

  function logAndCreate (dir) {
    console.log('mkdir', [name, dir || ''].join('/'));
    fs.mkdirSync(path.join(dirName, dir || '.'));
  }
}

function getDefinitionForAddon (state, addon) {
  try {
    return require(path.join(state.addonDir, addon, 'd2am.json'));
  } catch (e) {
    return state.definition;
  }
}

// iterate over all addons and setup symlinks
// if name is passed in, just do it to that one
function link (state, name) {
  check(state);

  if (name) {
    return linkAddon(name);
  } else {
    return list(state).map(linkAddon);
  }

  function linkAddon (addon) {
    console.log('checking symbolic links for', addon);

    return Object.keys(getDefinitionForAddon(state, addon)).map(partial(linkAddonDirectory, addon));
  }
  function linkAddonDirectory (addon, linkName) {
    var baseDir = path.join(state.addonDir, addon, linkName);
    var linkDir = path.join(state.dir, state.definition[linkName].replace('{ADDON_NAME}', addon));
    var linkDirParts = path.parse(linkDir);
    var backupDir = path.join(linkDirParts.dir, linkDirParts.base + '.old');
    var isEmpty = false;
    var resolvedDir;

    try {
      resolvedDir = fs.realpathSync(linkDir);
    } catch (e) {
      if (e.code === 'ENOENT') {
        resolvedDir = null;
      } else {
        exitWithError(state, e);
      }
    }

    if (resolvedDir === baseDir) {
      return true;
    }
    // newline for dramatic effect
    console.log();
    console.log(' *', addon, linkName, 'must be linked');

    isEmpty = fs.readdirSync(baseDir).length === 0;

    if (resolvedDir) {
      if (isEmpty) {
        console.log(' *', addon, linkName, 'is empty, copying the contents from volvo');
        fs.readdirSync(linkDir).map(function (name) {
          fsExtra.copySync(path.join(linkDir, name), path.join(baseDir, name));
        });
      } else {
        console.log(' *', addon, linkName, 'backing up old directory to', linkDirParts.base + '.old');
        fs.renameSync(linkDir, backupDir);
      }
    } else {
      console.log(' *', addon, linkName, 'has not been created in the dota tools yet. Creating it for you!');
      console.log(' * If you somehow destroy the temporary link, just run "d2am link" to recreate them');
    }

    return fsExtra.ensureSymlinkSync(baseDir, linkDir, 'junction');
  }
}

function initializeAddonDefinitions (state) {
  if (!state.addonDir) {
    // this probably shouldn't happen
    initializeAddonDirectory(state);
  }
  var fileName = path.join(state.addonDir, 'definition.json');
  var needsInit = false;

  try {
    fs.statSync(fileName);
  } catch (e) {
    if (e.code === 'ENOENT') {
      needsInit = true;
    } else {
      exitWithError(state, e);
    }
  }

  if (needsInit) {
    console.log('Copying default addon directory definition file');
    fsExtra.copySync(path.join(__dirname, 'definition.json'), fileName);
    console.log('Done!');
  }

  state.definition = require(fileName);
}

function initializeAddonDirectory (state) {
  var dirStat;
  var needsInit = false;

  state.addonDir = path.join(state.dir, 'addons');

  try {
    dirStat = fs.statSync(state.addonDir);
  } catch (e) {
    if (e.code === 'ENOENT') {
      needsInit = true;
    } else {
      exitWithError(state, e);
    }
  }

  if (!needsInit) {
    if (!dirStat.isDirectory()) {
      exitWithError(state, 'addons exists but is not a directory');
    } else {
      // looking good!
      return;
    }
  }

  console.log('Creating addons directory at:', state.addonDir);

  fs.mkdirSync(state.addonDir);
  console.log('Done!');
}

function exitWithError (state, err) {
  if (state.exitOnError) {
    console.error(err);
    process.exit(1);
  } else {
    throw new Error(err);
  }
}
