const fs = require("fs");

const data = JSON.parse(fs.readFileSync("./src/data.json")); 

console.log(data);