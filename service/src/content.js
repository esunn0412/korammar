import React, {useState, useEffect, useRef} from 'react';
import { Button, Popconfirm } from 'antd';
import { createRoot } from 'react-dom/client';



const App = () => {
    const [suggestion, setSuggestion] = useState('');
    const [open, setOpen] = useState(false); 
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [iconVisible, setIconVisible] = useState(false);
    const [iconPosition, setIconPosition] = useState({ top: 0, left: 0 });
    const [onClickFunction, setOnClickFunction] = useState(() => () => {});
    const lastInteractedRef = useRef();

    useEffect(() => {
        addEventListeners();
        return () => removeEventListeners();
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
        document.addEventListener('mousedown', setInteractionRef);
    }

    const setInteractionRef = (e) => {
        lastInteractedRef.current = e.target;
    }

    function removeEventListeners() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="search"], [contenteditable="true"], textarea');
        inputs.forEach(input => {
            input.removeEventListener('focus', displayIconOnFocus);
            input.removeEventListener('blur', hideIcon);
        });
        document.removeEventListener('mousedown', setInteractionRef);
        document.removeEventListener('mouseup', highlightHandler);
    }

    // 마우스 업 시 실행되는 로직. 텍스트 드래그인지 아닌지 구별 후 displayIconOnHighlight 로직 실행. 
    function highlightHandler(e) {
         // get the highlighted text
        console.log('highlight highlight');
        let text = window.getSelection().toString().trim()
        // check if anything is actually highlighted
        if(text !== '') {
            displayIconOnHighlight(e);
        } else {
            if (!isInputElement(lastInteractedRef)){
                hideIcon();
            }
        }
    }
    
    function isInputElement(element) {
        if (!element) return false;
        const inputTags = ['INPUT', 'TEXTAREA', 'SELECT'];
        return inputTags.includes(element.tagName) || element.isContentEditable;
    }
    

    // 텍스트 드래그 시 아이콘 위치, 온클릭 함수, 지정된 텍스트 저장 로직.
    const displayIconOnHighlight = (e) => {
        console.log('handle Highlight');
        let selectedText = window.getSelection().toString().trim()
        console.log(`selected Text: ${selectedText}`);
        setIconPosition({top:e.clientY + window.scrollY, left:e.clientX + window.scrollX});
        setIconVisible(true);
        setOnClickFunction(() => () => handleSelectedText(selectedText));
    }

    // 텍스트 드래그 교정 요청해 추천 문장으로 바꿔 팝업에 게시하는 로직. 
    // 드래그 후 아이콘 클릭 시 실행 
    const handleSelectedText = (selectedText) => {
        console.log('selected text button clicked');
        setOpen(true);
        console.log(`Original ${selectedText}`);
        if (selectedText){
            requestMakePost(selectedText, 'makePostCorrect', (correction) => {
                setSuggestion(correction);
            });
            // chrome.runtime.sendMessage({ type: 'makePostCorrect', text: selectedText }, (response) => {
            //     if (response.data){
            //         console.log(response.data);
            //         const correction = response.data;
            //         setSuggestion(correction);
            //     }
            // });
        }
    }

    // 아이콘 팝업에서 OK를 누르면 실행되는 함수 
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
        }
        
    }

    // 아이콘 팝업에서 cancel 을 누르면 실행되는 함수 
    const handleCancel = (e) => {
        e.preventDefault();
        console.log('Clicked cancel button');
        setOpen(false);
    };

    // 브라우저 내 Input란에 focus 된 상태로 아이콘 누르면 실행되는 함수  
    function handleInput(eventTarget) {
        setOpen(true);
        console.log('handle input function');
        let text = eventTarget.value || eventTarget.text;
        if (text) {
            requestMakePost(text, 'makePostCorrect', (correction) => {
                setSuggestion(correction);
            });
            // chrome.runtime.sendMessage({ type: 'makePostCorrect', text: text }, (response) => {
            //     if (response.data) {
            //         console.log(response.data);
            //         const correction = response.data;
            //         setSuggestion(correction);
            //     }
            // });
        }
    }

    function requestMakePost(text, type, callback) {
        chrome.runtime.sendMessage({ type: type, text: text}, (response) => {
            if(callback){
                console.log('hihi')
                console.log(response)
                callback(response.data);
            }
        });
    }

    // 아이콘 hide 함수 
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
