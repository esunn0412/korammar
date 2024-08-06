let color = '#1677ff';

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({color});
    console.log('Default background color set to %cblue', `color: ${color}`);
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'textUpdate') {
        sendResponse({ 'text' : request.text });
        return false;
    } else if (request.type === 'makePost'){
        makePost(request.text)
            .then(data => {
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

