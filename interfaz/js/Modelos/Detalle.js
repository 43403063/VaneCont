// js/Modelos/Detalle.js
class Detalle {
    constructor(item, idPlanCuentas, codigoCuenta, descripcion, importe_debe, importe_haber) {
      this.item = item;                 // Número de item
      this.idPlanCuentas = idPlanCuentas;                 // Número de item
      this.codigoCuenta = codigoCuenta; // Código de la cuenta
      this.descripcion = descripcion;   // Descripción de la cuenta
      this.importe_debe = importe_debe;   // Importe en debe
      this.importe_haber = importe_haber; // Importe en haber
    }
  }
  