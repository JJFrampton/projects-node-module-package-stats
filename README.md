# Package Stats

This module is designed to suppliment the ```npm search``` and ```npm view``` commands, providing more data around the current popularity of any given module and displaying it within the terminal through ascii charts and graphs.

This module is comprised of two data sources: 
- api.npmjs.org
  - used to gather historical data (downloads per day)
- api.npms.io
  - used to gather scores (maintenance, popularity, quality, etc)
  - details on how these scores are attained can be found [here](https://github.com/npms-io/npms-analyzer/blob/master/docs/architecture.md)

### Install
```npm install -g https://github.com/JJFrampton/projects-node-module-package-stats.git```

### Usage
```npm-search <npm module search term> [--debug --days <int>]```

### Uninstall
```npm uninstall -g package-stats```

### Example Usage and Results
```npm-search socket```

<img width="933" alt="Screen Shot 2022-02-25 at 11 56 40 PM" src="https://user-images.githubusercontent.com/7301152/155833427-1a4d471f-e3b2-4c0d-a0de-d3e3e0d1039c.png">
