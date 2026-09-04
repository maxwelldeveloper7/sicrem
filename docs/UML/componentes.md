@startuml
!define RECTANGLE class

skinparam nodeBackgroundColor #F5F5F5
skinparam componentBackgroundColor #E8E8E8
skinparam databaseBackgroundColor #D0E0F0
skinparam artifactBackgroundColor #FFF9E6

actor "Operador" as op
actor "Suporte" as sp

node "Máquina da Secretaria (Local)" {
  
  component "Navegador Web" as nav
  
  node "Aplicação Flask (Servidor Embutido)" as app {
    component "Rotas/Controllers" as routes
    component "Services (Regras de Negócio)" as services
    component "Models (SQLAlchemy ORM)" as models
    component "Templates (Jinja2)" as templates
    component "APScheduler (Backup)" as sched
    component "ReportLab (PDF)" as pdf
    component "Utils (Máscaras, Validação)" as utils
  }
  
  database "PostgreSQL (Banco Local)" as db
  folder "Diretório de Backups JSON" as json_backup
  folder "Diretório de Backups do Banco (SQL)" as sql_backup
  
  nav --> app : HTTP/HTTPS local
  routes --> services : invoca
  services --> models : usa
  models --> db : SQL via SQLAlchemy
  routes --> templates : renderiza
  services --> pdf : gera comprovante
  services --> utils : usa funções auxiliares
  services --> json_backup : escreve JSON
  sched --> db : pg_dump diário
  sched --> sql_backup : salva backup
  services --> sched : agenda tarefa
}

op --> nav : Usa o sistema
sp --> nav : Acessa rota oculta

@enduml