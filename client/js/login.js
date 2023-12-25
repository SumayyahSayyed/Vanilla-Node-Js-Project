
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
                if (data.data === "admin123@gmail.com" || data.data === "admin456@gmail.com") {
                    window.location.href = "../html/admin.html";
                }
                else if (data.data !== "admin123@gmail.com" && data.data !== "admin456@gmail.com") {
                    window.location.href = "/html/portfolio.html";
                }

            }
        })
        .catch(err => {
            console.log(err)
        })
}
let submit = document.getElementById("register-form");

submit.addEventListener("submit", (e) => {
    e.preventDefault();
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;


    let data = {
        verifyEmail: email,
        verifyPassword: password
    };

    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(res => {
            return res.json()
        })
        .then(data => {
            if (data.statusCode === "401") {
                alert(data.message);
            }
            else if (data.statusCode === "200") {
                console.log(data.message);
                localStorage.setItem("Token", data.token);
                // localStorage.setItem('tokenExpiration', expirationTime); 
                if (data.email === "admin123@gmail.com" && data.statusCode === "200" ||
                    data.email === "admin456@gmail.com" && data.statusCode === "200"
                ) {
                    window.location.href = "../html/admin.html";
                }
                else if (data.email !== "admin123@gmail.com" && data.statusCode === "200" ||
                    data.email !== "admin456@gmail.com" && data.statusCode === "200"
                ) {
                    window.location.href = "../html/portfolio.html";
                }
            }
        })
        .catch(err => {
            console.log(err)
        })
});

function removeErrorMessage() {
    const errorLabel = document.querySelector(".error-message");
    if (errorLabel !== null) {
        errorLabel.remove();
    }
}
