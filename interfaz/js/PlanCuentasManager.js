class PlanCuentasManager extends ApiBase {
  constructor() {
    super();
    //this.key = "planCuentas";
    this.planCuentas = [];
    this.init();
  }

  async init() {
    document.addEventListener("DOMContentLoaded", async () => {
      // Configuración de paginación
      this.itemsPerPage = 5;
      this.currentPage = 1;

      // Variable para guardar el índice de la cuenta que se está editando
      this.editingIndex = null;

      // Referencias a elementos del DOM
      this.prevBtn = document.getElementById("prevBtn");
      this.nextBtn = document.getElementById("nextBtn");

      // Formulario y botones
      this.cuentaForm = document.getElementById("cuentaForm");
      this.codeInput = document.getElementById("codeInput");
      this.descriptionInput = document.getElementById("descriptionInput");
      this.categoriaInput = document.getElementById('categoriaSelect');
      this.addBtn = document.getElementById("addBtn");
      this.updateBtn = document.getElementById("updateBtn");
      this.cancelBtn = document.getElementById("cancelBtn");

      // Si no hay datos en localStorage, se cargan desde la API
      if (this.planCuentas.length === 0) {
        await this.obtenerCuenta();
      }

      this.renderTable();
      this.addEventListeners();
    });
  }

  // Función para renderizar la tabla con paginación
  renderTable() {
    const cuentasTableBody = document.querySelector("#cuentasTable tbody");
    const data = this.getPaginatedData();
    cuentasTableBody.innerHTML = "";

    data.forEach((cuenta, indexInPage) => {
      // El índice real en el array principal es:
      const realIndex = (this.currentPage - 1) * this.itemsPerPage + indexInPage;

      const tr = document.createElement("tr");

      const tdCode = document.createElement("td");
      tdCode.textContent = cuenta.codigo;
      tr.appendChild(tdCode);

      const tdDescription = document.createElement("td");
      tdDescription.textContent = cuenta.nombre;
      tr.appendChild(tdDescription);

      const tdActions = document.createElement("td");

      // Botón Editar
      const editButton = document.createElement("button");
      editButton.classList.add("btn-info");
      editButton.innerHTML = `
      <img src="img/svg/edit.svg" alt="Editar" class="icon-btn" />
    `;
      editButton.addEventListener("click", () => {
        this.startEdit(realIndex);
      });
      tdActions.appendChild(editButton);

      // Botón Eliminar
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("btn-danger");
      deleteButton.innerHTML = `
      <img src="img/svg/delete.svg" alt="Eliminar" class="icon-btn" />
    `;
      deleteButton.addEventListener("click", async () => {
        await this.eliminarCuenta(realIndex);
        this.renderTable();
        this.updatePaginationInfo();
      });
      tdActions.appendChild(deleteButton);

      tr.appendChild(tdActions);
      cuentasTableBody.appendChild(tr);
    });

    this.updatePaginationInfo();
  };


  // Iniciar edición de una cuenta
  startEdit(index) {
    this.editingIndex = index;
    const cuenta = this.planCuentas[index];
    this.codeInput.value = cuenta.codigo;
    this.codeInput.readOnly = true;
    this.descriptionInput.value = cuenta.nombre;
    this.categoriaInput.value = cuenta.categoria;

    // Cambiamos botones
    this.addBtn.classList.add("hidden");
    this.updateBtn.classList.remove("hidden");
    this.cancelBtn.classList.remove("hidden");
  };

  // Cancelar edición
  cancelEdit() {
    this.editingIndex = null;
    this.cuentaForm.reset();
    this.addBtn.classList.remove("hidden");
    this.updateBtn.classList.add("hidden");
    this.cancelBtn.classList.add("hidden");
    this.codeInput.readOnly = false;
  };

  // Función para actualizar el indicador de página
  updatePaginationInfo() {
    // Referencias a elementos del DOM
    const pageIndicator = document.getElementById("pageIndicator");

    const totalPages = this.getTotalPages();
    pageIndicator.textContent = `Página ${this.currentPage} de ${totalPages}`;
    this.prevBtn.disabled = this.currentPage === 1;
    this.nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
  };

  addEventListeners() {
    // Listeners para paginación
    this.prevBtn.addEventListener("click", () => {
      this.prevPage();
      this.renderTable();
    });
    this.nextBtn.addEventListener("click", () => {
      this.nextPage();
      this.renderTable();
    });

    // Cuando el formulario se envíe (botón "Crear")
    this.cuentaForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const codigo = this.codeInput.value.trim();
      const nombre = this.descriptionInput.value.trim();
      const categoria = this.categoriaInput.value;

      if (!codigo || !nombre) return;

      // Crear nueva cuenta
      await this.crearCuenta(codigo, nombre, categoria);
      //this.cuentaForm.reset();
      //this.renderTable();
    });

    // Botón "Actualizar" en modo edición
    this.updateBtn.addEventListener("click", async () => {
      if (this.editingIndex !== null) {
        //const newCode = this.codeInput.value.trim();
        const newDescription = this.descriptionInput.value.trim();
        const newCategoria = this.categoriaInput.value.trim();
        //const newEstado = this.descriptionInput.value.trim();
        await this.actualizarCuenta(this.editingIndex, newDescription, newCategoria);
        this.cancelEdit();
        this.renderTable();
      }
    });

    // Botón "Cancelar"
    this.cancelBtn.addEventListener("click", () => {
      this.cancelEdit();
    });
  }

  async obtenerCuenta() {
    try {
      const response = await this.obtener('plan-cuentas');
      if (response.success) {
        console.log("Respuesta de la API:", response); // 👈 Agregado
        this.planCuentas = response.data?.map(item => new PlanCuenta(item.idPlanCuentas, item.codigo, item.nombre, item.categoria, item.estado));
        //console.log("MAPPING:", this.planCuentas); // 👈 Agregado
      }

    } catch (error) {
      console.error('Error cargando datos del backend:', error);
    }
  }

  // Crear una nueva cuenta
  async crearCuenta(codigo, nombre, categoria) {
    const nuevaCuenta = new PlanCuentaCrear(codigo, nombre, categoria);

    try {
      // Llamada al backend para crear la cuenta
      const response = await this.crear('plan-cuentas', nuevaCuenta);
      if (!response.success) {
        // Si la respuesta no es exitosa, mostramos los errores (validación o base de datos)
        this.mostrarErrores(response.errores || [response.message]);
      } else {
        // Si la cuenta se crea correctamente, limpiamos y renderizamos
        const nuevaCuentaBack = new PlanCuenta(
          response.data.idPlanCuentas,
          response.data.codigo,
          response.data.nombre,
          response.data.categoria,
          response.data.estado
        );
        this.planCuentas.push(nuevaCuentaBack);

        this.cuentaForm.reset();
        this.renderTable();
        this.ocultarErrores(); // Ocultamos los errores si la creación es exitosa
      }
    } catch (err) {
      console.error('Error al crear en el backend:', err);
      this.mostrarErrores([err.message]);
    }
  }

  // Actualizar una cuenta existente
  async actualizarCuenta(index, newDescription, newCategoria) {

    this.planCuentas[index].nombre = newDescription;
    this.planCuentas[index].categoria = newCategoria;
  
    const ActualizaCuenta = new PlanCuentaActualizar(
      newDescription,
      newCategoria,
      1
    );

    try {
      await this.actualizar(`plan-cuentas/${this.planCuentas[index].id}`, ActualizaCuenta);
    } catch (err) {
      console.error('Error al actualizar en el backend:', err);
    }
  }

  // Eliminar una cuenta
  async eliminarCuenta(index) {
    const cuenta = this.planCuentas[index];
    this.planCuentas.splice(index, 1);

    try {
      await this.eliminar(`plan-cuentas/${cuenta.code}`);
    } catch (err) {
      console.error('Error al eliminar del backend:', err);
    }
  }

  // Paginación: retorna un subconjunto de planCuentas según la página actual
  getPaginatedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.planCuentas.slice(startIndex, endIndex);
  }

  // Cantidad total de páginas
  getTotalPages() {
    return Math.ceil(this.planCuentas.length / this.itemsPerPage);
  }

  // Navegar a la página siguiente
  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  // Navegar a la página anterior
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}

// Instanciamos el manager
const manager = new PlanCuentasManager();
