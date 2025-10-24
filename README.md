TaskFlow API
## ¿Que es?

**TaskFlow** es una API RESTful diseñada para que empresas gestionen proyectos, tareas y usuarios de manera eficiente y colaborativa. Permite asignar tareas, organizar equipos y mantener un historial de actividades, todo en una sola plataforma.

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: PostgreSQL (desplegada en Supabase)
- **Despliegue**: Render
- **Autenticación**: JSON Web Tokens (JWT)
- **Notificaciones**: Nodemailer
- **Frontend**: HTML, CSS, JavaScript

## Instalación y Ejecución

### **1. Clonar el repositorio**:

```
git clone https://github.com/AgustinAzorin/TaskFlow_api.git
cd TaskFlow_api

```

### **2. Instalar dependencias**:

```jsx
npm install
```

**3. Configurar variables de entorno**:
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```jsx
PORT=3000
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/base_de_datos
[EMAIL_USER=tu_correo@gmail.com](mailto:EMAIL_USER=tu_correo@gmail.com)
EMAIL_PASS=tu_contraseña
JWT_SECRET=una_clave_secreta
```

### **4. Inicializar la base de datos**:

Ejecutar el script `setup.SQL` en tu gestor de base de datos PostgreSQL para crear las tablas necesarias.

### **5. Iniciar el servidor**:

```jsx
npm start

```

El servidor estará disponible en `http://localhost:3000`.


## Funcionalidades Principales

- **Gestión de Usuarios**: Crear, listar y asignar roles (admin o usuario).
- **Gestión de Proyectos**: Crear proyectos y asignar múltiples integrantes.
- **Gestión de Tareas**: Crear tareas y asignarlas a usuarios dentro de proyectos.
- **Historial de Actividades**: Registro de acciones realizadas por los usuarios.
- **Notificaciones por Correo**: Envío de correos electrónicos al asignar proyectos.

## Contacto

Para consultas o sugerencias, puedes contactarme a través de azorin.agustin231106@gmail.com.
