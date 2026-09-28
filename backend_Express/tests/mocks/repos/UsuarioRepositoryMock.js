class UsuarioRepositoryMock {
    constructor() {
        this.buscarPorEmail = jest.fn();
        this.criar = jest.fn();
        this.buscarPorId = jest.fn();
    }
}

module.exports = UsuarioRepositoryMock;


