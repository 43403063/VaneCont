// controllers/empresaController.js
const pool = require('../conexion/db');
const bcrypt = require('bcryptjs');

// Validaciones
const validar = (empresa, crear = true) => {
  const errores = [];

  if (crear) {
    // RUC debe tener exactamente 11 dígitos y comenzar con 10 o 20
    if (!/^(10|20)[0-9]{9}$/.test(empresa.ruc)) {
      errores.push("El RUC debe tener 11 dígitos y comenzar con 10 o 20.");
    }
  }

  // Nombre: letras y espacios, entre 3 y 100 caracteres
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,100}$/.test(empresa.nombre)) {
    errores.push("El nombre de la emppresa debe tener entre 3 y 100 caracteres, solo letras y espacios.");
  }

  // Teléfono: permite números, guiones y espacios (ej: 987654321 o 01-2345678)
  if (!/^[0-9\- ]{6,15}$/.test(empresa.telefono)) {
    errores.push("Teléfono inválido. Solo números, guiones y espacios, entre 6 y 15 caracteres.");
  }

  // Dirección: máximo 255 caracteres
  if (typeof empresa.direccion !== 'string' || empresa.direccion.length > 255) {
    errores.push("La dirección no debe superar los 255 caracteres.");
  }


  return errores;
};

const validarUsuario = (usuario) => {
  const errores = [];


  // Nombre: letras y espacios, hasta 100 caracteres
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,100}$/.test(usuario.nombre)) {
    errores.push("El nombre debe tener entre 3 y 100 caracteres, solo letras y espacios.");
  }

  // Email: formato básico de correo electrónico
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email)) {
    errores.push("Correo electrónico inválido.");
  }

  // Contraseña: mínimo 6 caracteres (puedes ajustar según tu política de seguridad)
  //if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(usuario.password)) {
  //  errores.push("La contraseña debe tener al menos 6 caracteres.");
  //}


  return errores;
};

// POST: Registrar un pedido
exports.registrarEmpresa = async (req, res) => {
  const usuario = req.body; // El cliente y los productos vienen en el body de la solicitud
  const { empresa } = req.body;

  const errores = validar(empresa, true);
  if (errores.length > 0) {
    return res.status(400).json({ success: false, errores });
  }
  const erroresUsu = validarUsuario(usuario, true);
  if (erroresUsu.length > 0) {
    return res.status(400).json({ success: false, erroresUsu });
  }


  // Inicia la transacción
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {

    // Registrar el pedido en la tabla Pedido
    const [resultEmpresa] = await connection.query(
      'INSERT INTO empresas (nombre, ruc, telefono, direccion) VALUES (?, ?, ?, ?)',
      [empresa.nombre, empresa.ruc, empresa.telefono, empresa.direccion]
    );

    const idEmpresa = resultEmpresa.insertId;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(usuario.contrasena, saltRounds);


    // Registrar el usuario

    await connection.query(
      'INSERT INTO usuarios (idEmpresa, idRol, nombre, email, password) VALUES (?, ?, ?, ?, ?)',
      [idEmpresa, 1, usuario.nombre, usuario.email, hashedPassword]
    );
  

    // Si todo está bien, confirmar la transacción
    await connection.commit();

    res.json({ success: true, mensaje: 'Empresa registrado exitosamente', idEmpresa });
  } catch (error) {
    // Si algo falla, revertir la transacción
    await connection.rollback();
    res.status(500).json({ success: false, mensaje: error.message });
  } finally {
    // Liberar la conexión
    connection.release();
  }
};

