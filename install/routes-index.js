var fs = require('fs');

module.exports = (app, cors) => {
    fs.readdirSync(__dirname).forEach((item) => {
        let [inp, fname, ext] = /(\w+).(\w+)$/.exec(item);
        if(fname === "index" || fname === "routes" || ext !== "js") return;
        let route = require('./'+fname);
        app.use('/', cors(), route);
    });
}