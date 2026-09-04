@startuml
skinparam classAttributeIconSize 0
skinparam classFontSize 12
skinparam classBackgroundColor #F5F5F5
skinparam classBorderColor #333333

class Unidade {
  +id: SERIAL
  +nome: VARCHAR(150)
  +endereco: VARCHAR(300)
  +ativo: BOOLEAN
}

class Turma {
  +id: SERIAL
  +id_unidade: INTEGER (FK)
  +nome: VARCHAR(100)
  +idade_min_meses: INTEGER
  +idade_max_meses: INTEGER
  +ativo: BOOLEAN
}

class Inscricao {
  +id: SERIAL
  +ano_referencia: INTEGER
  +numero: INTEGER
  +data_registro: TIMESTAMP
  +status: VARCHAR(20)
  +justificativa_status: TEXT
  -- Dados do Responsável --
  +resp_nome: VARCHAR(150)
  +resp_cpf: CHAR(11)
  +resp_rg: VARCHAR(20)
  +resp_parentesco: VARCHAR(50)
  +resp_telefone: VARCHAR(20)
  -- Endereço --
  +end_logradouro: VARCHAR(150)
  +end_numero: VARCHAR(10)
  +end_complemento: VARCHAR(50)
  +end_bairro: VARCHAR(100)
  +end_municipio: VARCHAR(100)
  +end_uf: CHAR(2)
  +end_cep: CHAR(8)
  +end_referencia: VARCHAR(150)
  -- Situação Socioeconômica --
  +sit_mae_vinculo: BOOLEAN
  +sit_demonstrativo_credito: BOOLEAN
  +sit_loas_bpc: BOOLEAN
  +sit_trabalhador_autonomo: BOOLEAN
  +sit_mae_matriculada: BOOLEAN
  +sit_vulnerabilidade: BOOLEAN
  +sit_declaracao_mae_adolescente: BOOLEAN
  +renda_per_capita: DECIMAL(10,2)
  -- Dados da Criança --
  +cri_nome: VARCHAR(150)
  +cri_data_nascimento: DATE
  +cri_cpf: CHAR(11)
  +cri_nome_pai: VARCHAR(150)
  +cri_nome_mae: VARCHAR(150)
  -- Documentos --
  +doc_certidao_sem_pai_mae: BOOLEAN
  +doc_irmao_matriculado: BOOLEAN
  -- Encaminhamentos --
  +enc_vara_familia: BOOLEAN
  +enc_conselho_tutelar: BOOLEAN
  +enc_cras: BOOLEAN
  +enc_creas: BOOLEAN
  +enc_casa_acolhimento: BOOLEAN
  -- Saúde e Dados Sociais --
  +saude_nis: VARCHAR(20)
  +saude_cartao_sus: VARCHAR(20)
  +saude_laudo_deficiencia: BOOLEAN
  +saude_laudo_intolerancia: BOOLEAN
  +saude_laudo_neurodivergencia: BOOLEAN
  -- Solicitação --
  +id_unidade: INTEGER (FK)
  +id_turma: INTEGER (FK)
  +turno: VARCHAR(10)
}

class Historico {
  +id: SERIAL
  +data_hora: TIMESTAMP
  +entidade: VARCHAR(30)
  +registro_id: INTEGER
  +campo: VARCHAR(50)
  +valor_anterior: TEXT
  +valor_novo: TEXT
  +operador: VARCHAR(20)
}

class Usuario {
  +id: SERIAL
  +username: VARCHAR(50)
  +senha_hash: VARCHAR(128)
  +role: VARCHAR(20)
}

class Configuracao {
  +chave: VARCHAR(50)
  +valor: TEXT
}

Unidade "1" -- "*" Turma : possui
Turma "*" -- "1" Unidade : pertence a

Unidade "1" -- "*" Inscricao : recebe inscrições
Turma "1" -- "*" Inscricao : possui inscritos

' Histórico não possui FK polimórfica; registra registro_id e entidade
note right of Historico
  registro_id pode referenciar
  Inscricao.id, Unidade.id ou Turma.id.
  A integridade é garantida pela aplicação.
end note

@enduml