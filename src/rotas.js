const express = require('express')

const { listarContasBancarias, criarContaBancaria, atualizarContaBancaria, excluirContaBancaria, depositosBancarios, saquesBancarios, transferenciasBancarias, saldoBancario, extratoBancario } = require('./controladores/controle-banco')
const { senhaDoBanco, dadosDoUsuario, numeroContaValorSenhaBody, numeroContaSenhaQuery, numeroContaEValorBody, deletarParams, atualizarParams, transferenciasParams } = require('./intermediario')
const { transferencias } = require('./bancodedados')

const rotas = express()

rotas.get('/contas', senhaDoBanco, listarContasBancarias)

rotas.post('/contas', dadosDoUsuario, criarContaBancaria)

rotas.put('/contas/:numero_conta/usuarios', dadosDoUsuario,  atualizarContaBancaria)

rotas.delete('/contas/:numero_conta', deletarParams, excluirContaBancaria)

rotas.post('/transacoes/depositar', numeroContaEValorBody, depositosBancarios)

rotas.post('/transacoes/sacar', numeroContaValorSenhaBody, saquesBancarios)

rotas.post('/transacoes/transferir', transferenciasParams, transferenciasBancarias)

rotas.get('/contas/saldo', numeroContaSenhaQuery, saldoBancario)

rotas.get('/contas/extrato', numeroContaSenhaQuery, extratoBancario)


module.exports = rotas