let userName = document.getElementById("userName");
let userEmail = document.getElementById("gmail");
let phoneNo = document.getElementById("phoneNo");
let templateUserName = document.getElementById("template-user-name");
let getAllData = null;
/* ----------------------------------------------------------------------------------*/
/* ------------------------------- Fetch Token --------------------------------------*/
/* ----------------------------------------------------------------------------------*/

let token = sessionStorage.getItem("Token");
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
    sessionStorage.clear();
    window.location.href = "../html/login.html";
});

function userIsLoggedIn() {
    let sessionVariable = sessionStorage.getItem("Token");
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

function handleFormSubmission() {
    projectForm.addEventListener("submit", (e) => {

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
                    console.log(data.data);
                    if (Array.isArray(data.data)) {
                        data.data.forEach((project, index) => {
                            viewProject(project);
                            editProject(project, index);
                            deleteProject(index);
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        }
    });
}


addProjectIcon.addEventListener("click", () => {
    document.getElementById("projectName").value = "";
    document.getElementById("projectDescription").value = "";
    document.getElementById("tags").value = "";
    document.getElementById("linkToLiveWebsite").value = "";
    document.getElementById("linkToRepo").value = "";
    document.getElementById("file").value = "";

    projectForm.classList.remove("hide");
    handleFormSubmission();
});



function openFile(e) {
    let input = e.target;
    let reader = new FileReader();
    reader.onload = () => {
        dataURL = reader.result;
    };
    reader.readAsDataURL(input.files[0]);
}

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
            console.log(data.message);
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
            getAllData = data.data;
            console.log(getAllData);
            if (Array.isArray(getAllData)) {
                getAllData.forEach((project, index) => {
                    projectDataToAppend(project);

                    // viewProject(project);
                    // editProject(project, index);
                    // deleteProject(index);
                });
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
        tag.classList.add("tag");
        tag.textContent = tagText;
        tagsContainer.appendChild(tag);
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

    // deleteBTN.onclick() = deleteIt();
    //project counter i have = 1
    /**
     * delete counter - 1
     */
}

// deleteIt()

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
                let tags = document.querySelectorAll(".tag");
                let livehref = link.getAttribute('href');
                let repohref = repo.getAttribute('href');

                let tagValues = Array.from(tags).map(tagElement => tagElement.innerHTML);
                tagValues = tagValues.join(", ");
                // console.log(tagValues);

                document.getElementById("projectName").value = heading.innerHTML;
                document.getElementById("projectDescription").value = para.innerHTML;
                document.getElementById("tags").value = tagValues;
                document.getElementById("linkToLiveWebsite").value = livehref;
                document.getElementById("linkToRepo").value = repohref;
                document.getElementById("file").value = "";

                projectForm.addEventListener("submit", handleSubmit);

                function handleSubmit(e) {
                    e.preventDefault();
                    projectForm.classList.add("hide");

                    let projectName = heading.innerHTML;

                    let projectImage = target.parentElement.parentElement.nextElementSibling;
                    projectImage.src = "";

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
                            console.log(data.data);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                }
            }
        }
    });
}

// function deleteProject(index) {
//     let projectSection = document.getElementById("allProjects");
//     projectSection.addEventListener("click", (e) => {
//         console.log("HSHDHS", index);
//         let target = e.target;
//         if (target.classList.contains("delete-project")) {
//             let parentElementDiv = target.parentElement.parentElement;
//             let projectImage = parentElementDiv.nextElementSibling;

//             console.log(projectSection.childNodes[index]);

//             // let heading = parentElementDiv.firstElementChild;
//             // console.log(parentElementDiv, projectImage);

//             console.log(index);

//             projectSection.removeChild(parentElementDiv);
//             projectSection.removeChild(projectImage);


//             fetch(`http://localhost:3000/deleteProject/${index}`, {
//                 method: "DELETE",
//                 headers: {
//                     "Content-type": "application/json",
//                     "authorization": token
//                 }
//             })
//                 .then((res) => {
//                     if (res.status === 204) {
//                         console.log("Project Deleted")
//                     } else {
//                     }
//                 })
//                 .catch((error) => {
//                     console.error("Error:", error);
//                 });

//         }
//     });
// }


