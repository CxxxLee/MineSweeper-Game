document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);

    try {
        const response = await fetch('php/signup.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        alert(data.message); // Show confirmation message

        if (data.success) {
            window.location.href = 'index.html'; // Redirect to main page
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
