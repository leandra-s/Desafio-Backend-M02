let { banco, contas } = require("./bancodedados")

function senhaDoBanco(req, res, next) {//listar contas
    const { senha_banco } = req.query

    if (!senha_banco) {// verificar senha passada como query params
        return res.status(401).json({ "mensagem": "Necessário senha!" })
    }

    if (senha_banco !== banco.senha) {
        return res.status(401).json({ "mensagem": "A senha do banco informada é inválida!" })
    }

    req.contas = contas

    next()
}

function dadosDoUsuario(req, res, next) {//criar e atualizar
    const usuario = req.body

    if (!usuario.nome) {
        return res.status(400).json({ "mensagem": "Necessário Nome!" })
    }

    if (!usuario.cpf) {
        return res.status(400).json({ "mensagem": "Necessário CPF!" })
    }

    if (!usuario.data_nascimento) {
        return res.status(400).json({ "mensagem": "Necessário Data de Nascimento!" })
    }

    if (!usuario.telefone) {
        return res.status(400).json({ "mensagem": "Necessário Telefone!" })
    }

    if (!usuario.email) {
        return res.status(400).json({ "mensagem": "Necessário Email!" })
    }

    if (!usuario.senha) {
        return res.status(400).json({ "mensagem": "Necessário Senha!" })
    }
    next()
}

function numeroContaValorSenhaBody(req, res, next) {//depositar, sacar
    const { numero_conta, valor, senha } = req.body

    if (!numero_conta || !valor || !senha) {//verifica se tudo foi passado
        return res.status(400).json({ "mensagem": "O número da conta, o valor e a senha são obrigatórios!" })
    }

    const encontrarConta = contas.find((conta) => { return conta.numero === numero_conta })

    if (!encontrarConta) {//se nao encontrar a conta
        return res.status(404).json({ "mensagem": "Conta bancária não encontada!" })
    }

    if (senha !== encontrarConta.usuario.senha) {//verifica se a senha é válida
        return res.status(400).json({ "mensagem": "Senha incorreta!" })
    }

    if (valor === 0 || valor < 0) {
        return res.status(400).json({ "mensagem": "Valores negativos ou igual a zero são inválidos!" })
    }

    if (encontrarConta.saldo < valor) {//verifica o saldo
        return res.status(400).json({ "mensagem": "Saldo insuficiente!" })
    }

    req.contaEValor = {
        encontrarConta,
        valor
    }
    next()
}

function numeroContaEValorBody(req, res, next) {
    const { numero_conta, valor } = req.body//ja foi verificado tudo no intermediario

    if (!numero_conta || !valor) {//diz se nada foi passado
        return res.status(400).json({ "mensagem": "O número da conta e o valor são obrigatórios!" })
    }

    const encontrarConta = contas.find((conta) => { return conta.numero === numero_conta })

    if (!encontrarConta) {//se nao encontrar a conta
        return res.status(404).json({ "mensagem": "Conta bancária não encontada!" })
    }

    if (valor === 0 || valor < 0) {//nao deixa depositos com valor 0 ou negativos
        return res.status(400).json({ "mensagem": "Depositos com valor zero ou negativos não são validos!" })
    }

    req.contaEValor = {
        encontrarConta,
        valor
    }
    next()

}


function numeroContaSenhaQuery(req, res, next) {//saldo, extrato
    const { numero_conta, senha } = req.query

    if (!numero_conta || !senha) {//verifica se foi passado as info na query
        return res.status(400).json({ "mensagem": "Numero da conta e senha necessarios!" })
    }

    const encontrarConta = contas.find((conta) => { return conta.numero === numero_conta })

    if (!encontrarConta) {
        return res.status(404).json({ "mensagem": "Conta bancária não encontrada!" })
    }

    if (senha !== encontrarConta.usuario.senha) {//se a senha está incorreta
        return res.status(400).json({ "mensagem": "Necessario senha correta" })
    }

    req.contaESenha = {
        encontrarConta,
        senha
    }
    next()
}

function deletarParams(req, res, next) {
    const { numero_conta } = req.params

    if (!numero_conta) {//verifica se foi passado as info na query
        return res.status(400).json({ "mensagem": "Numero da conta e senha necessarios!" })
    }

    const encontrarConta = contas.find((conta) => { return conta.numero === numero_conta })

    if (!encontrarConta) {
        return res.status(404).json({ "mensagem": "Conta bancária não encontrada!" })
    }

    if (encontrarConta.saldo !== 0) {//so exclui se o saldo for zero, se for diferente não
        return res.status(400).json({ "mensagem": "A conta só pode ser removida se o saldo for zero!" })
    }

    contas = contas.filter((conta) => { return conta.numero !== numero_conta })

    next()
}

function transferenciasParams(req, res, next){
    const { numero_conta_origem, numero_conta_destino, senha, valor } = req.body

    if (!numero_conta_destino || !numero_conta_origem || !valor || !senha) {//verifica os dados do body
        return res.status(400).json({ "mensagem": "O número da conta de origem, de destino, o valor e a senha são obrigatórios!" })
    }

    const encontrarConta1 = contas.find((conta) => { return conta.numero === numero_conta_origem })

    const encontrarConta2 = contas.find((conta) => { return conta.numero === numero_conta_destino })

    if (!encontrarConta1 || !encontrarConta2) {//se a conta nao foi encontrada
        return res.status(404).json({ "mensagem": "Conta bancária não encontada!" })
    }

    if (senha !== encontrarConta1.usuario.senha) {//verifica a senha da conta 1
        return res.status(400).json({ "mensagem": "Necessario senha correta" })
    }

    if (valor === 0 || valor < 0) {
        return res.status(400).json({ "mensagem": "Valores negativos ou igual a zero são inválidos!" })
    }

    if (encontrarConta1.saldo < valor) {//verifica o saldo da conta 1
        return res.status(403).json({ "mensagem": "Saldo insuficiente!" })
    }


    req.contas = {
        encontrarConta1,
        encontrarConta2,
        valor
    }
    
    next()
}

module.exports = {
    senhaDoBanco,
    dadosDoUsuario,
    numeroContaSenhaQuery,
    numeroContaEValorBody,
    numeroContaValorSenhaBody,
    deletarParams,
    transferenciasParams
}