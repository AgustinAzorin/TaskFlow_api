document.addEventListener('DOMContentLoaded', () => {
  validarSesion();
  configurarLogout();
  cargarProyectos();
});

let modoEdicion = false;
let proyectoEditandoId = null;

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
}

function resetFormulario() {
  document.getElementById('proyectoForm').reset();
  document.getElementById('submitBtn').textContent = 'Crear Proyecto';
  modoEdicion = false;
  proyectoEditandoId = null;
}

document.getElementById('proyectoForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const descripcion = document.getElementById('descripcion').value;
  const token = localStorage.getItem('token');

  const url = modoEdicion
    ? `https://taskflow-rnlr.onrender.com/proyectos/${proyectoEditandoId}`
    : 'https://taskflow-rnlr.onrender.com/proyectos';

  const method = modoEdicion ? 'PUT' : 'POST';

  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ nombre, descripcion })
  })
  .then(res => res.json())
  .then(() => {
    alert(modoEdicion ? 'Proyecto actualizado' : 'Proyecto creado');
    cargarProyectos();
    resetFormulario();
  })
  .catch(async (error) => {
    const errData = await error.json();
    alert('Error: ' + (errData.mensaje || error.message));
  });
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
