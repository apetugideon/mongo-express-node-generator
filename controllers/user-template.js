const { modelName } = require('.././models/{ tableNameLower }').{ modelName };
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { 
    resolveBodyData, 
    resolveDateFilter, 
    date_on, 
    replaceDate, 
    userAuth, 
    parseDates 
} = require('../utilities');


module.exports.create = (request, response, next) => {
    bcrypt.hash(request.body.password, 10).then((hash) => {
        let { sModel }Data = { ...resolveBodyData(request), password: hash };
        (new { modelName }({ sModel }Data)).save()
            .then(result => {
                const {_id, email, userRole = 0 } = result._id;
                const payLoadParam = [_id, email, userRole].join('!~+=');
                const token = jwt.sign({userId: payLoadParam}, 'RANDOM_TOKEN_SECRET', {expiresIn:'24h'});

                return response.status(201).json({
                    "status": true, "message": "User Account successfully created!", "data": { token, userId: _id, userRole }
                });
            })
            .catch((error) => {
                return response.status(400).json({
                    errors: { "status": false, "message": error.message || "fail", "data": {} }
                });
            });
    }).catch((error) => {
        return response.status(400).json({
            errors: { "status": false, "message": "process fail", "data": {} }
        });
    });
};


module.exports.login = (request, response, next) => {
    const { email, password } = request.body;

    { modelName }.findOne({ email }, function (error, result){
        if (error) {
            return response.status(401).json({
                errors: { "status": false, "message": "User not found!", "data": {} }
            });
        }

        bcrypt.compare(password, result.password)
            .then((valid) => {
                if (!valid) {
                    return response.status(401).json({
                        errors: { "status": false, "message": "Incorrect Password", "data": {} }
                    });
                }

                const {_id, email, userRole = 0 } = result;
                const payLoadParam = [_id, email, userRole].join('!~+=');
                const token = jwt.sign({userId: payLoadParam}, 'RANDOM_TOKEN_SECRET', {expiresIn:'24h'});
                return response.status(201).json({
                    "status": true, "message": "success", "data": { token, userId: _id, userRole }
                });
            })
            .catch((error) => {
                return response.status(401).json({
                    errors: { "status": false, "message": "User cannot be Authenticated!", "data": {} }
                });
            });
    });
};


module.exports.index = (request, response, next) => {
    const { page = 1, limit = 20 } = request.query;
    const queries = request.query;
    
    let queryFilters = {};
    { whereClauses }
    if ((queries.createdOnStart && queries.createdOnEnd) || (queries.updatedOnStart && queries.updatedOnEnd)) {
        Object.assign(queryFilters, resolveDateFilter(queries));
    }

    const fieldSelections = '{ fieldSelections }';
    const query = { modelName }.find(queryFilters).select(fieldSelections);
    { populateString }
    if (limit) query.limit(limit * 1);
    if (query) query.skip((page - 1) * limit);
    query.exec((error, result) => {
        if (error) {
            return response.status(400).json("Request Failed");
        } else {
            { modelName }.countDocuments(queryFilters, (err, count) => {
                result = parseDates(result);
                return response.status(200).json({
                    { tableNameLower }: result, totalPages: Math.ceil(count/limit), currentPage: +page, count
                });
            });
        }
    });
}


module.exports.show = (request, response, next) => {
    const queries = request.query;
    const fieldSelections = '{ fieldSelections }';
    const query = { modelName }.findById(request.params.id).select(fieldSelections);
    { populateString }
    query.exec((error, result) => {
        if (error) {
            return response.status(400).json("Request Failed");
        } else {
            result = parseDates(result);
            return response.status(200).json({ user: result });
        }
    });
}


module.exports.edit = async (request, response, next) => {
    let { tableNameLower } = await { modelName }.findById(request.params.id).exec();
    { tableNameLower } = parseDates({ tableNameLower });
    { createEditString }
    return response.status(200).json({{ createEditValues }{ tableNameLower }});
}


module.exports.update = (request, response, next) => {
    const { currUserId, currUserEmail, currUserRole } = userAuth(request.headers.authorization);

    const updateData = { ...request.body, updatedOn: Date.now() };
    if (currUserId) updateData.createdBy = currUserId;

    { modelName }.updateOne({_id: request.params.id}, {$set: updateData})
        .then(result => response.status(200).json({ message: "User updated!", result }))
        .catch(error => response.status(400).json("Request Failed"));
}


module.exports.remove = (request, response, next) => {
    { modelName }.remove({_id: request.params.id}, {$set: request.body})
        .then(result => response.status(200).json({ message: "User successfully deleted!", result }))
        .catch(error => response.status(400).json("Request Failed"));
}


module.exports.deleteMany = (request, response, next) => {
    { modelName }.deleteMany({_id: list, list: {$in: request.body.list}})
        .then(result => response.status(200).json(result))
        .catch(error => response.status(400).json("Request Failed"));
}