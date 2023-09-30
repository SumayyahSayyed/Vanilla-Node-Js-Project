const fs = require('fs');

const { getAndVerifyToken } = require('./authentication');

function saveExp(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { position, company, duration, jobInfo } = JSON.parse(body);

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let expId = 0;
                let expData = fs.readFileSync("../data/experience.json", "utf8");
                let data = JSON.parse(expData);

                if (!data) {
                    data = [];
                }

                let findUserIndex = data.findIndex(user => user.userId === userId);

                if (findUserIndex !== -1) {
                    if (!data[findUserIndex].Experiences) {
                        data[findUserIndex].Experiences = [];
                        expId = findUserIndex;
                        expId++;

                        const expInfo = { expId, position, company, duration, jobInfo };
                        data[findUserIndex].Experiences.push(expInfo);
                    }
                    else if (data[findUserIndex].Experiences) {
                        expId = data[findUserIndex].Experiences.length;
                        const expInfo = { expId, position, company, duration, jobInfo };
                        expId++;
                        data[findUserIndex].Experiences.push(expInfo);
                    }
                }
                else {
                    expId = 0;
                    const expInfo = { expId, position, company, duration, jobInfo };

                    const newUser = {
                        userId: userId,
                        Experiences: [expInfo]
                    };
                    data.push(newUser);
                    expId++;
                }


                fs.writeFileSync("../data/experience.json", JSON.stringify(data, null, 2), "utf8");

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
        })
    })
}

function getExp(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let expData = fs.readFileSync("../data/experience.json", "utf8");
            let data = JSON.parse(expData);
            let expArray = [];
            let user = data.find(user => user.userId === userId);

            if (user) {
                let expsArray = user.Experiences;
                expsArray.forEach(exp => {
                    if (user.userId === userId) {
                        let expId = exp.expId;
                        let position = exp.position;
                        let company = exp.company;
                        let duration = exp.duration;
                        let jobInfo = exp.jobInfo;

                        let experiences = { expId, position, company, duration, jobInfo };
                        expArray.push(experiences);
                    }
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: expArray
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

function saveEditedExp(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { indexValue, position, company, duration, jobInfo } = JSON.parse(body);

        // console.log("Exp Info ----", projectInfo);
        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let users = fs.readFileSync("../data/experience.json", "utf8");
                let data = JSON.parse(users);
                const expInfo = { position, company, duration, jobInfo };

                let user = data.find(user => user.userId === userId);
                if (user) {
                    let expsArray = user.Experiences;
                    expsArray.forEach((exp, index) => {

                        if (index === indexValue) {

                            let position = expInfo.position;
                            let company = expInfo.company;
                            let duration = expInfo.duration;
                            let jobInfo = expInfo.jobInfo;

                            exp.position = position;
                            exp.company = company;
                            exp.duration = duration;
                            exp.jobInfo = jobInfo;

                            fs.writeFileSync("../data/experience.json", JSON.stringify(data, null, 2), "utf8");

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Data received and saved successfully'
                            }));
                        }
                    });
                }
                else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '400',
                        message: 'User not found'
                    }));
                }
            }
        });
    })
}

function deleteExp(req, res) {
    const id = parseInt(req.url.split('/').pop());
    console.log("---------", id);

    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let expData = fs.readFileSync("../data/experience.json", "utf8");
            let data = JSON.parse(expData);
            let user = data.find(user => user.userId === userId);

            if (user) {
                let expArray = user.Experiences;
                let findExpIndex = expArray.findIndex(exp => exp.expId === id);
                if (findExpIndex !== -1) {
                    expArray.splice(findExpIndex, 1);
                    fs.writeFile("../data/experience.json", JSON.stringify(data, null, 2), (err) => {
                        if (err) {
                            console.error(err);
                            res.writeHead(500);
                            res.end("Internal Server Error");
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            statusCode: '200',
                            message: 'DELETED'
                        }));
                    });
                }
            }
        }
    });
}

module.exports = {
    saveExp,
    getExp,
    saveEditedExp,
    deleteExp
};