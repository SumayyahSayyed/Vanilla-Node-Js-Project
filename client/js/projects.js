let projectCounter = 1;
let addProjectIcon = document.getElementById("plus-icon");
let projectForm = document.getElementById("project-form");
let projectDiv = document.getElementById("allProjects");

let projectImageFile = document.getElementById("file");
let projectImage = document.getElementById("project-image");
let dataURL;


function handleFormSubmission(e) {
    e.preventDefault();

    let projectNameInput = document.getElementById("projectName").value;
    let projectDescriptionInput = document.getElementById("projectDescription").value;
    let langTags = document.getElementById("tags").value.split(',').map(tag => tag.trim());
    let liveLinkInput = document.getElementById("linkToLiveWebsite").value;
    let repoLinkInput = document.getElementById("linkToRepo").value;
    let imageSRC = dataURL;

    if (!projectNameInput || !projectDescriptionInput || !langTags || !liveLinkInput || !repoLinkInput || !imageSRC) {
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
        };

        projectDataToAppend(projectData);
        saveProject(projectData);

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
                            deleteProject(project);
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

        console.log("HI", projectData);
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

});

projectForm.addEventListener("submit", (e) => {
    if (editFlag === false) {
        handleFormSubmission(e);
    }
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
                console.log("Projects", getProjectData);

                getProjectData.forEach((project, index) => {
                    // console.log(project);
                    projectDataToAppend(project);

                    viewProject(project);
                    editProject(project, index);
                    deleteProject(project);
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
    // console.log(projectData.tags);
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
            editFlag = true;
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
                let tagsParent = tags[0].parentElement;
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


                let addEditedProject = document.getElementById("addProject");
                addEditedProject.addEventListener("click", (e) => {
                    e.preventDefault();
                    projectForm.classList.add("hide");


                    heading.innerHTML = document.getElementById("projectName").value;
                    para.innerHTML = document.getElementById("projectDescription").value;
                    let newTags = document.getElementById("tags").value.split(',').map(tag => tag.trim());
                    console.log(index);
                    console.log(tags.length);

                    newTags.forEach((tagValue, i) => {
                        if (i < tags.length) {
                            tags[i].innerHTML = tagValue;
                        } else {
                            let newTag = document.createElement("span");
                            newTag.classList.add("tag-" + index);
                            newTag.innerHTML = tagValue;
                            tagsParent.appendChild(newTag);
                        }
                        console.log(tagValue);
                    });
                    livehref = document.getElementById("linkToLiveWebsite").value;
                    repohref = document.getElementById("linkToRepo").value;
                    projectImage.src = dataURL;

                    let allTags = document.getElementById("tags").value.split(',').map(tag => tag.trim());

                    let saveEditedData = {
                        projectId: project.projectId,
                        projectNameData: heading.innerHTML,
                        projectDescription: para.innerHTML,
                        tags: allTags,
                        projectLiveLink: livehref,
                        projectRepo: repohref,
                        projectImg: projectImage.src
                    };

                    let Id = project.projectId;
                    fetch(`http://localhost:3000/saveEditedProject/${Id}`, {
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
                                        deleteProject(project);
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

    editFlag = false;
}

function deleteProject(project) {
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
                let Id = project.projectId;
                console.log(Id);

                fetch(`http://localhost:3000/deleteProject/${Id}`, {
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
    else if (!langTags && !errorLabel) {
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