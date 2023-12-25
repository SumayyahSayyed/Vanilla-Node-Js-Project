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
                    window.location.href = "../html/portfolio.html";
                }
            }
        })
        .catch(err => {
            console.log(err)
        })
}

// function preventGoingBack() {
//     window.history.forward();
// }
// setTimeout("preventGoingBack()", 0);
// window.onunload = function () { null };


let submit = document.getElementById("register-form");
// let expirationTime = new Date().getTime() + 30 * 1000;

submit.addEventListener("submit", (e) => {
    e.preventDefault();

    let fName = document.getElementById("firstname").value;
    let lName = document.getElementById("lastname").value;
    let phone = document.getElementById("phone").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let isTrue = validateForm(fName, lName, phone, email, password);

    if (isTrue) {

        let data = {
            firstName: fName,
            lastName: lName,
            userPhone: phone,
            userEmail: email,
            userPassword: password
        }

        fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                if (data.statusCode === "400") {
                    alert(data.message);
                }
                else if (data.email === "admin123@gmail.com" && data.statusCode === "200" ||
                    data.email === "admin456@gmail.com" && data.statusCode === "200"
                ) {
                    console.log("admin console");
                    console.log(data.message);
                    localStorage.setItem("Token", data.token);
                    // localStorage.setItem('tokenExpiration', expirationTime);
                    window.location.href = "../html/admin.html";
                }
                else if (data.email !== "admin123@gmail.com" && data.statusCode === "200" ||
                    data.email !== "admin456@gmail.com" && data.statusCode === "200"
                ) {
                    console.log("user console");
                    console.log(data.message);
                    localStorage.setItem("Token", data.token);
                    // localStorage.setItem('tokenExpiration', expirationTime);
                    window.location.href = "../html/social.html";
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
    else {
        isTrue = validateForm(fName, lName, phone, email, password);
    }

})

function removeErrorMessage() {
    const errorLabel = document.querySelector(".error-message");
    if (errorLabel !== null) {
        errorLabel.remove();
    }
}
function validateForm(fName, lName, phone, email, password) {
    removeErrorMessage();
    let errorLabel = document.querySelector(".error-message");

    if (fName == "" && !errorLabel) {
        let select = document.querySelector('input[name="firstname"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Please fill in your First Name";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;
    }
    else if (fName && /[^A-Za-z]/.test(fName) && !errorLabel) {
        let select = document.querySelector('input[name="firstname"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Name cannot contain numbers or special characters";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;
    }
    else if (lName == "" && !errorLabel) {
        let select = document.querySelector('input[name="lastname"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Please fill in your Last Name";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;

    }
    else if (lName && /[^A-Za-z]/.test(lName) && !errorLabel) {
        let select = document.querySelector('input[name="lastname"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Name cannot contain numbers or special characters";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;
    }
    else if (phone == "" && !errorLabel) {
        let select = document.querySelector('input[name="phone"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Please fill in your Phone Number";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;
    }
    else if (phone && /[^0-9]/.test(phone) && !errorLabel) {
        let select = document.querySelector('input[name="phone"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Phone Number cannot contain alphabets or special numbers";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;
    }
    else if (email == "" && !errorLabel) {
        let select = document.querySelector('input[name="email"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Please fill in email address";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;

    }
    else if (password == "" && !errorLabel) {
        let select = document.querySelector('input[name="password"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Please enter the password";
        errorLabel.style.color = "red";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
        return false;
    }

    return true;
}