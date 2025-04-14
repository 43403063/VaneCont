class Usuario {
  constructor(nombre, email, contrasena, empresaId) {
    this.nombre = nombre;
    this.email = email;
    this.contrasena = contrasena;
    this.empresaId = empresaId;
  }
}

class RegistroNuevo {
  constructor(nombre, email, contrasena, empresa) {
    this.nombre = nombre;
    this.email = email;
    this.contrasena = contrasena;
    this.empresa = {
      nombre: empresa.nombre,
      ruc: empresa.ruc,
      telefono: empresa.telefono,
      direccion: empresa.direccion
    };
  }
}

class Login {
  constructor(email, password) {
    this.email = email;
    this.password = password;   
  }
}