// execute `node fs.readdirSync.js`
const path = require('path');
const { readdirSync } = require('fs');

console.log(readdirSync(path.join(__dirname, 'packages')));
