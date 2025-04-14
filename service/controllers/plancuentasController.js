// controllers/plancuentasController.js
const pool = require('../conexion/db');

// Validaciones
const validarPlanCuenta = (plan_cuentas, crear = true) => {
  const errores = [];

  if (crear) {
    if (!/^[0-9]{2,10}$/.test(plan_cuentas.codigo)) {
      errores.push("El código debe tener entre 2 y 10 caracteres numéricos.");
    }
  }


  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,200}$/.test(plan_cuentas.nombre)) {
    errores.push("El nombre debe tener entre 3 y 200 caracteres, solo letras y espacios.");
  }

  if (!/^[APNFR]$/.test(plan_cuentas.categoria)) {
    errores.push("La categoría solo puede ser A, P, N, F o R.");
  }

  return errores;
};

// GET todos los plan_cuentas
exports.getPlanCuentas = async (req, res) => {
  try {
    const [plan_cuentas] = await pool.query('SELECT * FROM plan_cuentas ORDER BY idPlanCuentas');
    res.json(plan_cuentas);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET plan_cuentas por código
exports.getPlanCuentasPorCodigo = async (req, res) => {
  const { codigo } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM plan_cuentas WHERE codigo = ?', [codigo]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cuenta Contable  no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST individual
exports.createPlanCuenta = async (req, res) => {
  const plan_cuenta = req.body;
  const errores = validarPlanCuenta(plan_cuenta, true);

  if (errores.length > 0) {
    return res.status(400).json({ success: false, errores });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO plan_cuentas
        (codigo, nombre, categoria)
       VALUES (?, ?, ?)`,
      [
        plan_cuenta.codigo,
        plan_cuenta.nombre,
        plan_cuenta.categoria,
      ]
    );
    res.status(201).json({ success: true, idPlanCuentas: result.insertId, ...plan_cuenta });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(500).json({ success: false, error: `El código '${plan_cuenta.codigo}' ya existe.` });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};


// PATCH individual (actualización parcial)
exports.actualizarPlanCuenta = async (req, res) => {
  const { codigo } = req.params;
  const campos = req.body;

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ success: false, mensaje: 'No se proporcionaron campos para actualizar' });
  }

  const plan_cuenta = req.body;

  // Validación regex para los campos enviados
  const errores = validarPlanCuenta(plan_cuenta, false);

  if (errores.length > 0) {
    return res.status(400).json({ success: false, errores });
  }

  try {
    const camposSet = [];
    const valores = [];

    for (const [key, value] of Object.entries(campos)) {
      camposSet.push(`${key} = ?`);
      valores.push(value);
    }

    valores.push(codigo); // Último valor es el del WHERE

    const [result] = await pool.query(
      `UPDATE plan_cuentas SET ${camposSet.join(', ')} WHERE idPlanCuentas = ?`,
      valores
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Cuenta Contable no encontrado' });
    }

    res.json({ success: true, mensaje: 'Cuenta Contable actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
