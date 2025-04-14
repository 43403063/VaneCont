const pool = require('../conexion/db');

// Obtener todos los roles
exports.getAllRoles = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM roles ORDER BY idRol');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener roles', details: error.message });
    }
};

// Obtener un rol por ID
exports.getRolById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM roles WHERE idRol = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Rol no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener rol', details: error.message });
    }
};


exports.createRol = async (req, res) => {
    const { descripcion } = req.body;
    const regexDescripcion = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/;

    if (!descripcion || descripcion.length < 3 || !regexDescripcion.test(descripcion)) {
        return res.status(400).json({ 
            error: 'La descripción debe tener al menos 3 caracteres y solo puede contener letras, números y espacios' 
        });
    }

    try {
        const [result] = await pool.query('INSERT INTO roles (descripcion) VALUES (?)', [descripcion]);
        res.status(201).json({ idRol: result.insertId, descripcion });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear rol', details: error.message });
    }
};

// Crear varios roles
exports.createMultipleRoles = async (req, res) => {
    const roles = req.body.roles;
    const regexDescripcion = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/;

    if (!Array.isArray(roles)) {
        return res.status(400).json({ error: 'Se espera un arreglo de roles' });
    }

    for (const rol of roles) {
        if (!rol.descripcion || rol.descripcion.length < 3 || !regexDescripcion.test(rol.descripcion)) {
            return res.status(400).json({ 
                error: `Descripción inválida: '${rol.descripcion}'. Debe tener al menos 3 caracteres y solo contener letras, números y espacios.` 
            });
        }
    }

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
        await connection.beginTransaction();

        const values = roles.map(rol => [rol.descripcion]);
        await connection.query('INSERT INTO roles (descripcion) VALUES ?', [values]);

        await connection.commit();
        res.status(201).json({ message: 'Roles creados exitosamente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al crear roles', details: error.message });
    } finally {
        connection.release();
    }
};


// Eliminar un rol por ID
exports.deleteRol = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM roles WHERE idRol = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Rol no encontrado' });
        res.json({ message: 'Rol eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar rol', details: error.message });
    }
};

// Eliminar varios roles por ID
exports.deleteMultipleRoles = async (req, res) => {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Se espera un arreglo de IDs' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
        await connection.beginTransaction();

        await connection.query(
            `DELETE FROM roles WHERE idRol IN (${ids.map(() => '?').join(',')})`,
            ids
        );

        await connection.commit();
        res.json({ message: 'Roles eliminados correctamente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al eliminar roles', details: error.message });
    } finally {
        connection.release();
    }
};

exports.updateRol = async (req, res) => {
    const { descripcion } = req.body;
    const { id } = req.params;

    if (!descripcion) {
        return res.status(400).json({ error: 'El campo "descripcion" es obligatorio.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE roles SET descripcion = ? WHERE idRol = ?',
            [descripcion, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }

        res.json({ message: 'Rol actualizado correctamente', idRol: id, descripcion });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar rol', details: error.message });
    }
};

exports.updateMultipleRoles = async (req, res) => {
    const roles = req.body.roles;

    if (!Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ error: 'Se espera un arreglo de roles con idRol y descripcion' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
        await connection.beginTransaction();

        for (const rol of roles) {
            if (!rol.idRol || !rol.descripcion) {
                throw new Error('Cada rol debe tener idRol y descripcion');
            }
            await connection.query(
                'UPDATE roles SET descripcion = ? WHERE idRol = ?',
                [rol.descripcion, rol.idRol]
            );
        }

        await connection.commit();
        res.json({ message: 'Roles actualizados correctamente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al actualizar roles', details: error.message });
    } finally {
        connection.release();
    }
};

exports.patchRol = async (req, res) => {
    const { id } = req.params;
    const { descripcion } = req.body;

    if (!descripcion) {
        return res.status(400).json({ error: 'Debe incluir al menos un campo para actualizar' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE roles SET descripcion = ? WHERE idRol = ?',
            [descripcion, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }

        res.json({ message: 'Rol actualizado parcialmente', idRol: id });
    } catch (error) {
        res.status(500).json({ error: 'Error al aplicar patch al rol', details: error.message });
    }
};

exports.patchMultipleRoles = async (req, res) => {
    const roles = req.body.roles;

    if (!Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ error: 'Se espera un arreglo de roles con al menos idRol' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
        await connection.beginTransaction();

        for (const rol of roles) {
            if (!rol.idRol) throw new Error('Cada objeto debe tener un idRol');

            // Solo actualizamos si hay al menos un campo modificable
            if (rol.descripcion) {
                await connection.query(
                    'UPDATE roles SET descripcion = ? WHERE idRol = ?',
                    [rol.descripcion, rol.idRol]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Roles actualizados parcialmente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al aplicar patch masivo', details: error.message });
    } finally {
        connection.release();
    }
};
