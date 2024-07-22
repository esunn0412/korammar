document.addEventListener('DOMContentLoaded', () => {
    let counter = 0;

    const redButton = document.getElementById("redbutton");
    const countDisplay = document.getElementById("counter");

    redButton.addEventListener('click', () => {
        counter++;
        countDisplay.innerHTML = counter;
    });

    const inputText = document.getElementById('inputText');
    const correctButton = document.getElementById('correctButton');
    const outputText = document.getElementById('outputText');

    correctButton.addEventListener('click', () => {
        const text = inputText.value
        
    });

});