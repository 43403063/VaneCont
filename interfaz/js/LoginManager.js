class LoginManager extends ApiBase {
  constructor() {
    super();
    //Script principal de login
    const loginForm = document.getElementById('loginForm');
    // Asociar el evento al formulario
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      // Llamamos a loginUser para validar credenciales
      const user = await this.loginUser(email, password);

      if (user!= null) {
        // Si existe el usuario, lo guardamos en localStorage (o sessionStorage)
        guardarDatos('loggedInUser', user);
        // Redirigimos a la página de inicio (dashboard)
        window.location.href = 'dashboard.html';    
      }
    });
  }

  // Método para validar login
  async loginUser(email, password) {
 
    const login = new Login(email, password);
    try {
      // Llamada al backend para crear la cuenta
      const response = await this.crear('login', login);

      if (!response.success) {
        // Si la respuesta no es exitosa, mostramos los errores (validación o base de datos)
        this.mostrarErrores(response.errores);
        return null;
      } else {
        this.ocultarErrores(); // Ocultamos los errores si la creación es exitosa

        return response.data.usuario;
      }
    } catch (err) {
      console.error('Error al crear en el backend:', err);
      this.mostrarErrores([err.message]);
      return null;
    }

  }
}

// Instancia del gestor de registros
const loginManager = new LoginManager();