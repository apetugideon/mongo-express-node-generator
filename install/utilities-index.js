const jwt = require('jsonwebtoken');


const resolveBodyData = (request) => {
    let bodyData = {};
    for(let item in request.body) {
        bodyData[item] = request.body[item];
    }

    if (request.headers && request.headers.authorization) {
        const { currUserId, currUserEmail, currUserRole } = userAuth(request.headers.authorization);
        if (currUserId) bodyData.createdBy = currUserId;
    } 

    return bodyData;
}


const toTimeStamp = (dateValue) => new Date(Date.parse(dateValue)).getTime();


const resolveDateFilter = (queries) => {
    let dateFilter = {};
    let { createdOnStart, createdOnEnd, updatedOnStart, updatedOnEnd} = queries;
    if (createdOnStart && createdOnEnd) {
        dateFilter.createdOn = {$gte: toTimeStamp(createdOnStart + " 00:00:00"), $lte: toTimeStamp(createdOnEnd + " 23:59:00")}
    }
    if (updatedOnStart && updatedOnEnd) {
        dateFilter.updatedOn = {$gte: toTimeStamp(updatedOnStart + " 00:00:00"), $lte: toTimeStamp(updatedOnEnd + " 23:59:00")}
    }
    return dateFilter;
}


const date_on = (key, value) => {
    return { [key]: {$gte: toTimeStamp(value + " 00:00:00"), $lte: toTimeStamp(value + " 23:59:00")}};
}


const replaceDate = (key, value) => {
    if ((key === "createdOn") || (key === "updatedOn") || (/date$/i.test(key))) {
        var date = new Date(+value);
        date = date.toISOString();
        value = String(date);
    }
    return value;
}


const userAuth = (authorization) => {
    const token = (authorization) ? authorization.split(' ')[1] : "";
    if (token) {
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const { userId } = decodedToken;
        const payLoadParam = userId.split("!~+=");
    
        currUserId = payLoadParam[0] || "";
        currUserEmail = payLoadParam[1] || "";
        currUserRole = payLoadParam[2] || 0;
        return {currUserId, currUserEmail, currUserRole};
    } else {
        return {};
    }
}


const parseDates = (result) => {
    let results = JSON.parse(JSON.stringify(result, replaceDate));
    return results;
}


module.exports.parseDates = parseDates;
module.exports.userAuth = userAuth;
module.exports.date_on = date_on;
module.exports.replaceDate = replaceDate;
module.exports.toTimeStamp = toTimeStamp;
module.exports.resolveBodyData = resolveBodyData;
module.exports.resolveDateFilter = resolveDateFilter;