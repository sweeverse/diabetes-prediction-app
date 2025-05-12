document.getElementById("predictionForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let features = [
        parseFloat(document.getElementById("age").value),
        parseFloat(document.getElementById("sex").value),
        parseFloat(document.getElementById("bmi").value),
        parseFloat(document.getElementById("bp").value),
        parseFloat(document.getElementById("chol").value),
        parseFloat(document.getElementById("bad_chol").value),
        parseFloat(document.getElementById("good_chol").value),
        parseFloat(document.getElementById("chol_hdl_ratio").value),
        parseFloat(document.getElementById("triglycerides").value),
        parseFloat(document.getElementById("hba1c").value)
    ];

    fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: features })
    })
    .then(response => response.json())
    .then(data => {
        // Display the prediction result rounded to 3 decimal places
        document.getElementById("result").innerText = 
            "Predicted Diabetes Progression Score: " + parseFloat(data.prediction).toFixed(3);
    })
    .catch(error => {
        console.error("Error:", error);
        document.getElementById("result").innerText = "Error in prediction.";
    });
});
