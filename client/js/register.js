let submit = document.getElementById("register-form");

const generateId = () => Math.random().toString(36);

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
                else if (data.statusCode === "200") {
                    console.log(data.message);
                    sessionStorage.setItem("Token", data.token);
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
    else if (email && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email) && !errorLabel) {
        let select = document.querySelector('input[name="email"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Invalid email address";
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