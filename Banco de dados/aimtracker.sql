create database aimtracker;
use aimtracker;

CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario VARCHAR(45),
    email VARCHAR(45),
    senha VARCHAR(45),
    telefone CHAR(11)
);

CREATE TABLE estatisticas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pontuacao CHAR(4),
    erros CHAR(2),
    acertos CHAR(2),
    fkUsuario INT,
    FOREIGN KEY (fkUsuario) REFERENCES usuario(id)
);

CREATE TABLE avaliacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    estrelas DECIMAL(2,1),
    comentario VARCHAR(300),
    dataAvaliacao DATE,
    fkUsuarioAv INT,
    FOREIGN KEY (fkUsuarioAv) REFERENCES usuario(id)
);
