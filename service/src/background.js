
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request.type);
    if (request.type === 'textUpdate') {
        sendResponse({ 'text' : request.text });
        return false;
    } else if (request.type === 'makePostCorrect'){
        makePost(request.text)
            .then(data => {
                console.log('data received', data);
                sendResponse({data})
            })
            .catch(error => {sendResponse({error: error.message})
        });
        return true;
    } else if (request.type === 'makePostEdited'){
        makePostEdited(request.text)
            .then(data => {
                console.log('data received', data);
                sendResponse({data})
            })
            .catch(error => {sendResponse({error: error.message})
        });
        return true;
    }
});

async function makePost(text){
    var json = JSON.stringify({'text': text});

    try {
        const response = await fetch('http://218.153.32.129:38889/correct', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: json
        });
        const data = await response.json();
        console.log('data received', data);
        return data.corrected_text;
    } catch (error) {
        console.error('Error', error);
        throw error;
    }
}

async function makePostEdited(text){
    var json = JSON.stringify({'text': text});

    try {
        const response = await fetch('http://218.153.32.129:38889/edit', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: json
        });
        const data = await response.json();
        console.log('data received', data);
        return data.edited_text;
    } catch (error) {
        console.error('Error', error);
        throw error;
    }
}

