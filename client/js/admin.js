let usersTable = document.getElementById("usersTable");
let fetchusersData = JSON.parse(localStorage.getItem("user"));
let fetchusersProject = JSON.parse(localStorage.getItem("projects"));
let fetchusersContent = JSON.parse(localStorage.getItem("editable-content"));

let usersMainHeading = document.getElementById("users-main-heading");

let usersTab = document.getElementById("usersTab");
usersTab.addEventListener("click", () => {
    usersTab.style.color = "#1d3be3";
    projectsTab.style.color = "#000";
    let usersDiv = document.getElementById("usersDiv");
    let projectsDiv = document.getElementById("projectsDiv");

    projectsDiv.classList.add("hide");
    usersDiv.classList.remove("hide");
})



let tableRow = document.createElement("tr");
let userName = document.createElement("th");
let userEmail = document.createElement("th");
let userPhone = document.createElement("th");
let action = document.createElement("th");

tableRow.classList.add("main-row");

userName.innerHTML = "Name";
userEmail.innerHTML = "Email";
userPhone.innerHTML = "Phone";
action.innerHTML = "Actions";

usersTable.appendChild(tableRow);
tableRow.appendChild(userName);
tableRow.appendChild(userEmail);
tableRow.appendChild(userPhone);
tableRow.appendChild(action);


for (let eachuser of fetchusersData) {
    let dataRow = document.createElement("tr");

    dataRow.classList.add("table-row");

    let nameData = document.createElement("td");
    let emailData = document.createElement("td");
    let phoneData = document.createElement("td");
    let actionData = document.createElement("td");

    if (eachuser.userEmail !== "admin123@gmail.com") {

        nameData.innerHTML = eachuser.firstName + " " + eachuser.lastName;
        emailData.innerHTML = eachuser.userEmail;
        phoneData.innerHTML = eachuser.userPhone;

        let iconDiv = document.createElement("div");
        let editIcon = document.createElement("img");
        let deleteIcon = document.createElement("img");

        iconDiv.classList.add("icon-div");
        editIcon.setAttribute("src", "../assets/editable-icon/edit.png");
        editIcon.classList.add("edit-icon");
        deleteIcon.setAttribute("src", "../assets/editable-icon/delete.png");
        deleteIcon.classList.add("delete-icon");
        emailData.classList.add("email-data");



        usersTable.appendChild(dataRow);
        dataRow.appendChild(nameData);
        dataRow.appendChild(emailData);
        dataRow.appendChild(phoneData);


        iconDiv.appendChild(editIcon);
        iconDiv.appendChild(deleteIcon);
        actionData.appendChild(iconDiv);
        dataRow.appendChild(actionData);
    }
}


function deleteUser() {
    let deleteUser = document.querySelectorAll(".delete-icon");
    for (eachDeleteButton of deleteUser) {
        eachDeleteButton.addEventListener("click", (e) => {
            let tableRow = e.target.closest("tr");

            let emailData = tableRow.querySelector(".email-data");

            let userIndex = fetchusersData.findIndex(user => user.userEmail === emailData.textContent);
            if (userIndex !== -1) {
                let userId = fetchusersData[userIndex].id;

                let projectsToDelete = fetchusersProject.filter(project => project.projectID === userId);
                for (let projectToDelete of projectsToDelete) {
                    let projectIndex = fetchusersProject.indexOf(projectToDelete);
                    if (projectIndex !== -1) {
                        fetchusersProject.splice(projectIndex, 1);
                    }
                }
                let contentToDelete = fetchusersContent.filter(content => content.userID === userId);

                for (let editableData of contentToDelete) {
                    let editableIndex = fetchusersContent.indexOf(editableData);
                    if (editableIndex !== -1) {
                        console.log(editableIndex);
                        fetchusersContent.splice(editableIndex, 1);
                    }
                }

                fetchusersData.splice(userIndex, 1);

                localStorage.setItem("user", JSON.stringify(fetchusersData));
                localStorage.setItem("projects", JSON.stringify(fetchusersProject));
                localStorage.setItem("editable-content", JSON.stringify(fetchusersContent));

                tableRow.remove();
            }
        })
    }
}
deleteUser();


let editUserBtn = document.querySelectorAll(".edit-icon");
let addUser = document.getElementById("register-form");
let addNewUser = document.getElementById("addNewUser");
function editUser() {
    for (eachDeleteButton of editUserBtn) {
        eachDeleteButton.addEventListener("click", (e) => {
            let tableRow = e.target.closest("tr");
            addUser.classList.remove("hide");
            usersTable.classList.add("hide");
            usersMainHeading.classList.add("hide");
            addNewUser.classList.add("hide");
            document.body.style.backgroundColor = "rgba(173, 173, 173, 0.171)";

            let emailData = tableRow.querySelector(".email-data");
            console.log(emailData.textContent);

            for (let userdata of fetchusersData) {
                if (userdata.userEmail == emailData.textContent) {
                    document.getElementById("firstname").value = userdata.firstName;
                    document.getElementById("lastname").value = userdata.lastName;
                    let newEmail = document.getElementById("email").value = userdata.userEmail;
                    document.getElementById("password").value = userdata.userPassword;

                    addUser.addEventListener("submit", (e) => {
                        e.preventDefault();

                        let userToUpdate = fetchusersData.find(user => user.userEmail === newEmail);

                        if (userToUpdate) {
                            userToUpdate.firstName = document.getElementById("firstname").value;
                            userToUpdate.lastName = document.getElementById("lastname").value;
                            userToUpdate.userEmail = document.getElementById("email").value;
                            userToUpdate.userPassword = document.getElementById("password").value;

                            localStorage.setItem("user", JSON.stringify(fetchusersData));
                        }

                    });
                }
            }
        })
    }

}

