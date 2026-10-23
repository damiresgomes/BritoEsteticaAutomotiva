-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 08/10/2026 às 00:52
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `brito_estetica`
--

DELIMITER $$
--
-- Procedimentos
--
-- Sem `DEFINER` explícito: o definidor passa a ser quem executa o script,
-- assim o dump funciona em qualquer servidor (o `root@localhost` não existe
-- em todo MySQL 8, e um definidor inexistente impede a criação do objeto).
-- `READS SQL DATA` é a característica correta: a procedure só consulta a view.
CREATE PROCEDURE `sp_buscar_agendamentos` (IN `p_termo` VARCHAR(100)) READS SQL DATA BEGIN
    SELECT 
        id_agendamento,
        data_hora,
        placa_veiculo,
        modelo_veiculo,
        status,
        cliente,
        nome_servico,
        valor
    FROM vw_agendamentos_centralizados
    WHERE 
        p_termo IS NULL 
        OR p_termo = '' 
        OR cliente LIKE CONCAT('%', p_termo, '%') 
        OR modelo_veiculo LIKE CONCAT('%', p_termo, '%') 
        OR placa_veiculo LIKE CONCAT('%', p_termo, '%')
    ORDER BY data_hora DESC;
END$$

--
-- Funções
--
CREATE FUNCTION `fn_obter_nome_categoria` (`p_id_categoria` INT) RETURNS VARCHAR(100) CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC BEGIN
	DECLARE v_nome varchar(100);

	SELECT nome_categoria INTO v_nome
	FROM categoria
	WHERE id_categoria = p_id_categoria
	LIMIT 1;
	
	IF v_nome IS NULL THEN
		RETURN 'Categoria Não Encontrado';
	END IF ;
		
	RETURN v_nome;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `agendamentos`
--

