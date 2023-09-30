const fs = require('fs');

const { getAndVerifyToken } = require('./authentication');

function socials(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { githubLink, linkedinLink, twitterlink } = JSON.parse(body);
        let jsonData = [];
        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                const socialsData = { userId, githubLink, linkedinLink, twitterlink };
                let data = fs.readFileSync("../data/socials.json", "utf8");
                jsonData = JSON.parse(data);

                jsonData.push(socialsData);

                fs.writeFileSync("../data/socials.json", JSON.stringify(jsonData, null, 2), "utf8");
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received and saved successfully'
                }));
            }
            else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '400',
                    message: 'User not found'
                }));
            }
        });
    })
}

function appendSocials(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/socials.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let githubLink = user.githubLink;
                let linkedinLink = user.linkedinLink;
                let twitterlink = user.twitterlink;
                let links = { githubLink, linkedinLink, twitterlink };

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: links
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
    socials,
    appendSocials
};