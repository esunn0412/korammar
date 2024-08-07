import React, {useState, useEffect} from 'react';
import { Button, Popconfirm } from 'antd';
import { createRoot } from 'react-dom/client';



const App = () => {
    const [original, setOriginal] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [open, setOpen] = useState(false); 
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [iconVisible, setIconVisible] = useState(false);
    const [iconPosition, setIconPosition] = useState({ top: 0, left: 0 });
    const [onClickFunction, setOnClickFunction] = useState(() => () => {});


    const iconElement = document.getElementById('icon');

    useEffect(() => {
        addEventListeners();
        return () => removeEventListeners(); // Cleanup function
    }, []);

    // add event listeners for all text inputs 
    function addEventListeners() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="search"], [contenteditable="true"], textarea');
        console.log('Found inputs:', inputs.length);

        inputs.forEach(input => {
            input.addEventListener('focus', (event) => displayIconOnFocus(event));
            input.addEventListener('blur', hideIcon);
        });

        // add event listener for text selection 
        document.addEventListener('mouseup', highlightHandler);
    }

    function removeEventListeners() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="search"], [contenteditable="true"], textarea');
        inputs.forEach(input => {
            input.removeEventListener('focus', displayIconOnFocus);
            input.removeEventListener('blur', hideIcon);
        });
        document.removeEventListener('mouseup', highlightHandler);
    }

    function highlightHandler(e) {
         // get the highlighted text
        console.log('highlight highlight');
        let text = window.getSelection().toString().trim()
        // check if anything is actually highlighted
        if(text !== '') {
            // we've got a highlight, now do your stuff here
            handleHighlight(e);
        }
    }

    const handleHighlight = (e) => {
        console.log('handle Highlight');
        let selectedText = window.getSelection().toString().trim()
        setIconPosition({top:e.clientY, left:e.clientX});
        setIconVisible(true);
        setOriginal(selectedText);
        setOnClickFunction(() => () => handleSelectedText());
    }

    const handleSelectedText = () => {
        setOpen(true);
        if (original){
            chrome.runtime.sendMessage({ type: 'makePost', text: original }, (response) => {
                if (response.data && response.data.length > 0){
                    console.log(response.data);
                    const correction = response.data[0];
                    setSuggestion(correction);
                }
            });
        }
    }

    const handleOk = (e) => {
        e.preventDefault();
        setConfirmLoading(true);
        setTimeout(() => {
            setOpen(false);
            setConfirmLoading(false);
        }, 1000);
        console.log(onClickFunction.toString());
        // Apply the suggestion based on the current context (input or selection)
        if (onClickFunction.toString().includes('input')) {
            const iconElement = document.getElementById('icon');
            if (iconElement && iconElement.relatedElement) {
                iconElement.relatedElement.value = suggestion;
            }
        } else {
            console.log('handling selected text');
            console.log(original);
        }
        
    }
    const handleCancel = (e) => {
        e.preventDefault();
        console.log('Clicked cancel button');
        setOpen(false);
    };

    function handleInput(eventTarget) {
        setOpen(true);
        console.log('handle input function');
        let text = eventTarget.value || eventTarget.text;
        if (text) {
            chrome.runtime.sendMessage({ type: 'makePost', text: text }, (response) => {
                if (response.data && response.data.length > 0) {
                    console.log(response.data);
                    const correction = response.data[0];
                    setSuggestion(correction);
                }
            });
        }
    }

    function hideIcon() {
        console.log('hide icon function');
        setTimeout(() => {
            setIconVisible(false);
            setOpen(false);
        }, 250)
    }

    function displayIconOnFocus(event) {
        console.log('display Icon on focus');
        const rect = event.target.getBoundingClientRect();
        const iconElement = document.getElementById('icon');
        // 버튼이랑 연결된 element 지정
        iconElement.relatedElement = event.target;

        const iconHeight = 15; // The height of your icon
        const margin = 4; // A small margin to keep the icon from touching the viewport edge
        let topPosition = rect.top - iconHeight - margin;
        // const cursorX = event.clientX;
        // const cursorY = event.clientY;
        // console.log(cursorY, cursorX)
        if (topPosition < 0) {
            topPosition = rect.bottom + margin;
        }

        setIconPosition({top: topPosition, left:rect.left}) 
        setIconVisible(true);
        setOnClickFunction(() => () => handleInput(document.getElementById('icon').relatedElement));
    }

    return (
        <KorammarPopconfirm 
            suggestion={suggestion}
            open={open}
            confirmLoading={confirmLoading}
            handleOk={handleOk}
            handleCancel={handleCancel}
            handleInput={onClickFunction}
            iconVisible={iconVisible}
            iconPosition={iconPosition}
        >
        </KorammarPopconfirm>
    );
}

const KorammarPopconfirm = ({suggestion, open, confirmLoading, handleOk, handleCancel, handleInput, iconVisible, iconPosition}) => (
    <Popconfirm
        title="추천 문장:"
        description={suggestion}
        open={open}
        onConfirm={handleOk}
        okButtonProps={{
            loading: confirmLoading,
        }}
        onCancel={handleCancel}
    >
        <Button 
            id = 'icon'
            type="primary" 
            style={{
                width: '15px',
                height: '15px',
                borderRadius: '20%',
                padding: 0,
                display: iconVisible ? 'block' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1677ff',
                position: 'absolute',
                top: `${iconPosition.top}px`, 
                left: `${iconPosition.left}px`,
                zIndex: 2147483647,
                cursor: 'pointer'
            }}
            onClick={handleInput}
            onMouseDown={(e) => e.preventDefault()}
        />
    </Popconfirm>
);



document.addEventListener('DOMContentLoaded', () => {
    const style = {
        width: '300vw',
        height: '300vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };
    
    const iconContainer = document.createElement('div');
    iconContainer.id = 'korammar-chrome-app';
    iconContainer.style = style;
    document.body.appendChild(iconContainer);
    
    const root = createRoot(iconContainer);
    root.render(<App />, iconContainer);

});
