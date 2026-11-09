ALTER TABLE `clientes`
  ADD COLUMN `cpf` varchar(11) DEFAULT NULL,
  ADD UNIQUE KEY `uq_clientes_cpf` (`cpf`),
  ADD CONSTRAINT `chk_clientes_cpf` CHECK (`cpf` IS NULL OR `cpf` REGEXP '^[0-9]{11}$');
