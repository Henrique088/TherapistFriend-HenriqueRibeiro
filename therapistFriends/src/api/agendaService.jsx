// src/api/agendaService.jsx

import api from './apiConfig';

export const AgendaService = {
  async getDisponibilidades(profissionalId, start, end) {
    const response = await api.get('disponibilidade/', {
      params: { profissional_id: profissionalId, data_inicio: start, data_fim: end }
    });
    return response.data;
  },

  async getAgendaCompleta(profissionalId, inicio, fim) {
    const response = await api.get(`agenda/profissional/${profissionalId}/eventos`, {
      params: { inicio, fim }
    })

    return response.data
  },

  async saveDisponibilidade(profissionalId,disponibilidade) {
    const response = await api.put(`agenda/profissional/${profissionalId}/grade`, disponibilidade);
    return response.data;
  },

  async updateDisponibilidade(id, updates) {
    const response = await api.put(`disponibilidade/${id}`, updates);
    return response.data;
  },

  async deleteDisponibilidade(id) {
    await api.delete(`disponibilidade/${id}`);
  },

  async getBloqueios(profissionalId, start, end) {
    const response = await api.get('bloqueio/', {
      params: { profissional_id: profissionalId, data_inicio: start, data_fim: end }
    });
    return response.data;
  },

  async createBloqueio(bloqueio) {
    const response = await api.post('bloqueio/', bloqueio);
    return response.data;
  },

  async deleteBloqueio(profissionalId, bloqueioId) {
    await api.delete(`bloqueio/deletar/${profissionalId}/${bloqueioId}`);
  },

  async getAgendamentos(profissionalId, start, end) {
    const response = await api.get('agendamento/profissional', {
      params: { profissional_id: profissionalId, data_inicio: start, data_fim: end }
    });
    return response.data;
  },

  async createExcecao(profissionalId, bloqueioId, dataExcecao,motivo) {
    
    const response = await api.post('bloqueio/excecao', {
      profissionalId,
      bloqueioId,
      dataExcecao,
      motivo
    });
    return response.data;
  },

  async deleteExcecao(profissionalId, bloqueioId, excecaoId, ) {
    await api.delete(`bloqueio/excecao/${excecaoId}`, {params: {profissionalId, bloqueioId}});
  },



  //carregar Agenda do profissional
  async getAgenda(profissionalId, start, end, pacienteId) {
    const response = await api.get(`agenda/profissional/${profissionalId}/livres`, {
      params: { inicio: start, fim: end, pacienteId }
    });
    return response.data;
  },


  //Atualiza status do agendamento
  async updateAgendamentoStatus(agendamentoId, acao) {
    const response = await api.patch(`agenda/agendamento/${agendamentoId}/responder`, { acao });
    return response.data;
  },

  async updateBloqueio(id, updates) {
    const response = await api.put(`bloqueio/${id}`, updates);
    return response.data;
  },



  async agendamento(agendamentoData) {
    const response = await api.post('/agenda/agendar', agendamentoData);
    return response;
  },

  async cancelarAgendamento(id) {
    const response = await api.patch(`agenda/agendamento/${id}/cancelar-paciente`);
    return response.data.erro;
  },

  async urgenciaService(profissionalId) {
    const response = await api.get(`agenda/listar-urgencias/${profissionalId}`);
    return response.data;
  },

  //decidir Urgencia
  async decidirUrgencia(profissionalId,urgenciaId, acao, motivo) {

    let response
    if (acao === 'aprovar') {
      response = await api.patch(`agenda/aprovar-urgencia/${profissionalId}`, {
        urgenciaId,
        // motivo: motivo || ''
      });
    } else if (acao === 'rejeitar') {
      response = await api.patch(`agenda/aprovar-urgencia/${profissionalId}`, {
        urgenciaId,
        motivo: motivo || ''
      });

    }
    return response.data;
  },

  //solicitar Urgencia
  async solicitarUrgencia(profissionalId, pacienteId, motivo, janelaDeTempo) {
    const response = await api.post(`agenda/solicitar-urgencia/${profissionalId}`, {
      pacienteId,
      motivo,
      janelaDeTempo: janelaDeTempo
    });
    return response.data;
  },

  async dashboard(profissionalId) {
    const response = await api.get(`agenda/dashboard/${profissionalId}`);

    return response.data;
  }

};