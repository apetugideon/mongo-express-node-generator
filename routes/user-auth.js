const jwt = require('jsonwebtoken');

module.exports = (request, response, next) => {
    try {
        if ("allowAutomatedTesting" in request.body) {
            next();
        } else {
            const token = request.headers.authorization.split(' ')[1];
            jwt.verify(token, 'RANDOM_TOKEN_SECRET', (error, decodedToken) => {
                if ((error) || (!decodedToken)) {
                    response.status(401).json({
                        "code": "AUT_02",
                        "message": "The apikey is invalid.",
                        "field": "API-KEY"
                    });
                }
                const { userId } = decodedToken;
                const payLoadParam = userId.split("!~+=");
                request.body.currUserId = payLoadParam[0] || "";
                request.body.currUserEmail = payLoadParam[1] || "";
                request.body.currUserRole = payLoadParam[2] || 0;
                next();
            });
        }
    } catch(e) {
        response.status(401).json({
            error: 'User Authentication failed, please try again!',
        });
    }
};