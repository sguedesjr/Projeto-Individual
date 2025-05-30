// config.js
var mysql = require("mysql2");

var mySqlConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
};

function executar(instrucao, params = []) { // Adicionei params para o futuro (consultas parametrizadas)

    if (process.env.AMBIENTE_PROCESSO !== "producao" && process.env.AMBIENTE_PROCESSO !== "desenvolvimento") {
        console.log("\nO AMBIENTE (produção OU desenvolvimento) NÃO FOI DEFINIDO EM .env OU dev.env OU app.js\n");
        return Promise.reject("AMBIENTE NÃO CONFIGURADO EM .env");
    }

    return new Promise(function (resolve, reject) {
        var conexao = mysql.createConnection(mySqlConfig);

        // TENTATIVA DE CONEXÃO COM TRATAMENTO DE ERRO
        conexao.connect(function(err_connect) {
            if (err_connect) {
                console.error("ERRO AO CONECTAR COM O BANCO DE DADOS:", err_connect);
                // Garante que a promise seja rejeitada se a conexão falhar
                return reject(err_connect);
            }
            // console.log("Conexão com o banco de dados bem-sucedida!"); // Log opcional de sucesso

            conexao.query(instrucao, params, function (err_query, resultados) {
                conexao.end(); // Fecha a conexão após a query
                if (err_query) {
                    console.error("ERRO NA QUERY SQL:", err_query);
                    reject(err_query);
                } else {
                    // console.log("Resultados da query:", resultados); // Log opcional dos resultados
                    resolve(resultados);
                }
            });
        });

        // Este listener de erro na conexão é uma boa prática, mas o callback de connect()
        // é mais direto para erros de estabelecimento de conexão.
        conexao.on('error', function (err_geral) {
            console.error("ERRO GERAL NA CONEXÃO MYSQL:", err_geral);
            // Para garantir, podemos tentar rejeitar a promise aqui também,
            // embora idealmente o erro já teria sido capturado antes.
            // É importante notar que a promise pode já ter sido resolvida/rejeitada.
            // reject(err_geral); // Cuidado ao chamar reject multiplas vezes.
        });
    });
}

module.exports = {
    executar,
    mySqlConfig // Se você realmente precisar exportar isso
};