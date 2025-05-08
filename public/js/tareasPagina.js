document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const esAdmin = usuario.rol === 'admin';
  
    validarSesion(); // Ya verifica token y rol
  
    configurarLogout();
  
    const btnCargar = document.getElementById('btnCargarTareas');
    const tablaBody = document.getElementById('tablaTareasBody');
    const formCrear = document.getElementById('formCrearTarea');
    const contenedorForm = document.getElementById('formularioTareasContainer');
  
    if (esAdmin) {
      contenedorForm.style.display = 'block';
      await cargarSelects(); // usuarios y proyectos
    }
  
    btnCargar.addEventListener('click', async () => {
      try {
        const res = await fetch('https://taskflow-rnlr.onrender.com/tareas', {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
  
        const tareas = await res.json();
        renderizarTareas(tareas);
      } catch (err) {
        alert('Error al cargar tareas');
        console.error(err);
      }
    });
  
    if (formCrear) {
      formCrear.addEventListener('submit', async (e) => {
        e.preventDefault();
  
        const nuevaTarea = {
          nombre: document.getElementById('nombreTarea').value,
          descripcion: document.getElementById('descripcionTarea').value,
          estado: document.getElementById('estadoTarea').value,
          prioridad: document.getElementById('prioridadTarea').value,
          responsable: document.getElementById('responsableTarea').value,
          proyecto_id: document.getElementById('proyectoTarea').value,
          fecha_limite: document.getElementById('fechaLimiteTarea').value
        };
  
        try {
          const res = await fetch('https://taskflow-rnlr.onrender.com/tareas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(nuevaTarea)
          });
  
          if (!res.ok) throw new Error('Error al crear tarea');
          alert('✅ Tarea creada con éxito');
          formCrear.reset();
          btnCargar.click(); // recarga tabla
        } catch (err) {
          alert('Error: ' + err.message);
        }
      });
    }
  
    async function cargarSelects() {
      const [usuariosRes, proyectosRes] = await Promise.all([
        fetch('https://taskflow-rnlr.onrender.com/usuarios', {
          headers: { 'Authorization': 'Bearer ' + token }
        }),
        fetch('https://taskflow-rnlr.onrender.com/proyectos', {
          headers: { 'Authorization': 'Bearer ' + token }
        })
      ]);
  
      const usuarios = await usuariosRes.json();
      const proyectos = await proyectosRes.json();
  
      const selectUsuarios = document.getElementById('responsableTarea');
      const selectProyectos = document.getElementById('proyectoTarea');
  
      usuarios.filter(u => u.Rol === 'usuario').forEach(u => {
        const option = document.createElement('option');
        option.value = u.Usuario_ID;
        option.textContent = u.Usuario_Nombre;
        selectUsuarios.appendChild(option);
      });
  
      proyectos.forEach(p => {
        const option = document.createElement('option');
        option.value = p.Proyecto_ID;
        option.textContent = p.Proyecto_Nombre;
        selectProyectos.appendChild(option);
      });
    }
  
    function renderizarTareas(lista) {
      tablaBody.innerHTML = '';
      if (lista.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="9">No hay tareas registradas</td></tr>';
        return;
      }
  
      lista.forEach(t => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${t.Tarea_Nombre}</td>
          <td>${t.Tarea_Descripcion || '-'}</td>
          <td>${t.Estado}</td>
          <td>${t.Prioridad}</td>
          <td>${t.responsable_nombre || '-'}</td>
          <td>${t.proyecto_nombre || '-'}</td>
          <td>${t.Fecha_Limite || '-'}</td>
          <td>${t.Tarea_Fecha_Creacion || '-'}</td>
          <td>${t.Fecha_Finalizacion || '-'}</td>
        `;
        tablaBody.appendChild(fila);
      });
    }
  });
  