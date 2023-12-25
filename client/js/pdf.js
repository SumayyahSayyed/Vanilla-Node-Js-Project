let pdfURL;
function openPdf(e) {
    let input = e.target;
    let reader = new FileReader();
    reader.onload = () => {
        pdfURL = reader.result;

        const resumeLink = document.getElementById('resume-link');
        resumeLink.setAttribute('href', pdfURL);

        let data = {
            pdfURL: pdfURL
        }

        fetch("http://localhost:3000/savePdf", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "authorization": token
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(data => {
                if (data.statusCode === "200") {
                    console.log(data.message);
                    fetchURL(pdfURL);
                }
                else if (data.statusCode === "401") {
                    console.log(data.message);
                    localStorage.removeItem("Token");
                    window.location.href == "/client/html/login.html";
                }
            })
            .catch(err => {
                console.log(err);
            });
    };
    reader.readAsDataURL(input.files[0]);
}

const resumeLink = document.getElementById('resume-link');

function fetchURL(pdfURL) {
    fetch("http://localhost:3000/getPdf",
        {
            method: "GET",
            headers: {
                "authorization": token
            },
            body: JSON.stringify(pdfURL)
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (data.statusCode === "200") {
                console.log(data.message);
                console.log(data.data);
                resumeLink.setAttribute("href", data.data.pdf);
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

fetchURL(pdfURL);