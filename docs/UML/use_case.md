@startuml
left to right direction
skinparam packageStyle rectangle
skinparam actorBackgroundColor #E8E8E8
skinparam usecaseBackgroundColor #F5F5F5

actor "Operador" as op
actor "Suporte" as sp

rectangle "Sistema de Inscrição em Creches" {
  usecase "Login" as UC_Login
  usecase "Registrar inscrição" as UC_Registrar
  usecase "Validar CPF" as UC_ValidarCPF
  usecase "Verificar duplicidade" as UC_VerificarDup
  usecase "Cadastrar responsável" as UC_CadResp
  usecase "Cadastrar criança" as UC_CadCri
  usecase "Cadastrar irmão (reutilizar dados)" as UC_CadIrmao
  usecase "Calcular idade e sugerir turma" as UC_SugerirTurma
  usecase "Salvar inscrição e gerar comprovante" as UC_Salvar
  usecase "Consultar inscrições" as UC_Consultar
  usecase "Visualizar detalhes" as UC_Detalhes
  usecase "Reemitir comprovante" as UC_Reemitir
  usecase "Editar inscrição" as UC_Editar
  usecase "Inativar inscrição" as UC_Inativar
  usecase "Reativar inscrição" as UC_Reativar
  usecase "Gerar relatórios" as UC_Relatorios
  usecase "Exportar CSV" as UC_ExportarCSV
  usecase "Visualizar histórico" as UC_Historico
  usecase "Acessar rota oculta" as UC_RotaOculta
  usecase "Gerenciar unidades" as UC_GerUnidades
  usecase "Gerenciar turmas" as UC_GerTurmas
}

op --> UC_Login
op --> UC_Registrar
op --> UC_Consultar
op --> UC_Relatorios
op --> UC_Historico

UC_Registrar ..> UC_ValidarCPF : <<include>>
UC_Registrar ..> UC_VerificarDup : <<include>>
UC_Registrar ..> UC_CadResp : <<include>>
UC_Registrar ..> UC_CadCri : <<include>>
UC_Registrar ..> UC_CadIrmao : <<include>>
UC_Registrar ..> UC_SugerirTurma : <<include>>
UC_Registrar ..> UC_Salvar : <<include>>

UC_Consultar ..> UC_Detalhes : <<include>>
UC_Consultar ..> UC_Reemitir : <<include>>
UC_Consultar ..> UC_Editar : <<include>>
UC_Consultar ..> UC_Inativar : <<include>>
UC_Consultar ..> UC_Reativar : <<include>>

UC_Relatorios ..> UC_ExportarCSV : <<include>>

sp --> UC_Login
sp --> UC_RotaOculta
UC_RotaOculta ..> UC_GerUnidades : <<include>>
UC_RotaOculta ..> UC_GerTurmas : <<include>>

@enduml