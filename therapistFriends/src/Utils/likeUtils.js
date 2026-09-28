// src/Utils/likeUtils.js

import api from '../api/apiConfig';

export async function darLikeNoRelato(relatoId) {
  try {
    const response = await api.post(`/relato/${relatoId}/like`);
    console.log(response)
    return {
      sucesso: true,
      mensagem: response.data.msg,
      quantidadeLikes: response.data.acao === "curtido"? +1: -1,
      liked: response.data.acao === "curtido"? true: false,
    };
  } catch (error) {
    console.error('Erro ao dar like no relato:', error);
    return {
      sucesso: false,
      erro: error.response?.data?.message || error.message || 'Erro ao dar like',
    };
  }
}