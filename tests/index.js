const fs = require('fs');
const path = require('path');
const pluralize = require('pluralize');
const { 
    capitalizeFirstLetter, readFileString, resolveFileColumns, writeToFile, 
    findReplaceMultiple, generateFakeValues, fieldDataType, modelModules
} = require('../utils');

const convertFakeValuesToArray = (values) => {
    const keys = Object.keys(values);
    const kvalues = Object.values(values);
    return keys.map((item, pos) => `${item}: ${kvalues[pos]}`);
}


const writeShouldNotPostTests = (allRequiredFields, allFakeValues, tableNameLower) => {
    let valueString = "";
    let name_singular = tableNameLower.toLowerCase();
    allRequiredFields.forEach(field => {
        if (field in allFakeValues) delete allFakeValues[field];
        valueString += `
        it('it should not POST a ${name_singular} without ${field} field', (done) => {
            let ${name_singular} = {
                allowAutomatedTesting, ${convertFakeValuesToArray(allFakeValues).join(", ")}
            };
    
            chai.request(server)
            .post('/api/v1/${tableNameLower}')
            .send(${name_singular})
            .end((error, response) => {
                response.should.have.status(400);
                response.body.should.be.a('object');
                response.body.should.have.property('errors');
                response.body.errors.should.have.property('message');
                done();
            });
        });\n
        `
    });
    return valueString;
}


const extractDataObject = (str) => str.split('({').pop().split('})')[0];


const generateModelTree = (tableName) => {
    let mainAppPath = process.cwd();
    let currModule  = require(`${mainAppPath}/models/${tableName}`);
    let moduleKeys  = Object.keys(currModule), moduleValues = Object.values(currModule);

    let  [ modelObj, model ] = moduleValues;
    let  [ modelObjName, modelName ] = moduleKeys;
    let modelNameLowa= modelName.toLowerCase();
    let valueString  = [], dsCompulsory = [];

    let finalString = "";
    let includeString = "";
    for (let field in modelObj) {
        let dType = fieldDataType(modelObj[field]);
        let isRequired = modelObj[field]['required'];
        let collectionRef = modelObj[field]['ref'];
        if ((dType === "ObjectId") && (collectionRef)) {
            if (isRequired) {
                dsCompulsory.push(field);
                let refdModule = require(`${mainAppPath}/models/${collectionRef.toLowerCase()}`);    
                let recursionObj = generateModelTree(collectionRef.toLowerCase());
                let recursionValue = recursionObj.finalString, incString = recursionObj.includeString;
                valueString.push(`${field}: ${Object.keys(refdModule)[1].toLowerCase()}._id`);
                finalString += `${recursionValue}====`;
                includeString += `${incString}+++++++`;
            } 
        } else {
            let value = generateFakeValues(dType);
            if (dType === String) value = `"${value}"`
            valueString.push(`${field}: ${value}`);
        }
    }

    let testString = `${dsCompulsory.join(",")}*******${modelNameLowa} = (new ${modelName}({ ${valueString.join(", ")} })).save()`;
    finalString += `${testString}`;
    includeString += `${modelName}*****${tableName}`;
    return { finalString,  includeString };
}


const resolveTestComplexites = (fkVal) => {
    let returnArr = [];
    let testCompString = "";
    fkVal = fkVal.split("====");
    let lastLine = fkVal.length - 1;
    fkVal.forEach((item, pos) => {
        let [details, valString] = item.split("*******");
        details = details.trim();
        let [_, singularName] = /^(\w+)/.exec(valString);
        let idValues = (details) ? details.split(",") : [];

        if (pos === 0) {
            if (lastLine === pos) {
                let [_whole, tblname] = /^(\w+) = /.exec(valString);
                testCompString += `let ${tblname} = Promise.resolve({${extractDataObject(valString)}});
    return ${tblname}.then(${tblname} => {
        return { ${tblname} };
    }).catch(error => { return { error } });`;
            } else {
                testCompString += `let ${valString};
    return ${singularName}.then(${singularName} => {
        return { ${singularName} };
    })`;
            }
        } else {
            if (lastLine === pos) {
                let [_whole, tblname] = /^(\w+) = /.exec(valString);
                testCompString += `
    .then(result => {
        let { ${returnArr.join(", ")} } = result;
        let ${tblname} = {${extractDataObject(valString)}};
        return { ...result, ${tblname} };
    }).catch(error => { return { error } });`;
            } else {
                valString = valString.replace(/^\w+ = /, "");
                testCompString += `
    .then(result => {
        let { ${returnArr.join(", ")} } = result;
        return ${valString}
        .then(${singularName} => { return { ${singularName}, ${returnArr.join(", ")} } });
    })`;
            }
        }
        if (!details) { returnArr.push(singularName) } else { returnArr = []; returnArr.push(singularName); };
    });
    return testCompString;
}


