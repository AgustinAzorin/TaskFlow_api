document.addEventListener('DOMContentLoaded', () => {
  validarSesion();
  configurarLogout();
  cargarUsuariosEnSelect();
  cargarProyectos();
  cargarOpcionesUsuarios(); 
});


let modoEdicion = false;
let proyectoEditandoId = null;

function cargarOpcionesUsuarios() {
  const token = localStorage.getItem('token');
  fetch('https://taskflow-rnlr.onrender.com/usuarios', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(res => res.json())
  .then(usuarios => {
    const select = document.getElementById('usuarios_ids');
    select.innerHTML = '';
    usuarios.forEach(usuario => {
      const option = document.createElement('option');
      option.value = usuario.Usuario_ID;
      option.textContent = usuario.Usuario_Nombre;
      select.appendChild(option);
    });
  })
  .catch(err => console.error('Error al cargar usuarios:', err));
}


function cargarProyectos() {
  const token = localStorage.getItem('token');

  fetch('https://taskflow-rnlr.onrender.com/proyectos', {
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

      const thAcciones = document.createElement('th');
      thAcciones.textContent = 'Acciones';
      tableHeaders.appendChild(thAcciones);

      data.forEach(proyecto => {
        const tr = document.createElement('tr');
        Object.entries(proyecto).forEach(([key, value]) => {
          const td = document.createElement('td');
          td.textContent = value;
          tr.appendChild(td);
        });

        const accionesTd = document.createElement('td');

        const editarBtn = document.createElement('button');
        editarBtn.textContent = 'Editar';
        editarBtn.addEventListener('click', () => editarProyecto(proyecto));

        const eliminarBtn = document.createElement('button');
        eliminarBtn.textContent = 'Eliminar';
        eliminarBtn.addEventListener('click', () => eliminarProyecto(proyecto.Proyecto_ID));

        accionesTd.appendChild(editarBtn);
        accionesTd.appendChild(eliminarBtn);

        tr.appendChild(accionesTd);
        tableBody.appendChild(tr);
      });
    } else {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 100;
      td.textContent = 'No hay proyectos disponibles.';
      tr.appendChild(td);
      tableBody.appendChild(tr);
    }
  })
  .catch(async (error) => {
    const errData = await error.json();
    alert('Error: ' + (errData.mensaje || error.message));
  });
}

function editarProyecto(proyecto) {
  document.getElementById('nombre').value = proyecto.Proyecto_Nombre;
  document.getElementById('descripcion').value = proyecto.Proyecto_Descripcion;
  document.getElementById('submitBtn').textContent = 'Guardar Cambios';
  modoEdicion = true;
  proyectoEditandoId = proyecto.Proyecto_ID;

  // Obtener usuarios asignados al proyecto
  const token = localStorage.getItem('token');
  fetch(`https://taskflow-rnlr.onrender.com/proyectos/${proyectoEditandoId}/usuarios`, {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(res => res.json())
  .then(usuariosAsignados => {
    const select = document.getElementById('usuarios_ids');
    const idsAsignados = usuariosAsignados.map(u => u.Usuario_ID.toString());

    Array.from(select.options).forEach(opt => {
      opt.selected = idsAsignados.includes(opt.value);
    });
  })
  .catch(err => console.error('Error al obtener usuarios asignados:', err));
}


function resetFormulario() {
  document.getElementById('proyectoForm').reset();
  document.getElementById('submitBtn').textContent = 'Crear Proyecto';
  modoEdicion = false;
  proyectoEditandoId = null;
}

function cargarUsuariosEnSelect() {
  const token = localStorage.getItem('token');

  fetch('https://taskflow-rnlr.onrender.com/usuarios', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(res => res.json())
  .then(usuarios => {
    const select = document.getElementById('usuario_id');
    select.innerHTML = '<option value="">Seleccionar usuario</option>'; // limpiar

    usuarios.forEach(usuario => {
      const option = document.createElement('option');
      option.value = usuario.Usuario_ID;
      option.textContent = `${usuario.Usuario_Nombre} (${usuario.Email})`;
      select.appendChild(option);
    });
  })
  .catch(err => console.error('Error al cargar usuarios:', err));
}

document.getElementById('proyectoForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const descripcion = document.getElementById('descripcion').value;
  const usuariosSeleccionados = Array.from(document.getElementById('usuarios').selectedOptions)
    .map(option => option.value);
  
  const token = localStorage.getItem('token');

  if (modoEdicion) {
    fetch(`https://taskflow-rnlr.onrender.com/proyectos/${proyectoEditandoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ nombre, descripcion, usuariosSeleccionados })
    })
    .then(res => res.json())
    .then(() => {
      alert('Proyecto actualizado');
      cargarProyectos();
      document.getElementById('proyectoForm').reset();
      modoEdicion = false;
      proyectoEditandoId = null;
      document.getElementById('submitBtn').textContent = 'Crear Proyecto';
    })
    .catch(error => alert('Error: ' + error.message));
  } else {
    fetch('https://taskflow-rnlr.onrender.com/proyectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ nombre, descripcion, usuariosSeleccionados })
    })
    .then(res => res.json())
    .then(() => {
      alert('Proyecto creado');
      cargarProyectos();
      document.getElementById('proyectoForm').reset();
    })
    .catch(error => alert('Error: ' + error.message));
  }
});



function eliminarProyecto(id) {
  if (confirm('¿Eliminar este proyecto?')) {
    fetch(`https://taskflow-rnlr.onrender.com/proyectos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
    .then(() => {
      alert('Proyecto eliminado');
      cargarProyectos();
    })
    .catch(async (error) => {
      const errData = await error.json();
      alert('Error: ' + (errData.mensaje || error.message));
    });
  }
}
