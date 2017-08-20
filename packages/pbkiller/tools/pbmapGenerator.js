/**
 * pbmap生成器
 * 
 */
let fs = require('fs');
let path = require('path');
let rd = require('rd');
let util = require('util');
let shell = require('shelljs');

const TEMPLATE_STR = `/*eslint-disable*/
module.exports = %s;
`; 

/**
 * 提取代码
 * @param {string} rootPath 
 * @param {string} beginMark 
 * @param {string} endMark 
 */
function extractCode(rootPath, beginMark, endMark) {
    let files = rd.readFileFilterSync(rootPath, /\.proto$/);
    let arrayCode;
    let reg = new RegExp(`${beginMark}([\\s\\S]*?)${endMark}`);
    files.find((fileName) => {
        let data = fs.readFileSync(fileName, 'utf8');
        let obj = data.match(reg);
        if (obj) {
            arrayCode = obj[0].split(/\n|\r\n/g).slice(1, -1);
            return true;
        }
    });
    return arrayCode;
}

/**
 * 分析ActionCode
 * @param {*} arrayCode
 */
function analyseActionCode(pbmap, arrayCode) {
    let firstLine = arrayCode.shift();
    let matchObj = firstLine.match(/enum ([\s\S]*?){/);
    if (!matchObj) {
        console.log('找不到定义');
        return false;
    }
    let enumName = matchObj[1].trim();
    
    let table = {}
    let codeObject = {};
    pbmap[enumName] = codeObject;
  

    arrayCode.forEach((str) => {
        let values = str.split(/[=;/]/).map(str => str.trim()).filter(str => str);
        let len = values.length;
        let actionName;
        let actionCode;
        if (len >= 2) {
            actionName = values[0]; //str
            actionCode = parseInt(values[1]); //number
            codeObject[actionName] = actionCode;
            table[actionCode] = { name: actionName, code: actionCode, req: null, rsp: null };
        }

        if (len >= 4) {
            table[actionCode].req = values[len - 2]; //取倒数第2个
            table[actionCode].rsp = values[len - 1]; //取倒数第1个
        } else {
            console.log(`此定义未生成映射: ${str}`);
        }
    });
    codeObject.table = table;
    //console.log(pbmap);
    return pbmap;
}

/**
 * 分析push数据
 * @param {Array} arrayCode 
 */
function analysePushCode(pbmap, arrayCode) {
    let firstLine = arrayCode.shift();
    let matchObj = firstLine.match(/enum ([\s\S]*?){/);
    if (!matchObj) {
        console.log('找不到定义');
        return false;
    }
    let enumName = matchObj[1].trim();
    let pushType = {};
    let table = {};
    pbmap[enumName] = pushType;

    arrayCode.forEach((str) => {
        let values = str.split(/[=;/]/).map(str => str.trim()).filter(str => str);
        let len = values.length;
        let pushName;
        let pushCode;
        if (len >= 2) {
            pushName = values[0]; //str
            pushCode = parseInt(values[1]); //number
            pushType[pushName] = pushCode;
        }

        if (len >= 3) {
            table[pushCode] = { code: pushCode, name: pushName, push: values[len - 1] };
        }
    });
    pushType.table = table;
}

/**
 * 分析push数据
 * @param {Array} ErrorCode 
 */
function analyseErrorCode(pbmap, arrayCode) {
    let firstLine = arrayCode.shift();
    let matchObj = firstLine.match(/enum ([\s\S]*?){/);
    if (!matchObj) {
        console.log('找不到定义');
        return false;
    }
    let enumName = matchObj[1].trim();
    let errorCodeObj = {};
    pbmap[enumName] = errorCodeObj;

    arrayCode.forEach((str) => {
        let values = str.split(/[=;/]/).map(str => str.trim()).filter(str => str);
        let len = values.length;
        let errorName;
        let errorCode;
        if (len >= 2) {
            errorName = values[0]; //str
            errorCodeObj[errorName] = parseInt(values[1]); //number
        }
    });
}

const ACTION_CODE_BEGIN = 'ActionCode begin';
const ACTION_CODE_END = 'ActionCode end';
const PUSH_CODE_BEGIN = 'PushCode begin';
const PUSH_CODE_END = 'PushCode end';
const ERROR_CODE_BEGIN = 'ErrorCode begin';
const ERROR_CODE_END = 'ErrorCode end';

function main(rootPath, saveFile) {
    let pbmap = {};
    let array = extractCode(rootPath, ACTION_CODE_BEGIN, ACTION_CODE_END);
    analyseActionCode(pbmap, array);
    
    array = extractCode(rootPath, PUSH_CODE_BEGIN, PUSH_CODE_END);
    analysePushCode(pbmap, array);

    array = extractCode(rootPath, ERROR_CODE_BEGIN, ERROR_CODE_END);
    analyseErrorCode(pbmap, array);
    
    let data = JSON.stringify(pbmap, null, 4);
    data = util.format(TEMPLATE_STR, data);
    data = data.replace(/"/g, "'");

    let savePath = path.dirname(saveFile);
    shell.mkdir('-p', savePath);
    fs.writeFileSync(saveFile, data, 'utf8');
    process.exit(0);
}

let rootPath = process.argv[2];
let savePath = process.argv[3];
main(rootPath, savePath);
