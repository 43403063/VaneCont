// js/TransaccionesManager.js
class TransaccionesManager extends ApiBase {
  constructor() {
    super();
    this.key = "transacciones";
    const loggedInUser = obtenerDatos("loggedInUser");
    this.idEmpresa = loggedInUser.idEmpresa;

    //this.transacciones = [];
    this.init();
  }

  async init() {
    document.addEventListener("DOMContentLoaded", async () => {

      this.tableBody = document.querySelector("#transaccionesTable tbody");
      await this.renderTransacciones();
    });
  }

  // Función para renderizar los asientos
  async renderTransacciones() {
    //const tableBody = document.querySelector("#transaccionesTable tbody");
    const transacciones = await this.obtenerTransacciones();

    console.log('transacciones');
    console.log(transacciones);

    this.tableBody.innerHTML = "";

    transacciones.forEach((asiento, index) => {
      // Crear fila para la cabecera del asiento
      const tr = document.createElement("tr");

      // Crear celdas para los datos de la cabecera
      const tdId = document.createElement("td");
      tdId.textContent = asiento.id;
      tr.appendChild(tdId);


      const fecha = new Date(asiento.fecha);
      const fechaFormateada = fecha.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const tdFecha = document.createElement("td");
      tdFecha.textContent = fechaFormateada;
      tr.appendChild(tdFecha);

      const tdGlosa = document.createElement("td");
      tdGlosa.textContent = asiento.glosa;
      tr.appendChild(tdGlosa);

      const totalDebe = asiento.importe;
      const tdDebe = document.createElement("td");
      tdDebe.textContent = totalDebe;
      tr.appendChild(tdDebe);

      const totalHaber = totalDebe;
      const tdHaber = document.createElement("td");
      tdHaber.textContent = totalHaber;
      tr.appendChild(tdHaber);

      // Celda de acciones
      const tdActions = document.createElement("td");
      tdActions.id = `acciones-${asiento.id}`; // ID dinámico basado en el asiento

      // Botón "Ver Detalle"
      const detailBtn = document.createElement("button");
      //detailBtn.textContent = "Ver Detalle";
      detailBtn.classList.add("btn-success");

      detailBtn.innerHTML = `
      <img src="img/svg/view.svg" alt="Ver" class="icon-btn" />
    `;

      detailBtn.addEventListener("click", async () => {
        await this.mostrarDetallesModalBD(asiento.id);
        // Función para mostrar/ocultar el detalle del asiento
        //this.toggleDetalles(index);
      });
      tdActions.appendChild(detailBtn);

      // Botón "Editar" como enlace con un ícono de lápiz (para editar)
      const editLink = document.createElement("a");
      //editLink.textContent = "Editar";
      editLink.classList.add("a-btn-info");
      // Asigna el href con el número de asiento (índice) en el query string
      editLink.href = `CrudTransacciones.html?edit=${asiento.id}`;
      editLink.innerHTML = `
      <img src="img/svg/edit.svg" alt="Editar" class="icon-btn" />
    `;

      tdActions.appendChild(editLink);

      tr.appendChild(tdActions);

      this.tableBody.appendChild(tr);
    });
  }

  async mostrarDetallesModalBD(id) {

    const response = await this.obtener(`transacciones/${id}`);
    let asiento = [];
    if (response.success) {
      asiento = response.data;

    } else {
      console.error("Error al obtener transacciones:", response.message || "Respuesta sin éxito");
      return;
    }


    const modal = document.getElementById("detalleModal");
    const detalleContenido = document.getElementById("detalleContenido");

    // Construir la tabla de detalles
    let detailsHtml = `<table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Item</th>
          <th>Cuenta Contable</th>
          <th>Descripción</th>
          <th>Importe Debe S/</th>
          <th>Importe Haber S/</th>
        </tr>
      </thead>
      <tbody>`;

    asiento.detalles.forEach(detalle => {
      detailsHtml += `<tr>
        <td>${detalle.item}</td>
        <td>${detalle.codigo}</td>
        <td>${detalle.nombre}</td>
        <td>${parseFloat(detalle.importe_debe).toFixed(2)}</td>
        <td>${parseFloat(detalle.importe_haber).toFixed(2)}</td>
      </tr>`;
    });

    detailsHtml += `</tbody></table>`;

    // Insertar en el modal
    detalleContenido.innerHTML = detailsHtml;

    // Mostrar el modal
    modal.style.display = "block";

    // Cerrar modal al hacer clic en (x)
    document.querySelector(".close").onclick = function () {
      modal.style.display = "none";
    };

    // Cerrar modal al hacer clic fuera de él
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  }

  async obtenerTransacciones() {
    try {

      const response = await this.obtener(`transacciones/all/${this.idEmpresa}`);
      if (response.success) {
        const transacciones = response.data?.map(item => new Asiento(item.idEmpresa, item.idTransaccion, item.fecha, item.glosa, item.importe, null));
        return transacciones;
      } else {
        console.error("Error al obtener transacciones:", response.message || "Respuesta sin éxito");
        return [];
      }

    } catch (error) {
      console.error('Error cargando datos del backend:', error);
      return []; // <-- Asegura que siempre devuelva un array
    }
  }


  eliminarTransaccion(index) {
    this.transacciones.splice(index, 1);
    this.guardarDatos();
  };
}
// Instanciamos el manager
new TransaccionesManager();