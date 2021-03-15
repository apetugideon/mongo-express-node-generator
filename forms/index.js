const fs = require('fs');
const path = require('path');
const pluralize = require('pluralize');

const { 
    capitalizeFirstLetter, 
    readFileString, 
    resolveFileColumns, 
    writeToFile, 
    findReplaceMultiple,
    fieldDataType,
    isFileType,
    isDateField
} = require('../utils');

const createReport = (curr_modules, tableName, formsPath) => {
    let currModuleArr = Object.keys(curr_modules);
    let curr_model_index = currModuleArr.filter((item) => item.toLowerCase() === tableName.toLowerCase())[0];
    let model = curr_modules[curr_model_index];
    let pageName = capitalizeFirstLetter(tableName);
    let tableNameLower = tableName.toLowerCase();
    let tableNameSingular = pluralize.singular(tableName).toLowerCase();

    let toExempt = ['createdBy', 'updatedBy', 'updatedOn', 'createdOn', 'isValid'];
    let tdHeaders = "";
    let tdColumns = "";
    let rowLink = "tabNode";
    let dropDownSelectString = "";
    let dropDownSelectObj = [];
    let uploadFields = [];
    let hasFile = false;
    for(let item in model) {
        if (!toExempt.includes(item)) {
            let fieldName = item;
            let fieldType = fieldDataType(model[item]);
            uploadFields.push(fieldName);
            if (isFileType(item)) hasFile = true;

            let inputType = (fieldType === String) ? "text" : 
                            (fieldType === "ObjectId") ? "text" : 
                            (fieldType === Boolean) ? "text" :
                            (fieldType === Number) ? "text" : "text";
            
            if (!isFileType(item)) {
                tdHeaders += `                            <th>${fieldName}</th>\n`;
                tdColumns += `                let ${fieldName} = tabNode.cell(item.${fieldName});\n`;
                rowLink += `.row(${fieldName})`;
            }


            let tableRef = model[item]['ref'];
            if (tableRef) {
                dropDownSelectObj.push(`${item}Obj`);
                    dropDownSelectString += `    
        if (notEmptyArray(${item}Obj)) {
            makeSelectInput(${item}Obj, "${item}");
        }`;
            }
        }
    }
    tdHeaders += `                            <th>Actions</th>`;

    dropDownSelectString = `
        let { ${dropDownSelectObj.join(", ")} } = response;
    ${dropDownSelectString}
    `;

    let replaceArray = [
        { key: '{ pageName }', value: pageName },
        { key: '{ tableNameLower }', value: tableNameLower },
        { key: '{ modelName }', value: currModuleArr[1] },
        { key: '{ tdHeaders }', value: tdHeaders },
        { key: '{ tdColumns }', value: tdColumns },
        { key: '{ rowLink }', value: rowLink },
        { key: '{ tableNameSingular }', value: tableNameSingular },
        { key: '{ tableName }', value: tableName },
        { key: '{ dropDownSelectString }', value: dropDownSelectString },
        { key: '{ uploadFields }', value: "'" + uploadFields.join("', '") + "'" },
        { key: '{ uploadFieldsTds }', value: "<td>" + uploadFields.join("</td><td>") + "</td>" },
        { key: '{ includeEnctype }', value: (hasFile) ? ` enctype="multipart/form-data"` : "" },
        { key: '{ postFunction }', value: (hasFile) ? "postDataWithFile" : "postData" },
        { key: '{ putFunction }', value: (hasFile) ? "putDataWithFile" : "putData" },
        { key: '{ formVlues }', value: (hasFile) ? "valueWithFile" : "valueWithoutFile" },
        { key: '{ batchValues }', value: (hasFile) ? "resolvedBatchValues(formValues)" : "formValues" },
    ];

    let data = readFileString(path.join(__dirname, `index-template.html`));
    writeToFile(`${formsPath}/${tableNameLower}/index.html`, findReplaceMultiple(data, replaceArray));

    let data2 = readFileString(path.join(__dirname, `script-template.js`));
    writeToFile(`${formsPath}/${tableNameLower}/scripts.js`, findReplaceMultiple(data2, replaceArray));
}

