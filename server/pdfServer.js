const fs = require('fs');

const { getAndVerifyToken } = require('./authentication');

function savePdf(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { pdfURL } = JSON.parse(body);

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let users = fs.readFileSync("../data/users.json", "utf8");
                let allUsers = JSON.parse(users);
                let user = allUsers.find(user => user.userId === userId);

                if (user) {
                    if (!user.aboutMe) {
                        user.aboutMe = [];
                    }

                    user.aboutMe.push(pdfURL);

                    fs.writeFileSync("../data/users.json", JSON.stringify(allUsers, null, 2), "utf8");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'Data received and saved successfully'
                    }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '400',
                        message: 'User not found'
                    }));
                }
            }
        })
    })
}

function getPdf(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/users.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let pdfLink = user.aboutMe;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: pdfLink
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
    savePdf,
    getPdf
};