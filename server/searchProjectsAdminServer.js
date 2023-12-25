const { getAndVerifyToken } = require('./authentication');
const db = require('./dbServer');

function getProjectFromDB(userIdData) {
    const findID = `
        SELECT * FROM projects    
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
                projectNameData: eachId.Name,
                projectDescription: eachId.Description,
                tags: eachId.Tags,
                projectLiveLink: eachId.LiveLink,
                projectRepo: eachId.SourceCode,
                projectImg: eachId.ProjectImg
            };
            projectData.push(project);
        }
        userIdData(null, projectData);
    });
}

function getProjectAdminSearchData(req, res, query) {
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
                    if (
                        project.projectNameData.toLowerCase().includes(query) ||
                        project.projectDescription.toLowerCase().includes(query) ||
                        project.tags.toLowerCase().includes(query)
                    ) {
                        foundMatch = true;
                        matchingProjects.push(project);
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
    getProjectAdminSearchData
};