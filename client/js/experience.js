let expDiv = document.getElementById("exp");
let addExp = document.getElementById("plus-exp");
let expForm = document.getElementById("exp-form");
addExp.addEventListener("click", () => {
    document.getElementById("experiencePos").value = "";
    document.getElementById("company").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("jobInfo").value = "";
    expForm.classList.remove("hide");

});

expForm.addEventListener("submit", (e) => {
    if (editExpFlag === false) {
        handleExpForm(e);
    }
});

function handleExpForm(e) {
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
                            deleteExp(exp);
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
                        deleteExp(exp);
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
            editExpFlag = true;
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

                    let Id = expData.expId;

                    fetch(`http://localhost:3000/saveEditedExp/${Id}`, {
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
    editExpFlag = false;
}

function deleteExp(exp) {
    let deleteButtonClick = document.querySelectorAll(".delete-exp");
    let expMainDiv = document.getElementById("exp-main-div");

    for (let eachdata of deleteButtonClick) {
        eachdata.addEventListener("click", () => {
            let heading = eachdata.parentElement.parentElement.firstChild.firstElementChild;

            if (exp.position === heading.innerHTML) {

                let targetExp = eachdata.parentElement.parentElement;
                expMainDiv.removeChild(targetExp);

                let id = exp.expId;
                console.log(id);

                fetch(`http://localhost:3000/deleteExp/${id}`, {
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