let cancelButton = document.getElementById("cancel-button");
cancelButton.addEventListener("click", () => {
    addUser.classList.add("hide");
    usersTable.classList.remove("hide");
    usersMainHeading.classList.remove("hide");
    addNewUser.classList.remove("hide");
})

editUser();

let data = JSON.parse(localStorage.getItem("user"));
let searchContainer = document.getElementById("searchContainer");

function searchUser() {
    let searchBar = document.getElementById("search");
    let noResultsFound = true;

    searchBar.addEventListener("input", () => {
        let inputData = searchBar.value.toLowerCase();
        let searchResults = [];

        searchContainer.innerHTML = "";
        noResultsFound = true;

        searchContainer.classList.remove("none");
        usersMainHeading.classList.add("hide");
        usersTable.classList.add("hide");
        usersTable.style.display = "none";
        addNewUser.classList.add("hide");

        data.forEach((userData) => {
            if (
                userData.firstName.toLowerCase().includes(inputData) ||
                userData.lastName.toLowerCase().includes(inputData) ||
                userData.userEmail.toLowerCase().includes(inputData) ||
                userData.userPhone.toLowerCase().includes(inputData)
            ) {
                let combinedRow = {
                    user: userData
                };

                searchResults.push(combinedRow);
                noResultsFound = false;
            }
        });

        let tableRow = document.createElement("tr");
        let userName = document.createElement("th");
        let userEmail = document.createElement("th");
        let userPhone = document.createElement("th");

        tableRow.classList.add("main-row");

        userName.innerHTML = "Name";
        userEmail.innerHTML = "Email";
        userPhone.innerHTML = "Phone";

        searchContainer.appendChild(tableRow);
        tableRow.appendChild(userName);
        tableRow.appendChild(userEmail);
        tableRow.appendChild(userPhone);

        if (searchResults.length > 0) {
            searchResults.forEach((result) => {
                // console.log(result);
                let dataRow = document.createElement("tr");
                dataRow.classList.add("table-row");

                let nameData = document.createElement("td");
                let emailData = document.createElement("td");
                let phoneData = document.createElement("td");

                // Access user and project data from the combined row
                nameData.innerHTML = result.user.firstName + " " + result.user.lastName;
                emailData.innerHTML = result.user.userEmail;
                phoneData.innerHTML = result.user.userPhone;

                dataRow.appendChild(nameData);
                dataRow.appendChild(emailData);
                dataRow.appendChild(phoneData);
                searchContainer.appendChild(dataRow);
            });
        } else if (noResultsFound) {
            let noResultsItem = document.createElement("li");
            noResultsItem.textContent = "No results found.";
            searchContainer.appendChild(noResultsItem);
        }
    });
}

searchUser();

let crossSearch = document.getElementById("cross-search");
crossSearch.addEventListener("click", () => {
    searchContainer.classList.add("none");
    usersMainHeading.classList.remove("hide");
    usersTable.classList.remove("hide");
    usersTable.style.display = "block";
    addNewUser.classList.remove("hide");
    searchContainerProjects.classList.add("none");
    projectsTable.classList.remove("hide");
    projectsTable.style.display = "block";
})


document.addEventListener("click", (e) => {
    let searchBar = document.getElementById("search");
    let selectedElement = e.target;
    if (!selectedElement.classList.contains("searchTable")) {
        searchContainer.classList.add("none");
        usersMainHeading.classList.remove("hide");
        usersTable.classList.remove("hide");
        addNewUser.classList.remove("hide");
        searchBar.value = "";
    }
})


// Projects

let projectsTab = document.getElementById("projectsTab");
projectsTab.addEventListener("click", () => {
    projectsTab.style.color = "#1d3be3";
    usersTab.style.color = "#000";
    let usersDiv = document.getElementById("usersDiv");
    let projectsDiv = document.getElementById("projectsDiv");

    usersDiv.classList.add("hide");
    projectsDiv.classList.remove("hide");

    viewFullProject();
    searchProject();
})

