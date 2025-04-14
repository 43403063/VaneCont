// js/CrudTransaccionesManager.js
class CrudTransaccionesManager extends ApiBase {
    constructor() {
        super();
        //this.key = "transacciones"; // Clave en localStorage
        //this.transacciones = obtenerDatos(this.key) || [];
        //this.planCuentas = obtenerDatos("planCuentas") || [];

        const loggedInUser = obtenerDatos("loggedInUser");
        this.idEmpresa = loggedInUser.idEmpresa;

        this.init();
    }

    init() {
        document.addEventListener("DOMContentLoaded", async () => {

            // Referencias al formulario y sus elementos
            this.asientoForm = document.getElementById("asientoForm");
            this.asientoIdInput = document.getElementById("asientoId");
            this.asientoFechaInput = document.getElementById("asientoFecha");
            this.asientoGlosaInput = document.getElementById("asientoGlosa");
            this.detallesTableBody = document.querySelector("#detallesTable tbody");
            this.addDetailBtn = document.getElementById("addDetailBtn");
            this.cancelEditBtn = document.getElementById("cancelEditBtn");
            this.asientosListTableBody = document.querySelector("#asientosListTable tbody");

            // Variable para almacenar el índice del asiento en edición (-1 si es nuevo)
            this.editingIndex = -1;

            await this.isEdit();
            this.addEventListeners();

            // Si no se está editando, contaremos el N° Asiento ( + 1)
            if (this.editingIndex === -1) {
                this.asientoIdInput.value = 0;
                // Asignar la fecha actual en formato YYYY-MM-DD  2025-03-02T17:57:51.265Z  
                const today = new Date().toISOString().split("T")[0];
                this.asientoFechaInput.value = today;
            }
        });
    }

    async isEdit() {
        // Verificar si existe el parámetro 'edit' en la URL para cargar en modo edición
        const params = new URLSearchParams(window.location.search);
        const editParam = params.get('edit');
        if (editParam !== null) {

            const editId = parseInt(editParam, 10);

            const asiento = await this.obtenerTransacciones(editId);
            // Buscar el índice del asiento cuyo id coincida con editId
            //const foundIndex = transacciones.findIndex(asiento => parseInt(asiento.id, 10) === editId);            
            if (asiento != null) {
                // Rellenar el formulario con los datos del asiento a editar
                this.editingIndex = asiento.idTransaccion;
                this.asientoIdInput.value = asiento.idTransaccion;
                const fechaIso = new Date(asiento.fecha);
                const fechaFormateada = fechaIso.toISOString().split('T')[0];
                this.asientoFechaInput.value = fechaFormateada;
                this.asientoGlosaInput.value = asiento.glosa;
                this.detallesTableBody.innerHTML = "";
                asiento.detalles.forEach(detalle => {
                    this.addDetailRow(detalle);
                });
                modoTitulo.textContent = "Editar Asiento";

            } else {
                // Si el índice no es válido, se puede redirigir o notificar el error
                alert("Asiento no encontrado para edición.");
            }
        }
    }

