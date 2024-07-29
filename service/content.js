document.addEventListener('DOMContentLoaded', () => {
    let iconElement = null;
    createIcon();
    addEventListeners();

    // Send changes to background js as text 
    function handleInput(eventTarget){
        const text = eventTarget.value || eventTarget.text;
        if (text) {
            chrome.runtime.sendMessage({ type: 'makePost', text: text}, (response) => {
                if (response.data && response.data.length > 0) {
                    console.log(response.data);
                    alert(response.data[0]);
                }
            });
        }
    }

    // add event listeners for all text inputs 
    function addEventListeners() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="search"], [contenteditable="true"], textarea');
        console.log('Found inputs:', inputs.length);

        inputs.forEach(input => {
            input.addEventListener('focus', displayIcon);
            input.addEventListener('blur', hideIcon);
        });
    }

    function displayIcon(event) {
        console.log('display Icon');
        const rect = event.target.getBoundingClientRect();
        iconElement.relatedElement = event.target;
        iconElement.style.top = `${rect.top - 24 }px`;
        iconElement.style.left = `${rect.left}px`;
        iconElement.style.display = 'block'; 
    }

    function hideIcon(){
        if (iconElement) {
            iconElement.style.display = 'none';
        }
    }

    function createIcon() {
        if (!iconElement){
            iconElement = document.createElement('div');
            // const iconUrl = chrome.runtime.getURL('logo.png');
            // iconElement.style.backgroundImage=`url(${iconUrl})`;
            // iconElement.style.backgroundRepeat = 'no-repeat'; // Ensures the icon doesn't repeat
            // iconElement.style.backgroundPosition = 'center'; // Ensures the icon is centered
            iconElement.style.background = '#306582'; // Set to your desired icon color
            iconElement.style.width = '20px'; // Set to your desired icon size
            iconElement.style.height = '20px'; // Set to your desired icon size
            iconElement.style.display = 'none';
            iconElement.style.borderRadius = '20%'; // Makes the icon circular

            iconElement.style.position = 'absolute';
            iconElement.style.zIndex = '999999';
            iconElement.style.cursor = 'pointer'; // Makes the icon clickable, if needed

            iconElement.addEventListener('mouseover', () => {
                if (iconElement.relatedElement) {
                    handleInput(iconElement.relatedElement);
                }
            });
            
            document.body.appendChild(iconElement);
            console.log('Icon created: ', iconElement);
        }   
    }


    // observing changes to the DOM 
    const observer = new MutationObserver(addEventListeners);
    observer.observe(document.body, { 
        childList: true, 
        subtree: true
    });
});