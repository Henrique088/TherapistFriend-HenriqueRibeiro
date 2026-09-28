// src/application/dtos/signaling/SignalingDTO.ts

export interface OfferDTO {

    sessaoId: string;
    offer: RTCSessionDescriptionInit;

}

export interface AnswerDTO {

    sessaoId: string;
    answer: RTCSessionDescriptionInit;

}

export interface IceCandidateDTO {

    sessaoId: string;
    candidate: RTCIceCandidateInit;

}

export interface EndSessionDTO {

    sessaoId: string;

}

export interface RoomReadyDTO {

    sessaoId: string;
    shouldCreateOffer: boolean;

}

export interface SessionEndedPayload {
    sessaoId: string;
    mensagem?: string;
    tipo?: 'INFO_SESSAO';
    elegivelParaRelatorio?: boolean;
}