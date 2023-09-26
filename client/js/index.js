let token = localStorage.getItem("Token");

if (token) {
    fetch("http://localhost:3000/checkUserType", {
        method: "GET",
        headers: {
            "authorization": token
        }
    })
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (data.statusCode === "401") {
                alert(data.message);
            }
            else if (data.statusCode === "200") {
                if (data.data === "admin123@gmail.com") {
                    window.location.href = "../html/admin.html";
                }
                else if (data.data !== "admin123@gmail.com") {
                    window.location.href = "../html/portfolio.html";
                }
            }
        })
        .catch(err => {
            console.log(err)
        })
}


function preventGoingBack() {
    window.history.forward();
}
setTimeout("preventGoingBack()", 0);
window.onunload = function () { null };

let userName = document.getElementById("userName");
let userEmail = document.getElementById("gmail");
let phoneNo = document.getElementById("phoneNo");
let templateUserName = document.getElementById("template-user-name");
let getProjectData = null;
let getExpData = null;
let getEduData = null;
/* ----------------------------------------------------------------------------------*/
/* ------------------------------- Fetch Token --------------------------------------*/
/* ----------------------------------------------------------------------------------*/

// let token = localStorage.getItem("Token"); 

fetch("http://localhost:3000/profile", {
    method: "GET",
    headers: {
        "authorization": token
    }
})
    .then(res => {
        return res.json();
    })
    .then(data => {
        if (data.statusCode === "401") {
            console.log(data.message);
            window.location.href == "/client/html/login.html";
        }
        else if (data.statusCode === "200") {
            console.log(data.message);
            console.log(data.userInfo);
            userName.textContent = data.userInfo.firstName + " " + data.userInfo.lastName;
            userEmail.setAttribute("href", "mailto:" + data.userInfo.userEmail);
            userEmail.textContent = data.userInfo.userEmail;
            phoneNo.setAttribute("href", "//api.whatsapp.com/send?phone=" + data.userInfo.userPhone);
            templateUserName.textContent = data.userInfo.firstName + " " + data.userInfo.lastName;
        }
    })
    .catch(err => {
        console.log(err);
    })

/* ----------------------------------------------------------------------------------*/
/* ------------------------------- Log Out -----------------------------------------*/
/* ----------------------------------------------------------------------------------*/


let editIcon = document.querySelectorAll(".edit-icon");
let editableElement = document.querySelectorAll(".editable-element");
let projectImageFile = document.getElementById("file");
let projectImage = document.getElementById("project-image");
let dataURL;

let logOut = document.getElementById("logout");
logOut.addEventListener("click", () => {
    let token = localStorage.getItem("Token");
    fetch("http://localhost:3000/deleteToken", {
        method: "GET",
        headers: {
            "authorization": token
        }
    })
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (data.statusCode === "200") {
                console.log(data.message);
            }
            else if (data.statusCode === "401") {
                // console.log(data.message);
                // window.location.href == "/client/html/login.html";
            }
        })
        .catch(err => {
            console.log(err);
        })
    localStorage.removeItem("Token");
    window.location.href = "../html/login.html";
});

function userIsLoggedIn() {
    let sessionVariable = localStorage.getItem("Token");
    return !!sessionVariable;
}

document.addEventListener("DOMContentLoaded", function () {
    if (!userIsLoggedIn()) {
        window.location.href = "../html/login.html";
    }
});

//-------------------------------------------------------------------------


/* ----------------------------------------------------------------------------------*/
/* ------------------------------- Projects -----------------------------------------*/
/* ----------------------------------------------------------------------------------*/

let projectCounter = 1;
let addProjectIcon = document.getElementById("plus-icon");
let projectForm = document.getElementById("project-form");
let projectDiv = document.getElementById("allProjects");
let expDiv = document.getElementById("exp");


function handleFormSubmission(e) {

    e.preventDefault();

    let projectNameInput = document.getElementById("projectName").value;
    let projectDescriptionInput = document.getElementById("projectDescription").value;
    let langTags = document.getElementById("tags").value.split(',').map(tag => tag.trim());
    let liveLinkInput = document.getElementById("linkToLiveWebsite").value;
    let repoLinkInput = document.getElementById("linkToRepo").value;
    let imageSRC = dataURL;

    if (!projectNameInput || !projectDescriptionInput || langTags.length === 0 || !liveLinkInput || !repoLinkInput || !imageSRC) {
        validateFormProject(projectNameInput, projectDescriptionInput, langTags, liveLinkInput, repoLinkInput, imageSRC);
    } else {
        projectForm.classList.add("hide");

        let projectData = {
            projectNameData: projectNameInput,
            projectDescription: projectDescriptionInput,
            tags: langTags,
            projectLiveLink: liveLinkInput,
            projectRepo: repoLinkInput,
            projectImg: imageSRC
        }

        saveProject(projectData);
        projectDataToAppend(projectData);

        fetch("http://localhost:3000/getProjects", {
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
                if (data.statusCode === "200") {
                    console.log(data.data);
                    if (Array.isArray(data.data)) {
                        data.data.forEach((project, index) => {
                            viewProject(project);
                            editProject(project, index);
                            deleteProject(project, index);
                        });
                    }
                    return;
                }
                else if (data.statusCode === "401") {
                    console.log(data.message);
                    localStorage.removeItem("Token");
                    window.location.href == "/client/html/login.html";
                }
            })
            .catch(err => {
                console.log(err);
            })
    }
}

addProjectIcon.addEventListener("click", () => {
    document.getElementById("projectName").value = "";
    document.getElementById("projectDescription").value = "";
    document.getElementById("tags").value = "";
    document.getElementById("linkToLiveWebsite").value = "";
    document.getElementById("linkToRepo").value = "";
    document.getElementById("file").value = "";

    projectForm.classList.remove("hide");

    projectForm.addEventListener("submit", (e) => {
        handleFormSubmission(e);
    });

});

let addProject = document.getElementById("addProject");
addProject.addEventListener("click", () => {
    projectForm.removeEventListener("submit", handleFormSubmission);
});


function openFile(e) {
    let input = e.target;
    let reader = new FileReader();
    reader.onload = () => {
        dataURL = reader.result;
    };
    reader.readAsDataURL(input.files[0]);
}

