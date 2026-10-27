const express = require('express');
const db = require('../db');
const adminOnly = require('../middleware/admin');
const router = express.Router();
router.get('/', async (req, res, next) => {
  try { const [rows] = await db.query('SELECT id, nome FROM categorias ORDER BY nome'); res.json(rows); }
  catch (err) { next(err); }
});
router.post('/', adminOnly, async (req, res, next) => {
  try {
    const nome = String(req.body.nome || '').trim();
    if (!nome) return res.status(400).json({ erro: 'O nome da categoria é obrigatório.' });
    const [r] = await db.execute('INSERT INTO categorias (nome) VALUES (?)', [nome]);
    res.status(201).json({ id: r.insertId, nome });
  } catch (err) { next(err); }
});
router.put('/:id', adminOnly, async (req, res, next) => {
  try {
    const nome = String(req.body.nome || '').trim();
    if (!nome) return res.status(400).json({ erro: 'O nome da categoria é obrigatório.' });
    const [r] = await db.execute('UPDATE categorias SET nome = ? WHERE id = ?', [nome, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ erro: 'Categoria não encontrada.' });
    res.json({ mensagem: 'Categoria atualizada com sucesso.' });
  } catch (err) { next(err); }
});
router.delete('/:id', adminOnly, async (req, res, next) => {
  try {
    const [r] = await db.execute('DELETE FROM categorias WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ erro: 'Categoria não encontrada.' });
    res.status(204).send();
  } catch (err) { next(err); }
});
module.exports = router;
