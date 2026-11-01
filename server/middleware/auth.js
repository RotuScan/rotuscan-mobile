import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'rotuscan_segredo_super_seguro';

export function autenticarJWT(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Sessão expirada ou token não fornecido. Faça login novamente.' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ erro: 'Token inválido.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    req.userEmail = payload.email;
    return next();
  } catch (err) {
    return res.status(401).json({ erro: 'Sessão expirada ou inválida. Faça login novamente.' });
  }
}