let projectView = document.getElementById("mainDiv");
function viewFullProject() {
    let view = document.querySelectorAll(".view-icon");

    for (let viewProjectIcon of view) {
        // console.log("hello");
        viewProjectIcon.addEventListener("click", (e) => {

            projectView.classList.remove("hide");
            document.body.style.backgroundColor = "rgba(173, 173, 173, 0.171)";

            let listContent = e.target.closest('li').textContent;

            for (let eachproject of fetchusersProject) {

                if (eachproject.projectNameData === listContent) {
                    let projectImage = document.getElementById("projectImage");
                    let projectHeading = document.getElementById("projectHeading");
                    let pDescription = document.getElementById("projectDescription");
                    let seeLive = document.getElementById("seeLive");
                    let repoLink = document.getElementById("repoLink");


                    projectImage.setAttribute('src', eachproject.projectImg);
                    projectHeading.innerHTML = eachproject.projectNameData;
                    pDescription.innerHTML = eachproject.projectDescription;
                    seeLive.setAttribute('href', eachproject.projectLiveLink);
                    repoLink.setAttribute('href', eachproject.projectRepo);
                }
            }
        });
    }
}

let projects = JSON.parse(localStorage.getItem("projects"));
let user = JSON.parse(localStorage.getItem("user"));
let searchContainerProjects = document.getElementById("searchContainerProjects");

function searchProject() {
    let projectsTable = document.getElementById("projectsTable");
    let searchBar = document.getElementById("search");
    let noResultsFound = true;
    searchBar.addEventListener("input", () => {
        let inputData = searchBar.value.toLowerCase();
        let searchResults = [];

        searchContainerProjects.innerHTML = "";
        noResultsFound = true;

        searchContainerProjects.classList.remove("none");
        projectsTable.classList.add("hide");
        projectsTable.style.display = "none";

        projects.forEach((projectData) => {
            if (
                projectData.projectNameData.toLowerCase().includes(inputData) ||
                projectData.projectDescription.toLowerCase().includes(inputData)
            ) {

                let combinedRow = {
                    project: projectData
                };

                searchResults.push(combinedRow);
                noResultsFound = false;
            }
        });

        let tableRow = document.createElement("tr");
        let userEmail = document.createElement("th");
        let userProjects = document.createElement("th");

        tableRow.classList.add("main-row");

        userEmail.innerHTML = "Email";
        userProjects.innerHTML = "Projects";

        searchContainerProjects.appendChild(tableRow);

        tableRow.appendChild(userEmail);
        tableRow.appendChild(userProjects);

        if (searchResults.length > 0) {
            searchResults.forEach((result) => {
                console.log(result);
                let dataRow = document.createElement("tr");
                dataRow.classList.add("table-row");

                let emailData = document.createElement("td");
                let projectData = document.createElement("td");

                user.forEach((userData) => {
                    if (userData.id === result.project.projectID) {
                        emailData.innerHTML = userData.userEmail;
                        projectData.innerHTML = result.project.projectNameData;

                        dataRow.appendChild(emailData);
                        dataRow.appendChild(projectData);
                        searchContainerProjects.appendChild(dataRow);
                    }
                })


            });
        } else if (noResultsFound) {
            let noResultsItem = document.createElement("li");
            noResultsItem.textContent = "No results found.";
            searchContainerProjects.appendChild(noResultsItem);
        }
    });
}



let crossViewProject = document.getElementById("cross-view-project");
crossViewProject.addEventListener("click", () => {
    projectView.classList.add("hide");
    usersTable.style.display = "block";
    addNewUser.classList.remove("hide");
    document.body.style.backgroundColor = "white";
})


let projectsTable = document.getElementById("projectsTable");
let tableRowProjects = document.createElement("tr");
let userEmailProjects = document.createElement("th");
let userProjects = document.createElement("th");

tableRowProjects.classList.add("main-row");

userEmailProjects.innerHTML = "Email";
userProjects.innerHTML = "Projects";

projectsTable.appendChild(tableRowProjects);

tableRowProjects.appendChild(userEmailProjects);
tableRowProjects.appendChild(userProjects);


for (let eachuser of fetchusersData) {
    let dataRow = document.createElement("tr");

    dataRow.classList.add("table-row");

    let emailData = document.createElement("td");
    let projectData = document.createElement("td");

    if (eachuser.userEmail !== "admin123@gmail.com") {

        emailData.innerHTML = eachuser.userEmail;
        dataRow.appendChild(emailData);

        for (let eachproject of fetchusersProject) {
            if (eachuser.id === eachproject.projectID) {

                let projectsList = document.createElement("ul");
                let listData = document.createElement("li");

                projectData.classList.add("project-data");
                projectsList.classList.add("project-ul");
                listData.classList.add("project-li");

                listData.innerHTML = eachproject.projectNameData;

                let viewIconDiv = document.createElement("div");
                let viewIcon = document.createElement("img");

                viewIcon.setAttribute("src", "../assets/editable-icon/eye.png");
                viewIconDiv.classList.add("view-icon-div")
                viewIcon.classList.add("view-icon");

                projectData.appendChild(projectsList);

                viewIconDiv.appendChild(viewIcon);
                listData.appendChild(viewIconDiv);
                projectsList.appendChild(listData);
                dataRow.appendChild(projectData);
            }

        }

        projectsTable.appendChild(dataRow);
    }
}