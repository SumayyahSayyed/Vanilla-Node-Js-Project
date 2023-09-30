const fs = require('fs');

const { getAndVerifyToken } = require('./authentication');

function editableData(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { position, aboutMe } = JSON.parse(body);

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                const editableData = { userId, position, aboutMe };
                let editable = fs.readFileSync("../data/editable.json", "utf8");
                let data = JSON.parse(editable);

                let findUserIndex = data.findIndex(user => user.userId === userId);
                // console.log(findUserIndex);
                if (findUserIndex !== -1) {
                    data[findUserIndex] = editableData;
                    fs.writeFileSync("../data/editable.json", JSON.stringify(data, null, 2), "utf8");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'Data received and saved successfully'
                    }));
                }
                else {
                    data.push(editableData);
                    fs.writeFileSync("../data/editable.json", JSON.stringify(data, null, 2), "utf8");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'Data received and saved successfully'
                    }));
                }

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

function getEditableData(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let users = fs.readFileSync("../data/editable.json", "utf8");
            let allUsers = JSON.parse(users);
            let user = allUsers.find(user => user.userId === userId);

            if (user) {
                let position = user.position;
                let aboutMe = user.aboutMe;

                let editable = { position, aboutMe };
                // console.log("line 221 Editable:", editable)
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: editable
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
    editableData,
    getEditableData
};