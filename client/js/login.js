// function preventGoingBack() {
//     window.history.forward();
// }
// setTimeout("preventGoingBack()", 0);
// window.onunload = function () { null };

let submit = document.getElementById("register-form");

submit.addEventListener("submit", (e) => {
    e.preventDefault();
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let isValid = validateForm(email, password);

    if (isValid) {
        // window.location.href = "../html/portfolio.html";

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
                    sessionStorage.setItem("Token", data.token);
                    window.location.href = "../html/portfolio.html";
                }
            })
            .catch(err => {
                console.log(err)
            })
    }
});

function validateForm(email, password) {
    let errorLabel = document.querySelector(".error-message");
    // let usersData = JSON.parse(localStorage.getItem("user"));
    // let foundUser = usersData.find(user => user.userEmail === email);
    // let foundUserPassword = usersData.find(user => user.userPassword === password);

    // if (!foundUser || !foundUserPassword) {
    //     if (errorLabel) {
    //         errorLabel.remove();
    //     }

    //     errorLabel = document.createElement('label');
    //     errorLabel.innerHTML = 'Incorrect email or password';
    //     errorLabel.classList.add("error-message");
    //     errorLabel.style.color = 'red';

    //     let userEmail = document.querySelector('input[name="email"]');
    //     userEmail.parentElement.insertAdjacentElement('beforeend', errorLabel);

    //     return false;
    // }

    return true;
}

function removeErrorMessage() {
    const errorLabel = document.querySelector(".error-message");
    if (errorLabel !== null) {
        errorLabel.remove();
    }
}
