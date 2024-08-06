import React, {useState, useEffect} from 'react';
import { Button, Popconfirm } from 'antd';
import { createRoot } from 'react-dom/client';



const App = () => {
    const [suggestion, setSuggestion] = useState('');
    const [open, setOpen] = useState(false); 
    const [confirmLoading, setConfirmLoading] = useState(false);

    const iconElement = document.getElementById('icon');

    useEffect(() => {
        addEventListeners();
    }, []);

    const handleOk = (e) => {
        e.preventDefault();
        setConfirmLoading(true);
        setTimeout(() => {
            setOpen(false);
            setConfirmLoading(false);
        }, 1000);
        iconElement.relatedElement.value = suggestion; 
        // icon을 여기서 숨기거나, 태그를 삭제한다.
        iconElement.style.display = 'none';
    }
    const handleCancel = (e) => {
        e.preventDefault();
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
            input.addEventListener('blur', hideIcon);
        });
    }

    function hideIcon() {
        const iconElement = document.getElementById('icon');
        iconElement.style.display = 'none';
        setTimeout(() => {
            setOpen(false);
        }, 250)
    }

    function displayIcon(event) {
        console.log('display Icon');
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

        iconElement.style.top = `${ topPosition }px`;
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
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1677ff',
                position: 'absolute',
                zIndex: 999999,
                cursor: 'pointer'
            }}
            onClick={() => handleInput()}
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