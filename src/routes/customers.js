const express = require('express');
const db = require('../db');
const adminOnly = require('../middleware/admin');
const router = express.Router();
router.post('/', async (req, res, next) => {
  try {
    const { nome, altura = null, nascimento = null, cidade_id = null } = req.body;
    if (!String(nome || '').trim()) return res.status(400).json({ erro: 'O nome do cliente é obrigatório.' });
    if (altura !== null && (!Number.isFinite(Number(altura)) || Number(altura) <= 0)) return res.status(400).json({ erro: 'A altura deve ser um número positivo.' });
    const [r] = await db.execute('INSERT INTO clientes (nome, altura, nascimento, cidade_id) VALUES (?, ?, ?, ?)',
      [String(nome).trim(), altura === null ? null : Number(altura), nascimento || null, cidade_id || null]);
    res.status(201).json({ id: r.insertId, nome: String(nome).trim(), altura, nascimento, cidade_id });
  } catch (err) { next(err); }
});
router.get('/', adminOnly, async (req, res, next) => {
  try { const [rows] = await db.query(`SELECT cl.id, cl.nome, cl.altura, cl.nascimento, cl.cidade_id, ci.nome AS cidade
    FROM clientes cl LEFT JOIN cidades ci ON ci.id = cl.cidade_id ORDER BY cl.id`); res.json(rows); }
  catch (err) { next(err); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.execute(`SELECT cl.id, cl.nome, cl.altura, cl.nascimento, cl.cidade_id, ci.nome AS cidade
      FROM clientes cl LEFT JOIN cidades ci ON ci.id = cl.cidade_id WHERE cl.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ erro: 'Cliente não encontrado.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});
router.put('/:id', adminOnly, async (req, res, next) => {
  try {
    const { nome, altura = null, nascimento = null, cidade_id = null } = req.body;
    if (!String(nome || '').trim()) return res.status(400).json({ erro: 'O nome do cliente é obrigatório.' });
    const [r] = await db.execute('UPDATE clientes SET nome = ?, altura = ?, nascimento = ?, cidade_id = ? WHERE id = ?',
      [String(nome).trim(), altura === null ? null : Number(altura), nascimento || null, cidade_id || null, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ erro: 'Cliente não encontrado.' });
    res.json({ mensagem: 'Cliente atualizado com sucesso.' });
  } catch (err) { next(err); }
});
router.delete('/:id', adminOnly, async (req, res, next) => {
  try {
    const [r] = await db.execute('DELETE FROM clientes WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ erro: 'Cliente não encontrado.' });
    res.status(204).send();
  } catch (err) { next(err); }
});
module.exports = router;
