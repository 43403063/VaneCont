class ApiBase {
    constructor(baseURL) {
        this.baseURL = baseURL || 'http://localhost:3000/api';
    }

    // Método para obtener los encabezados con token si existe
    getHeaders() {
        const token = localStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }


    // Método genérico para hacer requests
    async request(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            //headers: this.getHeaders()
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT'|| method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseURL}/${endpoint}`, options);

            // Si no hay contenido (por ejemplo en DELETE), no intentes parsear JSON
            if (response.status === 204) return null;

            if (!response.ok) {
                //throw new Error(`Error ${method} en ${endpoint}: ${response.statusText}`);
                const errorData = await response.json(); // Intenta obtener el cuerpo de error
                // Manejo de errores más controlado, sin lanzar el error
                return {
                    success: false,
                    status: response.status,
                    message : errorData.message,
                    errores: errorData.errores 
                    || (errorData.error ? [errorData.error] : null) 
                    || (errorData.message ? [errorData.message] : ["Ocurrió un error desconocido."]),
                    data: null
                };
            }

            const responseData = await response.json();
            return { success: true, data: responseData };

        } catch (error) {
            console.error(`Error en la solicitud ${method} a ${endpoint}:`, error);
            return {
                success: false,
                status: 500,
                message: 'Hubo un problema al realizar la solicitud.',
                errores: error
            };
        }
    }

    async obtener(endpoint) {
        return await this.request(endpoint, 'GET');
    }

    async crear(endpoint, data) {
        return await this.request(endpoint, 'POST', data);
    }

    async actualizar(endpoint, data) {
        return await this.request(endpoint, 'PATCH', data);
    }
    async actualizar_put(endpoint, data) {
        return await this.request(endpoint, 'PUT', data);
    }

    async eliminar(endpoint) {
        return await this.request(endpoint, 'DELETE');
    }

    // Función para mostrar los errores en el frontend
    mostrarErrores(errores) {
        const errorContainer = document.getElementById("errorContainer");
        const errorList = document.getElementById("errorList");

        // Limpiar los errores previos
        errorList.innerHTML = '';

        // Mostrar cada error
        errores.forEach((error) => {
            const li = document.createElement("li");
            li.textContent = error;
            errorList.appendChild(li);
        });

        // Hacer visible el contenedor de errores
        errorContainer.style.display = 'block';
    }

    ocultarErrores() {
        const errorContainer = document.getElementById("errorContainer");
        errorContainer.style.display = 'none';
    }
}
