const fs = require('fs');
const path = require('path');
const pluralize = require('pluralize');

const { 
    capitalizeFirstLetter, 
    readFileString, 
    resolveFileColumns, 
    writeToFile, 
    findReplaceMultiple 
} = require('../utils');

const generate = (curr_modules, tableName, controllersPath) => {

    let currModuleArr = Object.keys(curr_modules);
    let curr_model_index = currModuleArr.filter((item) => item.toLowerCase() === tableName.toLowerCase())[0];
    let model = curr_modules[curr_model_index];

    // let curr_model_index = Object.keys(curr_modules).filter((item) => item.toLowerCase() === tableName.toLowerCase())[0];
    // let model = curr_modules[curr_model_index];

    let modelName = capitalizeFirstLetter(pluralize.singular(tableName));
    let tableArray = [], createEdits = [], populateValues = [], createEditArray = [], includeFilesArray = [];
    
    
    let toExempt = ['createdBy', 'updatedBy'];
    for(let item in model) {
        let tableRef = model[item]['ref'];
        if (tableRef) {
            //console.log(tableRef, tableName);
            let refModulesArr = Object.keys(require(`${process.cwd()}/models/${tableRef.toLowerCase()}`));
            let currModel = (refModulesArr.length) ? refModulesArr[1] : "";
            
            populateValues.push(`    query.populate('${item}');`);
            if ((!tableArray.includes(tableRef)) && (tableRef.toLowerCase() !== tableName.toLowerCase()) && (!toExempt.includes(item))) {
                createEditArray.push(`${item}Obj`);
                includeFilesArray.push(`const ${currModel} = require('.././models/${tableRef.toLowerCase()}').${currModel};`);
                createEdits.push(`let ${item}Obj = await ${currModel}.find().select("_id, names").exec();\n    ${item}Obj = parseDates(${item}Obj);\n`);
                tableArray.push(tableRef);
            }
        }
    }

    let createEditString = (createEdits.length) ? createEdits.join("\n    ") : "";
    let populateString = (populateValues.length) ? populateValues.join("\n") : "";
    let fileIncludeString = (includeFilesArray.length) ? includeFilesArray.join("\n") : "";
    let createEditValues = (createEditArray.length) ? createEditArray.join(", ") : "";

    let date_values = ['createdOn', 'updatedOn'];
    const modelArray = Object.keys(model);

    let whereClauseArray = [];
    modelArray.forEach((item, pos) => {
        if (date_values.includes(item)) {
            whereClauseArray.push(`    if (queries.${item}) Object.assign(queryFilters, date_on('${item}', queries.${item}));`);
        } else if (item === "names") {
            whereClauseArray.push(`    if (queries.${item}) queryFilters.${item} = { $regex: queries.${item}, $options: 'gi' };`);
        } else {
            whereClauseArray.push(`    if (queries.${item}) queryFilters.${item} = queries.${item};`);
        }
    });

    let whereClauses = (whereClauseArray.length) ? whereClauseArray.join("\n") : "";
    let fileColumns = resolveFileColumns(model);
    let tableNameLower = tableName.toLowerCase();
    let dataFile = 'template'; 
    if (tableNameLower === "users") {
        dataFile = '/user-template';
    }

    let data = readFileString(path.join(__dirname, `${dataFile}.js`));
    let replaceArray = [
        { key: '{ MainModel }', value: tableName },
        { key: '{ tableNameLower }', value: tableNameLower }, 
        { key: '{ sModel }', value: pluralize.singular(tableNameLower)},
        { key: '{ fieldSelections }', value: Object.keys(model).join(' ')},
        { key: '{ whereClauses }', value: whereClauses },
        { key: '{ populateString }', value: populateString },
        { key: '{ createEditString }', value: createEditString },
        { key: '{ createEditValues }', value: (createEditValues === "") ? createEditValues : createEditValues + ", " }, 
        { key: '{ whereClauses }', value: whereClauses },
        { key: '{ fileIncludeString }', value: fileIncludeString },
        { key: '{ modelName }', value: currModuleArr[1] },
        { key: '{ modelNameLower }', value: modelName.toLowerCase() }
    ];

    writeToFile(`${controllersPath}/${tableNameLower}.js`, findReplaceMultiple(data, replaceArray));
}

module.exports.generate = generate;