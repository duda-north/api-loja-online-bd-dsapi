module.exports = function adminOnly(req, res, next) {
  const configuredToken = process.env.ADMIN_TOKEN;
  const providedToken = req.get('x-admin-token');
  if (!configuredToken || !providedToken || providedToken !== configuredToken) {
    return res.status(403).json({ erro: 'Acesso restrito ao administrador.' });
  }
  next();
};
