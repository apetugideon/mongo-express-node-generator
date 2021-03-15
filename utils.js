const path = require('path');
const fs = require('fs');
const basePath = "../../";

const readFileString = (fileDir) => {
    try {
        return data = fs.readFileSync(fileDir, 'utf8');
    } catch (error) {
        console.log(error);
        return "";
    }
}

const writeToFile = (fileName, fileContent) => {
    fileName = path.join(path.join(__dirname, basePath), fileName);
    
    const filePath = path.parse(fileName).dir;
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
    }
    fs.writeFile(fileName, fileContent, (error) => {
        if (error) return console.log(error);
        console.log('The file was saved!');
    });
};

const capitalizeFirstLetter = (word) => {
    return word.charAt(0).toUpperCase() + word.substring(1);
} 

const findReplaceMultiple = (stringValue, replaceArray) => {
    replaceArray.forEach(item => {
        stringValue = stringValue.replace((new RegExp(`${item.key}`, 'gi')), item.value);
    });
    return stringValue;
}

const resolveFileColumns = (model) => {
    return Object.keys(model).filter(item => /(file|picture|video|mediaurl|url)s?$/i.test(item));
}


const fieldDataType = (objectValue) => {
    if (objectValue) {
        let dataType = objectValue['type'];
        if (typeof dataType === 'function') {
            if (Object.values(dataType)[0] === 'ObjectId') {
                dataType = 'ObjectId';
            } else if (Object.values(dataType)[0] === 'Decimal128') {
                dataType = 'Decimal128';
            }
        }
        if (!dataType) dataType = objectValue;
        return dataType;
    }
}


const generateFakeValues = (dType) => {
    let value;
    const alphae = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    const rNumber = Math.floor((Math.random() * 10000) + 5000);
    if (dType === Number) value = rNumber;
    if (dType === Boolean) value = true;
    if (dType === "Decimal128") value = rNumber + 0.25;
    if (dType === String) value = String(rNumber).split("").map(item => alphae[+item]).join("").toLowerCase();
    return value;
}

const modelModules = (modelFile) => {
    let mainAppPath = process.cwd();
    let currModule   = require(`${mainAppPath}/models/${modelFile}`); 
    let moduleKeys   = Object.keys(currModule);
    let moduleValues = Object.values(currModule);
    return { moduleKeys, moduleValues };
}

module.exports.isFile = (field) => {
    return /files?$/i.test(field);
}

module.exports.isPicture = (field) => {
    return /pictures?$/i.test(field);
}

module.exports.isVideo = (field) => {
    return /videos?$/i.test(field);
}

module.exports.isUrl = (field) => {
    return /(mediaurl|url)s?$/i.test(field);
}

const isFileType = (field) => {
    return /(file|picture|video|mediaurl|url)s?$/i.test(field);
}

module.exports.isDateField = (field) => {
    return /dates?/gi.test(field) || (field === 'updatedOn') || (field === 'createdOn');
}

module.exports.isFileType = isFileType;
module.exports.writeToFile = writeToFile;
module.exports.modelModules = modelModules;
module.exports.fieldDataType = fieldDataType;
module.exports.readFileString = readFileString;
module.exports.resolveFileColumns = resolveFileColumns;
module.exports.generateFakeValues = generateFakeValues;
module.exports.findReplaceMultiple = findReplaceMultiple;
module.exports.capitalizeFirstLetter = capitalizeFirstLetter;
