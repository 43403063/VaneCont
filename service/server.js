const express = require('express');
const cors = require('cors');
const app = express();

//const rolesRoutes = require('./routes/rolesRoutes');
const transaccionesRouters = require('./routes/transaccionesRouters');
const loginRouters = require('./routes/loginRouters');
const plancuentasRoutes = require('./routes/plancuentasRoutes');
const empresaRouters = require('./routes/empresaRouters');
// Permitir todas las solicitudes (modo desarrollo)
app.use(cors());

// O bien, para producción, especifica los orígenes permitidos:
// app.use(cors({
//   origin: 'http://localhost:5500' // Cambia esto por tu dominio o ruta local
// }));


app.use(express.json());
//app.use('/api/roles', rolesRoutes);
app.use('/api/transacciones', transaccionesRouters);
app.use('/api/login', loginRouters);
app.use('/api/plan-cuentas', plancuentasRoutes);
app.use('/api/empresas', empresaRouters);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
