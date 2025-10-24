-- Crear los tipos ENUM necesarios
CREATE TYPE rol_enum AS ENUM ('admin', 'usuario', 'invitado');
CREATE TYPE estado_enum AS ENUM ('pendiente', 'en_progreso', 'completada');
CREATE TYPE prioridad_enum AS ENUM ('alta', 'media', 'baja');


CREATE TABLE "Usuario" (
  "Usuario_ID" SERIAL PRIMARY KEY,
  "Usuario_Nombre" VARCHAR(100),
  "Email" VARCHAR(255),
  "Contraseña" VARCHAR(255),
  "Rol" rol_enum,
  "Fecha_Creacion" DATE
);

CREATE TABLE "Proyecto" (
  "Proyecto_ID" SERIAL PRIMARY KEY,
  "Proyecto_Nombre" VARCHAR(100),
  "Proyecto_Descripcion" TEXT,
  "Usuario_ID" INT,
  FOREIGN KEY ("Usuario_ID") REFERENCES "Usuario"("Usuario_ID") ON DELETE CASCADE
);

CREATE TABLE "Tarea" (
  "Tarea_ID" SERIAL PRIMARY KEY,
  "Tarea_Nombre" VARCHAR(100),
  "Tarea_Descripcion" TEXT,
  "Estado" estado_enum,
  "Prioridad" prioridad_enum,
  "Responsable" INT,
  "Proyecto_ID" INT,
  "Fecha_Limite" DATE,
  "Tarea_Fecha_Creacion" DATE,
  "Fecha_Finalizacion" DATE,
  FOREIGN KEY ("Responsable") REFERENCES "Usuario"("Usuario_ID") ON DELETE SET NULL,
  FOREIGN KEY ("Proyecto_ID") REFERENCES "Proyecto"("Proyecto_ID") ON DELETE CASCADE
);

-- Crear tabla de acciones del usuario
CREATE TABLE "Accion" (
  "Accion_ID" SERIAL PRIMARY KEY,
  "Usuario_ID" INT,
  "Accion_Descripcion" TEXT,
  "Fecha" DATE,
  "Entidad_afectada" VARCHAR(100),
  FOREIGN KEY ("Usuario_ID") REFERENCES "Usuario"("Usuario_ID") ON DELETE SET NULL
);

-- Crear tabla de relación muchos a muchos entre usuarios y proyectos
CREATE TABLE "ProyectoUsuario" (
  "Usuario_ID" INT,
  "Proyecto_ID" INT,
  PRIMARY KEY ("Usuario_ID", "Proyecto_ID"),
  FOREIGN KEY ("Usuario_ID") REFERENCES "Usuario"("Usuario_ID") ON DELETE CASCADE,
  FOREIGN KEY ("Proyecto_ID") REFERENCES "Proyecto"("Proyecto_ID") ON DELETE CASCADE
);

-- Índice para consultas más rápidas por proyecto
CREATE INDEX "idx_proyecto_id" ON "ProyectoUsuario" ("Proyecto_ID");
