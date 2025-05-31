var estatisticasModel = require("../models/estatisticasModel.js"); 

function exibir(req, res) {
    
    const { nome, erros, acertos, pontuacao } = req.body;

    if (!nome || erros === undefined || acertos === undefined || pontuacao === undefined) {
        return res.status(400).json({ error: "Dados incompletos para estatísticas." });
    }

    estatisticasModel.exibir(nome, erros, acertos, pontuacao)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao realizar a consulta! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function registrarResultadoPartida(req, res) {
    const { idUsuario, erros, acertos, pontuacao } = req.body;

    if (idUsuario === undefined || erros === undefined || acertos === undefined || pontuacao === undefined) {
        return res.status(400).json({
            error: "Dados incompletos para registrar o resultado. 'idUsuario', 'erros', 'acertos' e 'pontuacao' são obrigatórios."
        });
    }

    let idEstatisticasInseridas;


    estatisticasModel.insertStat(erros, acertos)
        .then(resultadoStat => {
          
            if (!resultadoStat || resultadoStat.insertId === undefined) {
                console.error("Falha ao obter o ID da estatística inserida. Resultado:", resultadoStat);
                
                throw new Error("Não foi possível obter o ID da estatística após a inserção.");
            }
            idEstatisticasInseridas = resultadoStat.insertId;

            
            return estatisticasModel.insertRanking(idUsuario, idEstatisticasInseridas, pontuacao);
        })
        .then(resultadoRanking => {
            
            res.status(201).json({
                message: "Resultado da partida e ranking registrados com sucesso!",
                idEstatisticas: idEstatisticasInseridas,
                
            });
        })
        .catch(erro => {
            console.error("Erro completo ao registrar resultado da partida:", erro);
            
            res.status(500).json({
                error: "Erro interno do servidor ao registrar o resultado da partida.",
                details: erro.sqlMessage || erro.message
            });
        });
}

function buscarEvol(req, res) {
    const idUsuario = req.params.idUsuario;
    if(!idUsuario){
        return res.status(400).json({erros: 'ID do usuário não fornecido.'});
    }

    estatisticasModel.buscarEvol(idUsuario)
        .then(resultado => res.json(resultado))
        .catch(erro => {
            console.error("Erro ao buscar evolução:", erro);
            res.status(500).json({ error: "Erro ao buscar evolução.", details: erro.sqlMessage || erro.message });
        });
}

module.exports = {
    exibir,
    registrarResultadoPartida,
    buscarEvol
};