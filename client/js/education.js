let addEdu = document.getElementById("plus-edu");
let eduForm = document.getElementById("edu-form");
addEdu.addEventListener("click", () => {
    document.getElementById("degree").value = "";
    document.getElementById("university").value = "";
    document.getElementById("cgpa").value = "";
    document.getElementById("uniDuration").value = "";
    eduForm.classList.remove("hide");
});

eduForm.addEventListener("submit", (e) => {
    if (editEduFlag === false) {
        handleEduForm(e);
    }
})

function handleEduForm(e) {
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
                            deleteEdu(edu);
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
}

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
                        deleteEdu(edu);
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

function editEdu(eduData, index) {
    let editButtonClick = document.querySelectorAll(".edit-edu");

    for (let eachdata of editButtonClick) {
        let eduForm = document.getElementById("edu-form");
        let addEdu = document.getElementById("addEdu");
        eachdata.addEventListener("click", (e) => {
            editEduFlag = true;
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
                console.log(index);
                e.preventDefault();
                eduForm.classList.add("hide");
                let degreeName = eachdata.parentElement.parentElement.firstChild.firstElementChild;
                if (eduData.degree === degreeName.innerHTML) {

                    degreeName.innerHTML = document.getElementById("degree").value;
                    uniName.innerHTML = document.getElementById("university").value;
                    cgpaCount.innerHTML = document.getElementById("cgpa").value;
                    durationCount.innerHTML = document.getElementById("uniDuration").value + "  years";

                    let saveEditededuData = {
                        indexValue: index,
                        degree: degreeName.innerHTML,
                        university: uniName.innerHTML,
                        cgpa: cgpaCount.innerHTML,
                        duration: durationCount.innerHTML,
                    }

                    let Id = eduData.eduId;

                    fetch(`http://localhost:3000/saveEditedEdu/${Id}`, {
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
    editEduFlag = false;
}

function deleteEdu(eduData) {
    let deleteButtonClick = document.querySelectorAll(".delete-edu");
    let mainParent = document.getElementById("edu-main-div");

    for (let eachdata of deleteButtonClick) {
        eachdata.addEventListener("click", () => {
            let heading = eachdata.parentElement.parentElement.firstChild.firstElementChild;

            if (eduData.degree === heading.innerHTML);

            let parentElementData = eachdata.parentElement.parentElement;
            mainParent.removeChild(parentElementData);

            let id = eduData.eduId;

            fetch(`http://localhost:3000/deleteEdu/${id}`, {
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