@startuml
actor "Operador" as op
participant "Navegador" as navegador
participant "InscricaoController" as controller
participant "InscricaoService" as service
participant "Inscricao (Model)" as model
participant "ComprovanteService" as comprovante
participant "Banco de Dados" as banco

== Entrada do CPF ==
op -> navegador: Acessa /inscricao/nova
navegador -> controller: GET /inscricao/nova
controller --> navegador: Renderiza formulário de CPF

op -> navegador: Digita CPF e clica "Avançar"
navegador -> controller: POST /inscricao/nova (cpf)

controller -> service: validar_cpf(cpf)
service --> controller: CPF válido / inválido

alt CPF inválido
    controller --> navegador: Mensagem "Número de CPF inválido"
    navegador --> op: Exibe erro
else CPF válido
    controller -> service: verificar_duplicidade(cpf, ano)
    service -> model: consultar_por_cpf_ano(cpf, ano)
    model -> banco: SELECT ... WHERE cri_cpf = :cpf AND ano_referencia = :ano
    banco --> model: resultado
    model --> service: inscricao existente? (boolean)
    service --> controller: resultado

    alt Inscrição duplicada
        controller --> navegador: Alerta "Já existe inscrição para este CPF..."
        navegador --> op: Exibe dados da inscrição existente
    else Sem duplicidade
        controller --> navegador: Redireciona para /inscricao/formulario
        navegador -> controller: GET /inscricao/formulario
        controller --> navegador: Renderiza formulário único vazio
    end
end

== Preenchimento do Formulário Único ==
op -> navegador: Preenche responsável, criança, etc.
op -> navegador: Seleciona unidade, data nascimento, etc.
navegador -> controller: (Requisições assíncronas para sugestão de turma?)
controller -> service: calcular_idade(data_nasc, ano_ref)
service --> controller: idade em meses
controller -> service: sugerir_turmas(unidade, idade)
service -> model: listar_turmas_compativeis(unidade, idade)
model -> banco: SELECT * FROM turmas WHERE id_unidade = ... AND ...
banco --> model: turmas compatíveis
model --> service: lista de turmas
service --> controller: turmas sugeridas
controller --> navegador: Atualiza select de turmas

== Submissão da Inscrição ==
op -> navegador: Clica "Salvar e gerar comprovante"
navegador -> controller: POST /inscricao/salvar (todos os campos)

controller -> service: validar_campos(dados)
service --> controller: erros ou ok

alt Campos inválidos
    controller --> navegador: Mensagens de erro
    navegador --> op: Exibe erros
else Campos válidos
    controller -> service: registrar_inscricao(dados)
    service -> model: criar_inscricao(dados)
    model -> banco: INSERT INTO inscricoes ...
    banco --> model: inscrição salva (id, numero)
    model --> service: objeto Inscricao

    service -> comprovante: gerar_pdf_json(inscricao)
    comprovante -> comprovante: Gera PDF (senha CPF) e JSON
    comprovante --> service: caminhos dos arquivos

    service --> controller: inscrição registrada + arquivos
    controller --> navegador: Redireciona para /inscricao/sucesso/<id>
    navegador --> op: Exibe tela de sucesso com link para PDF
end

@enduml