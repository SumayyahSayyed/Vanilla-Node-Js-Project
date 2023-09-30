const fs = require('fs');

const { getAndVerifyToken } = require('./authentication');

function deleteToken(req, res) {

    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let bearerToken = req.headers.authorization;

            console.log("bearer Token", bearerToken);

            if (!bearerToken) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '400',
                    message: 'Token not found in request headers'
                }));
            } else {
                let tokenFile = fs.readFileSync("../data/tokens.json", "utf8");
                let allTokens = JSON.parse(tokenFile);


                const matchToken = allTokens.find(data => data.userId === userId && data.token === bearerToken);
                console.log('TOKEN TO DELETE', matchToken);

                if (matchToken) {
                    const indexToDelete = allTokens.findIndex(data => data.userId === userId && data.token === bearerToken);

                    if (indexToDelete !== -1) {
                        allTokens.splice(indexToDelete, 1);

                        fs.writeFileSync("../data/tokens.json", JSON.stringify(allTokens, null, 2), 'utf8');


                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            statusCode: '200',
                            message: 'Token matched and action performed'
                        }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            statusCode: '401',
                            message: 'Token does not match any stored tokens'
                        }));
                    }
                }
            }
        }
    });
}

module.exports = {
    deleteToken
};