document.addEventListener('DOMContentLoaded', async () => {
    const apiKeyForm = document.getElementById('apiKeyForm');
    const apiKeySet = document.getElementById('apiKeySet');
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('saveKey');
    const changeButton = document.getElementById('changeKey');
    const status = document.getElementById('status');

    // Check if API key exists
    const result = await chrome.storage.sync.get(['apiKey']);
    if (result.apiKey) {
        apiKeyForm.classList.add('hidden');
        apiKeySet.classList.remove('hidden');
    }

    // Save API key
    saveButton.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        // Validate API key with a test request
        try {
            const response = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': apiKey
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: "Hello"
                            }]
                        }]
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Invalid API key');
            }

            await chrome.storage.sync.set({ apiKey });
            apiKeyForm.classList.add('hidden');
            apiKeySet.classList.remove('hidden');
            showStatus('API key saved successfully!', 'success');
        } catch (error) {
            showStatus('Invalid API key. Please check and try again.', 'error');
        }
    });

    // Change API key
    changeButton.addEventListener('click', () => {
        apiKeySet.classList.add('hidden');
        apiKeyForm.classList.remove('hidden');
        apiKeyInput.value = '';
    });

    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');
        setTimeout(() => {
            status.classList.add('hidden');
        }, 3000);
    }
}); 