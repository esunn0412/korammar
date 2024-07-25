document.addEventListener('DOMContentLoaded', () => {

    chrome.storage.sync.get('color', ({color}) => {
        document.getElementById('label').style.color = color;
    });

    chrome.storage.sync.get('color', ({color}) => {
        document.getElementById('popup-body').style.backgroundColor = color;
    });

    // Set variable
    const inputText = document.getElementById('inputText');
    const inputForm = document.getElementById('correctForm');

    // focus cursor on textarea as soon as popup is active
    inputText.focus()
    
    inputForm.addEventListener('submit', function(e) {
        e.preventDefault();
        makePost(inputText.value);
    });

    inputForm.addEventListener('keypress', function (e) {
        if (e.key === 'Enter'){
            e.preventDefault();
            makePost(inputText.value);
        }
    });

    function makePost(text){
        var json = JSON.stringify({'text': text});

        fetch('http://218.153.32.129:38889/correct', {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: json
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('inputText').value = data["corrected_text"];
        })
        .catch((error) => {
            console.error('Error', error);
        });
    }


});