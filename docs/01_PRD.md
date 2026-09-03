# PRD — Sistema de Inscrição em Creches (Censo Anual de Demanda)
## Documento de Requisitos de Produto

**Versão:** 5.2 (revisão após definições de arquitetura e SRS)  
**Licença:** GNU General Public License (GPL)  
**Última revisão:** Setembro de 2026

---

## Sumário

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Problema a Ser Resolvido](#2-problema-a-ser-resolvido)
3. [Usuário do Sistema](#3-usuário-do-sistema)
4. [Fluxo Principal do Sistema](#4-fluxo-principal-do-sistema)
5. [Funcionalidades do Sistema](#5-funcionalidades-do-sistema)
6. [Cadastro do Responsável](#6-cadastro-do-responsável) *(agora parte do formulário único)*
7. [Cadastro da Criança](#7-cadastro-da-criança) *(idem)*
8. [Cadastro de Irmãos](#8-cadastro-de-irmãos)
9. [Conferência da Inscrição](#9-conferência-da-inscrição)
10. [Comprovante de Inscrição e Backup Lógico](#10-comprovante-de-inscrição-e-backup-lógico)
11. [Consulta de Inscrições](#11-consulta-de-inscrições)
12. [Relatórios e Distribuição às Unidades](#12-relatórios-e-distribuição-às-unidades)
13. [Regras de Negócio Consolidadas](#13-regras-de-negócio-consolidadas)
14. [Requisitos Não Funcionais](#14-requisitos-não-funcionais)
15. [Registro de Alterações (Histórico)](#15-registro-de-alterações-histórico)
16. [Regras Operacionais](#16-regras-operacionais)
17. [Decisões de Escopo](#17-decisões-de-escopo)

---

## 1. Visão Geral do Produto

*(mantida igual à versão 5.1)*

---

## 2. Problema a Ser Resolvido

*(mantida igual)*

---

## 3. Usuário do Sistema

O sistema possui **dois perfis de usuário**:

- **Operador** — funcionário da Secretaria Municipal de Educação responsável pelo atendimento e registro das inscrições.
- **Suporte Técnico** — responsável pela configuração inicial, manutenção, cadastro de unidades e turmas, restauração de backups e reimportação de JSONs.

**Permissões do Operador:**
- registrar inscrições (formulário único contendo responsável e criança)
- editar inscrições **durante o período ativo da campanha**
- inativar/reativar inscrições durante a campanha
- consultar inscrições (inclusive de anos anteriores)
- reemitir comprovantes de inscrição
- gerar relatórios e listas por unidade
- exportar CSV

**Permissões do Suporte Técnico:**
- cadastrar/editar/inativar unidades (creches) e turmas via rota oculta (senha de suporte)
- redefinir senha do operador (diretamente no banco)
- restaurar backup do banco
- reimportar inscrições a partir de JSONs

**Restrições (ambos):**
- não é possível excluir inscrições já registradas
- após o encerramento do período de campanha, o sistema entra em modo **somente leitura** para aquele ano

> As unidades escolares não possuem login nem acesso ao sistema — recebem apenas a lista de inscritos referente a si, fornecida pelo Operador.

---

## 4. Fluxo Principal do Sistema

1. abrir a aplicação (login com usuário "operador" e senha local)
2. [NOVO] O Ano de Referência é definido no banco (configuração). O sistema já inicia com o ano configurado.
3. [NOVO] Unidades e turmas já estão cadastradas pelo suporte (não fazem parte do fluxo normal do operador)
4. iniciar inscrição informando o CPF da criança
5. sistema verifica duplicidade no ano vigente; se existir, bloqueia e mostra dados da inscrição existente
6. [NOVO] Se não existir, abre o **formulário único de inscrição** com todas as seções (responsável, criança, solicitação)
7. cadastrar irmãos (se houver), reutilizando dados do responsável (nova inscrição com dados copiados)
8. conferir dados da inscrição no resumo
9. editar informações se necessário (somente durante o período ativo)
10. registrar inscrição vinculada ao Ano de Referência (gravação única na tabela `inscricoes`)
11. gerar comprovante em PDF + arquivo JSON de backup
12. entregar comprovante ao responsável
13. consultar inscrições
14. gerar relatórios e listas por unidade

---

## 5. Funcionalidades do Sistema

### 5.1 Autenticação (Simplificada)

**Campos:**
- nome de usuário (fixo: "operador")
- senha local de acesso

**Comportamento:**
- solicitar credenciais ao abrir a aplicação
- senha armazenada como hash bcrypt no banco local
- após 5 tentativas inválidas consecutivas, bloquear acesso por 5 minutos
- [NOVO] Não há funcionalidade de redefinição de senha pela interface; apenas suporte técnico pode alterar diretamente no banco
- [NOVO] Login do suporte para rota oculta: usuário "suporte" com senha própria

---

### 5.2 Cadastro de Unidades (Creches)

**Responsável:** Suporte Técnico (via rota oculta `/suporte`)

**Campos da unidade:**
- nome da unidade
- endereço completo

> O campo `id` é gerado automaticamente pelo sistema como chave primária, sem intervenção do Operador.

---

### 5.3 Cadastro de Turmas

**Responsável:** Suporte Técnico (via rota oculta)

Cada turma é vinculada a uma unidade.

**Campos da turma:**
- unidade (creche) — seleção em lista
- nome da turma (ex.: Berçário I, Berçário II, 1º Período, 2º Período)
- faixa etária mínima (em meses completos em 31/03)
- faixa etária máxima (em meses completos em 31/03)

> **[NOVO] Campo removido:** turno — o turno desejado é armazenado na inscrição, não na turma.  
> **Campo removido:** número de vagas — este dado não é utilizado.

---

### 5.4 Regra de Corte Etário

A elegibilidade da criança considera o **corte etário de 31 de março do Ano de Referência** (definido na configuração).

**Comportamento do sistema:**
- calcular automaticamente a idade em **meses completos** na data de corte com base na data de nascimento
- sugerir a turma compatível, dentro da unidade selecionada, com a faixa etária calculada
- bloquear seleção de turma incompatível, exibindo mensagem explicativa
- [NOVO] Se a data de nascimento for alterada, recalcular idade e limpar seleção de turma se ficar incompatível

---

### 5.5 Período de Inscrição e Início da Inscrição

O período de inscrição é **fixo**: **setembro a outubro** de cada ano. As datas exatas são definidas no banco de dados pelo suporte. O sistema não permite novos cadastros ou edições fora desta janela (apenas consultas).

**Início da inscrição:** o Operador informa o **CPF da criança**.

**Comportamento do sistema:**

1. Verificar se já existe inscrição associada ao CPF **para o Ano de Referência vigente**.
2. **Se existir:** bloquear nova inscrição e exibir data, horário e unidade da inscrição já registrada neste ano.
3. **Se não existir para o ano vigente:** pesquisar no histórico (anos anteriores).
   - [NOVO] Na versão atual, **não há importação automática de dados históricos** (funcionalidade prevista para versão futura). O sistema apenas informa que a criança possui inscrições anteriores, mas o cadastro inicia em branco.
4. O Operador preenche o **formulário único de inscrição** com todos os dados.

> **Nota:** A futura importação de dados históricos **não edita nem apaga** os registros antigos — ela apenas copia os valores para criar um novo registro no ano vigente.

---

### 5.6 Formulário Único de Inscrição

**[NOVO]** Toda a inscrição (responsável + criança + solicitação de vaga) é feita em um **único formulário**, com seções visualmente separadas mas submetido de uma só vez. Não há salvamento intermediário.

As seções são:

**Seção 1 – Dados do Responsável** (ver seção 6 abaixo)  
**Seção 2 – Dados da Criança** (ver seção 7 abaixo)  
**Seção 3 – Solicitação de Vaga** (unidade, turma, turno)  
**Seção 4 – Situação Socioeconômica** (checkboxes e renda per capita)  
**Seção 5 – Documentos e Encaminhamentos** (checkboxes e campos opcionais)

Após preencher, o operador clica em "Conferir Resumo".

---

## 6. Cadastro do Responsável

*(agora faz parte do formulário único, mas mantém os campos listados)*

### 6.1 Dados de Identificação

- nome completo (obrigatório)
- CPF (obrigatório, validado)
- RG
- parentesco com a criança (mãe, pai, responsável legal, familiar, cuidador)
- telefone de contato (obrigatório)

### 6.2 Endereço

- logradouro, número, complemento, bairro
- município e UF
- CEP
- ponto de referência

### 6.3 Situação Socioeconômica

Coletadas para fins de planejamento interno da rede de creches.

- mãe com vínculo empregatício
- demonstrativo de crédito ou benefício
- LOAS / BPC / seguro-desemprego
- trabalhador(a) autônomo(a)
- mãe matriculada em rede pública de ensino
- situação de vulnerabilidade social
- declaração escolar de mãe adolescente
- **renda per capita familiar (obrigatória)** [NOVO: explícito obrigatório]

---

## 7. Cadastro da Criança

*(agora faz parte do formulário único)*

### 7.1 Identificação

- nome completo
- data de nascimento
- CPF (pré-preenchido a partir do início da inscrição, somente leitura)
- nome do pai
- nome da mãe

### 7.2 Solicitação de Vaga

- unidade (creche) pretendida — o responsável pode escolher livremente qualquer unidade da rede
- turma pretendida (sugerida automaticamente pelo sistema com base na unidade selecionada e no corte etário; seleção incompatível é bloqueada)
- [NOVO] turno desejado (manhã, tarde ou integral) — campo obrigatório, independente da turma

### 7.3 Situação Documental

- certidão em que não conste pai ou mãe
- irmão(ã) já matriculado(a) em unidade da rede

### 7.4 Encaminhamentos Institucionais

- Vara da Família
- Conselho Tutelar
- CRAS
- CREAS
- Casa de acolhimento

### 7.5 Dados Sociais e de Saúde

- NIS (Número de Identificação Social)
- número do cartão SUS
- laudo de deficiência ou neoplasia
- laudo de intolerância alimentar
- laudo de neurodivergência

---

## 8. Cadastro de Irmãos

Após concluir o cadastro de uma inscrição, o sistema pergunta:

> **Deseja cadastrar irmão(ã) desta criança?**

Se positivo:
- abre **um novo formulário único** de inscrição, **pré-preenchido com todos os dados do responsável** da inscrição anterior
- os campos **Nome do Pai** e **Nome da Mãe** vêm pré-preenchidos com os valores da criança anterior
- o Operador pode **clicar diretamente sobre qualquer campo** que deseje alterar. Ao clicar, o campo é limpo automaticamente (evento `onFocus`), permitindo nova digitação sem precisar apagar manualmente
- os campos que não forem clicados mantêm os valores pré-preenchidos

**Exemplo:** Se o pai for diferente, o Operador clica no campo "Nome do Pai", ele se esvazia, e digita o nome correto. O campo "Nome da Mãe" permanece inalterado.

> [NOVO] A nova inscrição para o irmão é um registro independente, com seu próprio CPF e dados da criança, mas copia os dados do responsável.

---

## 9. Conferência da Inscrição

Antes de salvar, o sistema exibe um **resumo completo das informações registradas**:

- dados do responsável
- dados da criança
- situação socioeconômica informada
- documentos informados
- encaminhamentos institucionais informados
- dados sociais e de saúde informados
- unidade, turma e turno pretendidos

> Campos lógicos (checkboxes, flags) aparecem no resumo **apenas quando marcados como verdadeiros**.

O Operador pode voltar a qualquer seção para corrigir informações antes de confirmar o registro.

---

## 10. Comprovante de Inscrição e Backup Lógico

*(mantido igual, exceto pequenos ajustes)*

### 10.1 Conteúdo

**Identificação da inscrição:**
- número da inscrição
- data e hora do registro
- ano de referência (ex.: 2027)

**Dados da criança:**
- nome completo, CPF, data de nascimento, nome do pai, nome da mãe

**Dados do responsável:**
- nome completo, CPF, telefone, endereço

**Solicitação:**
- unidade, turma e turno pretendidos [NOVO: incluído turno]

### 10.2 Formato

- impresso diretamente na máquina local
- gerado em PDF para download ou reimpressão

### 10.3 Segurança do PDF e Backup Lógico

- O PDF do comprovante é gerado com proteção por senha baseada no CPF da criança (apenas dígitos). Serve para controle de distribuição — os dados ficam armazenados localmente no banco de dados da máquina.
- **Simultaneamente à geração do PDF**, o sistema cria um arquivo **JSON** no mesmo diretório, contendo **todos os campos da inscrição** em formato estruturado e legível (sem criptografia).
- **Finalidade do JSON:** servir como **fonte de recuperação de desastres**. Caso o banco de dados local corrompa, o Suporte Técnico pode reimportar as inscrições a partir dos JSONs armazenados, sem perda de informações.
- O nome do arquivo JSON segue o padrão: `inscricao_CPF_ANO.json` (ex: `inscricao_12345678900_2027.json`).
- [NOVO] A cada edição da inscrição, o JSON e o PDF correspondentes são sobrescritos.

---

## 11. Consulta de Inscrições

### 11.1 Critérios de Busca

- nome da criança
- CPF da criança
- número da inscrição
- unidade (creche)
- ano de referência (filtro opcional)

### 11.2 Funcionalidades

- visualizar dados completos da inscrição selecionada
- reemitir comprovante de inscrição (PDF + JSON)
- [NOVO] indicador visual de status (ativa/inativada)

---

## 12. Relatórios e Distribuição às Unidades

### 12.1 Tipos de Relatórios

**Lista geral de inscritos por ano:**
- número da inscrição, nome da criança, unidade, turma pretendida, data da inscrição, **turno** [NOVO]
- Ordenação: agrupado por unidade, depois por turma, e dentro de cada turma **ordem crescente pelo nome da criança**

**Lista de inscritos por unidade** (para envio à respectiva creche):
- **todos os dados da inscrição** (inclusive campos vazios)
- Ordenação: agrupado por turma e nome crescente

**Inscrições por turma pretendida ou faixa etária:**
- subsidia o planejamento da oferta de vagas
- Ordenação padrão (unidade, turma, nome)

**Relatórios por critérios sociais:**
- renda per capita, situação de vulnerabilidade social, benefícios sociais declarados, encaminhamentos institucionais registrados
- Ordenação padrão (unidade, turma, nome)

### 12.2 Filtros

Todos os relatórios devem permitir filtragem por **unidade**, **ano de referência** e, quando aplicável, **faixa etária** e **turno**.  
[NOVO] Por padrão, os relatórios incluem **apenas inscrições ativas**. O operador pode optar por incluir inativadas.

### 12.3 Exportação

- **todos os relatórios** podem ser exportados em **CSV** com separador vírgula e cabeçalho
- a lista de inscritos por unidade pode ser impressa ou exportada para envio à creche correspondente

---

## 13. Regras de Negócio Consolidadas

| # | Regra |
| :--- | :--- |
| 1 | O CPF da criança é o identificador único **por ano de referência**. |
| 2 | Uma mesma criança pode ter inscrições em anos diferentes (ex.: 2026 e 2027), mas nunca duas no mesmo ano. |
| 3 | O CPF é campo obrigatório para iniciar o processo de inscrição e deve ser validado (dígitos verificadores). |
| 4 | A idade da criança é calculada em **meses completos** com base no corte etário de **31 de março do Ano de Referência**. |
| 5 | O sistema sugere a turma compatível (com base na unidade selecionada e na idade) e bloqueia seleções incompatíveis. |
| 6 | Campos lógicos (checkboxes) aparecem no resumo apenas quando verdadeiros. |
| 7 | **Edições:** permitidas **apenas durante o período ativo da campanha** (set-out). Após a data limite, o sistema fica em modo leitura para todos os registros daquele ano. |
| 8 | [NOVO] A importação de dados históricos **não está disponível na versão atual**; será implementada futuramente sem editar registros antigos. |
| 9 | Nenhuma inscrição pode ser excluída (apenas inativada, com justificativa, ou reativada durante a campanha). |
| 10 | O comprovante é gerado em PDF com senha + JSON de backup obrigatório, sobrescritos em edições. |
| 11 | [NOVO] O turno desejado é armazenado na inscrição, não na turma. |
| 12 | [NOVO] O cadastro de irmãos reutiliza dados do responsável, gerando nova inscrição independente. |
| 13 | [NOVO] A renda per capita é campo obrigatório e deve ser positiva. |
| 14 | [NOVO] Unidades e turmas são perenes e gerenciadas apenas pelo suporte técnico. |
| 15 | [NOVO] Todos os dados da inscrição (responsável, criança, solicitação) são armazenados em uma única tabela `inscricoes`. |

---

## 14. Requisitos Não Funcionais

### Segurança

- senha local de acesso à aplicação (usuário "operador", hash bcrypt, bloqueio de 5 minutos após 5 tentativas)
- proteção por senha dos comprovantes em PDF
- rota oculta de suporte com senha específica
- não há necessidade de HTTPS, já que a aplicação roda localmente sem tráfego de rede externa

### Disponibilidade

- o sistema **não depende de internet** — funciona inteiramente offline, com banco de dados local
- não há requisito de disponibilidade de rede, já que não existe servidor remoto

### Usabilidade

- formulário único com seções claras
- preenchimento automático sempre que possível (CPF pré-preenchido, turma sugerida, dados do responsável reutilizados para irmãos)
- mensagens de erro claras e orientadas à ação

### Integridade de Dados

- validação de CPF (dígitos verificadores, formato 11 dígitos)
- prevenção de duplicidade por CPF no mesmo ano
- validação de faixa etária conforme corte de 31 de março
- campos obrigatórios validados antes do registro
- [NOVO] CPF do responsável obrigatório e validado

### Proteção de Dados (LGPD)

- armazenamento local seguro de informações sensíveis (dados de saúde, situação social)
- rastreabilidade de alterações (campo, valor anterior, valor novo) — ver seção 15

### Backup e Recuperação

- [NOVO] Backup automático do banco de dados diariamente às 11:00 via `pg_dump` (formato plain SQL) para diretório definido na instalação
- procedimento simples documentado de restauração do backup em caso de falha da máquina (suporte técnico)
- **camada extra de recuperação:** os arquivos JSON gerados a cada inscrição podem ser reimportados individualmente em caso de perda parcial de dados

---

## 15. Registro de Alterações (Histórico)

Mantém-se um **histórico simplificado de alterações**, útil para corrigir erros de digitação e rastrear o que foi modificado — já que edições podem ocorrer durante a janela ativa.

### 15.1 Operações Registradas

- criação de inscrições, unidades, turmas
- edição de registros (durante o período ativo)
- [NOVO] inativação e reativação de inscrições (com justificativa)

### 15.2 Informações Registradas por Evento

- data e hora
- entidade afetada (inscrição, unidade, turma)
- identificador do registro afetado
- campo alterado, valor anterior, valor novo (nas edições)

### 15.3 Finalidade

- permitir corrigir erros de digitação com rastreabilidade
- manter histórico consultável por unidade, por criança (CPF) e por ano

---

## 16. Regras Operacionais

- há **várias creches (unidades)**; o atendimento e o registro no sistema são **centralizados na Secretaria Municipal de Educação**
- as unidades não acessam o sistema — recebem apenas a lista de inscritos referente a si
- o sistema opera em **campanhas anuais**, com janela fixa de **setembro a outubro** para o ano letivo seguinte
- o volume anual de inscrições costuma ficar **abaixo de 400 crianças**
- o atendimento é **presencial**, por ordem de chegada, com distribuição de senha física (gestão da fila é feita fora do sistema)
- o sistema registra **pré-matrículas (levantamento de demanda)**, não são matrículas definitivas
- algumas documentações são apenas conferidas presencialmente, podendo permanecer arquivadas fisicamente
- o cadastro pode ser realizado por responsável legal, familiar ou cuidador

### Persistência de Registros

- nenhuma pré-matrícula poderá ser excluída do sistema
- todos os registros permanecem armazenados no banco de dados local para consulta e análise histórica
- edições permanecem possíveis **apenas durante a janela ativa da campanha**; após o encerramento, os dados daquele ano ficam congelados
- [NOVO] Inativação e reativação de inscrições apenas durante a campanha, com justificativa obrigatória

### Distribuição às Unidades

- a lista de inscritos de cada unidade é gerada pelo Operador e entregue à creche correspondente (impressa ou em arquivo) **após o encerramento da campanha**
- a unidade não possui qualquer forma de acesso direto ao sistema

---

## 17. Decisões de Escopo

Para fins de clareza, ficam registradas as seguintes decisões de escopo que orientaram a construção desta versão:

- o sistema é um **censo de demanda**, não um sistema de alocação de vagas
- o número de vagas por turma **não é cadastrado** no sistema
- o período de coleta é **fixo (set-out)** e não configurável pelo Operador
- [NOVO] Unidades e turmas são cadastradas apenas pelo suporte técnico, não pelo operador
- [NOVO] O formulário de inscrição é único, com gravação única na tabela `inscricoes` (desnormalização)
- a edição de registros é permitida **apenas durante o período ativo**
- o JSON gerado junto com o PDF é a **camada primária de recuperação de desastres**
- [NOVO] A importação de dados históricos será implementada em versão futura (não disponível atualmente)
- [NOVO] O turno desejado é armazenado na inscrição, não na turma