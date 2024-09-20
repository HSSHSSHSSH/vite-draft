var resolve = require('resolve/sync'); // or, `require('resolve').sync
var res = resolve('sync', { basedir: __dirname });
console.log(res);