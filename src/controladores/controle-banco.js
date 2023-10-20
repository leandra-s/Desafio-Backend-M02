let { contas, depositos, saques, transferencias } = require('../bancodedados')

function listarContasBancarias(req, res) {
    const conta = req.contas
    return res.status(200).json(conta)
}

let numero_conta = 1
function criarContaBancaria(req, res) {
    const usuario = req.body
    let saldoInicial = 0//saldo inicial

    const verificarCpfEmail = contas.some((conta) => { return conta.usuario.cpf === usuario.cpf || conta.usuario.email === usuario.email })

    if (verificarCpfEmail) {//true -> ja existe cpf ou email igual ao do body
        return res.status(400).json({ "mensagem": "Já existe uma conta com o cpf ou e-mail informado!" })
    }

    const contaNova = {//construindo o obj
        numero: numero_conta.toString(),
        saldo: saldoInicial,
        usuario
    }

    numero_conta++//soma mais um no número da conta, para deixar pronto 
    contas.push(contaNova)//puxa a conta para o array

    return res.status(201).json()//retorna ok
}

function atualizarContaBancaria(req, res) {
    const { numero_conta } = req.params
    const usuario = req.body

    if (isNaN(numero_conta)) {
        return res.status(400).json({ "mensagem": "Necessário número válido!" })
    }

    const numeroEncontrado = contas.find((conta) => { return conta.numero === numero_conta })//se passou do intermediario, so encontra 

    if (!numeroEncontrado) {//se a conta nao foi encontrada
        return res.status(404).json({ "mensagem": "Conta bancária não encontada!" })
    }

    if (numeroEncontrado.usuario.cpf !== usuario.cpf || numeroEncontrado.usuario.email !== usuario.email) {//verifica o cpf ou email igual(sem contar o da conta encontrada)
        const filtroContas = contas.filter((conta) => {
            return conta.usuario.cpf !== numeroEncontrado.usuario.cpf || conta.usuario.email !== numeroEncontrado.usuario.email
        })

        const verificarCPF = filtroContas.some((conta) => { return conta.usuario.cpf === usuario.cpf || conta.usuario.email === usuario.email })
        if (verificarCPF) {
            return res.status(400).json({ "mensagem": "CPF ou e-mail Existente!" })
        }
    }

    //coloquei para pegar tudo do body, se o cpf ou email não mudar, vai continuar o mesmo
    numeroEncontrado.usuario.nome = usuario.nome
    numeroEncontrado.usuario.cpf = usuario.cpf
    numeroEncontrado.usuario.data_nascimento = usuario.data_nascimento
    numeroEncontrado.usuario.email = usuario.email
    numeroEncontrado.usuario.senha = usuario.senha

    return res.status(204).json()//ok

}

function excluirContaBancaria(req, res) {
    return res.status(204).json()
}

function depositosBancarios(req, res) {
    const contaEValor = req.contaEValor

    contaEValor.encontrarConta.saldo += contaEValor.valor//soma o valor do deposito na conta

    const numero_conta = contaEValor.encontrarConta.numero
    const valor = contaEValor.valor
    const data = new Date()

    depositos.push({//formatada os dados 
        data: data.toLocaleString(),
        numero_conta,
        valor
    })

    return res.status(204).json()
}

function saquesBancarios(req, res) {
    const contaEValor = req.contaEValor

    contaEValor.encontrarConta.saldo -= contaEValor.valor//subtrai o valor 
    const numero_conta = contaEValor.encontrarConta.numero
    const valor = contaEValor.valor
    const data = new Date()

    saques.push({//formata os dados
        data: data.toLocaleString(),
        numero_conta,
        valor
    })

    return res.status(204).json()

}

function transferenciasBancarias(req, res) {
    const contas = req.contas

    const origem = contas.encontrarConta1.numero
    const destino = contas.encontrarConta2.numero
    const valor = contas.valor

    contas.encontrarConta1.saldo -= contas.valor//tira da conta de origem
    contas.encontrarConta2.saldo += contas.valor//coloca na conta de destino

    const data = new Date()

    transferencias.push({//formata os dados
        data: data.toLocaleString(),
        numero_conta_origem: origem,
        numero_conta_destino: destino,
        valor

    })

    return res.status(204).json()
}

function saldoBancario(req, res) {
    const contaESenha = req.contaESenha

    return res.status(200).json({//se tudo deu certo, mostra o saldo da conta em questão
        saldo: contaESenha.encontrarConta.saldo
    })
}

function extratoBancario(req, res) {

    const contaESenha = req.contaESenha

    //encontra os depositos
    const depositosConta = depositos.filter((deposito) => { return deposito.numero_conta === contaESenha.encontrarConta.numero })

    //encontra os saques
    const saquesConta = saques.filter((saque) => { return saque.numero_conta === contaESenha.encontrarConta.numero })

    //encontra os transferencias enviadas
    const transferenciasEnviadas = transferencias.filter((transferencia) => { return transferencia.numero_conta_origem === contaESenha.encontrarConta.numero })

    //encontra os transferencias recebidas
    const transferenciasRecebidas = transferencias.filter((transferencia) => { return transferencia.numero_conta_destino === contaESenha.encontrarConta.numero })

    return res.status(200).json({//formata os dados
        depositos: depositosConta,
        saques: saquesConta,
        transferenciasEnviadas,
        transferenciasRecebidas

    })

}

module.exports = {
    listarContasBancarias,
    criarContaBancaria,
    atualizarContaBancaria,
    excluirContaBancaria,
    depositosBancarios,
    saquesBancarios,
    transferenciasBancarias,
    saldoBancario,
    extratoBancario
}