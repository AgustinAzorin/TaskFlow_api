function validarSesion(rolRequerido = null) {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');
  
    if (!usuario || !token) {
      alert('Debes iniciar sesión');
      window.location.href = 'public/index.html';
    }
  
    if (rolRequerido && usuario.rol !== rolRequerido) {
      alert('Acceso restringido');
      window.location.href = 'public/index.html';
    }
  }
  
  function configurarLogout() {
    const btnLogout = document.getElementById('logoutBtn');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = 'public/index.html';
      });
    }
  }
  