function viewProject(fetchusersProject) {
    console.log('hihihihihi', fetchusersProject);

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
            // console.log(data.message);
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
            console.log(data);
            editableData[0].innerHTML = data.data.position;
            editableData[1].innerHTML = data.data.aboutMe;
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
        let expDuration = document.getElementById("duration").value;
        let jobDescription = document.getElementById("jobInfo").value;

        if (!expPosition || !companyName || !expDuration || !jobDescription) {
            validateFormExp(expPosition, companyName, expDuration, jobDescription);
        } else {
            expForm.classList.add("hide");
            let expData = {
                expID: id,
                position: expPosition,
                company: companyName,
                duration: expDuration,
                jobInfo: jobDescription
            }

            saveExp(expData);
        }
    })
})
let crossExp = document.getElementById("cross-exp");
crossExp.addEventListener("click", () => {
    expForm.classList.add("hide");

})

function saveExp(expData) {
    let temp = JSON.parse(localStorage.getItem("exp")) || [];
    temp.push(expData);
    localStorage.setItem("exp", JSON.stringify(temp));

}

function appendExp() {
    let getExpData = JSON.parse(localStorage.getItem("exp")) || [];
    for (let eachData of getExpData) {

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

        if (eachData.expID === id) {

            expName.innerHTML = eachData.position;
            company.innerHTML = eachData.company;
            expDuration.innerHTML = eachData.duration;
            expDescription.innerHTML = eachData.jobInfo;


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
    }
}

appendExp();

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

function editExp() {
    let editButtonClick = document.querySelectorAll(".edit-exp");
    console.log(editButtonClick)
    let expArray = JSON.parse(localStorage.getItem("exp"));
    // let expMainDiv = document.getElementById("exp-main-div");

    for (let eachData of editButtonClick) {
        eachData.addEventListener("click", (e) => {

            let target = e.target;
            let expForm = document.getElementById("exp-form");
            let addExp = document.getElementById("addExp");


            expForm.classList.remove("hide");
            let heading = eachData.parentElement.parentElement.firstChild.firstElementChild;
            let companyName = heading.nextElementSibling;
            let duration = companyName.nextElementSibling;
            let jobDescription = duration.nextElementSibling;

            document.getElementById("experiencePos").value = heading.innerHTML;
            document.getElementById("company").value = companyName.innerHTML;
            document.getElementById("duration").value = duration.innerHTML;
            document.getElementById("jobInfo").value = jobDescription.innerHTML;

            addExp.addEventListener("click", (e) => {
                expForm.classList.add("hide");

                let JobCompany = companyName.innerHTML;
                let expToUpdate = expArray.find(exp => exp.company === JobCompany);
                e.preventDefault();
                if (expToUpdate) {
                    expToUpdate.position = document.getElementById("experiencePos").value;
                    expToUpdate.company = document.getElementById("company").value;
                    expToUpdate.duration = document.getElementById("duration").value;
                    expToUpdate.jobInfo = document.getElementById("jobInfo").value;

                    localStorage.setItem("exp", JSON.stringify(expArray));
                }
            });
        });

    }

}

editExp();

function deleteExp() {
    let deleteButtonClick = document.querySelectorAll(".delete-exp");
    let expArray = JSON.parse(localStorage.getItem("exp"));
    let expMainDiv = document.getElementById("exp-main-div");

    for (let eachdata of deleteButtonClick) {
        eachdata.addEventListener("click", () => {
            let heading = eachdata.parentElement.parentElement.firstChild.firstElementChild;
            let existingIndex = expArray.findIndex(exp => exp.position === heading.innerHTML);
            console.log(existingIndex);
            if (existingIndex !== -1) {
                expArray.splice(existingIndex, 1);
                localStorage.setItem("exp", JSON.stringify(expArray));

                let parentElement = eachdata.parentElement.parentElement;
                expMainDiv.removeChild(parentElement);
            }

        })
    }
}
deleteExp();

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
        let eduDuration = document.getElementById("uniDuration").value;

        if (!eduDegree || !eduUni || !eduCgpa || !eduDuration) {
            validateForm(eduDegree, eduUni, eduCgpa, eduDuration);
        } else {
            eduForm.classList.add("hide");
            let eduData = {
                eduID: id,
                degree: eduDegree,
                university: eduUni,
                cgpa: eduCgpa,
                duration: eduDuration,
            }

            saveEdu(eduData);
        }
    })
})
let crossEdu = document.getElementById("cross-education");
crossEdu.addEventListener("click", () => {
    eduForm.classList.add("hide");
})

function saveEdu(eduData) {
    let temp = JSON.parse(localStorage.getItem("edu")) || [];
    temp.push(eduData);
    localStorage.setItem("edu", JSON.stringify(temp));
}

