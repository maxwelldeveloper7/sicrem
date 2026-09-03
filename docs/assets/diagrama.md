@startuml
!define table(name,desc) class name as "desc" << (T,#FFAAAA) >>
!define primary_key(x) <b><color:#b8861b>x</color></b>
!define foreign_key(x) <color:#aaaaaa>x</color>
!define column(x) x

hide methods
hide stereotypes

entity "unidades" as unidades {
  * id : SERIAL <<PK>>
  --
  nome : VARCHAR(150) <<NOT NULL>>
  endereco : VARCHAR(300) <<NOT NULL>>
  ativo : BOOLEAN <<NOT NULL, DEFAULT TRUE>>
}

entity "turmas" as turmas {
  * id : SERIAL <<PK>>
  --
  id_unidade : INTEGER <<FK, NOT NULL>>
  nome : VARCHAR(100) <<NOT NULL>>
  idade_min_meses : INTEGER <<NOT NULL>>
  idade_max_meses : INTEGER <<NOT NULL>>
  ativo : BOOLEAN <<NOT NULL, DEFAULT TRUE>>
}

entity "inscricoes" as inscricoes {
  * id : SERIAL <<PK>>
  --
  ano_referencia : INTEGER <<NOT NULL>>
  numero : INTEGER <<NOT NULL>>
  data_registro : TIMESTAMP <<NOT NULL, DEFAULT NOW()>>
  status : VARCHAR(20) <<NOT NULL, CHECK ('ativa','inativada')>>
  justificativa_status : TEXT <<NULL>>
  --
  resp_nome : VARCHAR(150) <<NOT NULL>>
  resp_cpf : CHAR(11) <<NOT NULL>>
  resp_rg : VARCHAR(20) <<NULL>>
  resp_parentesco : VARCHAR(50) <<NOT NULL>>
  resp_telefone : VARCHAR(20) <<NOT NULL>>
  end_logradouro : VARCHAR(150) <<NOT NULL>>
  end_numero : VARCHAR(10) <<NOT NULL>>
  end_complemento : VARCHAR(50) <<NULL>>
  end_bairro : VARCHAR(100) <<NOT NULL>>
  end_municipio : VARCHAR(100) <<NOT NULL>>
  end_uf : CHAR(2) <<NOT NULL>>
  end_cep : CHAR(8) <<NOT NULL>>
  end_referencia : VARCHAR(150) <<NULL>>
  sit_mae_vinculo : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  sit_demonstrativo_credito : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  sit_loas_bpc : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  sit_trabalhador_autonomo : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  sit_mae_matriculada : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  sit_vulnerabilidade : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  sit_declaracao_mae_adolescente : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  renda_per_capita : DECIMAL(10,2) <<NOT NULL, CHECK (>0)>>
  --
  cri_nome : VARCHAR(150) <<NOT NULL>>
  cri_data_nascimento : DATE <<NOT NULL>>
  cri_cpf : CHAR(11) <<NOT NULL>>
  cri_nome_pai : VARCHAR(150) <<NULL>>
  cri_nome_mae : VARCHAR(150) <<NULL>>
  doc_certidao_sem_pai_mae : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  doc_irmao_matriculado : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  enc_vara_familia : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  enc_conselho_tutelar : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  enc_cras : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  enc_creas : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  enc_casa_acolhimento : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  saude_nis : VARCHAR(20) <<NULL>>
  saude_cartao_sus : VARCHAR(20) <<NULL>>
  saude_laudo_deficiencia : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  saude_laudo_intolerancia : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  saude_laudo_neurodivergencia : BOOLEAN <<NOT NULL, DEFAULT FALSE>>
  --
  id_unidade : INTEGER <<FK, NOT NULL>>
  id_turma : INTEGER <<FK, NOT NULL>>
  turno : VARCHAR(10) <<NOT NULL, CHECK ('manhã','tarde','integral')>>
}

entity "historico" as historico {
  * id : SERIAL <<PK>>
  --
  data_hora : TIMESTAMP <<NOT NULL, DEFAULT NOW()>>
  entidade : VARCHAR(30) <<NOT NULL>>
  registro_id : INTEGER <<NOT NULL>>
  campo : VARCHAR(50) <<NOT NULL>>
  valor_anterior : TEXT <<NULL>>
  valor_novo : TEXT <<NULL>>
  operador : VARCHAR(20) <<NOT NULL>>
}

entity "usuarios" as usuarios {
  * id : SERIAL <<PK>>
  --
  username : VARCHAR(50) <<NOT NULL, UNIQUE>>
  senha_hash : VARCHAR(128) <<NOT NULL>>
  role : VARCHAR(20) <<NOT NULL, CHECK ('operador','suporte')>>
}

entity "configuracoes" as configuracoes {
  * chave : VARCHAR(50) <<PK>>
  --
  valor : TEXT <<NOT NULL>>
}

' Relacionamentos
unidades ||--o{ turmas : "possui"
unidades ||--o{ inscricoes : "recebe inscrições"
turmas ||--o{ inscricoes : "tem inscrições"

' Nota sobre histórico (sem FK)
note right of historico
  Não possui FK real para as entidades,
  pois registra alterações genéricas.
  O campo `registro_id` referencia
  o ID da entidade correspondente
  (inscricao, unidade ou turma).
end note

' Índices importantes como nota
note bottom of inscricoes
  Índices:
  - idx_inscricoes_cpf_ano (cri_cpf, ano_referencia) UNIQUE
  - idx_inscricoes_numero_ano (numero, ano_referencia)
  - idx_inscricoes_ano_unidade_turma (ano, id_unidade, id_turma)
  - idx_inscricoes_cri_nome (cri_nome)
  - idx_inscricoes_status (status)
end note

@enduml