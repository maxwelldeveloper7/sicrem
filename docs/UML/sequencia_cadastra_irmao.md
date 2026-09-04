@startuml
actor "Operador" as op
participant "Navegador" as nav
participant "InscricaoController" as cc
participant "InscricaoService" as serv
participant "Inscricao (Model)" as model
participant "ComprovanteService" as comp
participant "Historico (Model)" as hist
participant "Banco de Dados" as bd

== Após salvar inscrição anterior ==
nav -> op: Exibe tela de sucesso com pergunta: "Deseja cadastrar irmão(ã) desta criança?"

alt Operador responde "Sim"
    op -> nav: Clica "Sim" (ou botão correspondente)
    nav -> cc: GET /inscricao/nova?irmao_de=<id_inscricao_anterior>
    cc -> serv: obter_dados_irmao(id_inscricao_anterior)
    serv -> model: buscar_por_id(id_inscricao_anterior)
    model -> bd: SELECT * FROM inscricoes WHERE id = :id
    bd --> model: inscrição anterior
    model --> serv: objeto Inscricao (dados do responsável e filiação)
    serv --> cc: dados pré-preenchidos (responsável, nome_pai, nome_mae)
    cc --> nav: Renderiza formulário único com campos do responsável e filiação preenchidos
    nav --> op: Exibe formulário com dados reutilizados

    == Preenchimento dos dados do irmão ==
    op -> nav: Preenche dados da criança (nome, nascimento, CPF, etc.)
    op -> nav: Seleciona unidade, data de nascimento etc.
    nav -> cc: Requisição para sugestão de turma (via Ajax ou submit parcial)
    cc -> serv: calcular_idade(data_nasc, ano_ref)
    serv --> cc: idade em meses
    cc -> serv: sugerir_turmas(unidade, idade)
    serv -> model: listar_turmas_compativeis(unidade, idade)
    model -> bd: SELECT turmas compatíveis
    bd --> model: turmas
    model --> serv: lista de turmas
    serv --> cc: turmas sugeridas
    cc --> nav: Atualiza select de turmas

    == Submissão da inscrição do irmão ==
    op -> nav: Clica "Salvar e gerar comprovante"
    nav -> cc: POST /inscricao/salvar (dados do formulário)

    cc -> serv: validar_campos(dados)
    serv --> cc: erros ou ok

    alt Campos inválidos
        cc --> nav: Mensagens de erro
        nav --> op: Exibe erros
    else Campos válidos
        cc -> serv: registrar_inscricao(dados)  // dados incluem responsável (reutilizado) e criança
        serv -> model: criar_inscricao(dados)
        model -> bd: INSERT INTO inscricoes (todos os campos)
        bd --> model: nova inscrição salva (id, numero)
        model --> serv: objeto Inscricao

        serv -> hist: registrar_evento(nova_inscricao_id, 'criação', ...)
        hist -> bd: INSERT INTO historico ...
        bd --> hist: ok

        serv -> comp: gerar_pdf_json(inscricao)
        comp -> comp: Gera PDF (senha CPF) e JSON
        comp --> serv: caminhos dos arquivos

        serv --> cc: inscrição registrada + arquivos
        cc --> nav: Redireciona para /inscricao/sucesso/<id>
        nav --> op: Exibe tela de sucesso e pergunta sobre novo irmão
    end
else Operador responde "Não"
    op -> nav: Clica "Não" (ou "Ir para o início")
    nav -> cc: GET / (ou rota de saída)
    cc --> nav: Redireciona para a página inicial
end

@enduml