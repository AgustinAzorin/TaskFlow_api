const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
/**
 * Middleware de autenticación.
 * Verifica que el token esté presente y sea válido.
 */
module.exports = function (req, res, next) {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(403).json({ mensaje: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(403).json({ mensaje: 'Token mal formado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    console.log("✅ Token verificado:", decoded); // Mostramos datos del token

    next();
  } catch (err) {
    console.error("❌ Error al verificar token:", err.message);
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
};

/**
 * Middleware de autorización por rol.
 * Se utiliza después del middleware de autenticación.
 */
module.exports.autorizacionPorRol = function (...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      console.warn(`❌ Rol no autorizado: ${req.user?.rol}`);
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    console.log(`✅ Acceso permitido para rol: ${req.user.rol}`);
    next();
  };
};
