require('dotenv').config();
const express = require('express');
const db = require('./db');
const errorHandler = require('./middleware/errors');
const app = express();
app.use(express.json({ limit: '1mb' }));
app.get('/', (req, res) => res.json({ mensagem: 'API da loja online está funcionando.', documentacao: 'Consulte o README.md.' }));
app.get('/health', async (req, res, next) => {
  try { await db.query('SELECT 1'); res.json({ status: 'ok', banco: 'conectado' }); }
  catch (err) { next(err); }
});
app.use('/api/clientes', require('./routes/customers'));
app.use('/api/categorias', require('./routes/categories'));
app.use('/api/produtos', require('./routes/products'));
app.use('/api/pedidos', require('./routes/orders'));
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.use(errorHandler);
const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API executando em http://localhost:${port}`));
