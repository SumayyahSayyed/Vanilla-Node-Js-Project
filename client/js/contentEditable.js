let editableElement = document.querySelectorAll(".editable-element");
let editIcon = document.querySelectorAll(".edit-icon");
let editableFlag = false;
editIcon.forEach((icon) => {
    icon.addEventListener("click", (e) => {
        editableFlag = true;
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
        if (editableFlag === true) {
            contentEditabaleData();
            editableFlag = false;
        }
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