CREATE TABLE `agendamentos` (
  `id_agendamento` int(11) NOT NULL,
  `data_hora` datetime NOT NULL,
  `placa_veiculo` varchar(10) DEFAULT NULL,
  `modelo_veiculo` varchar(50) DEFAULT NULL,
  `id_cliente` int(11) NOT NULL,
  `status` enum('Pendente','Confirmado','Cancelado') NOT NULL DEFAULT 'Pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `agendamentos`
--

INSERT INTO `agendamentos` (`id_agendamento`, `data_hora`, `placa_veiculo`, `modelo_veiculo`, `id_cliente`, `status`) VALUES
(101, '2026-06-24 09:00:00', 'ABC-1234', 'VW Golf', 1, 'Confirmado'),
(102, '2026-06-24 14:00:00', 'XYZ-5678', 'Honda Civic', 2, 'Cancelado'),
(103, '2026-06-25 08:30:00', 'KIL-9012', 'BMW 320i', 3, 'Confirmado'),
(104, '2026-06-25 13:00:00', 'MNO-3456', 'Hyundai HB20', 4, 'Confirmado'),
(105, '2026-06-26 10:00:00', 'QWE-7890', 'Toyota Corolla', 5, 'Confirmado'),
(106, '2026-06-27 09:00:00', 'ABC-1234', 'VW Golf', 1, 'Pendente'),
(107, '2026-06-25 09:00:00', 'DEX-4591', 'Jeep Compass', 6, 'Pendente'),
(108, '2026-06-25 14:00:00', 'EGA-8233', 'Honda HR-V', 7, 'Pendente'),
(109, '2026-06-26 08:00:00', 'FTY-1029', 'Chevrolet Onix', 8, 'Pendente'),
(110, '2026-06-26 13:30:00', 'BRL-5544', 'BMW M3', 9, 'Pendente'),
(111, '2026-06-27 08:30:00', 'GHT-7711', 'Fiat Toro', 10, 'Pendente'),
(112, '2026-06-27 10:30:00', 'KND-3920', 'Toyota Hilux', 11, 'Pendente'),
(113, '2026-06-27 14:00:00', 'MXC-8822', 'Hyundai Creta', 12, 'Cancelado'),
(114, '2026-09-25 13:30:00', 'ABC-1234', 'Cruze', 30, 'Pendente'),
(115, '2026-09-09 14:00:00', 'FTX-5478', 'HRV', 31, 'Pendente'),
(116, '2026-09-18 09:30:00', 'ABC-1245', 'HRV', 32, 'Pendente');

-- --------------------------------------------------------

--
-- Estrutura para tabela `agendamento_servico`
--

CREATE TABLE `agendamento_servico` (
  `id_agendamento` int(11) NOT NULL,
  `id_servico` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `agendamento_servico`
--

INSERT INTO `agendamento_servico` (`id_agendamento`, `id_servico`) VALUES
(101, 1),
(101, 9),
(102, 4),
(102, 12),
(103, 5),
(103, 6),
(103, 11),
(104, 2),
(105, 1),
(105, 14),
(106, 3),
(107, 2),
(107, 11),
(108, 1),
(108, 12),
(109, 4),
(109, 7),
(110, 5),
(110, 6),
(111, 1),
(111, 8),
(112, 3),
(112, 13),
(113, 1),
(113, 14),
(114, 1),
(114, 14),
(115, 7),
(116, 2),
(116, 11);

-- --------------------------------------------------------

--
-- Estrutura para tabela `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nome_categoria` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nome_categoria`) VALUES
(1, 'principal'),
(2, 'extra');

-- --------------------------------------------------------

--
-- Estrutura para tabela `clientes`
--

CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `clientes`
--

INSERT INTO `clientes` (`id_cliente`, `nome`, `telefone`) VALUES
(1, 'Carlos Santos', '(19) 98888-0001'),
(2, 'Ana Rodrigues', '(19) 97777-0002'),
(3, 'Bruno Oliveira', '(19) 96666-0003'),
(4, 'Mariana Costa', '(19) 95555-0004'),
(5, 'Pedro Almeida', '(19) 94444-0005'),
(6, 'Fernanda Linhares', '(19) 98111-2233'),
(7, 'Gabriel Zanetti', '(19) 98765-4321'),
(8, 'Juliana Paschoal', '(19) 99234-5678'),
(9, 'Rodrigo Prado', '(19) 99100-1122'),
(10, 'Letícia Camargo', '(19) 98877-6655'),
(11, 'Matheus Aranha', '(19) 99345-6789'),
(12, 'Camila Rezende', '(19) 98222-3344'),
(30, 'Daiane Sales', '(19) 90000-0000'),
(31, 'Jon Bueno', '(11) 95555-5555'),
(32, 'Daniel Galvão', '(19) 99999-9999');

-- --------------------------------------------------------

--
-- Estrutura para tabela `servicos`
--

CREATE TABLE `servicos` (
  `id_servico` int(11) NOT NULL,
  `nome_servico` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) DEFAULT NULL,
  `duracao_horas` decimal(4,2) NOT NULL DEFAULT 0.00,
  `id_categoria` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `servicos`
--

INSERT INTO `servicos` (`id_servico`, `nome_servico`, `descricao`, `preco`, `duracao_horas`, `id_categoria`) VALUES
(1, 'Lavagem Detalhada', 'Uma limpeza externa completa com secagem manual, vidros limpos e acabamento nos pneus. Ideal para\r\n                    quem usa o carro diariamente e quer manter a aparência sempre impecável sem gastar muito tempo.', 400.00, 6.00, 1),
(2, 'Higienização Interna Completa', 'Serviço premium que cuida do interior do veículo: aspiração profunda, limpeza de painel, portas e vidros, além de aromatização. Indicado para quem deseja eliminar poeira, ácaros e odores, deixando o carro com aspecto de novo.', 1200.00, 52.08, 1),
(3, 'Restauração de Faróis', 'Recupera a transparência dos faróis, removendo opacidade e pequenos riscos. Inclui polimento, aplicação de cera e proteção UV. Melhora a estética e aumenta a segurança à noite.', 250.00, 4.00, 1),
(4, 'Polimento Comercial', 'Corrige arranhões leves e devolve brilho à pintura. A cristalização protege contra desgaste e o tratamento UV prolonga a vida da pintura. É uma opção intermediária para quem quer renovar o visual sem investir em polimento técnico.', 700.00, 6.00, 1),
(5, 'Limpeza de Motor', 'Limpeza cuidadosa do compartimento do motor, removendo sujeira e oleosidade sem danificar componentes elétricos. Inclui proteção UV e cristalização da pintura. Além da estética, ajuda na manutenção preventiva.', 200.00, 3.30, 1),
(6, 'Polimento Técnico + Vitrificação', 'Processo avançado que corrige microarranhões e imperfeições da pintura. Finalizado com vitrificação cerâmica, que cria uma camada protetora contra sol, chuva e sujeira. É o serviço mais indicado para carros novos ou de luxo.', 2500.00, 11.00, 1),
(7, 'Vitrificação de Plástico', 'Tratamento que protege plásticos internos e externos contra ressecamento e desbotamento. Mantém a textura original e dá aspecto renovado às peças.', 700.00, 3.50, 1),
(8, 'Limpeza de Chassi', 'Limpeza profunda da parte inferior do veículo, removendo barro, óleo e resíduos. Inclui proteção anticorrosiva, essencial para quem roda em estradas de terra ou regiões úmidas.', 500.00, 4.00, 1),
(9, 'Higienização dos Bancos', 'Limpeza completa dos bancos em tecido ou couro, removendo manchas e odores. No couro, inclui hidratação para evitar rachaduras. Garante conforto e preserva o valor do veículo.', 800.00, 6.00, 1),
(10, 'Polimento Técnico', 'Polimento detalhado para correção de riscos leves.', 200.00, 5.00, 2),
(11, 'Hidratação de Couro', 'Tratamento para manter o couro macio e protegido.', 200.00, 2.00, 2),
(12, 'Cristalização de Vidros', 'Aplicação de produto repelente de água nos vidros.', 200.00, 2.00, 2),
(13, 'Limpeza do Motor', 'Serviço adicional de higienização do motor.', 400.00, 2.00, 2),
(14, 'Cera Líquida', 'Aplicação rápida de cera para proteção e brilho da pintura.', 80.00, 1.00, 2),
(27, 'teste', '<p>teste</p>', 500.00, 2.50, 1);

--
-- Acionadores `servicos`
--
-- Observação (MySQL 8): o trigger não recebe `NO SQL`/`DETERMINISTIC` — a
-- sintaxe de `CREATE TRIGGER` não aceita essas características. O MySQL 8
-- considera trigger sempre determinístico por definição. O que o MySQL 8
-- exige é que a *function* declare `DETERMINISTIC`/`NO SQL`/`READS SQL DATA`
-- (a de cima já declara `DETERMINISTIC`).
--
DELIMITER $$
CREATE TRIGGER `trg_servicos_before_update` BEFORE UPDATE ON `servicos` FOR EACH ROW BEGIN
	IF NEW.preco <= 0 THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Erro: O preço do serviço deve ser um valor estritamente positivo (maior que zero).';
	END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(100) NOT NULL,
  `cpf` varchar(30) NOT NULL,
  `salario` double NOT NULL,
  `datanascimento` date NOT NULL,
  `ativo` enum('Sim','Não') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuario`
--

INSERT INTO `usuario` (`id`, `nome`, `email`, `senha`, `cpf`, `salario`, `datanascimento`, `ativo`) VALUES
(1, 'Administrador', 'admin@gmail.com', '$2y$10$UlRENRQON2SjaSYAxmYs4OydOa5NkiJTqdZMbKiJbH75yZ5Xfebom', '094.650.100-90', 3500, '1980-07-22', 'Sim'),
(2, 'Bill Gates', 'teste@teste.com', '$2y$10$ineMFivFCCHdP3gGGWfoR.RRqt.3jYDbIi.mXDPLjIM0vvYps9j7G', '424.454.180-20', 3500, '2000-10-20', 'Sim'),
(9, 'teste', 'teste2@teste.com', '$2y$10$wl.IteWzPTk3Sc/5SL2cCuL3mrh8yqwHHLCGF4/e3oUJD6lcZZyUW', '540.998.448-03', 5240, '2007-11-12', 'Sim');

--
-- Normaliza os CPFs plantados para apenas dígitos.
--
-- Sem isso o índice `uq_usuario_cpf` não protege: gravado com máscara
-- ('094.650.100-90') e gravado sem máscara ('09465010090') são textos
-- diferentes para o MySQL, e o mesmo CPF passaria duas vezes.
--
UPDATE `usuario`
SET `cpf` = REPLACE(REPLACE(REPLACE(`cpf`, '.', ''), '-', ''), ' ', '');

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_agendamentos_centralizados`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `vw_agendamentos_centralizados` (
`id_agendamento` int(11)
,`data_hora` datetime
,`placa_veiculo` varchar(10)
,`modelo_veiculo` varchar(50)
,`status` enum('Pendente','Confirmado','Cancelado')
,`id_cliente` int(11)
,`cliente` varchar(100)
,`id_servico` int(11)
,`nome_servico` varchar(100)
,`valor` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_servico_mais_vendido`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `vw_servico_mais_vendido` (
`nome_servico` varchar(100)
,`total_vendas` bigint(21)
);

-- --------------------------------------------------------

--
-- Estrutura para view `vw_agendamentos_centralizados`
--
DROP TABLE IF EXISTS `vw_agendamentos_centralizados`;

CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_agendamentos_centralizados`  AS SELECT `a`.`id_agendamento` AS `id_agendamento`, `a`.`data_hora` AS `data_hora`, `a`.`placa_veiculo` AS `placa_veiculo`, `a`.`modelo_veiculo` AS `modelo_veiculo`, `a`.`status` AS `status`, `c`.`id_cliente` AS `id_cliente`, `c`.`nome` AS `cliente`, `s`.`id_servico` AS `id_servico`, `s`.`nome_servico` AS `nome_servico`, coalesce(`s`.`preco`,0.00) AS `valor` FROM (((`agendamentos` `a` join `clientes` `c` on(`c`.`id_cliente` = `a`.`id_cliente`)) left join `agendamento_servico` `ags` on(`ags`.`id_agendamento` = `a`.`id_agendamento`)) left join `servicos` `s` on(`s`.`id_servico` = `ags`.`id_servico`)) ORDER BY `a`.`data_hora` DESC ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_servico_mais_vendido`
--
DROP TABLE IF EXISTS `vw_servico_mais_vendido`;

CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_servico_mais_vendido`  AS WITH ContagemServicos AS (SELECT `s`.`nome_servico` AS `nome_servico`, count(`ags`.`id_agendamento`) AS `total_vendas` FROM (`servicos` `s` left join `agendamento_servico` `ags` on(`s`.`id_servico` = `ags`.`id_servico`)) GROUP BY `s`.`id_servico`, `s`.`nome_servico`) SELECT `contagemservicos`.`nome_servico` AS `nome_servico`, `contagemservicos`.`total_vendas` AS `total_vendas` FROM `contagemservicos` ORDER BY `contagemservicos`.`total_vendas` DESC LIMIT 0, 11  ;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD PRIMARY KEY (`id_agendamento`),
  ADD KEY `fk_agendamentos_cliente` (`id_cliente`);

--
-- Índices de tabela `agendamento_servico`
--
ALTER TABLE `agendamento_servico`
  ADD PRIMARY KEY (`id_agendamento`,`id_servico`),
  ADD KEY `fk_pivo_servico` (`id_servico`);

--
-- Índices de tabela `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Índices de tabela `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id_cliente`);

--
-- Índices de tabela `servicos`
--
ALTER TABLE `servicos`
  ADD PRIMARY KEY (`id_servico`),
  ADD KEY `fk_servicos_categoria` (`id_categoria`);

--
-- Índices de tabela `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuario_email` (`email`),
  ADD UNIQUE KEY `uq_usuario_cpf` (`cpf`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  MODIFY `id_agendamento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT de tabela `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de tabela `servicos`
--
ALTER TABLE `servicos`
  MODIFY `id_servico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de tabela `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD CONSTRAINT `fk_agendamentos_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`);

--
-- Restrições para tabelas `agendamento_servico`
--
ALTER TABLE `agendamento_servico`
  ADD CONSTRAINT `fk_pivo_agendamento` FOREIGN KEY (`id_agendamento`) REFERENCES `agendamentos` (`id_agendamento`),
  ADD CONSTRAINT `fk_pivo_servico` FOREIGN KEY (`id_servico`) REFERENCES `servicos` (`id_servico`);

--
-- Restrições para tabelas `servicos`
--
ALTER TABLE `servicos`
  ADD CONSTRAINT `fk_servicos_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`);

--
-- Restrições de tabela `usuario`
--
-- O CPF é sempre gravado com 11 dígitos: é o que faz o índice único
-- `uq_usuario_cpf` valer de verdade.
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `chk_usuario_cpf` CHECK (`cpf` REGEXP '^[0-9]{11}$');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
