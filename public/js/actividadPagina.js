document.addEventListener('DOMContentLoaded', () => {
    validarSesion('admin');
    configurarLogout();
  
    const token = localStorage.getItem('token');
    const tabla = document.getElementById('tablaHistorial');
    const btnCargar = document.getElementById('btnCargarHistorial');
  
    btnCargar.addEventListener('click', async () => {
      try {
        const res = await fetch('https://taskflow-rnlr.onrender.com/acciones', {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
  
        if (!res.ok) throw new Error('Error al obtener historial');
        const data = await res.json();
  
        tabla.innerHTML = '';
        if (data.length === 0) {
          tabla.innerHTML = '<tr><td colspan="4">No hay actividades registradas.</td></tr>';
          return;
        }
  
        data.forEach(row => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${row.Fecha}</td>
            <td>${row.Usuario_Nombre || 'Desconocido'}</td>
            <td>${row.Accion_Descripcion}</td>
            <td>${row.Entidad_afectada}</td>
          `;
          tabla.appendChild(tr);
        });
      } catch (err) {
        alert(err.message);
      }
    });
  });
  