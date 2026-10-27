const express = require('express');
const db = require('../db');
const adminOnly = require('../middleware/admin');
const router = express.Router();

// Consulta pública: produtos disponíveis (estoque maior que zero).
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(`SELECT p.id, p.nome, p.preco, p.quantidade,
      p.categoria_id, c.nome AS categoria FROM produtos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      WHERE p.quantidade > 0 ORDER BY p.id`);
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.execute(`SELECT p.id, p.nome, p.preco, p.quantidade,
      p.categoria_id, c.nome AS categoria FROM produtos p
      LEFT JOIN categorias c ON c.id = p.categoria_id WHERE p.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ erro: 'Produto não encontrado.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.post('/', adminOnly, async (req, res, next) => {
  try {
    const { nome, preco, quantidade = 0, categoria_id = null } = req.body;
    if (!nome || !Number.isFinite(Number(preco)) || Number(preco) < 0 ||
        !Number.isInteger(Number(quantidade)) || Number(quantidade) < 0) {
      return res.status(400).json({ erro: 'Informe nome, preço não negativo e quantidade inteira não negativa.' });
    }
    const [result] = await db.execute(
      'INSERT INTO produtos (nome, preco, quantidade, categoria_id) VALUES (?, ?, ?, ?)',
      [nome.trim(), Number(preco), Number(quantidade), categoria_id || null]);
    res.status(201).json({ id: result.insertId, nome: nome.trim(), preco: Number(preco), quantidade: Number(quantidade), categoria_id: categoria_id || null });
  } catch (err) { next(err); }
});

router.put('/:id', adminOnly, async (req, res, next) => {
  try {
    const { nome, preco, quantidade, categoria_id = null } = req.body;
    if (!nome || !Number.isFinite(Number(preco)) || Number(preco) < 0 ||
        !Number.isInteger(Number(quantidade)) || Number(quantidade) < 0) {
      return res.status(400).json({ erro: 'Informe nome, preço não negativo e quantidade inteira não negativa.' });
    }
    const [result] = await db.execute(
      'UPDATE produtos SET nome = ?, preco = ?, quantidade = ?, categoria_id = ? WHERE id = ?',
      [nome.trim(), Number(preco), Number(quantidade), categoria_id || null, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ erro: 'Produto não encontrado.' });
    res.json({ mensagem: 'Produto atualizado com sucesso.' });
  } catch (err) { next(err); }
});

router.delete('/:id', adminOnly, async (req, res, next) => {
  try {
    const [result] = await db.execute('DELETE FROM produtos WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ erro: 'Produto não encontrado.' });
    res.status(204).send();
  } catch (err) { next(err); }
});
module.exports = router;
