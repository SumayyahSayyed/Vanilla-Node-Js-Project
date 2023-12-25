const { getAndVerifyToken } = require('./authentication');
const db = require('./dbServer');

function getProjectFromDB(userIdData) {
    const findID = `
        SELECT user_ID, Name, Description, Tags FROM projects    
    `;
    const projectData = [];
    db.query(findID, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }

        for (let eachId of results) {
            let project = {
                userID: eachId.user_ID,
                Name: eachId.Name,
                Description: eachId.Description,
                Tags: eachId.Tags
            };
            projectData.push(project);
        }
        userIdData(null, projectData);
    });
}

function getProjectSearchData(req, res, query) {
    getAndVerifyToken(req, res, (userId) => {
        query = query.toLowerCase();
        console.log("NEW: ", query);
        if (userId) {
            getProjectFromDB((err, projectData) => {
                if (err) {
                    console.error('Error getting user IDs:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '500',
                        message: 'Internal Server Error'
                    }));
                    return;
                }

                let foundMatch = false;
                const matchingProjects = [];

                projectData.forEach(project => {
                    if (project.userID === userId) {
                        if (
                            project.Name.toLowerCase().includes(query) ||
                            project.Description.toLowerCase().includes(query) ||
                            project.Tags.toLowerCase().includes(query)
                        ) {
                            foundMatch = true;
                            matchingProjects.push(project);
                        }
                    }
                });

                if (foundMatch) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        statusCode: '200',
                        message: 'Data Received',
                        projects: matchingProjects
                    }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('No matching projects found.');
                }
            });

        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    });
}

module.exports = {
    getProjectSearchData
};