const createForm = (curr_modules, tableName, formsPath) => {
    let currModuleArr = Object.keys(curr_modules);
    let curr_model_index = currModuleArr.filter((item) => item.toLowerCase() === tableName.toLowerCase())[0];
    let model = curr_modules[curr_model_index];
    let pageName = capitalizeFirstLetter(tableName);
    let tableNameLower = tableName.toLowerCase();
    let tableNameSingular = pluralize.singular(tableName);

    let toExempt = ['createdBy', 'updatedBy', 'updatedOn', 'createdOn'];
    let formInputStrings = "";
    let fileUploadScripts = "";
    let uploadFields = [];
    let hasFile = false;
    for(let item in model) {
        if (!toExempt.includes(item)) {
            let fieldName = item;
            let tableRef = model[item]['ref'];
            let fieldType = fieldDataType(model[item]);
            if (fieldName !== "isValid") uploadFields.push(fieldName);
            if (isFileType(item)) hasFile = true;

            //let inputType = (fieldType === String || fieldType === Number) ? "text" : (fieldType === "ObjectId") ? "text" : "text";
            let inputType = (fieldType === String) ? "text" : 
                            (fieldType === "ObjectId") ? "text" : 
                            (fieldType === Boolean) ? "text" :
                            (fieldType === Number) ? "text" : "text";
            if (isDateField(item)) inputType = "date";

            if (fieldType === Boolean) {
                let checkDesc = (fieldName === "isValid") ? "Activate Record" : fieldName;
                formInputStrings += `
                <div class="custom-control custom-checkbox mb-3">
                    <input type='hidden' name='${fieldName}'>
                    <input type="checkbox" class="custom-control-input" id="${fieldName}" name="${fieldName}">
                    <label class="custom-control-label" for="${fieldName}">${checkDesc} ?</label>
                </div>
                `;
            } else {
                if (isFileType(item)) {
                    inputType = "file";
                    fileUploadScripts += `
            document.querySelector("#${fieldName}")
                .addEventListener('change', (event) => fileUpload('${fieldName}Preview', event.target.files[0]));`;
                }
    
                let isRequired = model[item]['required'];
                let columnName = capitalizeFirstLetter(fieldName);
                let requiredField = (isRequired) ? "Compulsory" : "Optional";
                let filePreviewer = inputType === "file" ? `<div id='${fieldName}Preview'></div>` : "";
        
                let fieldInputdef = "";
                if (tableRef) {
                    fieldInputdef = `<select class="fm-con fm-con-solid" id="${fieldName}" name="${fieldName}">
                                    <option value="">Select ${columnName}</option>
                                <select>`;
                } else {
                    if (/(description|address)e?s?/gi.test(item)) {
                        fieldInputdef = `<textarea class="fm-con fm-con-solid txtarea-height" id="${fieldName}" name="${fieldName}" placeholder="Enter ${fieldName}" ></textarea>`;
                    } else {
                        fieldInputdef = `<input type="${inputType}" class="fm-con fm-con-solid" id="${fieldName}" name="${fieldName}" placeholder="Enter ${columnName}" ${inputType === "file" ? "style=\"display:none\"" : ""}>`;
                    }
                }
        
                formInputStrings += `
                            <div class="form-group">
                                <label for="${fieldName}">${fieldName}</label>
                                ${fieldInputdef}
                                ${filePreviewer}
                                <small id="${fieldName}NotifId" class="form-text text-muted">This is a ${requiredField} ${columnName} Field</small>
                            </div>
                `;
            }
        }
    }
    formInputStrings += `           <input type="hidden" id="id" name="id">`;

    let replaceArray = [
        { key: '{ pageName }', value: pageName },
        { key: '{ tableName }', value: tableName },
        { key: '{ modelName }', value: currModuleArr[1] },
        { key: '{ formInputStrings }', value: formInputStrings },
        { key: '{ fileUploadScripts }', value: fileUploadScripts },
        { key: '{ tableNameSingular }', value: tableNameSingular },
        { key: '{ uploadFields }', value: "'" + uploadFields.join("', '") + "'" },
        { key: '{ uploadFieldsTds }', value: "<td>" + uploadFields.join("</td><td>") + "</td>" },
        { key: '{ includeEnctype }', value: (hasFile) ? ` enctype="multipart/form-data"` : "" },
    ];

    let data = readFileString(path.join(__dirname, `create-template.html`));
    writeToFile(`${formsPath}/${tableNameLower}/create.html`, findReplaceMultiple(data, replaceArray));
}

