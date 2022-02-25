# Package Stats

The "npm search" functionality is useful for getting details on what a package is, what it can do and more. This module is designed to be used as a suppliment to said command, providing more data around the current popularity of any given module and displaying it within the terminal through ascii charts and graphs.

This module is comprised of two data sources: 
- api.npmjs.org
  - used to gather historical data (downloads per day)
- api.npms.io
  - used to gather scores (maintenance, popularity, quality, etc)
  - details on how these scores are attained can be found [here](https://github.com/npms-io/npms-analyzer/blob/master/docs/architecture.md)

### Install
npm install -g https://github.com/JJFrampton/projects-node-module-package-stats.git

### Usage
npm-search <npm module search term> [--debug --days <int>]

### Uninstall
npm uninstall -g package-stats
