#!/usr/bin/env node

const appPath = "../../";
const fs = require('fs');
const path = require('path');
const test = require('./tests');
const route = require('./routes');
const installModule = require('./install');
const controller = require('./controllers');
const forms = require('./forms');

const testsPath  = "test";
const modelsPath = "models";
const routesPath = "routes";
const formsPath = "forms";
const apiDocPath = "api-doc";
const controllersPath = "controllers";
const middlewaresPath = "middlewares";

const params = process.argv.map(item => item.toLowerCase());
let action = params[2].toUpperCase();
const { capitalizeFirstLetter } = require('./utils');

if (action === "INSTALL") {
    installModule.install();
} else if (action === "GENERATE") {
    route.createAPIdocTemplate(apiDocPath);
    let model_url = path.join(__dirname, appPath);
    model_url = path.join(model_url, 'models');
    fs.readdirSync(model_url).forEach((item) => {
        try {
            let [_, fname] = /(\w+).(\w+)$/.exec(item);
            let modelName = capitalizeFirstLetter(fname);
            let curr_modules = require(`${model_url}/${fname}`);
            
            let model = curr_modules;
            controller.generate(model, fname, controllersPath);
            route.generate(model, fname, routesPath, middlewaresPath, apiDocPath);
            test.generate(model, fname, testsPath);
            forms.generate(model, fname, formsPath);
        } catch(e) {
            console.log("Errors: ", e);
        }
    });
}