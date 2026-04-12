/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { initFederation } from '@angular-architects/native-federation';

initFederation('federation.manifest.json')
  .catch((err: any) => console.error('Erro ao inicializar federation',err)) // tipo explícito
  .then((_ : unknown) => import('./bootstrap')) // pode usar unknown se não usar o valor
  .catch((err: any) => console.error('Erro ao carregar bootstrap',err));
