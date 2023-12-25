const http = require('http');
const fs = require('fs');
const url = require('url');
const cors = require('cors');


const connection = require("./dbServer");
const { getAndVerifyToken } = require("./authentication");
const { SignUp } = require("./signupServer");
const { LogIn } = require("./loginServer");
const { checkUserType } = require("./userTypeServer");
const { getProfileData } = require("./profileServer");
const { socials, appendSocials } = require("./socialsServer");
const { savePdf, getPdf } = require("./pdfServer");
const { saveProjects, getProjects, saveEditedProject, deleteProject } = require("./projectsServer");
const { saveExp, getExp, saveEditedExp, deleteExp } = require("./expServer");
const { saveEdu, getEdu, saveEditedEdu, deleteEdu } = require("./eduServer");
const { editableData, getEditableData } = require("./contentEditableServer");
const { getDataForAdmin, deleteUser, updateUser } = require("./adminServer");
const { deleteToken } = require("./deleteTokenServer");
const { getProjectSearchData } = require("./searchProjectServer");
// const { getExpSearchData } = require("./searchExpServer");
// const { getEduSearchData } = require("./searchEduServer");
const { getUserSearchData } = require("./adminSearchServer");
const { getProjectAdminSearchData } = require("./searchProjectsAdminServer");
const { makeAdmin } = require("./makeAdmin");


const PORT = process.env.PORT || 3000;


const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query.query;
    cors()(req, res, () => { });

    if (req.method === 'POST' && parsedUrl.pathname === '/signup') {
        SignUp(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/login') {
        LogIn(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/profile') {

        getProfileData(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/socials') {
        socials(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/appendSocials') {
        appendSocials(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/editableData') {
        editableData(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/getEditableData') {
        getEditableData(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/saveProjects') {
        saveProjects(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname == '/getProjects') {
        getProjects(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname.startsWith('/saveEditedProject/')) {
        saveEditedProject(req, res);
    }
    else if (req.method === 'DELETE' && parsedUrl.pathname.startsWith('/deleteProject/')) {
        deleteProject(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/saveExp') {
        saveExp(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/getExp') {
        getExp(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname.startsWith('/saveEditedExp')) {
        saveEditedExp(req, res);
    }
    else if (req.method === 'DELETE' && parsedUrl.pathname.startsWith('/deleteExp/')) {
        deleteExp(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/saveEdu') {
        saveEdu(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/getEdu') {
        getEdu(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/saveEditedEdu') {
        saveEditedEdu(req, res);
    }
    else if (req.method === 'DELETE' && parsedUrl.pathname.startsWith('/deleteEdu/')) {
        deleteEdu(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/getDataForAdmin') {
        getDataForAdmin(req, res);
    }
    else if (req.method === 'DELETE' && parsedUrl.pathname.startsWith('/deleteUser/')) {
        deleteUser(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname.startsWith('/updateUser/')) {
        updateUser(req, res);
    }
    else if (req.method === 'POST' && parsedUrl.pathname === '/savePdf') {
        savePdf(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/getPdf') {
        getPdf(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/deleteToken') {
        deleteToken(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/checkUserType') {
        checkUserType(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/checkUserTypeOnAdmin') {
        checkUserType(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/checkUserTypeOnUser') {
        checkUserType(req, res);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/searchProject' && query) {
        getProjectSearchData(req, res, query);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/searchUser' && query) {
        getUserSearchData(req, res, query);
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/searchProjectsInAdmin' && query) {
        getProjectAdminSearchData(req, res, query);
    }
    else if (req.method === 'POST' && parsedUrl.pathname.startsWith('/makeAdmin/')) {
        makeAdmin(req, res);
    }

});


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});