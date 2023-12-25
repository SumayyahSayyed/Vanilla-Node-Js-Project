let token = localStorage.getItem("Token");

let editFlag = false;
let editExpFlag = false;
let editEduFlag = false;

// if (token) {
//     fetch("http://localhost:3000/checkUserTypeOnUser", {
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
//                     window.location.href = "../html/portfolio.html";
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


let getProjectData = null;
let getExpData = null;
let getEduData = null;

/* ----------------------------------------------------------------------------------*/
/* ----------------------------------- Search ---------------------------------------*/
/* ----------------------------------------------------------------------------------*/

let selectedElementsDivExp = document.getElementById("selectedElementExp");
let selectedElementsDivProject = document.getElementById("selectedElementProject");
let selectedElementsDivEdu = document.getElementById("selectedElementEdu");

let projectslist = document.getElementById("project");
let explist = document.getElementById("exp");
let eduList = document.getElementById("education-section");


let noResultsFound = true;
let searchResultProject;

let endSearch = document.getElementById("end-search");
let searchBar = document.getElementById("search-items");
let resultsDiv = document.getElementById("resultsDiv");

let startSearch = document.getElementById("start-search");
startSearch.addEventListener("click", () => {
    startSearch.classList.add("hide");
    endSearch.classList.remove("hide");
    let query = searchBar.value.trim();
    selectedElementsDivExp.innerHTML = "";
    selectedElementsDivProject.innerHTML = "";
    selectedElementsDivEdu.innerHTML = "";
    noResultsFound = true;

    selectedElementsDivExp.classList.remove("hide");
    selectedElementsDivProject.classList.remove("hide");
    selectedElementsDivEdu.classList.remove("hide");
    projectslist.classList.add("hide");
    explist.classList.add("hide");
    eduList.classList.add("hide");

    if (query) {
        fetch(`http://localhost:3000/searchProject?query=${query}`, {
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
                searchResultProject = data.projects;
                viewSearchedProjects(searchResultProject);

            })
            .catch(error => {
                console.error('Error:', error);
                resultsDiv.textContent = 'An error occurred while fetching data.';
            });
    }
});

function viewSearchedProjects(searchResultProject) {
    let tableRowProject = document.createElement("tr");

    let projectNameth = document.createElement("th");
    let projectDescriptionth = document.createElement("th");
    let projectTagsth = document.createElement("th");

    tableRowProject.classList.add("main-row");

    projectNameth.innerHTML = "Project Name";
    projectDescriptionth.innerHTML = "Project Description";
    projectTagsth.innerHTML = "Tags";

    selectedElementsDivProject.appendChild(tableRowProject);
    if (searchResultProject.length > 0) {
        // console.log(searchResultProject);
        searchResultProject.forEach((result) => {
            tableRowProject.appendChild(projectNameth);
            tableRowProject.appendChild(projectDescriptionth);
            tableRowProject.appendChild(projectTagsth);

            console.log(result);
            let dataRowProject = document.createElement("tr");

            dataRowProject.classList.add("table-row");

            let pNameTD = document.createElement("td");
            let pDesTD = document.createElement("td");
            let pTagTD = document.createElement("td");

            pNameTD.innerHTML = result.Name;
            pDesTD.innerHTML = result.Description;
            pTagTD.innerHTML = result.Tags;

            dataRowProject.appendChild(pNameTD);
            dataRowProject.appendChild(pDesTD);
            dataRowProject.appendChild(pTagTD);

            selectedElementsDivProject.appendChild(dataRowProject);
        });
    }
}
endSearch.addEventListener("click", () => {
    startSearch.classList.remove("hide");
    endSearch.classList.add("hide");
    projectslist.classList.remove("hide");
    explist.classList.remove("hide");
    eduList.classList.remove("hide")
    selectedElementsDivProject.classList.add("hide");
    selectedElementsDivExp.classList.add("hide");
    selectedElementsDivEdu.classList.add("hide");
    searchBar.value = "";

})