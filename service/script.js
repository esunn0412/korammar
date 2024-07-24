document.addEventListener('DOMContentLoaded', () => {

    chrome.storage.sync.get('color', ({color}) => {
        document.getElementById('label').style.color = color;
    });

    chrome.storage.sync.get('color', ({color}) => {
        const h3elements = document.getElementsByTagName('h3');
        h3elements[0].style.color = color;
    });

    const inputText = document.getElementById('inputText');

    document.getElementById('correctForm').addEventListener('submit', function(e) {
        e.preventDefault();

        var text = inputText.value;
        var json = JSON.stringify({'text': text});

        fetch('http://127.0.0.1:8889/correct', {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: json
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('outputText').innerHTML = data;
        })
        .catch((error) => {
            console.error('Error', error);
        });        
    });

});