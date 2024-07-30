import React, {useState, useEffect} from 'react';
import { Button, Popconfirm } from 'antd';
import { createRoot } from 'react-dom/client';



const App = () => {
    const [suggestion, setSuggestion] = useState('');
    const [open, setOpen] = useState(true); 
    const [confirmLoading, setConfirmLoading] = useState(false);
    
    useEffect(() => {
        addEventListeners();
    }, []);

    const handleOk = () => {
        setConfirmLoading(true);
        setTimeout(() => {
            setOpen(false);
            setConfirmLoading(false);
        }, 2000);
    }
    const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
    };

    function handleInput(eventTarget) {
        setOpen(true);
        const text = eventTarget.value || eventTarget.text;
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

    // add event listeners for all text inputs 
    function addEventListeners() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="search"], [contenteditable="true"], textarea');
        console.log('Found inputs:', inputs.length);

        inputs.forEach(input => {
            input.addEventListener('focus', displayIcon);
        });
    }

    function displayIcon(event) {
        console.log('display Icon');
        const rect = event.target.getBoundingClientRect();
        const iconElement = document.getElementById('icon');
        iconElement.relatedElement = event.target;
        iconElement.style.top = `${rect.top - 24 }px`;
        iconElement.style.left = `${rect.left}px`;
        iconElement.style.display = 'block'; 
    }

    return (
        <KorammarPopconfirm 
            suggestion={suggestion}
            open={open}
            confirmLoading={confirmLoading}
            handleOk={handleOk}
            handleCancel={handleCancel}
            handleInput={() => handleInput(document.getElementById('icon').relatedElement)}
        >
        </KorammarPopconfirm>
    );
}

const KorammarPopconfirm = ({suggestion, open, confirmLoading, handleOk, handleCancel, handleInput}) => (
    <Popconfirm
        title="Suggestion"
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
                width: '20px',
                height: '20px',
                borderRadius: '20%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#306582',
                position: 'absolute',
                zIndex: 999999,
                cursor: 'pointer'
            }}
            onClick={() => handleInput()}
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