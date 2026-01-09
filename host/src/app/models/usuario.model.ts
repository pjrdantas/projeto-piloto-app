export interface Usuario {
  id?: number;
  nome: string;
  login: string;
  ativo: 'S' | 'N';
  senha?: string;
  perfisIds?: number[];        // ADICIONADO
  rolesIds?: number[];         // ADICIONADO
  permissionsIds?: number[];   // ADICIONADO
}
