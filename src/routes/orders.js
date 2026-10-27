const express = require('express');
const db = require('../db');
const adminOnly = require('../middleware/admin');
const router = express.Router();

// Body esperado: { cliente_id, endereco, itens: [{ produto_id, quantidade }] }
router.post('/', async (req, res, next) => {
  const { cliente_id, endereco, itens } = req.body;
  if (!Number.isInteger(Number(cliente_id)) || !String(endereco || '').trim() ||
      !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'Informe cliente_id, endereço e uma lista de itens não vazia.' });
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [clientes] = await conn.execute('SELECT id FROM clientes WHERE id = ?', [Number(cliente_id)]);
    if (!clientes.length) { await conn.rollback(); return res.status(404).json({ erro: 'Cliente não encontrado.' }); }
    const itensNormalizados = itens.map(i => ({ produto_id: Number(i.produto_id), quantidade: Number(i.quantidade) }));
    if (itensNormalizados.some(i => !Number.isInteger(i.produto_id) || !Number.isInteger(i.quantidade) || i.quantidade <= 0)) {
      await conn.rollback(); return res.status(400).json({ erro: 'Cada item deve ter produto_id e quantidade inteira positiva.' });
    }
    const [rPedido] = await conn.execute('INSERT INTO pedidos (endereco, cliente_id) VALUES (?, ?)', [String(endereco).trim(), Number(cliente_id)]);
    let total = 0;
    for (const item of itensNormalizados) {
      const [produtos] = await conn.execute('SELECT id, nome, preco, quantidade FROM produtos WHERE id = ? FOR UPDATE', [item.produto_id]);
      if (!produtos.length) { await conn.rollback(); return res.status(404).json({ erro: `Produto ${item.produto_id} não encontrado.` }); }
      const produto = produtos[0];
      if (produto.quantidade < item.quantidade) { await conn.rollback(); return res.status(409).json({ erro: `Estoque insuficiente para ${produto.nome}.` }); }
      await conn.execute('INSERT INTO pedidos_produtos (pedido_id, produto_id, preco, quantidade) VALUES (?, ?, ?, ?)', [rPedido.insertId, produto.id, produto.preco, item.quantidade]);
      await conn.execute('UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?', [item.quantidade, produto.id]);
      total += Number(produto.preco) * item.quantidade;
    }
    await conn.commit();
    res.status(201).json({ id: rPedido.insertId, cliente_id: Number(cliente_id), endereco: String(endereco).trim(), total: Number(total.toFixed(2)), itens: itensNormalizados });
  } catch (err) { await conn.rollback(); next(err); }
  finally { conn.release(); }
});
router.get('/', adminOnly, async (req, res, next) => {
  try {
    const [rows] = await db.query(`SELECT p.id, p.horario, p.endereco, p.cliente_id, c.nome AS cliente,
      COALESCE(SUM(pp.preco * pp.quantidade), 0) AS total
      FROM pedidos p JOIN clientes c ON c.id = p.cliente_id
      LEFT JOIN pedidos_produtos pp ON pp.pedido_id = p.id
      GROUP BY p.id, p.horario, p.endereco, p.cliente_id, c.nome ORDER BY p.horario DESC`);
    res.json(rows);
  } catch (err) { next(err); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const [pedidos] = await db.execute(`SELECT p.id, p.horario, p.endereco, p.cliente_id, c.nome AS cliente
      FROM pedidos p JOIN clientes c ON c.id = p.cliente_id WHERE p.id = ?`, [req.params.id]);
    if (!pedidos.length) return res.status(404).json({ erro: 'Pedido não encontrado.' });
    const [itens] = await db.execute(`SELECT pp.produto_id, pr.nome AS produto, pp.preco, pp.quantidade,
      (pp.preco * pp.quantidade) AS subtotal FROM pedidos_produtos pp
      JOIN produtos pr ON pr.id = pp.produto_id WHERE pp.pedido_id = ?`, [req.params.id]);
    const total = itens.reduce((sum, item) => sum + Number(item.subtotal), 0);
    res.json({ ...pedidos[0], itens, total: Number(total.toFixed(2)) });
  } catch (err) { next(err); }
});
router.delete('/:id', adminOnly, async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT id FROM pedidos WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!rows.length) { await conn.rollback(); return res.status(404).json({ erro: 'Pedido não encontrado.' }); }
    const [itens] = await conn.execute('SELECT produto_id, quantidade FROM pedidos_produtos WHERE pedido_id = ?', [req.params.id]);
    for (const item of itens) await conn.execute('UPDATE produtos SET quantidade = quantidade + ? WHERE id = ?', [item.quantidade, item.produto_id]);
    await conn.execute('DELETE FROM pedidos WHERE id = ?', [req.params.id]);
    await conn.commit();
    res.status(204).send();
  } catch (err) { await conn.rollback(); next(err); }
  finally { conn.release(); }
});
module.exports = router;
