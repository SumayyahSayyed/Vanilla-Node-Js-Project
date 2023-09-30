const fs = require('fs');

function getProfileData(userId, res) {
    const users = fs.readFile("../data/users.json", "utf8", (err, users) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.writeHead(500, { 'Content-Type': "application/json" });
            res.end(JSON.stringify({
                statusCode: "500",
                message: "internal server error"
            }));
        }
        else {
            const jsonData = JSON.parse(users);

            const data = jsonData.find((user) => user.userId === userId);
            if (data) {
                let userData = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    userEmail: data.userEmail,
                    userPhone: data.userPhone
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Token found',
                    userInfo: userData
                }));
            }
            else {
                res.writeHead(404, { 'Content-Type': "application/json" });
                res.end(JSON.stringify({
                    statusCode: "404",
                    message: "user not found"
                }));
            }
        }
    });
}

module.exports = {
    getProfileData
};