module.exports = (err, req, res, next) => {
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Já existe um registro com esses dados.' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ erro: 'Operação não permitida: há registros relacionados.' });
  }
  res.status(err.status || 500).json({
    erro: err.status ? err.message : 'Erro interno do servidor.'
  });
};
