const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const math = require('mathjs'); // Import the math.js library

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/solve', (req, res) => {
    // Get user inputs
    const equationInput = req.body.equation;
    const initialGuess = parseFloat(req.body.initialGuess);
    const tol = req.body.error;
    // Define tolerance and maximum iterations
   
    const tolerance = 1/Math.pow(10,tol);
    const maxIterations = 100;

    // Initialize iteration counter and x-value
    let iteration = 0;
    let xVal = initialGuess;

    // Initialize results HTML
    let resultsHTML = `<b>Equation = ${equationInput} <br> Initial Guess = ${initialGuess} <br> The Solution correct to ${tol} digits is found by: </b>
    <table><tr><th>Iteration</th><th>x</th><th>f(x)</th><th>f'(x)</th></tr>`;

    // Define the equation as a function
    const equationFunction = math.parse(equationInput).compile();

    while (iteration < maxIterations) {
        try {
            // Calculate the function value and its derivative at xVal
            const fxVal = equationFunction.evaluate({ x: xVal });
            const dfxVal = math.derivative(equationInput, 'x').evaluate({ x: xVal });

            // Check for convergence
            if (Math.abs(fxVal) < tolerance) {
                resultsHTML += `<br><tr><td>Converged to solution:</td><td><b>${xVal.toFixed(tol)}</b></td></tr>`;
                break;
            }

            // Update x using the Newton-Raphson formula
            xVal = xVal - fxVal / dfxVal;

            // Append current iteration details to results HTML
            resultsHTML += `<tr><td>${iteration}</td><td>${xVal.toFixed(6)}</td><td>${fxVal.toFixed(6)}</td><td>${dfxVal.toFixed(6)}</td></tr>`;

            iteration++;
        } catch (error) {
            console.error(error);
            resultsHTML += `<tr><td colspan="3">Error occurred during evaluation.</td></tr>`;
            break;
        }
    }

    if (iteration === maxIterations) {
        resultsHTML += `<tr><td colspan="3">Maximum iterations reached. The method did not converge.</td></tr>`;
    }

    resultsHTML += '</table>';

    // Display the results

    res.send(resultsHTML);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
