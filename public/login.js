document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const email = document.getElementById('loginEmail').value;
    const contrasena = document.getElementById('loginPassword').value;
  
    fetch('https://taskflow-rnlr.onrender.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, contrasena })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        window.location.href = 'index.html';
      } else {
        alert('Usuario o contraseña incorrectos');
      }
    })
    .catch(err => {
      console.error('Error al iniciar sesión:', err);
      alert('Error en el login');
    });
  });
  