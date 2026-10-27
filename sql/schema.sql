CREATE DATABASE IF NOT EXISTS bd_dsapi
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bd_dsapi;

CREATE TABLE IF NOT EXISTS cidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  altura DOUBLE NULL,
  nascimento DATE NULL,
  cidade_id INT NULL,
  CONSTRAINT fk_clientes_cidades FOREIGN KEY (cidade_id)
    REFERENCES cidades(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  quantidade INT NOT NULL DEFAULT 0,
  categoria_id INT NULL,
  CONSTRAINT chk_produtos_preco CHECK (preco >= 0),
  CONSTRAINT chk_produtos_quantidade CHECK (quantidade >= 0),
  CONSTRAINT fk_produtos_categorias FOREIGN KEY (categoria_id)
    REFERENCES categorias(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  horario DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  endereco VARCHAR(200) NOT NULL,
  cliente_id INT NOT NULL,
  CONSTRAINT fk_pedidos_clientes FOREIGN KEY (cliente_id)
    REFERENCES clientes(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS pedidos_produtos (
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  quantidade INT NOT NULL,
  PRIMARY KEY (pedido_id, produto_id),
  CONSTRAINT chk_item_preco CHECK (preco >= 0),
  CONSTRAINT chk_item_quantidade CHECK (quantidade > 0),
  CONSTRAINT fk_itens_pedidos FOREIGN KEY (pedido_id)
    REFERENCES pedidos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_itens_produtos FOREIGN KEY (produto_id)
    REFERENCES produtos(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

INSERT IGNORE INTO cidades (id, nome) VALUES (1, 'Porto Alegre'), (2, 'Canoas');
INSERT IGNORE INTO categorias (nome) VALUES ('Eletrônicos'), ('Casa'), ('Vestuário');
INSERT INTO produtos (nome, preco, quantidade, categoria_id)
SELECT 'Fone de ouvido', 79.90, 20, id FROM categorias WHERE nome = 'Eletrônicos'
AND NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Fone de ouvido');
