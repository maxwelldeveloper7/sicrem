@startuml
actor "Operador" as op
participant "Navegador" as nav
participant "ConsultaController" as cc
participant "InscricaoService" as serv
participant "Inscricao (Model)" as model
participant "ComprovanteService" as comp
participant "Historico (Model)" as hist
participant "Banco de Dados" as bd

== Consulta de Inscrições ==
op -> nav: Acessa /consulta
nav -> cc: GET /consulta
cc --> nav: Renderiza tela de consulta (formulário de filtros)

op -> nav: Preenche filtros (nome, CPF, unidade, ano, status)
op -> nav: Clica "Buscar"
nav -> cc: GET /consulta/buscar?filtros...
cc -> serv: buscar_inscricoes(filtros)
serv -> model: consultar(filtros)
model -> bd: SELECT * FROM inscricoes WHERE ...
bd --> model: resultados
model --> serv: lista de inscrições (resumidas)
serv --> cc: dados para tabela
cc --> nav: Renderiza tabela com resultados
nav --> op: Exibe lista de inscrições

== Visualização de Detalhes ==
op -> nav: Clica "Visualizar" em uma inscrição
nav -> cc: GET /consulta/<id>
cc -> serv: obter_inscricao(id)
serv -> model: buscar_por_id(id)
model -> bd: SELECT * FROM inscricoes WHERE id = :id
bd --> model: inscrição completa
model --> serv: objeto Inscricao
serv --> cc: dados da inscrição
cc --> nav: Renderiza página de detalhes
nav --> op: Exibe todos os dados

== Edição de Inscrição (apenas período ativo) ==
alt Período ativo
    op -> nav: Clica "Editar"
    nav -> cc: GET /inscricao/editar/<id>
    cc -> serv: obter_inscricao(id)
    serv -> model: buscar_por_id(id)
    model -> bd: SELECT ...
    bd --> model: inscrição
    model --> serv: objeto Inscricao
    serv --> cc: dados preenchidos
    cc --> nav: Renderiza formulário único preenchido

    op -> nav: Modifica campos desejados
    op -> nav: Clica "Salvar"
    nav -> cc: POST /inscricao/atualizar/<id> (dados alterados)
    cc -> serv: validar_campos(dados)
    serv --> cc: erros ou ok

    alt Campos inválidos
        cc --> nav: Mensagens de erro
        nav --> op: Exibe erros
    else Campos válidos
        cc -> serv: atualizar_inscricao(id, dados)
        serv -> model: salvar_alteracoes(inscricao)
        model -> bd: UPDATE inscricoes SET ... WHERE id = :id
        bd --> model: atualizado
        model --> serv: confirmação

        serv -> hist: registrar_alteracoes(inscricao_id, campos_alterados)
        hist -> bd: INSERT INTO historico ...
        bd --> hist: ok

        serv -> comp: gerar_pdf_json(inscricao)
        comp -> comp: Gera PDF e JSON sobrescrevendo
        comp --> serv: arquivos atualizados

        serv --> cc: sucesso + caminho comprovante
        cc --> nav: Redireciona para detalhes com mensagem de sucesso
        nav --> op: Exibe sucesso e botão para baixar comprovante
    end
else Período encerrado
    op -> nav: Tenta editar
    nav --> op: Mensagem "Campanha encerrada, somente leitura"
end

== Inativação de Inscrição (apenas período ativo) ==
alt Período ativo
    op -> nav: Na tela de detalhes, clica "Inativar"
    nav -> nav: Abre modal solicitando justificativa
    op -> nav: Digita justificativa e confirma
    nav -> cc: POST /inscricao/inativar/<id> (justificativa)
    cc -> serv: inativar_inscricao(id, justificativa)
    serv -> model: buscar_por_id(id)
    model -> bd: SELECT ...
    bd --> model: inscrição
    model --> serv: objeto
    serv -> model: atualizar_status(id, 'inativada', justificativa)
    model -> bd: UPDATE inscricoes SET status='inativada', justificativa_status=... WHERE id=:id
    bd --> model: atualizado
    serv -> hist: registrar_evento(inscricao_id, 'status', 'ativa' -> 'inativada')
    hist -> bd: INSERT INTO historico ...
    bd --> hist: ok
    serv --> cc: sucesso
    cc --> nav: Atualiza página com status inativada
    nav --> op: Exibe indicador de inativada
else Período encerrado
    op -> nav: Tenta inativar
    nav --> op: Mensagem "Operação não permitida fora da campanha"
end

@enduml