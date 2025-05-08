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
      Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        tableHeaders.appendChild(th);
      });

      data.forEach(usuario => {
        const tr = document.createElement('tr');
        Object.values(usuario).forEach(value => {
          const td = document.createElement('td');
          td.textContent = value;
          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });
    } else {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 100;
      td.textContent = 'No hay usuarios disponibles.';
      tr.appendChild(td);
      tableBody.appendChild(tr);
    }
  })
  .catch(error => console.error('Error al obtener usuarios:', error));
}

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
