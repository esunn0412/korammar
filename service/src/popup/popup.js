document.addEventListener('DOMContentLoaded', () => {

    // Set variable
    const inputText = document.getElementById('inputText');
    const inputForm = document.getElementById('correctForm');
    const correctButton = document.getElementById('correctButton');
    const editButton = document.getElementById('editButton');

    correctButton.addEventListener('click', async function(e) {
        e.preventDefault();
        requestMakePost(inputText.value, 'makePostCorrect', (correction) => {
            inputText.value = correction;
        });
    });

    editButton.addEventListener('click', async function(e) {
        e.preventDefault();
        requestMakePost(inputText.value, 'makePostEdited', (correction) => {
            inputText.value = correction;
        });
    });
    
    // inputForm.addEventListener('submit', function(e) {
    //     e.preventDefault();
        
    //     requestMakePost(inputText.value, (correction) => {
    //         inputText.value = correction;
    //     });
    // });

    // inputForm.addEventListener('keypress', async function (e) {
    //     if (e.key === 'Enter'){
    //         e.preventDefault();
    //         // let correction = requestMakePost(inputText.value);
    //         // inputText.value = correction[0]; 
    //         requestMakePost(inputText.value, (correction) =>{
    //             console.log(correction)
    //             inputText.value = correction;
    //         });
    //     }
    // });
    

    function requestMakePost(text, type, callback) {
        chrome.runtime.sendMessage({ type: type, text: text}, (response) => {
            if(callback){
                console.log('hihi')
                console.log(response)
                callback(response.data);
            }
        });
    }

});