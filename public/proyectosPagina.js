const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) {
  window.location.href = 'login.html';
}

function editarProyecto(proyecto) {
    document.getElementById('nombre').value = proyecto.Proyecto_Nombre;
    document.getElementById('descripcion').value = proyecto.Proyecto_Descripcion;
    document.getElementById('submitBtn').textContent = 'Guardar Cambios';
    modoEdicion = true;
    proyectoEditandoId = proyecto.Proyecto_ID;
}

  
function cargarProyectos() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Debes iniciar sesión primero');
    window.location.href = 'login.html';
    return;
  }

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
      // Crear encabezados
      Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        tableHeaders.appendChild(th);
      });

      // Encabezado extra para las acciones
      const thAcciones = document.createElement('th');
      thAcciones.textContent = 'Acciones';
      tableHeaders.appendChild(thAcciones);

      // Crear filas
      data.forEach(proyecto => {
        const tr = document.createElement('tr');
        Object.entries(proyecto).forEach(([key, value]) => {
          const td = document.createElement('td');
          td.textContent = value;
          tr.appendChild(td);
        });

        // Celda de acciones
        const accionesTd = document.createElement('td');

        // Botón Editar
        const editarBtn = document.createElement('button');
        editarBtn.textContent = 'Editar';
        editarBtn.addEventListener('click', () => editarProyecto(proyecto));

        // Botón Eliminar
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
  .catch(error => console.error('Error al obtener proyectos:', error));
}

let modoEdicion = false;
let proyectoEditandoId = null;


// Crear proyecto nuevo
document.getElementById('proyectoForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
  
    if (!nombre || !descripcion) {
      alert('Completa todos los campos');
      return;
    }
  
    const token = localStorage.getItem('token');
  
    if (modoEdicion) {
      // Modo editar
      fetch(`https://taskflow-rnlr.onrender.com/proyectos/${proyectoEditandoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ nombre, descripcion })
      })
      .then(async res => {
        if (!res.ok) {
          const texto = await res.text();
          throw new Error(texto);
        }
        return res.json();
      })
      .then(data => {
        alert('Proyecto actualizado exitosamente');
        cargarProyectos();
        document.getElementById('proyectoForm').reset();
        modoEdicion = false;
        proyectoEditandoId = null;
      })
      .catch(error => {
        alert('Error al actualizar proyecto: ' + error.message);
        console.error('Error al actualizar proyecto:', error);
      });
      document.getElementById('submitBtn').textContent = 'Crear Proyecto';

    } else {
      // Modo crear
      fetch('https://taskflow-rnlr.onrender.com/proyectos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ nombre, descripcion })
      })
      .then(async res => {
        if (!res.ok) {
          const texto = await res.text();
          throw new Error(texto);
        }
        return res.json();
      })
      .then(data => {
        alert('Proyecto creado exitosamente');
        cargarProyectos();
        document.getElementById('proyectoForm').reset();
      })
      .catch(error => {
        alert('Error al crear proyecto: ' + error.message);
        console.error('Error al crear proyecto:', error);
      });
    }
});
  


// Función para eliminar proyecto
function eliminarProyecto(id) {
  if (confirm('¿Estás seguro que quieres eliminar este proyecto?')) {
    fetch(`https://taskflow-rnlr.onrender.com/proyectos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
    .then(response => {
      if (!response.ok) throw new Error('Error al eliminar proyecto');
      alert('Proyecto eliminado');
      cargarProyectos();
    })
    .catch(error => {
      console.error('Error al eliminar proyecto:', error);
      alert('Error al eliminar proyecto: ' + error.message);
    });
  }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('usuario');
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// Cargar proyectos al inicio
cargarProyectos();
