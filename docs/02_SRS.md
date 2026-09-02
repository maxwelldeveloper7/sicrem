# SRS — Sistema de Inscrição em Creches (Censo Anual de Demanda)

**Versão:** 1.0  
**Data:** Setembro de 2026  
**Licença:** GNU General Public License (GPL)

---

## Sumário

1. [Introdução](#1-introdução)  
   1.1 Finalidade  
   1.2 Escopo do Sistema  
   1.3 Definições, Acrônimos e Abreviações  
   1.4 Referências  
   1.5 Visão Geral do Documento

2. [Descrição Geral](#2-descrição-geral)  
   2.1 Perspectiva do Produto  
   2.2 Funções do Produto  
   2.3 Características dos Usuários  
   2.4 Restrições Gerais  
   2.5 Suposições e Dependências

3. [Requisitos Específicos](#3-requisitos-específicos)  
   3.1 Requisitos Funcionais  
   3.2 Requisitos de Interface Externa  
   3.3 Requisitos de Desempenho  
   3.4 Requisitos de Segurança  
   3.5 Requisitos de Banco de Dados  
   3.6 Requisitos de Backup e Recuperação  
   3.7 Requisitos de Usabilidade  
   3.8 Requisitos Legais e de Privacidade

4. [Regras de Negócio](#4-regras-de-negócio)

5. [Modelo de Dados](#5-modelo-de-dados)

6. [Histórico de Alterações](#6-histórico-de-alterações)

---

## 1. Introdução

### 1.1 Finalidade

Este documento especifica os requisitos de software para o **Sistema de Inscrição em Creches — Censo Anual de Demanda**. O sistema tem como finalidade realizar o levantamento anual de demanda por vagas em creches municipais, operando localmente na Secretaria Municipal de Educação.

### 1.2 Escopo do Sistema

O sistema cobre:

- Cadastro de unidades (creches) e turmas (realizado exclusivamente pelo suporte técnico).
- Registro de inscrições de crianças para um ano de referência (campanha anual).
- Cadastro de responsáveis e crianças durante o processo de inscrição.
- Verificação de duplicidade por CPF no ano vigente.
- Geração de comprovante de inscrição em PDF protegido por senha e arquivo JSON de backup.
- Consulta de inscrições com filtros.
- Geração de relatórios e exportação CSV.
- Controle de período de campanha (janela fixa de setembro a outubro).
- Mecanismos de backup do banco de dados e recuperação via JSON.

**Fora do escopo:**

- Alocação de vagas, chamada pública ou matrícula definitiva.
- Cadastro e edição de unidades/turmas pelo operador (feito apenas pelo suporte via rota oculta).
- Importação de dados de anos anteriores (prevista para versão futura, quando houver base histórica).
- Gestão de fila de atendimento (feita externamente por senha física).

### 1.3 Definições, Acrônimos e Abreviações

| Termo | Descrição |
|-------|-----------|
| **CPF** | Cadastro de Pessoa Física (documento brasileiro) |
| **SRS** | Software Requirements Specification (Especificação de Requisitos de Software) |
| **PRD** | Product Requirements Document (Documento de Requisitos de Produto) |
| **JSON** | JavaScript Object Notation (formato de intercâmbio de dados) |
| **PDF** | Portable Document Format (formato de documento) |
| **CSV** | Comma-Separated Values (valores separados por vírgula) |
| **LGPD** | Lei Geral de Proteção de Dados (Lei nº 13.709/2018) |
| **CRAS** | Centro de Referência de Assistência Social |
| **CREAS** | Centro de Referência Especializado de Assistência Social |
| **LOAS** | Lei Orgânica da Assistência Social (benefício) |
| **BPC** | Benefício de Prestação Continuada |
| **NIS** | Número de Identificação Social |
| **SUS** | Sistema Único de Saúde |

### 1.4 Referências

- PRD — Sistema de Inscrição em Creches (Censo Anual de Demanda), versão 5.1, setembro de 2026.
- Lei Geral de Proteção de Dados (LGPD), Lei nº 13.709/2018.

### 1.5 Visão Geral do Documento

As seções 2 e 3 apresentam a descrição geral e os requisitos específicos (funcionais e não funcionais). A seção 4 consolida as regras de negócio. A seção 5 descreve o modelo de dados. A seção 6 contém o histórico de alterações.

---

## 2. Descrição Geral

### 2.1 Perspectiva do Produto

O sistema é uma aplicação web local, executada em uma única máquina na Secretaria Municipal de Educação. Não depende de internet ou servidor remoto. O banco de dados é local, armazenado na mesma máquina. A interface é acessada via navegador.

### 2.2 Funções do Produto

O sistema oferece as seguintes funções principais:

- Autenticação local com senha única.
- Cadastro de unidades e turmas (restrito ao suporte).
- Registro e edição de inscrições durante o período de campanha.
- Verificação de duplicidade por CPF no ano vigente.
- Cálculo automático de idade e sugestão/bloqueio de turma.
- Cadastro de responsáveis e crianças, com reutilização de dados para irmãos.
- Geração de comprovante PDF e JSON de backup.
- Consulta de inscrições com filtros e reemissão de comprovante.
- Geração de relatórios (lista geral, lista por unidade, por turma/faixa etária, por critérios sociais) e exportação CSV.
- Controle automático do período de campanha.
- Histórico de alterações.
- Backup automático diário do banco.

### 2.3 Características dos Usuários

- **Operador**: único usuário do sistema. Responsável pelo atendimento presencial, cadastro de inscrições, consultas e geração de relatórios. Não possui acesso ao gerenciamento de unidades/turmas.
- **Suporte técnico**: responsável pela instalação, configuração, manutenção do banco, cadastro/edição de unidades e turmas, redefinição de senha do operador (diretamente no banco), restauração de backups e reimportação de JSONs.

### 2.4 Restrições Gerais

- O sistema opera em uma única máquina local.
- Período de campanha fixo: setembro a outubro de cada ano.
- Nenhuma inscrição pode ser excluída (apenas inativada ou reativada durante a campanha).
- O sistema não possui interface para importação de dados de anos anteriores (versão futura).
- A autenticação do operador não possui recuperação de senha pela interface (apenas suporte).
- O acesso ao gerenciamento de unidades/turmas é feito por rota oculta com senha de suporte.

### 2.5 Suposições e Dependências

- A máquina onde o sistema roda possui navegador web compatível e espaço em disco adequado.
- O operador tem conhecimento básico de informática.
- O CPF é documento obrigatório para todas as crianças atendidas.
- O backup diário automático é suficiente para recuperação primária; os JSONs fornecem camada extra.

---

## 3. Requisitos Específicos

### 3.1 Requisitos Funcionais

#### 3.1.1 Autenticação

**RF-01 – Login**  
O sistema deve apresentar tela de login solicitando a senha local. O usuário único é "operador".  
**RF-02 – Validação de senha**  
A senha deve ser armazenada em hash (ex.: bcrypt) no banco de dados local.  
**RF-03 – Bloqueio por tentativas**  
Após 5 tentativas inválidas consecutivas, o sistema deve bloquear o acesso por 5 minutos, exibindo mensagem de tempo restante.  
**RF-04 – Sem recuperação de senha**  
O sistema não deve oferecer funcionalidade de redefinição de senha. A redefinição é feita pelo suporte técnico diretamente no banco de dados.

#### 3.1.2 Cadastro de Unidades e Turmas

**RF-05 – Acesso restrito**  
O cadastro e edição de unidades e turmas é acessível somente via rota oculta (URL não linkada), exigindo senha de suporte adicional.  
**RF-06 – CRUD de unidades**  
O suporte pode cadastrar, editar e inativar unidades. Campos da unidade: `id` (auto), `nome`, `endereco`.  
**RF-07 – CRUD de turmas**  
O suporte pode cadastrar, editar e inativar turmas. Campos da turma: `id` (auto), `id_unidade`, `nome`, `idade_min_meses`, `idade_max_meses`.  
**RF-08 – Perenidade**  
Unidades e turmas não possuem vínculo com ano; são registros únicos e reutilizados em todas as campanhas.

#### 3.1.3 Período de Campanha

**RF-09 – Definição das datas**  
As datas de início e fim da campanha são definidas diretamente no banco de dados (tabela de configuração). Valores padrão: 1º de setembro a 31 de outubro.  
**RF-10 – Bloqueio automático**  
Ao atingir a data final, o sistema deve automaticamente entrar em modo somente leitura para o ano vigente, impedindo novas inscrições e edições. O desbloqueio para uma nova campanha requer alteração da configuração no banco.

#### 3.1.4 Início da Inscrição

**RF-11 – Entrada do CPF**  
O operador inicia a inscrição informando o CPF da criança. O campo possui máscara `111.222.333-44` e aceita apenas dígitos.  
**RF-12 – Validação do CPF**  
Ao perder o foco, o sistema deve validar:  
- Formato: exatamente 11 dígitos.  
- Dígitos verificadores (algoritmo oficial).  
Em caso de erro, exibir mensagem específica: "CPF deve conter 11 dígitos" ou "Número de CPF inválido".  
**RF-13 – Verificação de duplicidade no ano**  
O sistema deve verificar se já existe inscrição ativa (ou inativada) para o CPF no ano de referência corrente. Se existir, bloquear nova inscrição e exibir data, hora e unidade da inscrição existente.  
**RF-14 – Histórico**  
Se não houver inscrição no ano vigente, o sistema deve pesquisar histórico de anos anteriores. Na versão atual, não há importação automática; apenas exibir mensagem informando que não há dados importáveis.

> **Nota:** A funcionalidade de importação de dados imutáveis de anos anteriores será implementada em versão futura, quando houver base histórica.

#### 3.1.5 Cadastro do Responsável

**RF-15 – Formulário do responsável**  
O sistema deve apresentar formulário com os seguintes campos (todos obrigatórios, exceto quando indicado):  
- Nome completo  
- CPF (obrigatório, validado)  
- RG  
- Parentesco (mãe, pai, responsável legal, familiar, cuidador)  
- Telefone de contato  
- Endereço: logradouro, número, complemento, bairro, município, UF, CEP, ponto de referência  
- Situação socioeconômica (checkboxes, não obrigatórios):  
  - Mãe com vínculo empregatício  
  - Demonstrativo de crédito ou benefício  
  - LOAS / BPC / seguro-desemprego  
  - Trabalhador(a) autônomo(a)  
  - Mãe matriculada em rede pública de ensino  
  - Situação de vulnerabilidade social  
  - Declaração escolar de mãe adolescente  
- Renda per capita familiar (obrigatório, com máscara monetária, valor decimal positivo)  

**RF-16 – Validação de campos**  
Antes de prosseguir, o sistema deve validar: CPF do responsável válido, campos de identificação e endereço preenchidos, renda per capita numérica positiva. Exibir mensagens de erro específicas.

#### 3.1.6 Cadastro da Criança

**RF-17 – Formulário da criança**  
Após o responsável, apresentar formulário com:  
- Nome completo (obrigatório)  
- Data de nascimento (obrigatório)  
- CPF (pré-preenchido, somente leitura)  
- Nome do pai  
- Nome da mãe  
- Unidade pretendida (seleção obrigatória de lista de unidades ativas)  
- Turma pretendida (seleção obrigatória, com sugestão e bloqueio conforme RF-19)  
- Turno desejado (manhã, tarde, integral) – obrigatório  
- Situação documental (checkboxes opcionais):  
  - Certidão em que não conste pai ou mãe  
  - Irmão(ã) já matriculado(a) em unidade da rede  
- Encaminhamentos institucionais (checkboxes opcionais):  
  - Vara da Família  
  - Conselho Tutelar  
  - CRAS  
  - CREAS  
  - Casa de acolhimento  
- Dados sociais e de saúde (opcionais):  
  - NIS  
  - Número do cartão SUS  
  - Laudo de deficiência ou neoplasia  
  - Laudo de intolerância alimentar  
  - Laudo de neurodivergência  

**RF-18 – Cálculo de idade**  
O sistema deve calcular a idade em meses completos com base na data de nascimento e no corte etário de 31 de março do ano de referência.

**RF-19 – Sugestão e bloqueio de turma**  
Com base na unidade selecionada e na idade calculada, o sistema deve:  
- Filtrar as turmas da unidade cuja faixa etária (`idade_min_meses`, `idade_max_meses`) inclua a idade em meses.  
- Exibir para seleção as turmas compatíveis.  
- Bloquear seleção de turma incompatível.  
- Se nenhuma turma for compatível, exibir mensagem e impedir o prosseguimento (turma obrigatória).  
- Ao alterar a data de nascimento, recalcular idade, limpar seleção de turma se incompatível e alertar o operador.

#### 3.1.7 Cadastro de Irmãos

**RF-20 – Pergunta de irmão**  
Após concluir o cadastro de uma criança, o sistema deve perguntar: "Deseja cadastrar irmão(ã) desta criança?"  
**RF-21 – Reutilização de dados**  
Se positivo, abrir novo formulário de inscrição com os dados do responsável pré-preenchidos (referenciando o mesmo registro ou copiando os valores). Os campos Nome do Pai e Nome da Mãe são pré-preenchidos com os valores da criança anterior.  
**RF-22 – Comportamento onFocus**  
Ao clicar em qualquer campo do responsável ou filiação (Nome do Pai, Nome da Mãe, etc.), o campo deve ser limpo automaticamente para nova digitação. Os demais campos permanecem inalterados.  
**RF-23 – Validação do CPF do responsável**  
Se o CPF for alterado, deve ser validado novamente.  
**RF-24 – Sem limite de irmãos**  
O sistema não impõe limite máximo de irmãos cadastrados consecutivamente.

#### 3.1.8 Conferência e Registro da Inscrição

**RF-25 – Resumo de conferência**  
Antes de salvar, exibir resumo completo com todos os dados informados (responsável, criança, situação socioeconômica, documentos, encaminhamentos, dados sociais/saúde, unidade, turma, turno). Campos lógicos (checkboxes) aparecem somente se marcados como verdadeiros.  
**RF-26 – Possibilidade de edição**  
O operador pode voltar a qualquer seção para corrigir dados.  
**RF-27 – Registro**  
Ao confirmar, o sistema deve gravar a inscrição vinculada ao ano de referência, com número de inscrição gerado automaticamente (sequencial por ano).  
**RF-28 – Geração de comprovante e JSON**  
Simultaneamente ao registro, gerar:  
- PDF do comprovante (nome do arquivo: `comprovante_CPF_ANO.pdf`) com senha igual ao CPF da criança (apenas dígitos).  
- JSON de backup (nome do arquivo: `inscricao_CPF_ANO.json`) contendo todos os campos da inscrição, incluindo nulos, no diretório definido na instalação.

#### 3.1.9 Edição e Inativação de Inscrições

**RF-29 – Edição durante campanha**  
O operador pode editar qualquer campo da inscrição durante o período ativo. Ao salvar a edição, o sistema deve:  
- Atualizar o JSON correspondente (sobrescrever).  
- Gerar novo PDF (sobrescrever) e exibir mensagem alertando o operador para entregar o comprovante atualizado ao responsável.  
- Registrar a alteração no histórico (seção 3.1.11).  
**RF-30 – Inativação**  
O operador pode inativar uma inscrição acessando o cadastro e clicando em "Inativar". O sistema deve exigir justificativa (campo texto obrigatório). Uma inscrição inativada:  
- Permanece visível nas consultas com indicador visual.  
- Não é considerada nos relatórios por padrão, mas pode ser incluída se o filtro de status for ajustado.  
- Não libera o CPF para nova inscrição no mesmo ano.  
**RF-31 – Reativação**  
Inscrições inativadas podem ser reativadas somente durante o período ativo, mediante justificativa. O evento deve ser registrado no histórico.  

#### 3.1.10 Consulta de Inscrições

**RF-32 – Critérios de busca**  
O sistema deve permitir busca por:  
- Nome da criança (parcial)  
- CPF da criança  
- Número da inscrição  
- Unidade (seleção)  
- Ano de referência (filtro opcional)  

**RF-33 – Visualização**  
Exibir lista de inscrições correspondentes com status (ativa/inativada). Ao selecionar uma, mostrar todos os dados completos.  
**RF-34 – Reemissão de comprovante**  
Permitir reemitir o comprovante (PDF) e o JSON, sobrescrevendo os arquivos existentes.

#### 3.1.11 Histórico de Alterações

**RF-35 – Registro automático**  
O sistema deve registrar automaticamente eventos de criação e edição de inscrições, unidades e turmas, com:  
- Data e hora  
- Entidade afetada (inscrição, unidade, turma)  
- Identificador do registro  
- Campo alterado, valor anterior e novo (para edições)  
**RF-36 – Consulta do histórico**  
O histórico deve ser consultável por unidade, por criança e por ano.

#### 3.1.12 Relatórios e Exportação

**RF-37 – Lista geral de inscritos por ano**  
Relatório contendo número da inscrição, nome da criança, unidade, turma pretendida, data da inscrição. Ordenação: agrupado por unidade, depois por turma, e dentro de cada turma ordem crescente pelo nome da criança.  
**RF-38 – Lista de inscritos por unidade**  
Relatório individual por unidade, com todos os dados da inscrição (todos os campos, inclusive vazios). Ordenação: agrupado por turma e nome crescente.  
**RF-39 – Relatório por turma/faixa etária**  
Listagem de inscrições filtradas por turma pretendida ou faixa etária, com ordenação padrão (unidade, turma, nome).  
**RF-40 – Relatório por critérios sociais**  
Relatório com todas as colunas da inscrição, com filtros por critérios sociais (renda, vulnerabilidade, benefícios, encaminhamentos). Ordenação padrão (unidade, turma, nome).  
**RF-41 – Filtros**  
Todos os relatórios devem permitir filtro por unidade e ano de referência. O relatório por critérios sociais deve ter filtros específicos para cada critério social.  
**RF-42 – Exportação CSV**  
Todos os relatórios podem ser exportados em CSV com separador vírgula e cabeçalho.  
**RF-43 – Exibição em tela**  
Os relatórios são exibidos em tela (HTML) e podem ser impressos ou exportados.  
**RF-44 – Padrão de status**  
Por padrão, os relatórios incluem apenas inscrições ativas. O operador pode optar por incluir inativadas.

#### 3.1.13 Backup do Banco de Dados

**RF-45 – Backup automático**  
O sistema deve realizar backup automático do banco de dados diariamente às 11:00, copiando o arquivo do banco para o diretório `/home/operador/sicrem/backups_banco` (definido na instalação).  
**RF-46 – Sem mensagem ao usuário**  
O backup automático não deve exibir mensagens ao operador.  
**RF-47 – Restauração manual**  
A restauração do banco a partir dos backups é feita manualmente pelo suporte técnico, sem interface específica no sistema.

#### 3.1.14 Recuperação via JSON

**RF-48 – Geração obrigatória**  
A cada criação ou edição de inscrição, o sistema deve gerar/atualizar o JSON correspondente no diretório de backups.  
**RF-49 – Conteúdo do JSON**  
O JSON deve conter todos os campos das tabelas de banco relacionadas à inscrição, incluindo valores nulos.  
**RF-50 – Reimportação manual**  
O suporte técnico pode reimportar inscrições a partir dos JSONs usando ferramenta externa. O processo deve:  
- Ler o JSON.  
- Verificar se o registro já existe no banco (pelo número da inscrição ou CPF + ano).  
- Se não existir, converter os dados em comandos SQL INSERT e executar no banco.

### 3.2 Requisitos de Interface Externa

**RE-01 – Interface web**  
O sistema deve ser acessado via navegador, com páginas HTML/CSS/JavaScript.  
**RE-02 – Máscaras**  
- CPF: `111.222.333-44` (apenas dígitos).  
- Telefone: máscara genérica (ex.: `(11) 91234-5678`).  
- CEP: `12345-678`.  
- Renda per capita: máscara monetária (ex.: `1.234,56`).  

**RE-03 – Mensagens de erro**  
Todas as mensagens de erro devem ser claras e orientadas à ação. Ex.: "Número de CPF inválido", "Turma incompatível com a idade", etc.

### 3.3 Requisitos de Desempenho

**RD-01 – Volume de dados**  
O sistema deve suportar até 400 inscrições por ano, com resposta de tela em menos de 2 segundos em hardware típico de escritório.  
**RD-02 – Armazenamento local**  
O banco de dados local deve ser dimensionado para armazenar pelo menos 10 anos de inscrições sem degradação.

### 3.4 Requisitos de Segurança

**RS-01 – Senha do operador**  
A senha deve ser armazenada como hash forte (ex.: bcrypt com custo ≥ 10).  
**RS-02 – Senha do suporte**  
A rota oculta de gerenciamento deve exigir senha de suporte adicional, também armazenada de forma segura.  
**RS-03 – Proteção de comprovante**  
O PDF do comprovante deve ser protegido por senha igual ao CPF da criança (somente dígitos).  
**RS-04 – Sem HTTPS**  
Por ser aplicação local sem tráfego externo, não é necessário HTTPS.  
**RS-05 – Dados sensíveis**  
Dados de saúde e sociais devem ser armazenados localmente com controle de acesso físico à máquina. O sistema não transmite dados pela rede.

### 3.5 Requisitos de Banco de Dados

**RB-01 – SGBD**  
O banco de dados deve ser local e relacional (ex.: SQLite ou PostgreSQL), conforme definido na implementação.  
**RB-02 – Armazenamento de CPF**  
CPFs devem ser armazenados como string de 11 dígitos, sem pontuação.  
**RB-03 – Armazenamento de datas**  
Datas devem ser armazenadas no formato ISO (`YYYY-MM-DD`).  
**RB-04 – Armazenamento de renda**  
Renda per capita deve ser armazenada como `DECIMAL(10,2)`.  
**RB-05 – Campos lógicos**  
Checkboxes devem ser armazenados como booleanos (`TRUE`/`FALSE`).  
**RB-06 – Tabelas**  
O modelo mínimo deve incluir:  
- `unidades` (id, nome, endereco, ativo)  
- `turmas` (id, id_unidade, nome, idade_min_meses, idade_max_meses, ativo)  
- `responsaveis` (id, nome, cpf, rg, parentesco, telefone, endereco..., renda_per_capita, ...)  
- `criancas` (id, nome, data_nascimento, cpf, nome_pai, nome_mae, ...)  
- `inscricoes` (id, ano_referencia, numero, data_registro, status, id_responsavel, id_crianca, id_unidade, id_turma, turno, ...)  
- `historico` (id, data_hora, entidade, registro_id, campo, valor_anterior, valor_novo, operador)  
- `configuracoes` (chave, valor) – para datas de campanha, diretórios, etc.

### 3.6 Requisitos de Backup e Recuperação

**RR-01 – Backup diário**  
Backup automático do arquivo do banco às 11:00 para diretório definido na instalação.  
**RR-02 – Backup em JSON**  
Geração obrigatória de JSON por inscrição, sobrescrito em edições.  
**RR-03 – Retenção**  
Os backups diários devem ser mantidos por pelo menos 30 dias; os JSONs devem ser mantidos indefinidamente (ou conforme política local).  
**RR-04 – Restauração**  
Documentar procedimento de restauração para o suporte, incluindo reimportação de JSONs.

### 3.7 Requisitos de Usabilidade

**RU-01 – Preenchimento automático**  
Sempre que possível, pré-preencher campos (CPF, turma sugerida, dados de irmãos).  
**RU-02 – Navegação simples**  
Formulários em etapas claras, com botões "Voltar" e "Avançar".  
**RU-03 – Mensagens de erro**  
Mensagens específicas e acionáveis.  
**RU-04 – Acessibilidade**  
Garantir contraste adequado e tamanhos de fonte legíveis.

### 3.8 Requisitos Legais e de Privacidade

**RL-01 – LGPD**  
O sistema deve garantir a confidencialidade e integridade dos dados pessoais e sensíveis, com armazenamento local seguro e controle de acesso.  
**RL-02 – Rastreabilidade**  
Todas as alterações devem ser registradas no histórico (campo, valor anterior/novo, data, operador).  
**RL-03 – Não exclusão**  
Nenhum dado de inscrição pode ser excluído definitivamente; apenas inativado.

---

## 4. Regras de Negócio

| # | Regra |
|---|-------|
| 1 | O CPF da criança é o identificador único por ano de referência. |
| 2 | Uma mesma criança pode ter inscrições em anos diferentes, mas nunca duas no mesmo ano. |
| 3 | O CPF é obrigatório para iniciar a inscrição e deve ser validado. |
| 4 | A idade da criança é calculada em meses completos com base no corte de 31/março do ano de referência. |
| 5 | O sistema sugere turmas compatíveis e bloqueia seleções incompatíveis. |
| 6 | Campos lógicos (checkboxes) aparecem no resumo apenas quando verdadeiros. |
| 7 | Edições permitidas apenas durante o período ativo da campanha (set-out). Após o fim, modo somente leitura. |
| 8 | Nenhuma inscrição pode ser excluída; pode ser inativada ou reativada (durante a campanha). |
| 9 | A inativação não libera CPF para nova inscrição no mesmo ano. |
| 10 | O comprovante é gerado em PDF com senha (CPF) + JSON de backup obrigatório. |
| 11 | O turno desejado é armazenado na inscrição, não na turma. |
| 12 | O cadastro de irmãos reutiliza dados do responsável e pré-preenche filiação. |
| 13 | A renda per capita é campo obrigatório e deve ser positiva. |
| 14 | Unidades e turmas são perenes e gerenciadas apenas pelo suporte. |

---

## 5. Modelo de Dados

A seguir, a descrição das tabelas principais (os tipos de dados são sugestões; o banco pode ser SQLite ou outro).

**Tabela `unidades`**

| Campo | Tipo | Observações |
|-------|------|-------------|
| id | INTEGER PK | Auto incremento |
| nome | VARCHAR(150) | Obrigatório |
| endereco | VARCHAR(300) | Obrigatório |
| ativo | BOOLEAN | Default TRUE |

**Tabela `turmas`**

| Campo | Tipo | Observações |
|-------|------|-------------|
| id | INTEGER PK | Auto incremento |
| id_unidade | INTEGER FK | Referência a unidades.id |
| nome | VARCHAR(100) | Ex.: "Berçário I" |
| idade_min_meses | INTEGER | Obrigatório |
| idade_max_meses | INTEGER | Obrigatório |
| ativo | BOOLEAN | Default TRUE |

**Tabela `responsaveis`**

| Campo | Tipo | Observações |
|-------|------|-------------|
| id | INTEGER PK | Auto incremento |
| nome | VARCHAR(150) | Obrigatório |
| cpf | CHAR(11) | Obrigatório, único |
| rg | VARCHAR(20) | |
| parentesco | VARCHAR(50) | Obrigatório |
| telefone | VARCHAR(20) | Obrigatório |
| end_logradouro | VARCHAR(150) | |
| end_numero | VARCHAR(10) | |
| end_complemento | VARCHAR(50) | |
| end_bairro | VARCHAR(100) | |
| end_municipio | VARCHAR(100) | |
| end_uf | CHAR(2) | |
| end_cep | CHAR(8) | |
| end_referencia | VARCHAR(150) | |
| mae_vinculo_empregaticio | BOOLEAN | Default FALSE |
| demonstrativo_credito | BOOLEAN | Default FALSE |
| loas_bpc_seguro | BOOLEAN | Default FALSE |
| trabalhador_autonomo | BOOLEAN | Default FALSE |
| mae_matriculada | BOOLEAN | Default FALSE |
| vulnerabilidade_social | BOOLEAN | Default FALSE |
| declaracao_escolar_mae_adolescente | BOOLEAN | Default FALSE |
| renda_per_capita | DECIMAL(10,2) | Obrigatório |

**Tabela `criancas`**

| Campo | Tipo | Observações |
|-------|------|-------------|
| id | INTEGER PK | Auto incremento |
| nome | VARCHAR(150) | Obrigatório |
| data_nascimento | DATE | Obrigatório |
| cpf | CHAR(11) | Obrigatório |
| nome_pai | VARCHAR(150) | |
| nome_mae | VARCHAR(150) | |
| certidao_sem_pai_mae | BOOLEAN | Default FALSE |
| irmao_matriculado | BOOLEAN | Default FALSE |
| vara_familia | BOOLEAN | Default FALSE |
| conselho_tutelar | BOOLEAN | Default FALSE |
| cras | BOOLEAN | Default FALSE |
| creas | BOOLEAN | Default FALSE |
| casa_acolhimento | BOOLEAN | Default FALSE |
| nis | VARCHAR(20) | |
| cartao_sus | VARCHAR(20) | |
| laudo_deficiencia | BOOLEAN | Default FALSE |
| laudo_intolerancia | BOOLEAN | Default FALSE |
| laudo_neurodivergencia | BOOLEAN | Default FALSE |

**Tabela `inscricoes`**

| Campo | Tipo | Observações |
|-------|------|-------------|
| id | INTEGER PK | Auto incremento |
| ano_referencia | INTEGER | Obrigatório (ex.: 2027) |
| numero | INTEGER | Sequencial por ano, gerado automaticamente |
| data_registro | DATETIME | Data/hora da criação |
| status | VARCHAR(20) | 'ativa' ou 'inativada' (default 'ativa') |
| id_responsavel | INTEGER FK | Referência a responsaveis.id |
| id_crianca | INTEGER FK | Referência a criancas.id |
| id_unidade | INTEGER FK | Referência a unidades.id |
| id_turma | INTEGER FK | Referência a turmas.id |
| turno | VARCHAR(10) | 'manhã', 'tarde', 'integral' (obrigatório) |
| justificativa_status | TEXT | Usado na inativação/reativação |

**Tabela `historico`**

| Campo | Tipo | Observações |
|-------|------|-------------|
| id | INTEGER PK | Auto incremento |
| data_hora | DATETIME | |
| entidade | VARCHAR(30) | 'inscricao', 'unidade', 'turma' |
| registro_id | INTEGER | ID do registro alterado |
| campo | VARCHAR(50) | |
| valor_anterior | TEXT | |
| valor_novo | TEXT | |
| operador | VARCHAR(20) | 'operador' |

**Tabela `configuracoes`**

| Campo | Tipo | Observações |
|-------|------|-------------|
| chave | VARCHAR(50) | Ex.: 'campanha_inicio', 'campanha_fim', 'diretorio_backup_json', 'diretorio_backup_banco' |
| valor | TEXT | |

---

## 6. Histórico de Alterações

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | Set/2026 | Versão inicial do SRS, derivada do PRD v5.1 e respostas do questionário interativo. |
