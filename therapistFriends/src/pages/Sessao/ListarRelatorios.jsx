// src/pages/Sessao/ListarRelatorios.jsx

import React, { useState, useEffect } from 'react';
import api from '../../api/apiConfig';
import {Search, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import MenuLateral from '../../Components/Menu/MenuLateral';
import './ListarRelatorios.css';
import { Link } from 'react-router-dom';

export const ListaRelatorios = () => {
  const [relatorios, setRelatorios] = useState([]);

  const [filtros, setFiltros] = useState({
    pagina: 1,
    busca: '',
    emocao: '',
    ordem: 'asc' // desc = mais recente primeiro
  });

  const [paginacao, setPaginacao] = useState({
    totalPaginas: 1,
    paginaAtual: 1
  });

  const [loading, setLoading] = useState(false);

  const carregarRelatorios = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sessoes/relatorios', {
        params: {
          page: filtros.pagina,
          limit: 10,
          codinome: filtros.busca,
          emocao: filtros.emocao,
          ordem: filtros.ordem
        }
      });

      setRelatorios(data.relatorios);
      setPaginacao(data.paginacao);
    } catch (error) {
      // console.error('Erro ao carregar relatórios', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRelatorios();
  }, []);

  // debounce só na busca
  useEffect(() => {
    const timer = setTimeout(() => {
      carregarRelatorios();
    }, 500);

    return () => clearTimeout(timer);
  }, [filtros.busca]);

  // outros filtros disparam direto
  useEffect(() => {
    carregarRelatorios();
  }, [filtros.pagina, filtros.emocao, filtros.ordem]);

  const formatarData = (dataISO) => {
    return new Date(dataISO).toLocaleString('pt-BR');
  };

  const getEmotionClass = (emotion) => {
    const map = {
      Felicidade: 'badge-felicidade',
      Tristeza: 'badge-tristeza',
      Raiva: 'badge-raiva',
      Neutro: 'badge-neutro'
    };
    return `badge ${map[emotion] || 'badge-neutro'}`;
  };

  const alterarFiltro = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
      pagina: 1 // sempre reseta página ao filtrar
    }));
  };

  const mudarPagina = (pagina) => {
    if (pagina < 1 || pagina > paginacao.totalPaginas) return;

    setFiltros((prev) => ({
      ...prev,
      pagina
    }));
  };

  const gerarPaginas = () => {
    const paginas = [];
    for (let i = 1; i <= paginacao.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  };

  return (
    <div className="container">
      <MenuLateral />

      <main className="content-wrapper">
        <header className="header-section">
          <h1 className="title">Relatórios de Sessões</h1>

          <div className="filters-row">
            {/* Busca */}
            <div className="search-container">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={filtros.busca}
                onChange={(e) =>
                  setFiltros({ ...filtros, busca: e.target.value })
                }
              />
            </div>

            {/* Filtro emoção */}
            <select
              value={filtros.emocao}
              onChange={(e) => alterarFiltro('emocao', e.target.value)}
            >
              <option value="">Todas emoções</option>
              <option value="Felicidade">Felicidade</option>
              <option value="Tristeza">Tristeza</option>
              <option value="Raiva">Raiva</option>
              <option value="Neutro">Neutro</option>
            </select>

            {/* Ordenação */}
            <select
              value={filtros.ordem}
              onChange={(e) => alterarFiltro('ordem', e.target.value)}
            >
              <option value="desc">Mais recentes</option>
              <option value="asc">Mais antigos</option>
            </select>
          </div>
        </header>
        <div className="content-body">
          <div className="table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Data</th>
                  <th>Emoção</th>
                  <th>Confiança</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" align="center">
                      Carregando...
                    </td>
                  </tr>
                ) : relatorios.length === 0 ? (
                  <tr>
                    <td colSpan="5" align="center">
                      Nenhum resultado encontrado
                    </td>
                  </tr>
                ) : (
                  relatorios.map((r) => (
                    <tr key={r.id}>
                      <td>{r.paciente?.codinome}</td>

                      <td>{formatarData(r.resumo?.dataRealizada)}</td>

                      <td>
                        <span className={getEmotionClass(r.resumo?.emocaoPredominante)}>
                          {r.resumo?.emocaoPredominante}
                        </span>
                      </td>

                      <td>{r.resumo?.confiancaMedia}%</td>

                      <td>
                        <Link to={`/relatorio/${r.sessaoId}`} className="action-btn">
                          <FileText size={16} />
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* PAGINAÇÃO COMPLETA */}
        <footer className="pagination">
          <button
            onClick={() => mudarPagina(paginacao.paginaAtual - 1)}
            disabled={paginacao.paginaAtual === 1}
          >
            <ChevronLeft size={18} />
          </button>

          {gerarPaginas().map((p) => (
            <button
              key={p}
              className={p === paginacao.paginaAtual ? 'active' : ''}
              onClick={() => mudarPagina(p)}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => mudarPagina(paginacao.paginaAtual + 1)}
            disabled={paginacao.paginaAtual === paginacao.totalPaginas}
          >
            <ChevronRight size={18} />
          </button>
        </footer>


      </main>
    </div>
  );
};