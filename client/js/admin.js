
let token = localStorage.getItem("Token");
// if (token) {
//     fetch("http://localhost:3000/checkUserTypeOnAdmin", {
//         method: "GET",
//         headers: {
//             "authorization": token
//         }
//     })
//         .then(res => {
//             return res.json();
//         })
//         .then(data => {
//             if (data.statusCode === "401") {
//                 alert(data.message);
//             }
//             else if (data.statusCode === "200") {
//                 if (data.data === "admin123@gmail.com") {
//                     window.location.href = "../html/admin.html";
//                 }
//                 else if (data.data !== "admin123@gmail.com") {
//                     window.location.href = "/html/portfolio.html";
//                 }

//             }
//         })
//         .catch(err => {
//             console.log(err)
//         })
// }


function preventGoingBack() {
    window.history.forward();
}
setTimeout("preventGoingBack()", 0);
window.onunload = function () { null };


let getUserData = null;
let usersTable = document.getElementById("usersTable");

function getUsers() {
    fetch("http://localhost:3000/getDataForAdmin", {
        method: "GET",
        headers: {
            "Content-type": "application/json",
            "authorization": token
        }
    })
        .then(res => {
            return res.json();
        })
        .then(data => {
            console.log(data);
            getUserData = data.userData;
            let projects = data.projects;
            // console.log(getUserData);

            // searchProject(getUserData, projects);
            appendUsers(getUserData);

            appendProjects(getUserData, projects);
            viewFullProject(projects);

            makeAdmin(getUserData);

            if (Array.isArray(getUserData)) {
                getUserData.forEach((user, index) => {
                    deleteUser(user);
                    editUser(user);
                })
            }
        })

        .catch(err => {
            console.log(err);
        });
}
getUsers();


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

function appendUsers(getUserData) {

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

    for (let eachuser of getUserData) {
        let dataRow = document.createElement("tr");

        dataRow.classList.add("table-row");

        let nameData = document.createElement("td");
        let emailData = document.createElement("td");
        let phoneData = document.createElement("td");
        let actionData = document.createElement("td");

        if (eachuser.userEmail !== "admin123@gmail.com" || eachuser.userEmail !== "admin456@gmail.com") {

            nameData.innerHTML = eachuser.userName;
            emailData.innerHTML = eachuser.userEmail;
            phoneData.innerHTML = eachuser.userPhone;

            let iconDiv = document.createElement("div");
            let editIcon = document.createElement("img");
            let deleteIcon = document.createElement("img");
            let adminDiv = document.createElement("img");

            iconDiv.classList.add("icon-div");
            editIcon.setAttribute("src", "../assets/editable-icon/edit.png");
            editIcon.classList.add("edit-icon");
            deleteIcon.setAttribute("src", "../assets/editable-icon/delete.png");
            deleteIcon.classList.add("delete-icon");
            adminDiv.setAttribute("src", "../assets/editable-icon/setting.png");
            adminDiv.classList.add("admin-icon");
            nameData.classList.add("name-data");
            emailData.classList.add("email-data");
            phoneData.classList.add("phone-data");

            if (eachuser.userType === "user") {
                iconDiv.appendChild(adminDiv);
            }


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
}

function deleteUser(user) {
    let deleteUser = document.querySelectorAll(".delete-icon");
    for (eachDeleteButton of deleteUser) {
        eachDeleteButton.addEventListener("click", (e) => {
            let tableRow = e.target.closest("tr");

            let emailData = tableRow.querySelector(".email-data");

            if (user.userEmail === emailData.textContent) {
                let userId = user.userId;
                fetch(`http://localhost:3000/deleteUser/${userId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": token
                    }
                })
                    .then((res) => {
                        if (res.status === 204) {
                            console.log("User Deleted");
                        } else {
                        }
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });

                tableRow.remove();
            }
        })
    }
}

let addUser = document.getElementById("register-form");
let addNewUser = document.getElementById("addNewUser");

function editUser(user) {
    let editUserBtn = document.querySelectorAll(".edit-icon");

    for (let eachEditButton of editUserBtn) {
        eachEditButton.addEventListener("click", (e) => {
            // console.log("clicked");
            let tableRow = e.target.closest("tr");
            addUser.classList.remove("hide");
            usersTable.classList.add("hide");
            usersMainHeading.classList.add("hide");
            document.body.style.backgroundColor = "rgba(173, 173, 173, 0.171)";

            let emailData = tableRow.querySelector(".email-data");
            let nameData = tableRow.querySelector(".name-data");
            let phoneData = tableRow.querySelector(".phone-data");
            console.log(emailData.textContent);

            if (user.userEmail === emailData.textContent) {
                const nameParts = user.userName.split(' ');
                document.getElementById("firstname").value = nameParts[0];
                document.getElementById("lastname").value = nameParts.slice(1).join(' ');
                document.getElementById("email").value = user.userEmail;
                document.getElementById("phone").value = user.userPhone;

                addUser.addEventListener("submit", (e) => {
                    e.preventDefault();

                    user.firstName = document.getElementById("firstname").value;
                    user.lastName = document.getElementById("lastname").value;
                    user.userPhone = document.getElementById("phone").value;
                    user.userEmail = document.getElementById("email").value;

                    let fname = user.firstName;
                    let lname = user.lastName;
                    let phone = user.userPhone
                    let email = user.userEmail

                    let isTrue = validateForm(fname, lname, phone, email);

                    if (isTrue) {
                        addUser.classList.add("hide");
                        usersTable.classList.remove("hide");
                        usersMainHeading.classList.remove("hide");

                        emailData.textContent = user.userEmail;
                        nameData.textContent = user.firstName + " " + user.lastName;
                        phoneData.textContent = user.userPhone;


                        let updateUserData = {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            userEmail: user.userEmail,
                            userPhone: user.userPhone
                        };

                        let userId = user.userId;
                        console.log(userId);
                        fetch(`http://localhost:3000/updateUser/${userId}`, {
                            method: "POST",
                            headers: {
                                "Content-type": "application/json",
                                "authorization": token
                            },
                            body: JSON.stringify(updateUserData)
                        })
                            .then(res => {
                                return res.json();
                            })
                            .then(data => {
                                console.log(data.message);
                            })
                            .catch(err => {
                                console.log(err);
                            })
                    }
                    else {
                        isTrue = validateForm(fname, lname, phone, email);
                    }
                });
            }
        })
    }
}

