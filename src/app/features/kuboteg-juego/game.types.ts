export type ObjetivoSecreto =
  | { tipo: 'continentes'; ids: [string, string] }
  | { tipo: 'destruir'; color: string; fallback?: true }
  | { tipo: 'tres_mayorias' }
  | { tipo: 'cuatro_mayorias' };

export interface ConquistaPendiente {
  origenId: string;
  destinoId: string;
  tropasOrigenFinal: number;
  defensorNombre: string;
  defensorColor: string;
  defensorId: string;
}

export interface RpcError {
  error?: string;
}

export interface Pacto {
  id: string;
  tipo: 'no_agresion';
  jugador1Id: string;
  jugador2Id: string;
  territoriosId1?: string[];
  territorioId1?: string;
  territorioId2?: string;
  territoriosId2?: string[];
  rondaInicio: number;
  rondaExpira: number;
  estado?: 'activo' | 'en_transicion';
}

export interface PropuestaPacto {
  id: string;
  tipo: 'no_agresion';
  proponenteId: string;
  receptorId: string;
  territoriosId1?: string[];
  territorioId1?: string;
  territorioId2?: string;
  territoriosId2?: string[];
  ts: number;
}

export interface GrupoChat {
  id: string;
  nombre: string;
  bandera: string;
  jugadoresIds: string[];
  creadoPor: string;
}

export interface InvitacionGrupo {
  id: string;
  grupoId: string;
  grupoNombre: string;
  grupoBandera: string;
  invitadorId: string;
  invitadoId: string;
  totalEsperados: number;
  ts: number;
}

export interface CombateRpc {
  error?: string;
  dados_ataque?: number[];
  dados_defensa?: number[];
  bajas_atacante?: number;
  bajas_defensor?: number;
  conquista?: boolean;
  tropas_origen_final?: number;
  tropas_destino_final?: number;
}

export interface Dedicatoria {
  id: string;
  ganador_nombre: string;
  ganador_lider: string | null;
  dedicatoria: string;
  jugadores: Array<{ usuario_id: string }>;
}

export type ModoAudio = 'sin_sonido' | 'sin_musica' | 'musica_uniforme' | 'musica_lideres';