let pdfURL;
function openPdf(e) {
    let input = e.target;
    let reader = new FileReader();
    reader.onload = () => {
        pdfURL = reader.result;

        const resumeLink = document.getElementById('resume-link');
        resumeLink.setAttribute('href', pdfURL);

        let data = {
            pdfURL: pdfURL
        }

        fetch("http://localhost:3000/savePdf", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "authorization": token
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(data => {
                if (data.statusCode === "200") {
                    console.log(data.message);
                    fetchURL(pdfURL);
                }
                else if (data.statusCode === "401") {
                    console.log(data.message);
                    localStorage.removeItem("Token");
                    window.location.href == "/client/html/login.html";
                }
            })
            .catch(err => {
                console.log(err);
            });
    };
    reader.readAsDataURL(input.files[0]);
}

const resumeLink = document.getElementById('resume-link');

function fetchURL(pdfURL) {
    fetch("http://localhost:3000/getPdf",
        {
            method: "GET",
            headers: {
                "authorization": token
            },
            body: JSON.stringify(pdfURL)
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (data.statusCode === "200") {
                console.log(data.message);
                resumeLink.setAttribute("href", data.data);
            }
            else if (data.statusCode === "401") {
                console.log(data.message);
                localStorage.removeItem("Token");
                window.location.href == "/client/html/login.html";
            }
        })
        .catch(err => {
            console.log(err);
        })
}

fetchURL(pdfURL);

let crossIcon = document.getElementById("cross-icon");
crossIcon.addEventListener("click", () => {
    projectForm.classList.add("hide");
});

function saveProject(projectData) {
    fetch("http://localhost:3000/saveProjects",
        {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "authorization": token
            },
            body: JSON.stringify(projectData)
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (data.statusCode === "200") {
                console.log(data.message);
            }
            else if (data.statusCode === "401") {
                console.log(data.message);
                localStorage.removeItem("Token");
                window.location.href == "/client/html/login.html";
                return;
            }
        })
        .catch(err => {
            console.log(err);
        })
}

function getProjects() {
    fetch("http://localhost:3000/getProjects", {
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
            if (data.statusCode === "401") {
                console.log(data.message);
                localStorage.removeItem("Token");
                window.location.href == "/client/html/login.html";
            }
            else if (data.statusCode === "200") {
                getProjectData = data.data;
                console.log(getProjectData);

                if (Array.isArray(getProjectData)) {
                    getProjectData.forEach((project, index) => {
                        projectDataToAppend(project);

                        viewProject(project);
                        editProject(project, index);
                        deleteProject(project, index);
                    });
                }
            }
        })
        .catch(err => {
            console.log(err);
        })
}
getProjects();

function projectDataToAppend(projectData) {

    let projectSection = document.createElement("article");
    let projectName = document.createElement("h3");
    let projectDescription = document.createElement("p");
    let liveSiteBtn = document.createElement("button");
    let liveSiteLink = document.createElement("a");
    let sourceCodeBtn = document.createElement("button");
    let sourceCodeLink = document.createElement("a");
    let projectImage = document.createElement("img");
    let tagsContainer = document.createElement("div");

    let editBTN = document.createElement("img");
    let deleteBTN = document.createElement("img");
    let viewBTN = document.createElement("img");

    // Adding all the required classes
    projectSection.classList.add("grid-description-" + projectCounter);
    liveSiteBtn.classList.add("btn", "name", "liveBTN");
    sourceCodeBtn.classList.add("code-btn", "name", "repoBTN");
    projectImage.classList.add("grid-image-" + projectCounter, "project-image");
    projectImage.setAttribute("id", "project-image");
    tagsContainer.classList.add("tags-container");

    deleteBTN.classList.add("delete-project");
    editBTN.classList.add("edit-project");
    viewBTN.classList.add("view-project");

    projectName.innerHTML = projectData.projectNameData;
    projectDescription.innerHTML = projectData.projectDescription;
    liveSiteLink.setAttribute("href", projectData.projectLiveLink);
    sourceCodeLink.setAttribute("href", projectData.projectRepo);
    projectImage.setAttribute("src", projectData.projectImg);
    deleteBTN.setAttribute("src", "../assets/editable-icon/delete.png");
    editBTN.setAttribute("src", "../assets/editable-icon/edit.png");
    viewBTN.setAttribute("src", "../assets/editable-icon/eye.png");

    let projectMainDiv = document.getElementById("allProjects");

    // Appending all the elements
    projectMainDiv.appendChild(projectSection);
    projectSection.appendChild(projectName);
    projectSection.appendChild(projectDescription);

    // InnerHTML of the buttons
    liveSiteBtn.innerHTML = "See Live";
    sourceCodeBtn.innerHTML = "Source Code";

    // Appending tags
    for (let tagText of projectData.tags) {
        let tag = document.createElement("span");
        tag.classList.add("tag-" + (projectCounter - 1));
        tag.textContent = tagText;
        tagsContainer.appendChild(tag);

        tag.style.padding = ".3em .5em";
        tag.style.backgroundColor = "#4b5cbe";
        tag.style.color = "white";
        tag.style.margin = "1em .5em 1em 0"
    }

    projectSection.appendChild(tagsContainer);

    // Appending the links inside the button
    liveSiteBtn.appendChild(liveSiteLink);
    sourceCodeBtn.appendChild(sourceCodeLink);

    // Appending the buttons
    projectSection.appendChild(liveSiteBtn);
    projectSection.appendChild(sourceCodeBtn);

    let editButtons = document.createElement("div");
    editButtons.classList.add("edit-buttons");
    projectSection.appendChild(editButtons);

    editButtons.appendChild(deleteBTN);
    editButtons.appendChild(editBTN);
    editButtons.appendChild(viewBTN);

    projectMainDiv.parentElement.insertAdjacentElement("beforeend", projectImage);
    projectMainDiv.appendChild(projectImage);

    projectCounter++;

}

