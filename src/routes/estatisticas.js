var express = require("express");
var router = express.Router();

var estatisticasController = require("../controllers/estatisticasController.js");

//Recebendo os dados do html e direcionando para a função cadastrar de usuarioController.js
router.post("/exibir", function (req, res) {
    estatisticasController.exibir(req, res);
});

router.get("/buscarEvol/:idUsuario", function (req, res){
estatisticasController.buscarEvol (req, res);
});

router.post("/registrarResultadoPartida", function (req, res) {
    estatisticasController.registrarResultadoPartida(req, res);
});

module.exports = router;