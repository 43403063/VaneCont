// controllers
const pool = require('../conexion/db');

// Validaciones
const validar = (transaccion) => {
  const errores = [];

  // Validar glosa
  if (transaccion.glosa && transaccion.glosa.length > 200) {
    errores.push('La glosa no debe superar los 200 caracteres.');
  }

  // Validar fecha
  if (new Date(transaccion.fecha) > new Date()) {
    errores.push('La fecha no puede ser mayor a la fecha actual.');
  }

  // Validar que la suma de debe y haber sean iguales
  const totalDebe = transaccion.detalle.reduce((sum, d) => sum + parseFloat(d.importe_debe || 0), 0);
  const totalHaber = transaccion.detalle.reduce((sum, d) => sum + parseFloat(d.importe_haber || 0), 0);

  if (totalDebe.toFixed(2) !== totalHaber.toFixed(2)) {
    errores.push('La suma de los importes en el Debe y el Haber deben ser iguales.');
  }


  return errores;
};

// GET todos las Transacciones
exports.getTransacciones = async (req, res) => {
  const { idEmpresa } = req.params;
  try {
    const [transacciones] = await pool.query('SELECT * FROM transacciones where idEmpresa = ? ORDER BY idTransaccion desc',
      [idEmpresa]);
    res.json(transacciones);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET Transaccion por Id
// GET Transaccion por Id (cabecera + detalle)
exports.getTransaccionPorId = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener cabecera de la transacción
    const [cabeceraRows] = await pool.query(
      'SELECT * FROM transacciones WHERE idTransaccion = ?',
      [id]
    );

    if (cabeceraRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transacción no existe' });
    }

    const transaccion = cabeceraRows[0];

    // Obtener detalles asociados a la transacción
    const [detalleRows] = await pool.query(
      'SELECT * FROM detalle_transacciones as d inner join plan_cuentas p on d.idPlanCuentas = p.idPlanCuentas WHERE idTransaccion = ? ORDER BY item;',
      [id]
    );

    // Construir respuesta combinada
    const resultado = {
      ...transaccion,
      detalles: detalleRows
    };

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// POST: Registrar
exports.registrarTransaccion = async (req, res) => {
  const transaccion = req.body; // El cliente y los productos vienen en el body de la solicitud

  // Validaciones (ejemplo básico)
  if (!transaccion.idEmpresa || transaccion.detalle.length === 0) {
    return res.status(400).json({ success: false, message: 'Empresa y Detalle de Transaccion son necesarios.' });
  }

  const errores = validar(transaccion);

  if (errores.length > 0) {
    return res.status(400).json({ success: false, errores });
  }

  // Inicia la transacción
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {

    // Verificar disponibilidad de productos
    for (let detalle of transaccion.detalle) {
      const [existePlan] = await connection.query(
        'SELECT idPlanCuentas FROM plan_cuentas WHERE idPlanCuentas = ?',
        [detalle.idPlanCuentas]
      );

      if (existePlan.length === 0) {
        return res.status(404).json({ success: false, message: `No existe algunas de las cuentas contables.${detalle.idPlanCuentas}` });
      }
    }

    // Registrar el pedido en la tabla Pedido
    const [resultTransaccion] = await connection.query(
      'INSERT INTO transacciones (idEmpresa, fecha, glosa, importe) VALUES (?, ?, ?, ?)',
      [transaccion.idEmpresa, transaccion.fecha, transaccion.glosa, Total(transaccion.detalle)]
    );
    const idTransaccion = resultTransaccion.insertId;

    // Registrar los detalles del pedido en la tabla DetallePedido
    for (let detalle of transaccion.detalle) {

      // Insertar el detalle del pedido
      await connection.query(
        'INSERT INTO detalle_transacciones (idTransaccion, idPlanCuentas, item, importe_debe, importe_haber) VALUES (?, ?, ?, ?, ?)',
        [idTransaccion, detalle.idPlanCuentas, detalle.item, detalle.importe_debe, detalle.importe_haber]
      );
    }

    // Si todo está bien, confirmar la transacción
    await connection.commit();

    res.json({ success: true, mensaje: 'Transaccion registrado exitosamente', idTransaccion });
  } catch (error) {
    // Si algo falla, revertir la transacción
    await connection.rollback();
    res.status(500).json({ success: false, mensaje: error.message });
  } finally {
    // Liberar la conexión
    connection.release();
  }
};

// PUT: Actualizar una transacción
exports.actualizarTransaccion = async (req, res) => {
  const { id } = req.params;
  const transaccion = req.body;

  if (!transaccion || !transaccion.detalle || transaccion.detalle.length === 0) {
    return res.status(400).json({ success: false, message: 'Los datos de transacción y detalle son requeridos.' });
  }

  const errores = validar(transaccion);

  if (errores.length > 0) {
    return res.status(400).json({ success: false, errores });
  }


  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Validar que la transacción exista
    const [existe] = await connection.query(
      'SELECT idTransaccion FROM transacciones WHERE idTransaccion = ?',
      [id]
    );

    if (existe.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Transacción no encontrada.' });
    }

    // Actualizar cabecera
    await connection.query(
      'UPDATE transacciones SET fecha = ?, glosa = ?, estado = ?, importe = ? WHERE idTransaccion = ?',
      [
        transaccion.fecha,
        transaccion.glosa,
        transaccion.estado,
        Total(transaccion.detalle),
        id
      ]
    );

    // Eliminar detalle anterior
    await connection.query('DELETE FROM detalle_transacciones WHERE idTransaccion = ?', [id]);

    // Insertar nuevo detalle
    for (let detalle of transaccion.detalle) {
      await connection.query(
        'INSERT INTO detalle_transacciones (idTransaccion, idPlanCuentas, item, importe_debe, importe_haber) VALUES (?, ?, ?, ?, ?)',
        [
          id,
          detalle.idPlanCuentas,
          detalle.item,
          detalle.importe_debe,
          detalle.importe_haber
        ]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Transacción actualizada correctamente.' });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};


// Función para calcular el total
function Total(detalle) {
  return detalle.reduce((total, detalle) => total + (detalle.importe_debe), 0).toFixed(2);
}
