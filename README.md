# What is copyright-fixer

Every company has its copyright rules and all developers has to be apply these rules when
writing codes. But most of formatter programs are agnostic of these rules. It is difficult
to handle copyright rules for each files manually. This extension is handling all of them.

## Features

- Make sure the copyright notice is added at the top of each file.
- Remove copyright texts which sliding downwards.

## Extension Settings

These files will be apply sequentially.

- `.vscode/copyright-fixer.json`
- `copyright-fixer.json`

Example content:

```json
{
  "template": "/**\n * Copyright (c) {companyName} - All Rights Reserved\n * Written by {authorName} <{authorEmail}>, {startYear}-{currentYear}\n */",
  "templateVars": {
    "companyName": "Trillion Dollar Company LTD. STI.",
    "authorName": "John Doe",
    "authorEmail": "john@doe.com",
    "startYear": 1989,
    "currentYear": 2024
  },
  "afterNewLine": 2,
  "foundSimilarityMinRate": 0.8,
  "includedExtensions": ["rs", "ts", "js", "tsx", "jsx"],
  "includedFolders": ["src"],
  "preCmd": ["cargo fmt"]
}
```

#### Explanations of these values:

- `template`: Template string for copyright block. This has to multiline comment as like that.
  Also you can add custom variables, emojis etc...
- `templateVars`: You can set custom variables and values.
- `afterNewLine`: Specify how many new lines will be added after the template. If you want to see
  one line space between copyright and source code you must set `2` (one is for next line, second
  is for empty line).
- `foundSimilarityMinRate`: Sometims vscode adding `import` statements top of the file
  automatically. Then the copyright block will remains below. This extension scans all multiline
  comment blocks and try to find the copyright block. I'm using a basic text similarity
  algorithm for detecting block's similarity with parsed `template` value.
- `includedExtensions`: Specify necessary extensions.
- `includedFolders`: Specify target folders. IMPORTANT: Don't set base folder like `['.']`
  because exclude feature didn't implemented yet. Because of that set only source folders.

## Issue status

- ✅ Find sliding down copyright texts.
- 🚧 Set old copyright text date behaviour.
- 🚧 Exclude folder.

## Release Notes

You can check implemented features by versioning.

### 0.1.1

- Read config files.
- Adding copyright text to each file if there isn't text on top of it.
- Fix empty lines after the copyright block.

### 0.2.0

- Execute command before & after copyright fix.
- Improved copyright block find feature.

**Enjoy!**
