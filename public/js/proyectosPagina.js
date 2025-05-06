document.addEventListener('DOMContentLoaded', () => {
  validarSesion('admin');
  configurarLogout();

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const contenedorProyectos = document.getElementById('contenedorProyectos');
  const formCrear = document.getElementById('formCrearProyecto');
  const btnCargar = document.getElementById('btnCargarProyectos');

  // Cargar proyectos desde el backend
  btnCargar.addEventListener('click', async () => {
    try {
      const respuesta = await fetch('https://taskflow-rnlr.onrender.com/proyectos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!respuesta.ok) throw new Error('Error al obtener proyectos');

      const proyectos = await respuesta.json();
      renderizarProyectos(proyectos);
    } catch (error) {
      console.error('❌', error.message);
      alert('No se pudieron cargar los proyectos.');
    }
  });

  // Crear nuevo proyecto
  formCrear.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();

    if (!nombre) {
      alert('El nombre del proyecto es obligatorio');
      return;
    }

    try {
      const respuesta = await fetch('https://taskflow-rnlr.onrender.com/proyectos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          usuario_id: usuario.id
        })
      });

      if (!respuesta.ok) throw new Error('Error al crear proyecto');

      const nuevoProyecto = await respuesta.json();
      alert('✅ Proyecto creado exitosamente');
      formCrear.reset();
      // Opcional: recargar lista automáticamente
      btnCargar.click();
    } catch (error) {
      console.error('❌', error.message);
      alert('Hubo un problema al crear el proyecto.');
    }
  });

  function renderizarProyectos(lista) {
    contenedorProyectos.innerHTML = '';
    if (lista.length === 0) {
      contenedorProyectos.innerHTML = '<p>No hay proyectos aún.</p>';
      return;
    }

    lista.forEach(p => {
      const div = document.createElement('div');
      div.style.border = '1px solid #ccc';
      div.style.padding = '10px';
      div.style.margin = '10px 0';

      div.innerHTML = `
        <h3>${p.Proyecto_Nombre}</h3>
        <p>${p.Proyecto_Descripcion || 'Sin descripción'}</p>
        <small>Creado por Usuario ID: ${p.Usuario_ID}</small>
      `;

      contenedorProyectos.appendChild(div);
    });
  }
});
