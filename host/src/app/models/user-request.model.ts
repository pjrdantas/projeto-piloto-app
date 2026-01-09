export interface UserRequest {
  nome: string;
  login: string;
  senha: string;
  ativo: 'S' | 'N';
  perfisIds?: number[];        // ADICIONADO
  rolesIds?: number[];         // ADICIONADO
  permissionsIds?: number[];   // ADICIONADO
}