function editProject(project, index) {
    let projectSection = document.getElementById("allProjects");

    projectSection.addEventListener("click", (e) => {
        let target = e.target;

        if (target.classList.contains("edit-project")) {
            let heading = target.parentElement.parentElement.firstElementChild;

            if (project.projectNameData === heading.innerHTML) {
                let projectArticle = e.target.closest("article");
                let liveButton = projectArticle.getElementsByClassName("liveBTN")[0];
                let repoButton = projectArticle.getElementsByClassName("repoBTN")[0];

                let link = liveButton.querySelector('a');
                let repo = repoButton.querySelector('a');

                projectForm.classList.remove("hide");
                let para = heading.nextElementSibling;
                let tags = document.querySelectorAll(".tag-" + index);
                let livehref = link.getAttribute('href');
                let repohref = repo.getAttribute('href');

                let projectImage = e.target.parentElement.parentElement.nextElementSibling;
                projectImage.src = "";

                let tagValues = Array.from(tags).map(tagElement => tagElement.innerHTML);
                tagValues = tagValues.join(", ");

                document.getElementById("projectName").value = heading.innerHTML;
                document.getElementById("projectDescription").value = para.innerHTML;
                document.getElementById("tags").value = tagValues;
                document.getElementById("linkToLiveWebsite").value = livehref;
                document.getElementById("linkToRepo").value = repohref;
                document.getElementById("file").value = "";

                // Add the event listener with necessary parameters
                // projectForm.addEventListener("submit", (e) => {
                //     handleSubmit(e, tags, index, livehref, repohref);
                // });

                let addEditedProject = document.getElementById("addProject");
                addEditedProject.addEventListener("click", (e) => {
                    e.preventDefault();
                    projectForm.classList.add("hide");


                    heading.innerHTML = document.getElementById("projectName").value;
                    para.innerHTML = document.getElementById("projectDescription").value;
                    let newTags = document.getElementById("tags").value.split(',').map(tag => tag.trim());

                    newTags.forEach((tagValue, index) => {
                        tags[index].innerHTML = tagValue;
                        console.log(tags);
                    })
                    livehref = document.getElementById("linkToLiveWebsite").value;
                    repohref = document.getElementById("linkToRepo").value;
                    projectImage.src = dataURL;

                    let allTags = document.getElementById("tags").value.split(',').map(tag => tag.trim());

                    let saveEditedData = {
                        indexValue: index,
                        projectNameData: heading.innerHTML,
                        projectDescription: para.innerHTML,
                        tags: allTags,
                        projectLiveLink: livehref,
                        projectRepo: repohref,
                        projectImg: projectImage.src
                    };

                    fetch("http://localhost:3000/saveEditedProject", {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json",
                            "authorization": token
                        },
                        body: JSON.stringify(saveEditedData)
                    })
                        .then(res => {
                            return res.json();
                        })
                        .then(data => {
                            if (data.statusCode === "200") {
                                console.log(data.data);

                            }
                            else if (data.statusCode === "401") {
                                console.log(data.message);
                                localStorage.removeItem("Token");
                                window.location.href == "/client/html/login.html";
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        })

                    fetch("http://localhost:3000/getProjects", {
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
                            if (data.statusCode === "401") {
                                console.log(data.message);
                                localStorage.removeItem("Token");
                                window.location.href == "/client/html/login.html";
                            }
                            else if (data.statusCode === "200") {
                                getProjectData = data.data;
                                console.log(getProjectData);

                                if (Array.isArray(getProjectData)) {
                                    getProjectData.forEach((project, index) => {

                                        viewProject(project);
                                        editProject(project, index);
                                        deleteProject(project, index);
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        })

                })

            }
        }
    });
}

// let addEditedProject = document.getElementById("addProject");

// addEditedProject.addEventListener("click", () => {
//     projectForm.removeEventListener("submit", handleSubmit);
// });

// function handleSubmit(e, tags, index, livehref, repohref) {

//     e.preventDefault();
//     projectForm.classList.add("hide");
//     let heading = e.target.parentElement.parentElement.firstElementChild;
//     let projectName = heading.innerHTML;
//     let para = heading.nextElementSibling;

//     let projectImage = e.target.parentElement.parentElement.nextElementSibling;
//     projectImage.src = "";

//     projectName = document.getElementById("projectName").value;
//     para.innerHTML = document.getElementById("projectDescription").value;
//     let newTags = document.getElementById("tags").value.split(',').map(tag => tag.trim());

//     newTags.forEach((tagValue, index) => {
//         tags[index].innerHTML = tagValue;
//         console.log(tags);
//     })
//     livehref = document.getElementById("linkToLiveWebsite").value;
//     repohref = document.getElementById("linkToRepo").value;
//     projectImage.src = dataURL;

//     let allTags = document.getElementById("tags").value.split(',').map(tag => tag.trim());

//     let saveEditedData = {
//         indexValue: index,
//         projectNameData: heading.innerHTML,
//         projectDescription: para.innerHTML,
//         tags: allTags,
//         projectLiveLink: livehref,
//         projectRepo: repohref,
//         projectImg: projectImage.src
//     };

//     fetch("http://localhost:3000/saveEditedProject", {
//         method: "POST",
//         headers: {
//             "Content-type": "application/json",
//             "authorization": token
//         },
//         body: JSON.stringify(saveEditedData)
//     })
//         .then(res => {
//             return res.json();
//         })
//         .then(data => {
//             if (data.statusCode === "200") {
//                 console.log(data.data);
//             }
//             else if (data.statusCode === "401") {
//                 console.log(data.message);
//                 localStorage.removeItem("Token");
//                 window.location.href == "/client/html/login.html";
//             }
//         })
//         .catch(err => {
//             console.log(err);
//         })
// }


function deleteProject(project, index) {
    let projectSection = document.getElementById("allProjects");
    projectSection.addEventListener("click", (e) => {
        let target = e.target;
        if (target.classList.contains("delete-project")) {
            let parentElementDiv = target.parentElement.parentElement;
            let heading = parentElementDiv.firstChild;
            let projectImage = parentElementDiv.nextElementSibling;

            if (project.projectNameData === heading.innerHTML) {

                projectSection.removeChild(parentElementDiv);
                projectSection.removeChild(projectImage);


                fetch(`http://localhost:3000/deleteProject/${index}`, {
                    method: "DELETE",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": token
                    }
                })
                    .then((res) => {
                        res.json
                    })
                    .then(data => {
                        if (data.statusCode === "200") {
                            console.log("Project Deleted")
                        }
                        if (data.statusCode === "401") {
                            console.log(data.message);
                            localStorage.removeItem("Token");
                            window.location.href == "/client/html/login.html";
                        }
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });
            }

        }
    });
}

function viewProject(fetchusersProject) {

    let projectView = document.getElementById("popUp");
    let projectDiv = document.getElementById("allProjects");
    let expDiv = document.getElementById("exp");


    document.addEventListener("click", (e) => {
        let element = e.target;

        if (element.classList.contains("view-project")) {
            projectView.classList.remove("hide");
            projectDiv.classList.add("hide");
            expDiv.classList.add("hide");

            let heading = element.parentElement.parentElement.firstElementChild;
            let projectName = heading.innerHTML;

            if (fetchusersProject.projectNameData === projectName) {
                let projectImage = document.getElementById("projectImage");
                let projectHeading = document.getElementById("projectHeading");
                let pDescription = document.getElementById("projectInfo");
                let tagsDiv = document.querySelector(".tagsDiv");

                tagsDiv.innerHTML = '';

                for (let eachTag of fetchusersProject.tags) {
                    let createTag = document.createElement("span");
                    createTag.classList.add("viewTag");
                    createTag.innerHTML = eachTag;
                    tagsDiv.appendChild(createTag);
                }

                projectImage.setAttribute('src', fetchusersProject.projectImg);
                projectHeading.innerHTML = fetchusersProject.projectNameData;
                pDescription.textContent = fetchusersProject.projectDescription;
            }
        }
    });
}

let crossViewProject = document.getElementById("cross-view-project");
crossViewProject.addEventListener("click", (e) => {
    let allProjects = document.querySelector(".project-no");
    let projectView = document.getElementById("popUp");
    let projectDiv = document.getElementById("allProjects");
    let expDiv = document.getElementById("exp");

    if (!e.target.classList.contains("mainDiv")) {
        projectView.classList.add("hide");
        allProjects.classList.remove("hide");
        projectDiv.classList.remove("hide");
        expDiv.classList.remove("hide");
    }
})

// const resumeInput = document.getElementById('resume');
// const resumeLink = document.getElementById('resume-link');
// resumeLink.setAttribute("href", dataURL);

// resumeInput.addEventListener('click', (e) => {

//     const selectedFile = resumeInput.files[0];
//     const fileURL = URL.createObjectURL(selectedFile);


// });

/* ----------------------------------------------------------------------------------*/
/* ------------------------ Content Editable Data -----------------------------------*/
/* ----------------------------------------------------------------------------------*/
editIcon.forEach((icon) => {
    icon.addEventListener("click", (e) => {
        let precedingElement = e.target.previousElementSibling;

        if (precedingElement) {
            precedingElement.contentEditable = true;
            precedingElement.style.backgroundColor = "#FF98A1";
        }
    })
})
document.addEventListener("click", (e) => {
    let selectedElement = e.target;

    if (!selectedElement.classList.contains("editable-element")
        &&
        !selectedElement.classList.contains("edit-icon")) {
        editableElement.forEach(element => {
            element.contentEditable = false;
            element.style.backgroundColor = "transparent";
        })
        contentEditabaleData();
    }
})


let editableData = document.querySelectorAll(".editable-element");
function contentEditabaleData() {
    let p = editableData[0].innerHTML;
    let a = editableData[1].innerHTML;

    let objData = {
        position: p,
        aboutMe: a
    };

    fetch("http://localhost:3000/editableData", {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "authorization": token
        },
        body: JSON.stringify(objData)
    })
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (data.statusCode === "401") {
                window.location.href == "/client/html/login.html";
                console.log(data.message);
                localStorage.removeItem("Token");
            }
            else if (data.statusCode === "200") {
                console.log(data.message);
            }
        })
        .catch(err => {
            console.log(err);
        })
}

