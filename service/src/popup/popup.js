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
    
    inputForm.addEventListener('submit', function(e) {
        e.preventDefault();
        requestMakePost(inputText.value, (correction) => {
            if (correction && correction.length > 0) {
                inputText.value = correction[0];
            }
        });
    });

    inputForm.addEventListener('keypress', async function (e) {
        if (e.key === 'Enter'){
            e.preventDefault();
            // let correction = requestMakePost(inputText.value);
            // inputText.value = correction[0]; 
            requestMakePost(inputText.value, (correction) =>{
                if (correction && correction.length > 0) {
                    inputText.value = correction[0];
                }
            });
        }
    });
    

    function requestMakePost(text, callback) {
        chrome.runtime.sendMessage({ type: 'makePost', text: text}, (response) => {
            console.log('Correction received', response.data)
            if(callback){
                callback(response.data);
            }
        });
    }

});