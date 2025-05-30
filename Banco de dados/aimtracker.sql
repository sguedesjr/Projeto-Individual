create database aimtracker;
use aimtracker;

CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(30) NOT NULL,
    email VARCHAR(45) NOT NULL,
    senha VARCHAR(45) NOT NULL
);

CREATE TABLE estatisticas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    erros INT,
    acertos INT
);


CREATE TABLE leaderboard(
id INT,
pontuacao INT,
fkUsuario INT,
fkEstatisticas INT,
constraint pkComposta primary key(id, fkUsuario, fkEstatisticas),
constraint fkUsuario foreign key leaderboard(fkUsuario) references usuario(id),
constraint fkEstatisticas foreign key leaderboard(fkEstatisticas) references estatisticas(id)
)auto_increment=1;

select * from usuario;

