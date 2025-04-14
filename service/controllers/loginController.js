// controllers/clientesController.js
const pool = require('../conexion/db');
const bcrypt = require('bcryptjs');

// GET login de usuario con validación
exports.loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Se requieren email y password como parámetros",
        });
    }

    let errors = [];
    const regexUsuario = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!regexUsuario.test(email)) errors.push("El usuario no tiene un formato válido");
    //if (!regexPassword.test(password)) errors.push("La contraseña debe ser segura (mínimo 8 caracteres, mayúscula, minúscula, número y símbolo)");

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errores: errors });
    }

    try {
        const [usuarios] = await pool.query(
            `SELECT u.idUsuarios, u.idEmpresa, u.nombre, u.email, u.password, r.descripcion AS rol
             FROM usuarios u
             INNER JOIN roles r ON u.idRol = r.idRol
             WHERE u.email = ?`,
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        const usuario = usuarios[0];
        const match = await bcrypt.compare(password, usuario.password);

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Contraseña incorrecta",
            });
        }

        res.json({
            success: true,
            usuario: {
                id: usuario.idUsuarios,
                idEmpresa: usuario.idEmpresa,
                nombre: usuario.nombre,
                nomUsuario: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error en el login", error: error.message });
    }
};
