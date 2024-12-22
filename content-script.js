let floatingBox = null;
let isCreatingBox = false;

document.addEventListener('mouseup', async function(event) {
    // If we're clicking inside the floating box, do nothing
    if (floatingBox && floatingBox.contains(event.target)) {
        return;
    }

    const selectedText = window.getSelection().toString().trim();
    
    // If there's no selected text and we click outside the box, remove it
    if (!selectedText && floatingBox && !floatingBox.contains(event.target)) {
        document.body.removeChild(floatingBox);
        floatingBox = null;
        return;
    }
    
    // If there's selected text and we're not clicking inside the box, create a new one
    if (selectedText.length > 0 && !isCreatingBox) {
        if (floatingBox) {
            document.body.removeChild(floatingBox);
        }
        isCreatingBox = true;
        createFloatingBox(event.pageX, event.pageY, selectedText);
        isCreatingBox = false;
    }
});

function createFloatingBox(x, y, selectedText) {
    floatingBox = document.createElement('div');
    floatingBox.className = 'gemini-floating-box';
    
    // Close button
    const closeButton = document.createElement('span');
    closeButton.className = 'gemini-close';
    closeButton.innerHTML = '×';
    closeButton.onclick = (e) => {
        e.stopPropagation();
        document.body.removeChild(floatingBox);
        floatingBox = null;
    };
    
    // Selected text display
    const contextDiv = document.createElement('div');
    contextDiv.className = 'gemini-context';
    contextDiv.textContent = `Selected text: ${selectedText.substring(0, 100)}${selectedText.length > 100 ? '...' : ''}`;
    
    // Input textarea
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Ask about this text...';
    
    // Prevent textarea events from bubbling up
    textarea.addEventListener('mouseup', (e) => e.stopPropagation());
    textarea.addEventListener('mousedown', (e) => e.stopPropagation());
    textarea.addEventListener('click', (e) => e.stopPropagation());
    
    // Submit button
    const button = document.createElement('button');
    button.textContent = 'Ask Gemini';
    
    // Prevent button events from bubbling up
    button.addEventListener('mouseup', (e) => e.stopPropagation());
    button.addEventListener('mousedown', (e) => e.stopPropagation());
    button.addEventListener('click', async (e) => {
        e.stopPropagation();
        await handleSubmit();
    });
    
    // Response container
    const responseDiv = document.createElement('div');
    responseDiv.className = 'gemini-response';
    responseDiv.style.display = 'none';
    
    // Add elements to floating box
    floatingBox.appendChild(closeButton);
    floatingBox.appendChild(contextDiv);
    floatingBox.appendChild(textarea);
    floatingBox.appendChild(button);
    floatingBox.appendChild(responseDiv);
    
    // Position the floating box
    floatingBox.style.left = `${x}px`;
    floatingBox.style.top = `${y + 20}px`; // Add some offset from cursor
    
    document.body.appendChild(floatingBox);
    
    // Adjust position if box goes off-screen
    const boxRect = floatingBox.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    if (boxRect.right > windowWidth) {
        floatingBox.style.left = `${windowWidth - boxRect.width - 20}px`;
    }
    if (boxRect.bottom > windowHeight) {
        floatingBox.style.top = `${y - boxRect.height - 20}px`;
    }

    async function handleSubmit() {
        const userQuery = textarea.value;
        if (!userQuery.trim()) return;
        
        responseDiv.style.display = 'block';
        responseDiv.className = 'gemini-response loading';
        responseDiv.textContent = 'Generating response...';
        
        try {
            // Get the API key from storage
            const result = await chrome.storage.sync.get(['apiKey']);
            if (!result.apiKey) {
                throw new Error('API key not found. Please set it in the extension options.');
            }

            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': result.apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Context: ${selectedText}\n\nQuestion: ${userQuery}`
                        }]
                    }]
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to generate response');
            }

            responseDiv.className = 'gemini-response';
            responseDiv.textContent = data.candidates[0].content.parts[0].text;
        } catch (error) {
            responseDiv.className = 'gemini-response';
            responseDiv.textContent = 'Error: ' + error.message;
        }
    }
}

// Prevent the floating box from closing when clicking inside it
document.addEventListener('click', function(event) {
    if (floatingBox && !floatingBox.contains(event.target) && !window.getSelection().toString().trim()) {
        document.body.removeChild(floatingBox);
        floatingBox = null;
    }
}); 