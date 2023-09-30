const fs = require('fs');

const { getAndVerifyToken } = require('./authentication');

function saveEdu(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { degree, university, cgpa, duration } = JSON.parse(body);

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let eduId = 0;
                let eduData = fs.readFileSync("../data/education.json", "utf8");
                let data = JSON.parse(eduData);

                if (!data) {
                    data = [];
                }

                let findUserIndex = data.findIndex(user => user.userId === userId);

                if (findUserIndex !== -1) {
                    if (!data[findUserIndex].Educations) {
                        data[findUserIndex].Educations = [];
                        eduId = findUserIndex;
                        eduId++;

                        const eduInfo = { eduId, degree, university, cgpa, duration };
                        data[findUserIndex].Educations.push(eduInfo);
                    }
                    else if (data[findUserIndex].Educations) {
                        eduId = data[findUserIndex].Educations.length;
                        const eduInfo = { eduId, degree, university, cgpa, duration };
                        eduId++;
                        data[findUserIndex].Educations.push(eduInfo);
                    }
                }
                else {
                    eduId = 0;
                    const eduInfo = { eduId, degree, university, cgpa, duration };
                    const newUser = {
                        userId: userId,
                        Educations: [eduInfo]
                    }
                    data.push(newUser);
                    eduId++;
                }

                fs.writeFileSync("../data/education.json", JSON.stringify(data, null, 2), "utf8");

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

function getEdu(req, res) {
    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let eduData = fs.readFileSync("../data/education.json", "utf8");
            let data = JSON.parse(eduData);
            let eduArray = [];
            let user = data.find(user => user.userId === userId);

            if (user) {
                let edusArray = user.Educations;
                edusArray.forEach(edu => {
                    if (user.userId === userId) {

                        let eduId = edu.eduId;
                        let degree = edu.degree;
                        let university = edu.university;
                        let cgpa = edu.cgpa;
                        let duration = edu.duration;

                        let educations = { eduId, degree, university, cgpa, duration };
                        eduArray.push(educations);
                    }
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    statusCode: '200',
                    message: 'Data received successfully',
                    data: eduArray
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

function saveEditedEdu(req, res) {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { indexValue, degree, university, cgpa, duration } = JSON.parse(body);

        getAndVerifyToken(req, res, (userId) => {
            if (userId) {
                let eduData = fs.readFileSync("../data/education.json", "utf8");
                let data = JSON.parse(eduData);
                const eduInfo = { degree, university, cgpa, duration };

                let user = data.find(user => user.userId === userId);

                if (user) {
                    let edusArray = user.Educations;
                    edusArray.forEach((edu, index) => {
                        if (index === indexValue) {

                            let degree = eduInfo.degree;
                            let university = eduInfo.university;
                            let cgpa = eduInfo.cgpa;
                            let duration = eduInfo.duration;

                            edu.degree = degree;
                            edu.university = university;
                            edu.cgpa = cgpa;
                            edu.duration = duration;

                            fs.writeFileSync("../data/education.json", JSON.stringify(data, null, 2), "utf8");

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                statusCode: '200',
                                message: 'Data received and saved successfully'
                            }));
                        }
                    });

                } else {
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

function deleteEdu(req, res) {
    const id = parseInt(req.url.split('/').pop());
    console.log("---------", id);

    getAndVerifyToken(req, res, (userId) => {
        if (userId) {
            let eduData = fs.readFileSync("../data/education.json", "utf8");
            let data = JSON.parse(eduData);
            let user = data.find(user => user.userId === userId);

            if (user) {
                let eduArray = user.Educations;
                let findEduIndex = eduArray.findIndex(edu => edu.eduId === id);
                if (findEduIndex !== -1) {
                    eduArray.splice(findEduIndex, 1);

                    fs.writeFile("../data/education.json", JSON.stringify(data, null, 2), (err) => {
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
    saveEdu,
    getEdu,
    saveEditedEdu,
    deleteEdu
};