const generate = (curr_modules, tableName, formsPath) => {

    createForm(curr_modules, tableName, formsPath);
    createReport(curr_modules, tableName, formsPath);
    // let currModuleArr = Object.keys(curr_modules);
    // let curr_model_index = currModuleArr.filter((item) => item.toLowerCase() === tableName.toLowerCase())[0];
    // let model = curr_modules[curr_model_index];

    // let modelName = capitalizeFirstLetter(pluralize.singular(tableName));
    // let tableArray = [], createEdits = [], populateValues = [], createEditArray = [], includeFilesArray = [];
    
    // let toExempt = ['createdBy', 'updatedBy'];
    // for(let item in model) {
    //     let tableRef = model[item]['ref'];
    //     if (tableRef) {
    //         let refModulesArr = Object.keys(require(`${process.cwd()}/models/${tableRef.toLowerCase()}`));
    //         let currModel = (refModulesArr.length) ? refModulesArr[1] : "";
            
    //         populateValues.push(`    query.populate('${item}');`);
    //         if ((!tableArray.includes(tableRef)) && (tableRef.toLowerCase() !== tableName.toLowerCase()) && (!toExempt.includes(item))) {
    //             createEditArray.push(`${item}Obj`);
    //             includeFilesArray.push(`const ${currModel} = require('.././models/${tableRef.toLowerCase()}').${currModel};`);
    //             createEdits.push(`let ${item}Obj = await ${currModel}.find().exec();\n    ${item}Obj = parseDates(${item}Obj);\n`);
    //             tableArray.push(tableRef);
    //         }
    //     }
    // }

    // let createEditString = (createEdits.length) ? createEdits.join("\n    ") : "";
    // let populateString = (populateValues.length) ? populateValues.join("\n") : "";
    // let fileIncludeString = (includeFilesArray.length) ? includeFilesArray.join("\n") : "";
    // let createEditValues = (createEditArray.length) ? createEditArray.join(", ") : "";

    // let date_values = ['createdOn', 'updatedOn'];
    // const modelArray = Object.keys(model);

    // let whereClauseArray = [];
    // modelArray.forEach((item, pos) => {
    //     if (date_values.includes(item)) {
    //         whereClauseArray.push(`    if (queries.${item}) Object.assign(queryFilters, date_on('${item}', queries.${item}));`);
    //     } else if (item === "names") {
    //         whereClauseArray.push(`    if (queries.${item}) queryFilters.${item} = { $regex: queries.${item}, $options: 'gi' };`);
    //     } else {
    //         whereClauseArray.push(`    if (queries.${item}) queryFilters.${item} = queries.${item};`);
    //     }
    // });

    // let whereClauses = (whereClauseArray.length) ? whereClauseArray.join("\n") : "";
    // let fileColumns = resolveFileColumns(model);
    // let tableNameLower = tableName.toLowerCase();
    // let dataFile = 'template'; 
    // if (tableNameLower === "users") {
    //     dataFile = '/user-template';
    // }

    // let data = readFileString(path.join(__dirname, `${dataFile}.js`));
    // let replaceArray = [
    //     { key: '{ MainModel }', value: capitalizeFirstLetter(tableName) },
    //     { key: '{ tableNameLower }', value: tableNameLower }, 
    //     { key: '{ sModel }', value: pluralize.singular(tableNameLower)},
    //     { key: '{ fieldSelections }', value: Object.keys(model).join(' ')},
    //     { key: '{ whereClauses }', value: whereClauses },
    //     { key: '{ populateString }', value: populateString },
    //     { key: '{ createEditString }', value: createEditString },
    //     { key: '{ createEditValues }', value: (createEditValues === "") ? createEditValues : createEditValues + ", " }, 
    //     { key: '{ whereClauses }', value: whereClauses },
    //     { key: '{ fileIncludeString }', value: fileIncludeString },
    //     { key: '{ modelName }', value: currModuleArr[1] },
    //     { key: '{ modelNameLower }', value: modelName.toLowerCase() }
    // ];

    // writeToFile(`${controllersPath}/${tableNameLower}.js`, findReplaceMultiple(data, replaceArray));
}

module.exports.generate = generate;