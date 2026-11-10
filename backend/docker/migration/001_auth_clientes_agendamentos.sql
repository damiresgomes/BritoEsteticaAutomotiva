-- Execute uma vez em volumes MySQL que já existiam antes desta funcionalidade.
-- O docker-entrypoint-initdb.d não reaplica scripts em um volume inicializado.

ALTER TABLE clientes
  ADD COLUMN email varchar(100) DEFAULT NULL,
  ADD COLUMN senha_hash varchar(255) DEFAULT NULL,
  ADD COLUMN ativo enum('Sim','Não') NOT NULL DEFAULT 'Sim',
  ADD UNIQUE KEY uq_clientes_email (email);

ALTER TABLE usuario
  ADD COLUMN papel enum('ADMIN','USUARIO') NOT NULL DEFAULT 'USUARIO';

UPDATE usuario SET papel = 'ADMIN' WHERE email = 'admin@gmail.com';

ALTER TABLE agendamentos
  MODIFY COLUMN status enum('Pendente','Confirmado','Em atendimento','Concluído','Cancelado')
  NOT NULL DEFAULT 'Pendente';
