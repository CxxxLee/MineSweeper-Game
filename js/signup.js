document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const password = document.getElementById('password');
  const confirm  = document.getElementById('confirmPassword');

  if (!form || !password || !confirm) return;

  // live validation while typing
  const validate = () => {
    if (confirm.value.trim() !== password.value.trim()) {
      confirm.setCustomValidity('Passwords do not match');
    } else {
      confirm.setCustomValidity('');
    }
  };

  password.addEventListener('input', validate);
  confirm.addEventListener('input', validate);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // run the check right before submit
    validate();

    // enforce all native constraints (required, minlength, our custom message, etc.)
    if (!form.reportValidity()) return;

    // Only reaches here if everything is valid & passwords match
    const formData = new FormData(form);

    try {
      const res = await fetch('php/signup.php', { method: 'POST', body: formData });
      const data = await res.json();
      alert(data.message);
      if (data.success) window.location.href = 'index.html';
    } catch (err) {
      console.error('Error:', err);
    }
  });
});
