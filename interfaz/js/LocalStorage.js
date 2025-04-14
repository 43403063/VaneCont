function obtenerDatos(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function guardarDatos(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function eliminarDatos(key) {
    localStorage.removeItem(key);
}
