// js/Modelos/Asiento.js
class Asiento {
    constructor(idEmpresa, id, fecha, glosa, importe, detalle = []) {
      this.idEmpresa = idEmpresa;             // Número de asiento
      this.id = id;             // Número de asiento
      this.fecha = fecha;       // Fecha en formato string (por ejemplo, "2025-03-01")
      this.glosa = glosa;       // Descripción o glosa del asiento
      this.importe = importe;       // Descripción o glosa del asiento
      this.detalle = detalle; // Array de objetos de tipo Detalle
    }
  
    // Propiedades calculadas (puedes usarlas para validación o visualización)
    get sumaDebe() {
      return this.detalle.reduce((acc, d) => acc + parseFloat(d.importe_debe), 0);
    }
  
    get sumaHaber() {
      return this.detalle.reduce((acc, d) => acc + parseFloat(d.importe_haber), 0);
    }
  }
  