let cancelButton = document.getElementById("cancel-button");
cancelButton.addEventListener("click", () => {
    addUser.classList.add("hide");
    usersTable.classList.remove("hide");
    usersMainHeading.classList.remove("hide");
})

let searchResults;

let searchContainer = document.getElementById("searchContainer");
let startSearch = document.getElementById("start-search");
let inputSearchBar = document.getElementById("search");
let crossSearch = document.getElementById("cross-search");

startSearch.addEventListener("click", () => {
    startSearch.classList.add("hide");
    crossSearch.classList.remove("hide");
    noResultsFound = true;

    searchContainer.classList.remove("none");
    usersMainHeading.classList.add("hide");
    usersTable.classList.add("hide");
    usersTable.style.display = "none";
    let query = inputSearchBar.value.trim();

    if (query) {
        fetch(`http://localhost:3000/searchUser?query=${query}`, {
            method: "GET",
            headers: {
                "authorization": token
            }
        })
            .then(response => {
                if (response.status === 404) {
                    return null;
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                searchUser(data.user);
                searchResults = data.user;
                if (Array.isArray(searchResults)) {
                    searchResults.forEach((user, index) => {
                        deleteUser(user);
                        editUser(user);
                    })
                }

            })
            .catch(error => {
                console.error('Error:', error);
            });

        fetch(`http://localhost:3000/searchProjectsInAdmin?query=${query}`, {
            method: "GET",
            headers: {
                "authorization": token
            }
        })
            .then(response => {
                if (response.status === 404) {
                    resultsDiv.textContent = 'No results found.';
                    return null;
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                console.log(searchResults);
                searchProject(data.projects)

            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
})

function searchUser(credentials) {
    console.log(credentials);
    let noResultsFound = true;

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

    searchContainer.appendChild(tableRow);
    tableRow.appendChild(userName);
    tableRow.appendChild(userEmail);
    tableRow.appendChild(userPhone);
    tableRow.appendChild(action);

    if (credentials.length > 0) {
        credentials.forEach((result) => {
            let dataRow = document.createElement("tr");
            dataRow.classList.add("table-row");

            let nameData = document.createElement("td");
            let emailData = document.createElement("td");
            let phoneData = document.createElement("td");
            let actionData = document.createElement("td");

            if (result.Email !== "admin123@gmail.com") {
                nameData.innerHTML = result.userName;
                emailData.innerHTML = result.userEmail;
                phoneData.innerHTML = result.userPhone;

                let iconDiv = document.createElement("div");
                let editIcon = document.createElement("img");
                let deleteIcon = document.createElement("img");

                iconDiv.classList.add("icon-div");
                editIcon.setAttribute("src", "../assets/editable-icon/edit.png");
                editIcon.classList.add("edit-icon");
                deleteIcon.setAttribute("src", "../assets/editable-icon/delete.png");
                deleteIcon.classList.add("delete-icon");
                nameData.classList.add("name-data");
                emailData.classList.add("email-data");
                phoneData.classList.add("phone-data");

                dataRow.appendChild(nameData);
                dataRow.appendChild(emailData);
                dataRow.appendChild(phoneData);

                iconDiv.appendChild(editIcon);
                iconDiv.appendChild(deleteIcon);
                actionData.appendChild(iconDiv);
                dataRow.appendChild(actionData);

                searchContainer.appendChild(dataRow);

            }
        });

    } else if (noResultsFound) {
        let noResultsItem = document.createElement("li");
        noResultsItem.textContent = "No results found.";
        searchContainer.appendChild(noResultsItem);
    }

}

crossSearch.addEventListener("click", () => {
    startSearch.classList.remove("hide");
    crossSearch.classList.add("hide");

    inputSearchBar.value = "";

    searchContainer.classList.add("none");
    usersMainHeading.classList.remove("hide");
    usersTable.classList.remove("hide");
    usersTable.style.display = "block";
    searchContainerProjects.classList.add("none");
    projectsTable.classList.remove("hide");
    projectsTable.style.display = "block";
})

/*------------------------------------------- Projects -------------------------------------------*/


let projectsTab = document.getElementById("projectsTab");
projectsTab.addEventListener("click", () => {
    projectsTab.style.color = "#1d3be3";
    usersTab.style.color = "#000";
    let usersDiv = document.getElementById("usersDiv");
    let projectsDiv = document.getElementById("projectsDiv");

    usersDiv.classList.add("hide");
    projectsDiv.classList.remove("hide");
})

let projectView = document.getElementById("mainDiv");
function viewFullProject(allProjects) {
    let view = document.querySelectorAll(".view-icon");

    for (let viewProjectIcon of view) {
        viewProjectIcon.addEventListener("click", (e) => {

            projectView.classList.remove("hide");
            document.body.style.backgroundColor = "rgba(173, 173, 173, 0.171)";
            let listContent = e.target.closest('li').textContent;

            for (let eachUsersproject of allProjects) {
                if (eachUsersproject.projectNameData === listContent) {
                    let projectImage = document.getElementById("projectImage");
                    let projectHeading = document.getElementById("projectHeading");
                    let pDescription = document.getElementById("projectDescription");
                    let tagsContainer = document.getElementById("tags-container");
                    let seeLive = document.getElementById("seeLive");
                    let repoLink = document.getElementById("repoLink");


                    projectImage.setAttribute('src', eachUsersproject.projectImg);
                    projectHeading.innerHTML = eachUsersproject.projectNameData;
                    pDescription.innerHTML = eachUsersproject.projectDescription;
                    seeLive.setAttribute('href', eachUsersproject.projectLiveLink);
                    repoLink.setAttribute('href', eachUsersproject.projectRepo);

                    let allTags = eachUsersproject.tags;
                    allTags = allTags.split(',').map(tag => tag.trim());
                    tagsContainer.innerHTML = '';

                    allTags.forEach(tag => {
                        let tagSpan = document.createElement("span");
                        tagSpan.classList.add("tags-span");

                        tagSpan.innerHTML = tag;
                        tagsContainer.appendChild(tagSpan);
                    });
                }
            }
        });
    }
}

let searchContainerProjects = document.getElementById("searchContainerProjects");


function searchProject(allProjects) {
    let projectsTable = document.getElementById("projectsTable");
    let searchContainerProjects = document.getElementById("searchContainerProjects");
    let noResultsFound = true;

    noResultsFound = true;

    searchContainerProjects.classList.remove("none");
    projectsTable.classList.add("hide");
    projectsTable.style.display = "none";

    let tableRow = document.createElement("tr");
    // let userEmail = document.createElement("th");
    let userProjects = document.createElement("th");


    tableRow.classList.add("main-row");

    // userEmail.innerHTML = "Email";
    userProjects.innerHTML = "Projects";

    searchContainerProjects.appendChild(tableRow);

    // tableRow.appendChild(userEmail);
    tableRow.appendChild(userProjects);

    if (allProjects.length > 0) {
        allProjects.forEach((result) => {
            if (result.email !== "admin1232gmail.com") {

                let dataRow = document.createElement("tr");
                dataRow.classList.add("table-row");

                // let emailData = document.createElement("td");
                let projectData = document.createElement("td");

                let projectsList = document.createElement("ul");
                let listData = document.createElement("li");

                let viewIconDiv = document.createElement("div");
                let viewIcon = document.createElement("img");

                projectsList.classList.add("project-ul");
                listData.classList.add("project-li");
                viewIcon.classList.add("view-icon");
                projectData.classList.add("projectElement");
                viewIconDiv.classList.add("view-icon-div");

                // emailData.innerHTML = result.email;
                listData.innerHTML = result.projectNameData;
                viewIcon.setAttribute("src", "../assets/editable-icon/eye.png");

                viewIconDiv.appendChild(viewIcon);
                // dataRow.appendChild(emailData);
                projectsList.appendChild(listData);
                listData.appendChild(viewIconDiv);
                projectData.appendChild(projectsList);
                dataRow.appendChild(projectData);
                searchContainerProjects.appendChild(dataRow);

            }
        });
        viewFullProject(allProjects);
    } else if (noResultsFound) {
        let noResultsItem = document.createElement("li");
        noResultsItem.textContent = "No results found.";
        searchContainerProjects.appendChild(noResultsItem);
    }

}

let crossViewProject = document.getElementById("cross-view-project");
crossViewProject.addEventListener("click", () => {
    startSearch.classList.remove("hide");
    crossSearch.classList.add("hide");
    projectView.classList.add("hide");
    usersTable.style.display = "block";
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


function appendProjects(user, projects) {
    console.log(projects);
    for (let eachUser of user) {
        if (eachUser.userEmail !== "admin123@gmail.com") {

            let dataRow = document.createElement("tr");
            dataRow.classList.add("table-row");

            let emailData = document.createElement("td");
            let projectData = document.createElement("td");

            emailData.innerHTML = eachUser.userEmail;
            dataRow.appendChild(emailData);

            for (let eachUsersproject of projects) {
                if (eachUser.userId === eachUsersproject.userId) {

                    // for (let eachProject of eachUsersproject.Projects) {

                    let projectsList = document.createElement("ul");
                    let listData = document.createElement("li");

                    projectData.classList.add("project-data");
                    projectsList.classList.add("project-ul");
                    listData.classList.add("project-li");

                    listData.innerHTML = eachUsersproject.projectNameData;

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
                    // }

                }
            }
            projectsTable.appendChild(dataRow);
        }
    }
}

// Validation

function removeErrorMessage() {
    const errorLabel = document.querySelector(".error-message");
    if (errorLabel !== null) {
        errorLabel.remove();
    }
}
function validateForm(fName, lName, phone, email) {
    removeErrorMessage();
    let errorLabel = document.querySelector(".error-message");

    if (fName == "" && !errorLabel) {
        let select = document.querySelector('input[name="firstname"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Please fill in your First Name";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;
    }
    else if (fName && /[^A-Za-z]/.test(fName) && !errorLabel) {
        let select = document.querySelector('input[name="firstname"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Name cannot contain numbers or special characters";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;
    }
    else if (lName == "" && !errorLabel) {
        let select = document.querySelector('input[name="lastname"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Please fill in your Last Name";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;

    }
    else if (lName && /[^A-Za-z]/.test(lName) && !errorLabel) {
        let select = document.querySelector('input[name="lastname"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Name cannot contain numbers or special characters";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;
    }
    else if (phone == "" && !errorLabel) {
        let select = document.querySelector('input[name="phone"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Please fill in your Phone Number";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;
    }
    else if (phone && /[^0-9]/.test(phone) && !errorLabel) {
        let select = document.querySelector('input[name="phone"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Phone Number cannot contain alphabets or special numbers";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;
    }
    else if (email == "" && !errorLabel) {
        let select = document.querySelector('input[name="email"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Please fill in email address";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;

    }

    return true;
}


// Create Admin

function makeAdmin(getUserData) {
    let adminIcon = document.querySelectorAll(".admin-icon");

    for (let admin of adminIcon) {
        admin.addEventListener("click", (e) => {
            let tableRow = e.target.closest("tr");
            let emailData = tableRow.querySelector(".email-data").textContent; // Extract email text

            let foundUser = getUserData.find(user => user.userEmail === emailData);

            if (foundUser) {
                let ID = foundUser.userId;
                fetch(`http://localhost:3000/makeAdmin/${ID}`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": token
                    }
                })
                    .then(res => {
                        return res.json();
                    })
                    .then(data => {
                        console.log(data.message);
                    })
                    .catch(err => {
                        console.log(err);
                    })

            }
        })
    }

}
