const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ mensaje: 'Token faltante' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ mensaje: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
}

function autorizacionPorRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }
    next();
    console.log("Rol recibido:", req.user.rol);
  };  
}

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("Contenido del token decodificado:", decoded); 
  req.user = decoded;
  next();
} catch (err) {
  res.status(401).json({ mensaje: 'Token inválido' });
}

module.exports = { verificarToken, autorizacionPorRol };