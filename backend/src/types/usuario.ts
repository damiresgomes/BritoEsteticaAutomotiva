// Declara o alias de tipo 'StatusAtivo' para nomear uma estrutura de tipo reutilizável.
export type StatusAtivo = "Sim" | "Não";

// Declara a interface 'Usuario' para definir o contrato/forma de dados em TypeScript.
export interface Usuario {
  // Define a propriedade/campo 'id' no objeto/estrutura.
  id: number;
  // Define a propriedade/campo 'nome' no objeto/estrutura.
  nome: string;
  // Define a propriedade/campo 'email' no objeto/estrutura.
  email: string;
  // Define a propriedade/campo 'senha' no objeto/estrutura.
  senha: string;
  // Define a propriedade/campo 'cpf' no objeto/estrutura.
  cpf: string;
  // Define a propriedade/campo 'salario' no objeto/estrutura.
  salario: number;
  // Define a propriedade/campo 'datanascimento' no objeto/estrutura.
  datanascimento: string;
  // Define a propriedade/campo 'ativo' no objeto/estrutura.
  ativo: StatusAtivo;
}

// Declara a interface 'NovoUsuario' para definir o contrato/forma de dados em TypeScript.
export interface NovoUsuario {
  // Define a propriedade/campo 'nome' no objeto/estrutura.
  nome: string;
  // Define a propriedade/campo 'email' no objeto/estrutura.
  email: string;
  // Define a propriedade/campo 'senhaHash' no objeto/estrutura.
  senhaHash: string;
  // Define a propriedade/campo 'cpf' no objeto/estrutura.
  cpf: string;
  // Define a propriedade/campo 'salario' no objeto/estrutura.
  salario: number;
  // Define a propriedade/campo 'datanascimento' no objeto/estrutura.
  datanascimento: string;
}

// -----------------------------------------------------------------------------
// RESUMO DO ARQUIVO
// -----------------------------------------------------------------------------
// Tipos TypeScript auxiliares para usuário.
