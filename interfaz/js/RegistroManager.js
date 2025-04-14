class RegistroManager extends ApiBase {
  constructor() {
    super();
    this.empresas = [];
    this.usuarios = [];

    // Asociar el evento al formulario
    const registroForm = document.getElementById('registroForm');
    registroForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Obtener valores del formulario
      const empresaNombre = document.getElementById('empresaNombre').value;
      const empresaRuc = document.getElementById('empresaRuc').value;
      const empresaTelefono = document.getElementById('empresaTelefono').value;
      const empresaDireccion = document.getElementById('empresaDireccion').value;

      const usuarioNombre = document.getElementById('usuarioNombre').value;
      const usuarioEmail = document.getElementById('usuarioEmail').value;
      const usuarioContrasena = document.getElementById('usuarioContrasena').value;

      // Generar un id único para la empresa (por ejemplo, usando Date.now())
      const idEmpresa = 0;
      const nuevaEmpresa = new Empresa(idEmpresa, empresaRuc, empresaNombre, empresaTelefono, empresaDireccion);
      // Crear un usuario asociado a la empresa mediante empresaId
      const nuevoUsuario = new Usuario(usuarioNombre, usuarioEmail, usuarioContrasena, idEmpresa);

      const exito = await this.registrar(nuevaEmpresa, nuevoUsuario);

      if (exito) {
        window.location.href = 'login.html';
      }
    });
  }


  async registrar(empresa, usuario) {
    // Crear el modelo con los datos combinados
    const nuevoRegistro = new RegistroNuevo(
      usuario.nombre,
      usuario.email,
      usuario.contrasena,
      empresa
    );
    try {
      // Llamada al backend para crear la cuenta
      const response = await this.crear('empresas', nuevoRegistro);
      if (!response.success) {
        // Si la respuesta no es exitosa, mostramos los errores (validación o base de datos)
        this.mostrarErrores(response.errores || [response.message]);
        return false;
      } else {
        this.ocultarErrores(); // Ocultamos los errores si la creación es exitosa
        return true
      }
    } catch (err) {
      console.error('Error al crear en el backend:', err);
      this.mostrarErrores([err.message]);
      return false;
    }
  }
}

// Instancia del gestor de registros
const registroManager = new RegistroManager();