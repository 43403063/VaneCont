// Clase base que define la interfaz común
class Base {
    guardarBase(key,data) {
        console.log("Guardando datos desde Clase Base");
        guardarDatos(key, data); //Metodo del LocalStorage
    } 
}