function appendEdu() {
    let getEduData = JSON.parse(localStorage.getItem("edu")) || [];

    for (let eachData of getEduData) {

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

        if (eachData.eduID === id) {

            eduDegree.innerHTML = eachData.degree;
            eduUni.innerHTML = eachData.university;
            eduCgpa.innerHTML = eachData.cgpa;
            eduDuration.innerHTML = eachData.duration;


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
    }
}
appendEdu();

function editEdu() {
    let editButtonClick = document.querySelectorAll(".edit-edu");
    let eduArray = JSON.parse(localStorage.getItem("edu"));
    // console.log(eduArray);

    for (let eachdata of editButtonClick) {
        let eduForm = document.getElementById("edu-form");
        let addEdu = document.getElementById("addEdu");
        eachdata.addEventListener("click", (e) => {

            eduForm.classList.remove("hide");
            let degreeName = eachdata.parentElement.parentElement.firstChild.firstElementChild;
            let uniName = degreeName.nextElementSibling;
            let cgpaCount = uniName.nextElementSibling;
            let durationCount = cgpaCount.nextElementSibling;

            console.log(degreeName, uniName, cgpaCount, durationCount);

            document.getElementById("degree").value = degreeName.innerHTML;
            document.getElementById("university").value = uniName.innerHTML;
            document.getElementById("cgpa").value = cgpaCount.innerHTML;
            document.getElementById("uniDuration").value = durationCount.innerHTML;

            addEdu.addEventListener("click", (e) => {
                e.preventDefault();
                eduForm.classList.add("hide");
                let degreeName = eachdata.parentElement.parentElement.firstChild.firstElementChild;
                let eduToUpdate = eduArray.find(ed => ed.degree === degreeName.innerHTML);
                if (eduToUpdate) {
                    eduToUpdate.degree = document.getElementById("degree").value;
                    eduToUpdate.university = document.getElementById("university").value;
                    eduToUpdate.cgpa = document.getElementById("cgpa").value;
                    eduToUpdate.duration = document.getElementById("uniDuration").value;

                    localStorage.setItem("edu", JSON.stringify(eduArray));

                    degreeName.innerHTML = document.getElementById("degree").value;
                    uniName.innerHTML = document.getElementById("university").value;
                    cgpaCount.innerHTML = document.getElementById("cgpa").value;
                    durationCount.innerHTML = document.getElementById("uniDuration").value;

                }
            });
        });
    }

}
editEdu();

function deleteEdu() {
    let deleteButtonClick = document.querySelectorAll(".delete-edu");
    let eduArray = JSON.parse(localStorage.getItem("edu"));
    let mainParent = document.getElementById("edu-main-div");

    for (let eachdata of deleteButtonClick) {
        eachdata.addEventListener("click", () => {
            let heading = eachdata.parentElement.parentElement.firstChild.firstElementChild;
            console.log(heading);
            let existingIndex = eduArray.findIndex(edu => edu.degree === heading.innerHTML);
            console.log(existingIndex);
            if (existingIndex !== -1) {
                eduArray.splice(existingIndex, 1);
                localStorage.setItem("edu", JSON.stringify(eduArray));
                let parentElement = eachdata.parentElement.parentElement;
                mainParent.removeChild(parentElement);
            }
        })
    }
}
deleteEdu();

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

// let githubAcc = document.getElementById("github-acc");
// let linkedInAcc = document.getElementById("linkedin-acc");
// let twitterAcc = document.getElementById("twitter-acc");
// let getAccountsInfo = JSON.parse(localStorage.getItem("socials"));


// if (getAccountsInfo.socialID === id) {
//     console.log(getAccountsInfo.LinkedinLink);

//     githubAcc.setAttribute("href", getAccountsInfo.githubLink);
//     linkedInAcc.setAttribute("href", getAccountsInfo.linkedinLink);
//     twitterAcc.setAttribute("href", getAccountsInfo.twitterlink);
// }

/* ----------------------------------------------------------------------------------*/
/* ----------------------------------- Search ---------------------------------------*/
/* ----------------------------------------------------------------------------------*/

let experience = JSON.parse(localStorage.getItem("exp"));
let projects = JSON.parse(localStorage.getItem("projects"));

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

    projects.forEach((projectData) => {
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
    experience.forEach((expData) => {
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
            // console.log(result);
            if (result.exp.expID === id) {

                tableRowExp.appendChild(postionName);
                tableRowExp.appendChild(companysName);
                tableRowExp.appendChild(durationTime);
                tableRowExp.appendChild(positionDetail);

                console.log(result);
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
            }
        });
    }
    if (searchResultProject.length > 0) {
        searchResultProject.forEach((result) => {
            if (result.project.projectID === id) {
                tableRowProject.appendChild(projectNameth);
                tableRowProject.appendChild(projectDescriptionth);
                tableRowProject.appendChild(projectTagsth);

                console.log(result);
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
            }
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