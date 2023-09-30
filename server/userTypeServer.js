const fs = require('fs');

const { getAndVerifyToken } = require('./authentication');

function checkUserType(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/users.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let email = user.userEmail;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: email
                }));
            }
            else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '400',
                    message: 'User not found'
                }));
            }
        }
    })
}

module.exports = {
    checkUserType
};
