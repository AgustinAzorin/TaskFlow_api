document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const contrasena = document.getElementById('loginPassword').value;
  
    fetch('https://taskflow-rnlr.onrender.com/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contrasena })
    })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        const rol = data.usuario.rol;
        if (rol === 'admin') {
          window.location.href = 'html/adminPagina.html';
        } else {
          window.location.href = 'html/usuarioPagina.html';
        }
      } else {
        alert(data.mensaje || 'Error en el login');
      }
    })
    .catch(err => {
      console.error('Error al iniciar sesión:', err);
      alert('Error en el login');
    });
  });