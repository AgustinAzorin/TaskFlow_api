CREATE TABLE "Usuario" (
  "Usuario_ID" int,
  "Usuario_Nombre" string,
  "Email" string,
  "Contraseña" string,
  "Rol" enum,
  "Fecha_Creacion" fecha,
  PRIMARY KEY ("Usuario_ID")
);

CREATE TABLE "Proyecto" (
  "Proyecto_ID" int,
  "Proyecto_Nombre" string,
  "Proyecto_Descripcion" string,
  "Usuario_ID" int,
  PRIMARY KEY ("Proyecto_ID"),
  CONSTRAINT "FK_Proyecto.Usuario_ID"
    FOREIGN KEY ("Usuario_ID")
      REFERENCES "Usuario"("Usuario_ID")
);

CREATE TABLE "Tarea" (
  "Tarea_ID" int,
  "Tarea_Nombre" string,
  "Tarea_Descripcion" string,
  "Estado" enum,
  "Prioridad" enum,
  "Responsable" string,
  "Proyecto_ID" int,
  "Fecha_Limite" fecha,
  "Tarea_Fecha_Creacion" fecha,
  "Fecha_Finalizacion" fecha,
  PRIMARY KEY ("Tarea_ID"),
  CONSTRAINT "FK_Tarea.Responsable"
    FOREIGN KEY ("Responsable")
      REFERENCES "Usuario"("Usuario_ID"),
  CONSTRAINT "FK_Tarea.Proyecto_ID"
    FOREIGN KEY ("Proyecto_ID")
      REFERENCES "Proyecto"("Proyecto_ID")
);

CREATE TABLE "Accion" (
  "Accion_ID" int,
  "Usuario_ID" intt,
  "Accion_Descripcion" string,
  "Fecha" fecha,
  "Entidad_afectada" string,
  PRIMARY KEY ("Accion_ID"),
  CONSTRAINT "FK_Accion.Usuario_ID"
    FOREIGN KEY ("Usuario_ID")
      REFERENCES "Usuario"("Usuario_ID")
);

CREATE TABLE "ProyectoUsuario" (
  "Usuario_ID" int,
  "Proyecto_ID" int
);

CREATE INDEX "Fk" ON  "ProyectoUsuario" ("Proyecto_ID");

