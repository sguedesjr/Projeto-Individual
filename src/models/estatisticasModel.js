var database = require("../database/config.js")

function exibir(nome, erros, acertos, pontuacao) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ")
    var instrucaoSql = `

        select u.nome as 'Nome do usuário', e.erros as 'Erros', e.acertos as 'Acertos', l.pontuacao as 'Pontuação' 
from usuario u 
join leaderboard l on
l.fkUsuario = u.id
join estatisticas e on l.fkEstatisticas = e.id
where u.nome = '${nome}' and e.erros = ${erros} and e.acertos = ${acertos} and l.pontuacao = ${pontuacao}`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarEvol(id, pontuacao) {
    var instrucaoSql = `select l.id as 'NumeroPart', l.pontuacao as 'Pontuacao' from leaderboard l 
                        where l.fkUsuario = ${idUsuario}
                        order by l.id asc;`;


    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function insertStat(erros, acertos) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():");
    
    
    var instrucaoSql = `
        INSERT INTO estatisticas (erros, acertos) VALUES (${erros}, ${acertos});
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function insertRanking (fkUsuario, fkEstatisticas, pontuacao) {
    console.log("ACESSEI O USUARIO MODEL ... function insertRanking():");
    var instrucaoSql = `
        INSERT INTO leaderboard (fkUsuario, fkEstatisticas, pontuacao) 
        VALUES (${fkUsuario}, ${fkEstatisticas}, ${pontuacao});
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    exibir,
    insertRanking,
    insertStat,
    buscarEvol
};