    addEventListeners() {
        // Listener para agregar una nueva fila de detalle
        this.addDetailBtn.addEventListener("click", () => {
            this.addDetailRow();
        });

        // Manejar el envío del formulario para guardar o actualizar un asiento
        this.asientoForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const nuevoAsiento = this.getFormData();
            console.log(nuevoAsiento);
            // Validar que se haya ingresado al menos un detalle
            if (nuevoAsiento.detalle.length === 0) {
                showCustomAlert({
                    type: "error",
                    title: "Error de validación",
                    message: "Debe ingresar al menos un detalle en el asiento."
                });
                return;
            }

            // Calcular suma total de importes debe y haber
            const totalDebe = nuevoAsiento.detalle.reduce((acc, d) => acc + parseFloat(d.importe_debe), 0);
            const totalHaber = nuevoAsiento.detalle.reduce((acc, d) => acc + parseFloat(d.importe_haber), 0);

            // Para evitar errores de precisión en cálculos decimales, usamos una tolerancia
            const epsilon = 0.01;
            if (Math.abs(totalDebe - totalHaber) > epsilon) {
                showCustomAlert({
                    type: "error",
                    title: "Error de validación",
                    message: "La suma del total debe y del total haber deben ser iguales."
                });
                return;
            }


            showCustomAlert({
                type: "confirm",
                title: "Confirmar Grabación",
                message: "¿Desea grabar los registros?",
                onConfirm: async () => {
                    // Código a ejecutar si el usuario responde "Sí"     
                    let respuestabool = false;
                    if (this.editingIndex === -1) {
                        // Nuevo asiento
                        respuestabool = await this.agregarTransaccion(nuevoAsiento);
                    } else {
                        // Actualizar asiento existente
                        respuestabool = await this.actualizarTransaccion(this.editingIndex, nuevoAsiento);
                    }

                    if (respuestabool) {
                        showCustomAlert({
                            type: "success",
                            title: "Exito",
                            message: "Se guardo con Exito.",
                            onOk: () => {
                                // Al guardar, redirigir a la lista de transacciones
                                window.location.href = "Transacciones.html";
                            }
                        });
                    }


                },
                onCancel: () => {
                    return; // terminar el proceso
                }
            });
        });

        // Listener para cancelar edición
        this.cancelEditBtn.addEventListener("click", () => {
            window.location.href = "Transacciones.html";
        });

    }

    // Función para agregar una fila de detalle
    addDetailRow = (detalle = {}) => {
        const tr = document.createElement("tr");

        const tdItem = document.createElement("td");
        // Se asignará el número de item automáticamente al guardar
        tdItem.textContent = "";
        tr.appendChild(tdItem);

        // Campo oculto para el idPlanCuentas (puedes cambiar el nombre si necesitas idDetalle)
        const inputId = document.createElement("input");
        inputId.type = "hidden";
        inputId.name = "idPlanCuentas"; // puedes ajustar el name si lo necesitas
        inputId.value = detalle.idPlanCuentas || ""; // o idDetalle si corresponde

        // Campo Código de Cuenta
        const tdCodigo = document.createElement("td");
        const inputCodigo = document.createElement("input");
        inputCodigo.type = "text";
        inputCodigo.maxLength = 5;
        inputCodigo.value = detalle.codigo || "";

        tdCodigo.appendChild(inputId);
        tdCodigo.appendChild(inputCodigo);
        tr.appendChild(tdCodigo);

        // Campo Descripción (rellenado automáticamente)
        const tdDescripcion = document.createElement("td");
        const inputDescripcion = document.createElement("input");
        inputDescripcion.type = "text";
        inputDescripcion.style.backgroundColor = "#d3d3d3";
        inputDescripcion.readOnly = true;
        inputDescripcion.value = detalle.nombre || "";
        tdDescripcion.appendChild(inputDescripcion);
        tr.appendChild(tdDescripcion);

        // Al perder el foco en el campo código, buscar y rellenar la descripción
        inputCodigo.addEventListener("blur", async () => {
            const codeEntered = inputCodigo.value.trim();
            const cuenta = await this.buscarCuenta(codeEntered);
            console.log(cuenta);
            if (cuenta != null) {
                inputCodigo.value = cuenta.codigo;
                inputDescripcion.value = cuenta.nombre;
                inputId.value = cuenta.idPlanCuentas;
            } else {
                // Si no se encuentra la cuenta, se puede limpiar la descripción o dejarla editable
                inputCodigo.value = "";
                inputDescripcion.value = "";
                inputId.value = "";
                // mensaje de error
                //alert("Código de cuenta no encontrado.");

                showCustomAlert({
                    type: "error",
                    title: "Dato no Encontrado",
                    message: "Código de cuenta no encontrado."
                });
            }
        });

        const tdDebe = document.createElement("td");
        const inputDebe = document.createElement("input");
        inputDebe.style.textAlign = "right";
        inputDebe.type = "number";
        inputDebe.step = "0.01";
        inputDebe.value = detalle.importe_debe || "0";
        tdDebe.appendChild(inputDebe);
        tr.appendChild(tdDebe);

        const tdHaber = document.createElement("td");
        const inputHaber = document.createElement("input");
        inputHaber.style.textAlign = "right";
        inputHaber.type = "number";
        inputHaber.step = "0.01";
        inputHaber.value = detalle.importe_haber || "0";
        tdHaber.appendChild(inputHaber);
        tr.appendChild(tdHaber);

        const tdActions = document.createElement("td");
        tdActions.style.textAlign = "center";
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.classList.add("btn-remove");

        // Usamos innerHTML para insertar el SVG del ícono
        removeBtn.innerHTML = `
        <img src="img/svg/delete.svg" alt="Eliminar" class="icon-btn" />
      `;


        removeBtn.addEventListener("click", () => tr.remove());
        tdActions.appendChild(removeBtn);
        tr.appendChild(tdActions);

        this.detallesTableBody.appendChild(tr);
    };

    // Función para recoger los datos del formulario y construir un objeto Asiento
    getFormData = () => {
        const id = this.asientoIdInput.value.trim();
        const fecha = this.asientoFechaInput.value;
        const glosa = this.asientoGlosaInput.value.trim();

        // Recorrer las filas de detalles y construir un array de Detalle
        const detalles = [];
        const rows = this.detallesTableBody.querySelectorAll("tr");
        rows.forEach((row, index) => {
            const inputs = row.querySelectorAll("input");
            const idCuenta = inputs[0].value.trim();
            const codigoCuenta = inputs[1].value.trim();
            const descripcion = inputs[2].value.trim();
            const importeDebe = parseFloat(inputs[3].value.trim()) || 0;
            const importeHaber = parseFloat(inputs[4].value.trim()) || 0;
            if (codigoCuenta || descripcion) {  // Solo se incluye si hay datos
                const item = index + 1;
                detalles.push(new Detalle(item, idCuenta, codigoCuenta, descripcion, importeDebe, importeHaber));
            }
        });

        console.log('detalle datat captuaado');
        console.log(detalles);

        return new Asiento(this.idEmpresa, id, fecha, glosa, 0, detalles);
    };


    // Agregar un nuevo asiento
    async agregarTransaccion(asiento) {

        try {
            // Llamada al backend para crear la cuenta
            const response = await this.crear('transacciones', asiento);
            if (!response.success) {
                // Si la respuesta no es exitosa, mostramos los errores (validación o base de datos)
                this.mostrarErrores(response.errores || [response.message]);
                return false;
            } else {
                this.ocultarErrores(); // Ocultamos los errores si la creación es exitosa
                return true;
            }
        } catch (err) {
            console.error('Error al crear en el backend:', err);
            this.mostrarErrores([err.message]);
            return false;
        }

    }

    // Agregamos métodos de actualización y eliminación al TransaccionesManager
    async actualizarTransaccion(index, asiento) {
        console.log('actualizarTransaccion');
        console.log(index);
        console.log(asiento);
        try {
            // Llamada al backend para crear la cuenta
            const response = await this.actualizar_put(`transacciones/${index}`, asiento);
            if (!response.success) {
                // Si la respuesta no es exitosa, mostramos los errores (validación o base de datos)
                this.mostrarErrores(response.errores || [response.message]);
                return false;
            } else {
                this.ocultarErrores(); // Ocultamos los errores si la creación es exitosa
                return true;
            }
        } catch (err) {
            console.error('Error al crear en el backend:', err);
            this.mostrarErrores([err.message]);
            return false;
        }
    };

    async obtenerTransacciones(id) {
        //return this.transacciones;

        const response = await this.obtener(`transacciones/${id}`);
        let asiento = [];
        if (response.success) {
            asiento = response.data;
            return asiento;

        } else {
            console.error("Error al obtener transacciones:", response.message || "Respuesta sin éxito");
            return null;
        }

    }

    async buscarCuenta(codigo) {
        // Retorna la primera cuenta cuyo código coincida exactamente        
        const response = await this.obtener(`plan-cuentas/${codigo}`);
        let plan = [];
        if (response.success) {
            plan = response.data;
            return plan;

        } else {
            console.error("Error al obtener Plan de cuentas:", response.message || "Respuesta sin éxito");
            return null;
        }


    }
}
// Instanciamos el manager
new CrudTransaccionesManager();