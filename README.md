---
[![npm version](https://badge.fury.io/js/malta-millis.svg)](http://badge.fury.io/js/malta-millijs)
[![Dependencies](https://david-dm.org/fedeghe/malta-millijs.svg)](https://david-dm.org/fedeghe/malta-millijs)
[![npm downloads](https://img.shields.io/npm/dt/malta-millijs.svg)](https://npmjs.org/package/malta-millijs)
[![npm downloads](https://img.shields.io/npm/dm/malta-millijs.svg)](https://npmjs.org/package/malta-millijs)  
---  

This plugin can be used on: **.js** files and even on **.coffee** and **.ts** files after using the right plugin  

The plugin will create a lightly minified file:  
- remove multi/single line comments  
- remove new lines  
- reduce 2 or more spaces to 1  
- remove most of the unuseful wrapping spaces  

### Options

- __leaveOriginal__
If given as `true` the plugin will create two files, one .js containing the builded file, and another .min.js containing the minified version.  
If not given the plugin will create just one .js minified file
default value: false


Sample usage:  
```
malta app/script/main.js public/js -plugins=malta-millijs
```
or in the .json file :  
```
"app/script/main.js" : "public/js -plugins=malta-millijs"
```
or in a script : 
``` js
var Malta = require('malta');
Malta.get().check([
    'app/script/main.js',
    'public/js',
    '-plugins=malta-millijs[leaveOriginal:true]'
    ]).start(function (o) {
        var s = this;
        console.log('name : ' + o.name)
        console.log("content : \n" + o.content);
        'plugin' in o && console.log("plugin : " + o.plugin);
        console.log('=========');
    });
```