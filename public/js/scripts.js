document.addEventListener('DOMContentLoaded', () => {
  validarSesion('admin');
  configurarLogout();

  document.getElementById('btnCargarUsuarios').addEventListener('click', cargarUsuarios);
});

function cargarUsuarios() {
  const token = localStorage.getItem('token');

  fetch('https://taskflow-rnlr.onrender.com/usuarios', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(response => response.json())
    .then(data => {
      const tableHeaders = document.getElementById('tableHeaders');
      const tableBody = document.getElementById('tableBody');
      tableHeaders.innerHTML = '';
      tableBody.innerHTML = '';

      if (data.length > 0) {
        const keys = Object.keys(data[0]).filter(key => key !== 'contrasena');

        keys.forEach(key => {
          const th = document.createElement('th');
          th.textContent = key.charAt(0).toUpperCase() + key.slice(1);
          tableHeaders.appendChild(th);
        });

        data.forEach(usuario => {
          const tr = document.createElement('tr');
          keys.forEach(key => {
            const td = document.createElement('td');
            td.textContent = usuario[key];
            tr.appendChild(td);
          });
          tableBody.appendChild(tr);
        });

        // Guardamos en window para filtrar luego
        window.usuariosCargados = data;
      }
    })
    .catch(error => console.error('Error al obtener usuarios:', error));
}

document.getElementById('buscarUsuario').addEventListener('input', function () {
  const filtro = this.value.toLowerCase();
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';

  const filtrados = (window.usuariosCargados || []).filter(usuario =>
    (usuario.nombre && usuario.nombre.toLowerCase().includes(filtro)) ||
    (usuario.email && usuario.email.toLowerCase().includes(filtro))
  );

  const keys = Object.keys(filtrados[0] || {}).filter(key => key !== 'contrasena');
  filtrados.forEach(usuario => {
    const tr = document.createElement('tr');
    keys.forEach(key => {
      const td = document.createElement('td');
      td.textContent = usuario[key];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
});

document.getElementById('usuarioForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nuevoUsuario = {
    nombre: document.getElementById('nombre').value,
    email: document.getElementById('email').value,
    contrasena: document.getElementById('contrasena').value,
    rol: document.getElementById('rol').value,
    fecha: document.getElementById('fecha').value
  };

  fetch('https://taskflow-rnlr.onrender.com/usuarios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify(nuevoUsuario)
  })
  .then(res => res.json())
  .then(() => {
    alert('Usuario agregado');
    cargarUsuarios();
    document.getElementById('usuarioForm').reset();
  })
  .catch(error => alert('Error: ' + error.message));
});