const generate = (curr_modules, tableName, testsPath) => {
    let { finalString,  includeString } = generateModelTree(tableName);
    let testComplexities = resolveTestComplexites(finalString);

    let fileToInclude = [];
    includeString.split("+++++++").forEach(item => {
        let [modelName, fileName] = item.split("*****");
        let includeDesc = `const ${modelName} = require('.././models/${fileName}').${modelName};`;
        if (!fileToInclude.includes(includeDesc)) fileToInclude.push(includeDesc);
    });
    let fileIncludeString = (fileToInclude.length) ? fileToInclude.join("\n") : "";
    
    let currModuleArr = Object.keys(curr_modules);
    let curr_model_index = currModuleArr.filter((item) => item.toLowerCase() === tableName.toLowerCase())[0];
    let model = curr_modules[curr_model_index];

    let tableArray = [];
    let dataFile = '/template'; 
    let shouldHaveColumns = "";
    let toExempt = ['createdBy', 'updatedBy', 'createdOn', 'updatedOn'];
    let fileColumns = resolveFileColumns(model);
    let tableNameLower = tableName.toLowerCase();
    let testFakeValues = "";
    let allFakeValues = {};
    let allRequiredFields = [];
    let objectIdFields = [];
    if (tableNameLower === "users") dataFile = '/user-template';
    let postCompulsoryDbs = [];

    let modelName = capitalizeFirstLetter(pluralize.singular(tableName));
    for(let item in model) {
        let isRequired = model[item]['required'];
        let dType = model[item]['type'];
        if (!dType) dType = model[item];

        if (!model[item]['ref']) {
            if (!toExempt.includes(item) && !(/dates?$/i.test(item))) {
                let value = generateFakeValues(dType);

                if (dType === String) {
                    testFakeValues += (testFakeValues === "") ? `${item}: "${value}"` : `, ${item}: "${value}"`;
                } else {
                    testFakeValues += (testFakeValues === "") ? `${item}: ${value}` : `, ${item}: ${value}`;
                }
                
                let shouldHave = `response.body.${modelName.toLowerCase()}.should.have.property('${item}');`;
                shouldHaveColumns += (shouldHaveColumns === "") ? `${shouldHave}` : `\n                ${shouldHave}`;

                allFakeValues[item] = (dType === String) ? `"${value}"` : value;
                if (isRequired) {
                    allRequiredFields.push(item);
                }
            }
        } else {
            if (!toExempt.includes(item)) {
                allFakeValues[item] = `"${generateFakeValues(String)}"`;
                if (isRequired) allRequiredFields.push(item);
                const dataType = model[item]['type'];
                if ((typeof dataType === 'function') && isRequired) {
                    if (Object.values(dataType)[0] === 'ObjectId') {
                        objectIdFields.push(item);
                        postCompulsoryDbs.push(model[item]['ref']);
                    }
                }
            }
        }
    }


    let data = readFileString(__dirname + `${dataFile}.js`);
    let replaceArray = [
        { key: '{ MainModel }', value: tableName },
        { key: '{ tableNameLower }', value: tableNameLower }, 
        { key: '{ sModel }', value: pluralize.singular(tableNameLower)},
        { key: '{ testFakeValues }', value: testFakeValues }, 
        { key: '{ shouldHaveColumns }', value: shouldHaveColumns },
        { key: '{ objectIdFields }', value: objectIdFields.join(", ") },
        { key: '{ modelName }', value: currModuleArr[1] },
        { key: '{ modelNameLower }', value: modelName.toLowerCase() },
        { key: '{ fileIncludeString }', value: fileIncludeString },
        { key: '{ testComplexities }', value: testComplexities }
    ];

    let doNotPostTests = (allRequiredFields.length) ? writeShouldNotPostTests(allRequiredFields, allFakeValues, tableNameLower) : "";    
    replaceArray.push({ key: '{ doNotPostTests }', value: doNotPostTests });
    writeToFile(`${testsPath}/${tableNameLower}.js`, findReplaceMultiple(data, replaceArray));
}


module.exports.generate = generate;