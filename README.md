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
  "foundSimilarityMinRate": 0.9,
  "includedExtensions": ["rs", "ts", "js", "tsx", "jsx"],
  "includedFolders": ["src"]
}
```

## Known Issues

- [ ] Find sliding down copyright texts.
- [ ] Set old copyright text date behaviour.

## Release Notes

You can check implemented features by versioning.

### 1.0.0

- Read config files.
- Adding copyright text to each file if there isn't text on top of it.

**Enjoy!**