function fetchPreviousData() {
    fetch("http://localhost:3000/getEditableData", {
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
            if (data.statusCode === "200") {
                console.log(data);
                editableData[0].innerHTML = data.data.position;
                editableData[1].innerHTML = data.data.aboutMe;
            }
            else if (data.statusCode === "401") {
                console.log(data.message);
                localStorage.removeItem("Token");
                window.location.href == "/client/html/login.html";
            }
        })
        .catch(err => {
            console.log(err);
        })
}
fetchPreviousData();

/* ----------------------------------------------------------------------------------*/
/* ------------------------ Project Form Validation ---------------------------------*/
/* ----------------------------------------------------------------------------------*/


function validateFormProject(projectNameInput, projectDescriptionInput, langTags, liveLinkInput, repoLinkInput, imageSRC) {
    let errorLabel = document.querySelector(".error-message");

    if (!projectNameInput && !errorLabel) {
        let pName = document.querySelector('input[name="projectName"]');
        errorLabel = document.createElement("p");
        errorLabel.classList.add("error-message");
        errorLabel.style.color = "red";
        errorLabel.innerHTML = "Please enter the Project Name.";
        pName.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
    else if (!projectDescriptionInput && !errorLabel) {
        let pDescription = document.querySelector('textarea[name="projectDescription"]');
        errorLabel = document.createElement("p");
        errorLabel.classList.add("error-message");
        errorLabel.style.color = "red";
        errorLabel.innerHTML = "Please enter the Project Description.";
        pDescription.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
    else if (langTags.length === 0 && !errorLabel) {
        let pTags = document.querySelector('textarea[name="tags"]');
        errorLabel = document.createElement("p");
        errorLabel.classList.add("error-message");
        errorLabel.style.color = "red";
        errorLabel.innerHTML = "Please enter the languages you used.";
        pTags.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
    else if (!liveLinkInput && !errorLabel) {
        let pLiveLink = document.querySelector('input[name="tags"]');
        errorLabel = document.createElement("p");
        errorLabel.classList.add("error-message");
        errorLabel.style.color = "red";
        errorLabel.innerHTML = "Please enter the Project Live Link.";
        pLiveLink.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
    else if (!repoLinkInput && !errorLabel) {
        let pRepoLink = document.querySelector('input[name="linkToRepo"]');
        errorLabel = document.createElement("p");
        errorLabel.classList.add("error-message");
        errorLabel.style.color = "red";
        errorLabel.innerHTML = "Please enter the Project Repository Link.";
        pRepoLink.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
    else if (!imageSRC && !errorLabel) {
        let imageValue = document.querySelector('input[name="file"]');
        errorLabel = document.createElement("p");
        errorLabel.classList.add("error-message");
        errorLabel.style.color = "red";
        errorLabel.innerHTML = "Please select an Image for your project.";
        imageValue.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
}

function removeErrorMessage() {
    let errorLabel = document.querySelector(".error-message");
    if (errorLabel !== null) {
        errorLabel.remove();
    }
}

/* ----------------------------------------------------------------------------------*/
/* ------------------------------- Experience ---------------------------------------*/
/* ----------------------------------------------------------------------------------*/

let addExp = document.getElementById("plus-exp");
let expForm = document.getElementById("exp-form");
addExp.addEventListener("click", () => {
    document.getElementById("experiencePos").value = "";
    document.getElementById("company").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("jobInfo").value = "";
    expForm.classList.remove("hide");

    expForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let expPosition = document.getElementById("experiencePos").value;
        let companyName = document.getElementById("company").value;
        let expDuration = document.getElementById("duration").value + " months";
        let jobDescription = document.getElementById("jobInfo").value;

        if (!expPosition || !companyName || !expDuration || !jobDescription) {
            validateFormExp(expPosition, companyName, expDuration, jobDescription);
        } else {
            expForm.classList.add("hide");
            let expData = {
                position: expPosition,
                company: companyName,
                duration: expDuration,
                jobInfo: jobDescription
            }

            saveExp(expData);
            appendExp(expData)

            fetch("http://localhost:3000/getExp", {
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
                    if (data.statusCode === "200") {
                        console.log(data.data);
                        if (Array.isArray(data.data)) {
                            data.data.forEach((exp, index) => {
                                editExp(exp, index);
                                deleteExp(exp, index);
                            });
                        }
                    }
                    else if (data.statusCode === "401") {
                        console.log(data.message);
                        localStorage.removeItem("Token");
                        window.location.href == "/client/html/login.html";
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        }
    })
})
let crossExp = document.getElementById("cross-exp");
crossExp.addEventListener("click", () => {
    expForm.classList.add("hide");

})

function saveExp(expData) {
    fetch("http://localhost:3000/saveExp",
        {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "authorization": token
            },
            body: JSON.stringify(expData)
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (data.statusCode === "200") {
                console.log(data.message);
            }
            else if (data.statusCode === "401") {
                console.log(data.message);
                localStorage.removeItem("Token");
                window.location.href == "/client/html/login.html";
            }
        })
        .catch(err => {
            console.log(err);
        })

}

function appendExp(expData) {

    // Creating all the necessary elements
    let expSection = document.createElement("div");
    let expContentDiv = document.createElement("div");
    let expName = document.createElement("h3");
    let company = document.createElement("h4");
    let expDuration = document.createElement("p");
    let expDescription = document.createElement("p");

    let editBTN = document.createElement("img");
    let deleteBTN = document.createElement("img");

    // Adding all the required classes
    expSection.classList.add("experienceDiv");
    expContentDiv.classList.add("expContentDiv");
    expName.setAttribute("id", "developerPos");
    company.setAttribute("id", "CompanyName");
    expDuration.setAttribute("id", "expDuration");
    expDescription.setAttribute("id", "expDescription");

    deleteBTN.classList.add("delete-exp");
    editBTN.classList.add("edit-exp");


    expName.innerHTML = expData.position;
    company.innerHTML = expData.company;
    expDuration.innerHTML = expData.duration;
    expDescription.innerHTML = expData.jobInfo;


    deleteBTN.setAttribute("src", "../assets/editable-icon/delete.png");
    editBTN.setAttribute("src", "../assets/editable-icon/edit.png");

    let expMainDiv = document.getElementById("exp-main-div");

    // Appending all the elements
    expMainDiv.appendChild(expSection);
    expSection.appendChild(expContentDiv);
    expContentDiv.appendChild(expName);
    expContentDiv.appendChild(company);
    expContentDiv.appendChild(expDuration);
    expContentDiv.appendChild(expDescription);


    let editButtons = document.createElement("div");
    editButtons.classList.add("edit-buttons");

    editButtons.appendChild(deleteBTN);
    editButtons.appendChild(editBTN);
    expSection.appendChild(editButtons);
}

function getExp() {
    fetch("http://localhost:3000/getExp", {
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
            if (data.statusCode === "200") {
                getExpData = data.data;
                console.log(getExpData);
                if (Array.isArray(getExpData)) {
                    getExpData.forEach((exp, index) => {
                        appendExp(exp);

                        editExp(exp, index);
                        deleteExp(exp, index);
                    });
                }
            }
            else if (data.statusCode === "401") {
                console.log(data.message);
                localStorage.removeItem("Token");
                window.location.href == "/client/html/login.html";
            }
        })
        .catch(err => {
            console.log(err);
        })
}
getExp();

function validateFormExp(expPosition, companyName, expDuration, jobDescription) {
    let errorLabel = document.querySelector(".error-message");

    if (!expPosition && !errorLabel) {
        let uniDegree = document.querySelector('input[name="experiencePos"]');
        errorLabel = document.createElement("p");
        errorLabel.classList.add("error-message");
        errorLabel.style.color = "red";
        errorLabel.innerHTML = "Please enter the Experience Position.";
        uniDegree.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
    else if (!companyName && !errorLabel) {
        let uniName = document.querySelector('input[name="company"]');
        errorLabel = document.createElement("p");
        errorLabel.classList.add("error-message");
        errorLabel.style.color = "red";
        errorLabel.innerHTML = "Please enter the company Name.";
        uniName.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
    else if (!expDuration && !errorLabel) {
        let uniCgpa = document.querySelector('input[name="duration"]');
        errorLabel = document.createElement("p");
        errorLabel.classList.add("error-message");
        errorLabel.style.color = "red";
        errorLabel.innerHTML = "Please enter the duration of your job";
        uniCgpa.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
    else if (!jobDescription && !errorLabel) {
        let uniDuration = document.querySelector('input[name="jobInfo"]');
        errorLabel = document.createElement("p");
        errorLabel.classList.add("error-message");
        errorLabel.style.color = "red";
        errorLabel.innerHTML = "Please enter the description of your job";
        uniDuration.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
}

function removeErrorMessage() {
    let errorLabel = document.querySelector(".error-message");
    if (errorLabel !== null) {
        errorLabel.remove();
    }
}

function editExp(expData, existingIndex) {
    let editButtonClick = document.querySelectorAll(".edit-exp");
    // let expMainDiv = document.getElementById("exp-main-div");

    for (let eachData of editButtonClick) {
        eachData.addEventListener("click", (e) => {

            let target = e.target;
            let expForm = document.getElementById("exp-form");
            let addExp = document.getElementById("addExp");


            expForm.classList.remove("hide");
            let heading = eachData.parentElement.parentElement.firstChild.firstElementChild;
            let companyName = heading.nextElementSibling;
            let jobDuration = companyName.nextElementSibling;
            let jobDescription = jobDuration.nextElementSibling;

            document.getElementById("experiencePos").value = heading.innerHTML;
            document.getElementById("company").value = companyName.innerHTML;
            document.getElementById("duration").value = jobDuration.innerHTML;
            document.getElementById("jobInfo").value = jobDescription.innerHTML;

            addExp.addEventListener("click", (e) => {
                e.preventDefault();
                expForm.classList.add("hide");

                let JobCompany = companyName.innerHTML;
                if (expData.company === JobCompany) {
                    console.log(expData.company);
                    console.log(JobCompany);

                    heading.innerHTML = document.getElementById("experiencePos").value;
                    companyName.innerHTML = document.getElementById("company").value;
                    jobDuration.innerHTML = document.getElementById("duration").value + " months";
                    jobDescription.innerHTML = document.getElementById("jobInfo").value;

                    console.log(heading, companyName, jobDuration, jobDescription);

                    let saveEditedExpData = {
                        indexValue: existingIndex,
                        position: heading.innerHTML,
                        company: companyName.innerHTML,
                        duration: jobDuration.innerHTML,
                        jobInfo: jobDescription.innerHTML
                    }

                    fetch("http://localhost:3000/saveEditedExp", {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json",
                            "authorization": token
                        },
                        body: JSON.stringify(saveEditedExpData)
                    })
                        .then(res => {
                            return res.json();
                        })
                        .then(data => {
                            if (data.statusCode === "200") {
                                console.log(data.data);
                            }
                            else if (data.statusCode === "401") {
                                console.log(data.message);
                                localStorage.removeItem("Token");
                                window.location.href == "/client/html/login.html";
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        })
                }
            });
        });

    }
}

function deleteExp(exp, index) {
    let deleteButtonClick = document.querySelectorAll(".delete-exp");
    let expMainDiv = document.getElementById("exp-main-div");

    for (let eachdata of deleteButtonClick) {
        eachdata.addEventListener("click", () => {
            let heading = eachdata.parentElement.parentElement.firstChild.firstElementChild;

            if (exp.position === heading.innerHTML) {

                let targetExp = eachdata.parentElement.parentElement;
                expMainDiv.removeChild(targetExp);

                fetch(`http://localhost:3000/deleteExp/${index}`, {
                    method: "DELETE",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": token
                    }
                })
                    .then((res) => {
                        if (res.status === 204) {
                            console.log("Exp Deleted")
                        } else if (res.status === 401) {
                            console.log(data.message);
                            localStorage.removeItem("Token");
                            window.location.href == "/client/html/login.html";
                        }
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });
            }

        })
    }
}

/* ----------------------------------------------------------------------------------*/
/* ------------------------------- Education ---------------------------------------*/
/* ----------------------------------------------------------------------------------*/
let addEdu = document.getElementById("plus-edu");
let eduForm = document.getElementById("edu-form");
addEdu.addEventListener("click", () => {
    document.getElementById("degree").value = "";
    document.getElementById("university").value = "";
    document.getElementById("cgpa").value = "";
    document.getElementById("uniDuration").value = "";
    eduForm.classList.remove("hide");

    eduForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let eduDegree = document.getElementById("degree").value;
        let eduUni = document.getElementById("university").value;
        let eduCgpa = document.getElementById("cgpa").value;
        let eduDuration = document.getElementById("uniDuration").value + " years";

        if (!eduDegree || !eduUni || !eduCgpa || !eduDuration) {
            validateForm(eduDegree, eduUni, eduCgpa, eduDuration);
        } else {
            eduForm.classList.add("hide");
            let eduData = {
                degree: eduDegree,
                university: eduUni,
                cgpa: eduCgpa,
                duration: eduDuration,
            }

            saveEdu(eduData);
            appendEdu(eduData);

            fetch("http://localhost:3000/getEdu", {
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
                    if (data.statusCode === "200") {
                        console.log(data.data);
                        if (Array.isArray(data.data)) {
                            data.data.forEach((edu, index) => {
                                editEdu(edu, index);
                                deleteEdu(edu, index);
                            });
                        }
                    }
                    else if (data.statusCode === "401") {
                        console.log(data.message);
                        localStorage.removeItem("Token");
                        window.location.href == "/client/html/login.html";
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        }
    })
})
let crossEdu = document.getElementById("cross-education");
crossEdu.addEventListener("click", () => {
    eduForm.classList.add("hide");
})

function saveEdu(eduData) {
    fetch("http://localhost:3000/saveEdu",
        {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "authorization": token
            },
            body: JSON.stringify(eduData)
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (data.statusCode === "200") {
                console.log(data.message);
            }
            else if (data.statusCode === "401") {
                console.log(data.message);
                localStorage.removeItem("Token");
                window.location.href == "/client/html/login.html";
            }
        })
        .catch(err => {
            console.log(err);
        })

}

function appendEdu(eduData) {

    // Creating all the necessary elements
    let eduSection = document.createElement("div");
    let eduContentDiv = document.createElement("div");
    let eduDegree = document.createElement("h3");
    let eduUni = document.createElement("h4");
    let eduCgpa = document.createElement("span");
    let eduDuration = document.createElement("p");

    let editBTN = document.createElement("img");
    let deleteBTN = document.createElement("img");

    // Adding all the required classes
    eduSection.classList.add("educationDiv");
    eduContentDiv.classList.add("eduContentDiv");
    eduDegree.setAttribute("id", "degreeName");
    eduUni.setAttribute("id", "uniName");
    eduCgpa.setAttribute("id", "eduCgpa");
    eduDuration.setAttribute("id", "eduDuration");

    deleteBTN.classList.add("delete-edu");
    editBTN.classList.add("edit-edu");

    eduDegree.innerHTML = eduData.degree;
    eduUni.innerHTML = eduData.university;
    eduCgpa.innerHTML = eduData.cgpa;
    eduDuration.innerHTML = eduData.duration;


    deleteBTN.setAttribute("src", "../assets/editable-icon/delete.png");
    editBTN.setAttribute("src", "../assets/editable-icon/edit.png");

    let eduMainDiv = document.getElementById("edu-main-div");

    // Appending all the elements


    eduMainDiv.appendChild(eduSection);
    eduSection.appendChild(eduContentDiv);
    eduContentDiv.appendChild(eduDegree);
    eduContentDiv.appendChild(eduUni);
    eduContentDiv.appendChild(eduCgpa);
    eduContentDiv.appendChild(eduDuration);


    let editButtons = document.createElement("div");
    editButtons.classList.add("edit-buttons");

    editButtons.appendChild(deleteBTN);
    editButtons.appendChild(editBTN);
    eduSection.appendChild(editButtons);

}

function getEdu() {
    fetch("http://localhost:3000/getEdu", {
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
            if (data.statusCode === "200") {
                getEduData = data.data;
                console.log(getEduData);
                if (Array.isArray(getEduData)) {
                    getEduData.forEach((edu, index) => {
                        appendEdu(edu);

                        editEdu(edu, index);
                        deleteEdu(edu, index);
                    });
                }
            }
            else if (data.statusCode === "401") {
                console.log(data.message);
                localStorage.removeItem("Token");
                window.location.href == "/client/html/login.html";
            }
        })
        .catch(err => {
            console.log(err);
        })
}
getEdu();

function editEdu(eduData, indexValue) {
    let editButtonClick = document.querySelectorAll(".edit-edu");

    for (let eachdata of editButtonClick) {
        let eduForm = document.getElementById("edu-form");
        let addEdu = document.getElementById("addEdu");
        eachdata.addEventListener("click", (e) => {

            eduForm.classList.remove("hide");
            let degreeName = eachdata.parentElement.parentElement.firstChild.firstElementChild;
            let uniName = degreeName.nextElementSibling;
            let cgpaCount = uniName.nextElementSibling;
            let durationCount = cgpaCount.nextElementSibling;


            document.getElementById("degree").value = degreeName.innerHTML;
            document.getElementById("university").value = uniName.innerHTML;
            document.getElementById("cgpa").value = cgpaCount.innerHTML;
            document.getElementById("uniDuration").value = durationCount.innerHTML;

            addEdu.addEventListener("click", (e) => {
                e.preventDefault();
                eduForm.classList.add("hide");
                let degreeName = eachdata.parentElement.parentElement.firstChild.firstElementChild;
                if (eduData.degree === degreeName.innerHTML) {

                    degreeName.innerHTML = document.getElementById("degree").value;
                    uniName.innerHTML = document.getElementById("university").value;
                    cgpaCount.innerHTML = document.getElementById("cgpa").value;
                    durationCount.innerHTML = document.getElementById("uniDuration").value + "  years";

                    let saveEditededuData = {
                        index: indexValue,
                        degree: degreeName.innerHTML,
                        university: uniName.innerHTML,
                        cgpa: cgpaCount.innerHTML,
                        duration: durationCount.innerHTML,
                    }
                    fetch("http://localhost:3000/saveEditedEdu", {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json",
                            "authorization": token
                        },
                        body: JSON.stringify(saveEditededuData)
                    })
                        .then(res => {
                            return res.json();
                        })
                        .then(data => {
                            if (data.statusCode === "200") {
                                console.log(data.message);
                            }
                            else if (data.statusCode === "401") {
                                console.log(data.message);
                                localStorage.removeItem("Token");
                                window.location.href == "/client/html/login.html";
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        })

                }
            });
        });
    }

}

function deleteEdu(eduData, index) {
    let deleteButtonClick = document.querySelectorAll(".delete-edu");
    let mainParent = document.getElementById("edu-main-div");

    for (let eachdata of deleteButtonClick) {
        eachdata.addEventListener("click", () => {
            let heading = eachdata.parentElement.parentElement.firstChild.firstElementChild;

            if (eduData.degree === heading.innerHTML);

            let parentElement = eachdata.parentElement.parentElement;
            mainParent.removeChild(parentElement);

            fetch(`http://localhost:3000/deleteEdu/${index}`, {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json",
                    "authorization": token
                }
            })
                .then((res) => {
                    if (res.status === 204) {
                        console.log("Edu Deleted")
                    }
                })
                .then(data => {
                    if (data.statusCode === "401") {
                        console.log(data.message);
                        localStorage.removeItem("Token");
                        window.location.href == "/client/html/login.html";
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        })
    }
}

function validateForm(eduDegree, eduUni, eduCgpa, eduDuration) {
    let errorLabel = document.querySelector(".error-message");

    if (!eduDegree && !errorLabel) {
        let uniDegree = document.querySelector('input[name="degree"]');
        errorLabel = document.createElement("p");
        errorLabel.classList.add("error-message");
        errorLabel.style.color = "red";
        errorLabel.innerHTML = "Please enter the Education degree.";
        uniDegree.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
    else if (!eduUni && !errorLabel) {
        let uniName = document.querySelector('input[name="university"]');
        errorLabel = document.createElement("p");
        errorLabel.classList.add("error-message");
        errorLabel.style.color = "red";
        errorLabel.innerHTML = "Please enter your University Name.";
        uniName.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
    else if (!eduCgpa && !errorLabel) {
        let uniCgpa = document.querySelector('input[name="cgpa"]');
        errorLabel = document.createElement("p");
        errorLabel.classList.add("error-message");
        errorLabel.style.color = "red";
        errorLabel.innerHTML = "Please enter your CGPA";
        uniCgpa.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
    else if (!eduDuration && !errorLabel) {
        let uniDuration = document.querySelector('input[name="uniDuration"]');
        errorLabel = document.createElement("p");
        errorLabel.classList.add("error-message");
        errorLabel.style.color = "red";
        errorLabel.innerHTML = "Please enter the duration like this = 2019-2023";
        uniDuration.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
}

function removeErrorMessage() {
    let errorLabel = document.querySelector(".error-message");
    if (errorLabel !== null) {
        errorLabel.remove();
    }
}


/* ----------------------------------------------------------------------------------*/
/* ------------------------------- Attaching Social ----------------------------------*/
/* ----------------------------------------------------------------------------------*/

let githubAcc = document.getElementById("github-acc");
let linkedInAcc = document.getElementById("linkedin-acc");
let twitterAcc = document.getElementById("twitter-acc");

fetch("http://localhost:3000/appendSocials", {
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
        if (data.statusCode === "200") {
            let getSocialsData = data.data;
            console.log(getSocialsData);
            githubAcc.setAttribute("href", getSocialsData.githubLink);
            linkedInAcc.setAttribute("href", getSocialsData.linkedinLink);
            twitterAcc.setAttribute("href", getSocialsData.twitterlink);
        }
        else if (data.statusCode === "401") {
            console.log(data.message);
            window.location.href == "/client/html/login.html";
        }
    })
    .catch(err => {
        console.log(err);
    })



/* ----------------------------------------------------------------------------------*/
/* ----------------------------------- Search ---------------------------------------*/
/* ----------------------------------------------------------------------------------*/

let selectedElementsDivExp = document.getElementById("selectedElementExp");
let selectedElementsDivProject = document.getElementById("selectedElementProject");
let searchBar = document.getElementById("search-items");
let projectslist = document.getElementById("project");
let explist = document.getElementById("exp");


let noResultsFound = true;

searchBar.addEventListener("input", () => {
    let inputData = searchBar.value.toLowerCase();
    let searchResultProject = [];
    let searchResultExp = [];

    selectedElementsDivExp.innerHTML = "";
    selectedElementsDivProject.innerHTML = "";
    noResultsFound = true;

    selectedElementsDivExp.classList.remove("hide");
    selectedElementsDivProject.classList.remove("hide");
    projectslist.classList.add("hide");
    explist.classList.add("hide");

    getProjectData.forEach((projectData) => {
        let projectTags = projectData.tags;
        let projectMatches =
            (projectData.projectNameData.toLowerCase().includes(inputData) ||
                projectData.projectDescription.toLowerCase().includes(inputData) ||
                projectTags.some(tag => tag.toLowerCase().includes(inputData)));

        if (projectMatches) {
            let combinedRow = {
                project: projectData,
                projectTags: projectTags
            };
            searchResultProject.push(combinedRow);
            noResultsFound = false;
            console.log(searchResultProject);
        }

    });
    getExpData.forEach((expData) => {
        let expMatches =
            (expData.company.toLowerCase().includes(inputData) ||
                expData.duration.toLowerCase().includes(inputData) ||
                expData.jobInfo.toLowerCase().includes(inputData) ||
                expData.position.toLowerCase().includes(inputData));
        if (expMatches) {
            let combinedRow = {
                exp: expData
            };
            searchResultExp.push(combinedRow);
            noResultsFound = false;
            // console.log(searchResults);
        }
    });

    let tableRowExp = document.createElement("tr");
    let tableRowProject = document.createElement("tr");
    let postionName = document.createElement("th");
    let companysName = document.createElement("th");
    let durationTime = document.createElement("th");
    let positionDetail = document.createElement("th");
    let projectNameth = document.createElement("th");
    let projectDescriptionth = document.createElement("th");
    let projectTagsth = document.createElement("th");

    tableRowExp.classList.add("main-row");
    tableRowProject.classList.add("main-row");

    projectNameth.innerHTML = "Project Name";
    projectDescriptionth.innerHTML = "Project Description";
    projectTagsth.innerHTML = "Tags";
    postionName.innerHTML = "Position";
    companysName.innerHTML = "Company";
    durationTime.innerHTML = "Duration";
    positionDetail.innerHTML = "Details";

    selectedElementsDivExp.appendChild(tableRowExp);
    selectedElementsDivProject.appendChild(tableRowProject);

    if (searchResultExp.length > 0) {
        searchResultExp.forEach((result) => {

            tableRowExp.appendChild(postionName);
            tableRowExp.appendChild(companysName);
            tableRowExp.appendChild(durationTime);
            tableRowExp.appendChild(positionDetail);

            // console.log(result);
            let dataRowExp = document.createElement("tr");

            dataRowExp.classList.add("table-row");

            let positionTD = document.createElement("td");
            let companyTD = document.createElement("td");
            let durationTD = document.createElement("td");
            let detailTD = document.createElement("td");

            positionTD.innerHTML = result.exp.position;
            companyTD.innerHTML = result.exp.company;
            durationTD.innerHTML = result.exp.duration;
            detailTD.innerHTML = result.exp.jobInfo;

            dataRowExp.appendChild(positionTD);
            dataRowExp.appendChild(companyTD);
            dataRowExp.appendChild(durationTD);
            dataRowExp.appendChild(detailTD);

            selectedElementsDivExp.appendChild(dataRowExp);
        });
    }
    if (searchResultProject.length > 0) {
        searchResultProject.forEach((result) => {
            tableRowProject.appendChild(projectNameth);
            tableRowProject.appendChild(projectDescriptionth);
            tableRowProject.appendChild(projectTagsth);

            // console.log(result);
            let dataRowProject = document.createElement("tr");

            dataRowProject.classList.add("table-row");

            let pNameTD = document.createElement("td");
            let pDesTD = document.createElement("td");
            let pTagTD = document.createElement("td");

            pNameTD.innerHTML = result.project.projectNameData;
            pDesTD.innerHTML = result.project.projectDescription;
            pTagTD.innerHTML = result.project.tags;

            dataRowProject.appendChild(pNameTD);
            dataRowProject.appendChild(pDesTD);
            dataRowProject.appendChild(pTagTD);

            selectedElementsDivProject.appendChild(dataRowProject);
        });
    }
    else if (noResultsFound) {
        let noResultsItem = document.createElement("li");
        noResultsItem.textContent = "No results found.";
        selectedElementsDivProject.appendChild(noResultsItem);
        selectedElementsDivExp.appendChild(noResultsItem);
    }
});

let endSearch = document.getElementById("end-search");

endSearch.addEventListener("click", () => {

    projectslist.classList.remove("hide");
    explist.classList.remove("hide");
    selectedElementsDivProject.classList.add("hide");
    selectedElementsDivExp.classList.add("hide");
    searchBar.value = "";

})