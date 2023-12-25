let userName = document.getElementById("userName");
let userEmail = document.getElementById("gmail");
let phoneNo = document.getElementById("phoneNo");
let templateUserName = document.getElementById("template-user-name");
let adminUser = document.getElementById("adminUser");


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
            userName.textContent = data.userInfo.userName;
            userEmail.setAttribute("href", "mailto:" + data.userInfo.userEmail);
            userEmail.textContent = data.userInfo.userEmail;
            phoneNo.setAttribute("href", "//api.whatsapp.com/send?phone=" + data.userInfo.userPhone);
            templateUserName.textContent = data.userInfo.userName;
            if (data.userInfo.userType === "admin") {
                adminUser.classList.remove("hide");
            }
        }
    })
    .catch(err => {
        console.log(err);
    })

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