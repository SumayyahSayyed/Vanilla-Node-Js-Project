let socialForm = document.getElementById("social-form");

socialForm.addEventListener("submit", (e) => {
    let token = localStorage.getItem("Token")
    e.preventDefault();

    let github = document.getElementById("github").value;
    let linkedin = document.getElementById("linkedin").value;
    let twitter = document.getElementById("twitter").value;

    if (!github || !linkedin || !twitter) {
        validateForm(github, linkedin, twitter);
    }
    else {
        let data = {
            githubLink: github,
            linkedinLink: linkedin,
            twitterlink: twitter
        }

        fetch("http://localhost:3000/socials", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": token
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                return res.json();
            })
            .then(data => {
                if (data.statusCode === "200") {
                    console.log(data.message);
                    window.location.href = "../html/portfolio.html";
                }
                else if (data.statusCode === "400") {
                    console.log(data.message);
                }
            })
            .catch(err => {
                console.log(err);
            })
    }
})


function removeErrorMessage() {
    const errorLabel = document.querySelector(".error-message");
    if (errorLabel !== null) {
        errorLabel.remove();
    }
}
function validateForm(github, linkedin, twitter) {
    let errorLabel = document.querySelector(".error-message");


    if (github == "" && !errorLabel) {
        let select = document.querySelector('input[name="github"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Please enter your Github Link";
        errorLabel.style.color = "red";
        errorLabel.style.display = "block";

        select.parentElement.insertAdjacentElement('beforeend', errorLabel);

    }
    else if (linkedin == "" && !errorLabel) {
        let select = document.querySelector('input[name="linkedin"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Please enter your LinkedIn Profile Link";
        errorLabel.style.color = "red";
        errorLabel.style.display = "block";


        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
    else if (twitter == "" && !errorLabel) {
        let select = document.querySelector('input[name="twitter"]');
        errorLabel = document.createElement("label");
        errorLabel.classList.add("error-message");
        errorLabel.innerText = "Please link your Twitter account";
        errorLabel.style.color = "red";
        errorLabel.style.display = "block";


        select.parentElement.insertAdjacentElement('beforeend', errorLabel);
    }
}
