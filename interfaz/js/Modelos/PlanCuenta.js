class PlanCuenta {
  constructor(id, codigo, nombre, categoria, estado) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.categoria = categoria;
    this.estado = estado;
  }
}
class PlanCuentaCrear {
  constructor(codigo, nombre, categoria) {
    this.codigo = codigo;
    this.nombre = nombre;
    this.categoria = categoria;
  }
}

class PlanCuentaActualizar {
  constructor(nombre, categoria, estado) {
    this.nombre = nombre;
    this.categoria = categoria;
    this.estado = estado;
  }
}
