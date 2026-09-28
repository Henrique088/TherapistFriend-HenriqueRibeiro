// src/application/dtos/AgendaDTO.ts

export interface AgendarConsultaDTO {
    pacienteId: number;
    profissionalId: number;
    dataInicio: Date;
    dataFim: Date;
    tipo: 'regular' | 'urgencia';
    observacoes?: string;
}


export interface GradeDTO {
    diaSemana: number;
    horaInicio: string;
    horaFim: string;
}

export interface EventoCalendarioDTO {
    id: string | number;
    title: string;
    start: Date;
    end: Date;
    tipo: 'agendamento' | 'bloqueio' | 'excecao' | 'background';
    status?: string;
    // classificacao: string;
    resource?: any; // Informações extras (ex: nome do paciente)
    color?: string;
}

export interface EventoCalendarioPacienteDTO {
    id: string | number | null;
    title: string;
    start: Date;
    end: Date;
    tipo: 'agendamento' | 'bloqueio' | 'excecao';
    classificacao: 'meu_agendamento' | 'ocupado' | 'bloqueio_comum' | 'bloqueio_estrategico' | 'vaga_vip' | 'disponivel';
    status?: string;
    resource?: any; // Informações extras (ex: nome do paciente)
    color?: string;
}

export interface CriarBloqueioDTO {
    profissionalId: number;
    titulo: string;
    dataInicio: Date;
    dataFim: Date;
    recorrente: boolean;
    tipo: 'comum' | 'estrategico' | 'pessoal' | 'feriado' | undefined;
    diasSemana: number[];
}


export interface AdicionarExcecaoDTO {
    profissionalId: number;
    bloqueioId: number;
    dataExcecao: Date;
    motivo?: string;
}


export interface ListarHorariosLivresDTO {
    profissionalId: number;
    pacienteId: number;
    inicio: Date;
    fim: Date;
    duracaoMinutos: number;
}


export interface RemoverBloqueioDTO {
    profissionalId: number;
    bloqueioId: number;
}

export interface RemoverExcecaoDTO {
    profissionalId: number;
    bloqueioId: number;
    excecaoId: number;
}


export interface GraficoMensalDTO {
  mes: string;  // Formato: "2026-03"
  total: number;
}

export interface DashboardProfissionalResponseDTO {
  resumo: {
    hoje: number;
    semana: number;
    mes: number;
  };
  grafico: GraficoMensalDTO[]; 
}


export interface AgendarComVoucherRequestDTO {
    pacienteId: number;
    profissionalId: number;
    voucherId: number;
    dataInicio: Date;
    dataFim: Date;
}

export interface ResponderAgendamentoDTO {
    agendamentoId: number;
    acao: 'confirmado' | 'cancelado';
    profissionalId: number;
}