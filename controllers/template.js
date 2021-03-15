const { modelName } = require('.././models/{ MainModel }').{ modelName };
{ fileIncludeString }
const { resolveBodyData, resolveDateFilter, date_on, parseDates, userAuth } = require('../utilities');


module.exports.create = async (request, response, next) => {
    { createEditString }
    return response.status(200).json({{ createEditValues }});
}


module.exports.store = (request, response, next) => {
    let { sModel }Data = resolveBodyData(request);
    (new { modelName }({ sModel }Data)).save()
    .then(result => {
        result = parseDates(result);
        return response.status(200).json({ 
            { modelNameLower }: result, 
            status: true,
            message: "{ modelName } successfully added!"
        });
    })
    .catch(error => response.status(400).json({ 
        errors: { message: error.message || "Request Failed" },
        status: false 
    }));
}


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
    const countQuery = { modelName }.find(queryFilters).select(fieldSelections);
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
    const fieldSelections = '{ fieldSelections }';
    const query = { modelName }.findById(request.params.id).select(fieldSelections);
    { populateString }
    query.exec((error, result) => {
        if (error) {
            return response.status(400).json("Request Failed");
        } else {
            result = parseDates(result);
            return response.status(200).json({ { modelNameLower }: result });
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
    .then(result => response.status(200).json({ message: "{ modelName } updated!", result }))
    .catch(error => response.status(400).json("Request Failed"));
}


module.exports.remove = (request, response, next) => {
    { modelName }.remove({_id: request.params.id}, {$set: request.body})
    .then(result => response.status(200).json({ message: "{ modelName } successfully deleted!", result }))
    .catch(error => response.status(400).json("Request Failed"));
}


module.exports.deleteMany = (request, response, next) => {
    { modelName }.deleteMany({_id: list, list: {$in: request.body.list}})
    .then(result => response.status(200).json(result))
    .catch(error => response.status(400).json("Request Failed"));
}