# Dota2 Addon Manager
Manage multiple git hosted dota2 addons and their symlinks on windows with less pain.

# Installation
`npm i -g dota2-addon-manager`

## Usage
```
$ d2am
Commands:
  list           List all available addons
  link [name]    Iterate over all addons and ensure their symlinks are setup
  create <name>  Create directory stub for an addon with a given name

Options:
  --dir, -d   "dota 2 beta" folder.                               [default: "."]
  -h, --help  Show help                                                [boolean]

$ d2am link
checking symbolic links for aaa

 * aaa content must be linked
 * aaa content backing up old directory to aaa.old
checking symbolic links for test-arena

 * test-arena game must be linked
 * test-arena game has not been created in the dota tools yet. Creating it for you!
 * If you somehow destroy the temporary link, just run "d2am link" to recreate them
```

# API

#### d2am `list`
List all available addons from the addon directory.

#### d2am `link [name]`
Check the symlinks for an addon or for all addons if `name` is not specified. If the destination directory already exists and the source is empty, the existing files will be copied in. Otherwise, the existing directory will be renamed ending in `.old`.

#### d2am `create <name>`
Create the skeleton for `name` inside the addons directory. This will automatically run `d2am link` for this mod, following all of it's normal behavior.

## Contributing
`npm run test`

# License
MIT
