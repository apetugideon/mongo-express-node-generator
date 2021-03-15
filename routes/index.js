const fs = require('fs');
const path = require('path');
const pluralize = require('pluralize');
const { 
    readFileString, resolveFileColumns, writeToFile, 
    findReplaceMultiple, generateFakeValues, isFileType 
} = require('../utils');


const createAuthFile = (tableName, middlewaresPath) => {
    tableName = tableName.toLowerCase();
    let data = readFileString(__dirname + "/user-auth.js");
    writeToFile(`${middlewaresPath}/${tableName}Auth.js`, data);
}


const createMiddlewareFile = (tableName, fileColumns, middlewaresPath) => {
    let data = readFileString(__dirname + `/file-upload.js`);
    let imageString;
    tableName = tableName.toLowerCase();
    if (fileColumns.length > 1) {
        let fileString = fileColumns.map(item => `{ name: '${item}', maxCount: 1 }`);
        imageString = `module.exports = multer({storage}).fields([${fileString.join(", ")}]);\n`;
    } else {
        imageString = `module.exports = multer({storage}).single('${fileColumns[0]}');\n`;
    }

    let replaceArray = [
        { key: '{ imageString }', value: imageString }, { key: '{ tableName }', value: tableName }
    ];
    writeToFile(`${middlewaresPath}/${tableName}.js`, findReplaceMultiple(data, replaceArray));
}


const createAPIdoc = (model, apiDocPath, tableName) => {
    let exampleValue = "";
    let exampleValueString = "";
    let toExempt = ['createdBy', 'updatedBy', 'createdOn', 'updatedOn'];
    for(let item in model) {
        let dType = model[item]['type'];
        if (!dType) dType = model[item];

        if (!toExempt.includes(item) && !(/dates?$/i.test(item))) {
            let value = generateFakeValues(dType);    
            
            if (dType === String) {
                exampleValue += (exampleValue === "") ? `"${item}": "${value}"` : `, "${item}": "${value}"`;
                exampleValueString += (exampleValueString === "") ? `\\"${item}\\": \\"${value}\\"` : `,\\n    \\"${item}\\": \\"${value}\\"`;
            } else {
                exampleValue += (exampleValue === "") ? `"${item}": ${value}` : `, "${item}": ${value}`;
                exampleValueString += (exampleValueString === "") ? `\\"${item}\\": ${value}` : `,\\n    \\"${item}\\": ${value}`;
            }
        }
    }

    let data = readFileString(__dirname + `/endpoint-template.js`);
    let replaceArray = [
        { key: '{ routeTag }', value: `${tableName}` }, 
        { key: '{ routePath }', value: `/api/v1/${tableName}` },
        { key: '{ appUrl }', value: "http://localhost:5000" }, 
        { key: '{ appTitle }', value: "App Desc" },
        { key: '{ exampleValue }', value: exampleValue },
        { key: '{ exampleValueString }', value: exampleValueString }
    ];
    writeToFile(`${apiDocPath}/${tableName}.js`, findReplaceMultiple(data, replaceArray));
}


const createAPIdocTemplate = (apiDocPath) => {
    let data = readFileString(__dirname + `/doc-template.js`);
    let replaceArray = [
        { key: '{ appUrl }', value: "http://localhost:5000" }, 
        { key: '{ appTitle }', value: "App Desc" }
    ];
    writeToFile(`${apiDocPath}/index.js`, findReplaceMultiple(data, replaceArray));
}


const generate = (curr_modules, tableName, routesPath, middlewaresPath, apiDocPath) => {

    let curr_model_index = Object.keys(curr_modules).filter((item) => item.toLowerCase() === tableName.toLowerCase())[0];
    let model = curr_modules[curr_model_index];

    let hashFile = false;
    for(let item in model) {
        if (isFileType(item)) hashFile = true;
    }

    let fileColumns = resolveFileColumns(model);
    tableName = tableName.toLowerCase();
    let dataFile = '/template'; 
    if (tableName === "users") {
        dataFile = '/user-template';
        createAuthFile(tableName, middlewaresPath);
    }
    let data = readFileString(__dirname + `${dataFile}.js`);
    let replaceArray = [
        { key: '{ routeName }', value: tableName },
        { key: '{ fileInclude }', value: (hashFile) ? `const ${tableName}Multer = require('../middlewares/${tableName}');` : "" },
        { key: '{ multerVariable }', value: (hashFile) ? `, ${tableName}Multer` : "" }
    ];
    writeToFile(`${routesPath}/${tableName}.js`, findReplaceMultiple(data, replaceArray));
    if (fileColumns.length) {
        createMiddlewareFile(tableName, fileColumns, middlewaresPath);
    }
    createAPIdoc(model, apiDocPath, tableName);
}


module.exports.generate = generate;
module.exports.createAPIdocTemplate = createAPIdocTemplate;