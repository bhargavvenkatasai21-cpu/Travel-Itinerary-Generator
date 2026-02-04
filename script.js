const form = document.getElementById('itineraryForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const messageDiv = document.getElementById('message');
const emailStatusDiv = document.getElementById('emailStatus');
const WEBHOOK_URL = 'https://bhargav21.app.n8n.cloud/webhook/3490fdb5-f396-47bb-bcec-b3ab7a74c6ab';

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Hide any previous messages
    messageDiv.style.display = 'none';
    
    // Validate form
    if (!form.checkValidity()) {
        showMessage('Please fill in all required fields correctly.', 'error');
        return;
    }
    
    // Get form data
    const formData = {
        startingLocation: document.getElementById('startingLocation').value.trim(),
        destination: document.getElementById('destination').value.trim(),
        days: parseInt(document.getElementById('days').value),
        budget: parseFloat(document.getElementById('budget').value),
        travelMode: document.getElementById('travelMode').value,
        travelers: parseInt(document.getElementById('travelers').value),
        language: document.getElementById('language').value,
        email: document.getElementById('email').value.trim(),
        preferences: document.getElementById('preferences').value.trim()
    };
    
    // Show loading state
    setLoadingState(true);
    hideEmailStatus();
    showMessage('Generating your personalized itinerary... This may take a moment.', 'info');
    
    let emailSent = false;
    let errorMessage = '';
    
    try {
        // First, try to send to webhook
        try {
            const webhookResponse = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (webhookResponse.ok) {
                // Try to parse JSON response, but handle non-JSON responses
                let webhookData = {};
                emailSent = true; // Default to true if webhook returns OK
                
                try {
                    const contentType = webhookResponse.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        webhookData = await webhookResponse.json();
                        // Only override if explicitly set to false
                        if (webhookData.emailSent === false) {
                            emailSent = false;
                        }
                    } else {
                        const textResponse = await webhookResponse.text();
                        console.log('Webhook response (non-JSON):', textResponse);
                        // Keep emailSent as true (default)
                    }
                } catch (parseError) {
                    console.log('Could not parse webhook response as JSON:', parseError);
                    // Keep emailSent as true (default)
                }
                
                showMessage(
                    `✅ Success! Your itinerary request has been submitted to the webhook. ${emailSent ? 'Email will be sent shortly.' : ''}`,
                    'success'
                );
            } else {
                throw new Error(`Webhook request failed with status: ${webhookResponse.status}`);
            }
        } catch (webhookError) {
            console.log('Webhook error, trying local server:', webhookError);
            
            // Fallback to local server if webhook fails
            try {
                const response = await fetch('http://localhost:3000/api/generate-itinerary', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    emailSent = true;
                    showMessage(
                        `✅ Success! Your itinerary has been generated and sent to ${formData.email}. Please check your inbox (and spam folder).`,
                        'success'
                    );
                } else {
                    errorMessage = data.error || 'Failed to generate itinerary. Please try again.';
                    showMessage(errorMessage, 'error');
                }
            } catch (localError) {
                console.error('Local server error:', localError);
                errorMessage = 'Unable to connect to the server. Please make sure the backend server is running or check your internet connection.';
                showMessage(errorMessage, 'error');
            }
        }
        
        // Show email status
        if (emailSent) {
            showEmailStatus(true, `Email sent successfully to ${formData.email}`);
        } else if (errorMessage) {
            showEmailStatus(false, 'Email could not be sent. ' + errorMessage);
        } else {
            showEmailStatus(false, 'Email status unknown. Please check your inbox.');
        }
        
        if (emailSent || !errorMessage) {
            form.reset();
        }
        
    } catch (error) {
        console.error('Unexpected error:', error);
        showMessage(
            'An unexpected error occurred. Please try again later.',
            'error'
        );
        showEmailStatus(false, 'Email could not be sent due to an unexpected error.');
    } finally {
        setLoadingState(false);
    }
});

function setLoadingState(loading) {
    if (loading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto-hide success messages after 10 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 10000);
    }
}

// Real-time email validation
document.getElementById('email').addEventListener('blur', function() {
    const email = this.value.trim();
    if (email && !isValidEmail(email)) {
        this.setCustomValidity('Please enter a valid email address');
    } else {
        this.setCustomValidity('');
    }
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showEmailStatus(sent, message) {
    emailStatusDiv.style.display = 'flex';
    emailStatusDiv.className = `email-status ${sent ? 'sent' : 'not-sent'}`;
    
    const statusIcon = emailStatusDiv.querySelector('.status-icon');
    const statusText = emailStatusDiv.querySelector('.status-text');
    
    statusIcon.textContent = sent ? '✅' : '❌';
    statusText.textContent = message;
}

function hideEmailStatus() {
    emailStatusDiv.style.display = 'none';
}
