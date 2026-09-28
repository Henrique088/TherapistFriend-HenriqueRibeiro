class ProfissionalRepositoryMock {
    constructor() {
        this.criar = jest.fn();
        this.buscarPorUsuario = jest.fn();
        this.atualizar = jest.fn();
    }
}

module.exports = ProfissionalRepositoryMock;
