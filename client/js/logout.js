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