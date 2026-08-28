# PRD — Sistema de Inscrição em Creches (Censo Anual de Demanda)
## Documento de Requisitos de Produto

**Versão:** 5.1 (revisada a partir da v4.0)
**Licença:** GNU General Public License (GPL)
**Última revisão:** 2026

---

## Sumário

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Problema a Ser Resolvido](#2-problema-a-ser-resolvido)
3. [Usuário do Sistema](#3-usuário-do-sistema)
4. [Fluxo Principal do Sistema](#4-fluxo-principal-do-sistema)
5. [Funcionalidades do Sistema](#5-funcionalidades-do-sistema)
6. [Cadastro do Responsável](#6-cadastro-do-responsável)
7. [Cadastro da Criança](#7-cadastro-da-criança)
8. [Cadastro de Irmãos](#8-cadastro-de-irmãos)
9. [Conferência da Inscrição](#9-conferência-da-inscrição)
10. [Comprovante de Inscrição](#10-comprovante-de-inscrição)
11. [Consulta de Inscrições](#11-consulta-de-inscrições)
12. [Relatórios e Distribuição às Unidades](#12-relatórios-e-distribuição-às-unidades)
13. [Regras de Negócio Consolidadas](#13-regras-de-negócio-consolidadas)
14. [Requisitos Não Funcionais](#14-requisitos-não-funcionais)
15. [Registro de Alterações (Histórico)](#15-registro-de-alterações-histórico)
16. [Regras Operacionais](#16-regras-operacionais)
17. [Decisões de Escopo](#17-decisões-de-escopo)

---

## 1. Visão Geral do Produto

### 1.1 Nome do Produto

**Sistema de Inscrição em Creches (Censo Anual de Demanda)**

### 1.2 Propósito

Disponibilizar uma aplicação web local, com banco de dados armazenado na própria máquina da **Secretaria Municipal de Educação**, para realizar o **Censo Anual de Demanda** por novas vagas em creches da rede municipal.

O sistema opera em uma janela fixa (**setembro a outubro**) para que a Secretaria levante quantas crianças necessitarão de vaga no **ano letivo seguinte**, permitindo:

- cadastro padronizado das inscrições, por unidade (creche) pretendida
- **reutilização inteligente de dados históricos**: ao digitar o CPF, o sistema busca inscrições de anos anteriores e oferece a importação de **todos os campos** (incluindo unidade e turma), evitando retrabalho no atendimento presencial
- geração de comprovante de inscrição
- geração de relatórios simples para apoio ao planejamento
- geração de listas de inscritos para envio a cada unidade

> **Nota de escopo:** o sistema registra a **intenção de vaga (pré-matrícula)**. Critérios de priorização, chamada e matrícula definitiva continuam fora do escopo do sistema, sendo decisões administrativas externas.
>
> **Nota sobre as unidades:** as creches **não acessam o sistema**. Todo o cadastro, inscrição e consulta é feito exclusivamente pelo Operador na Secretaria. Cada unidade recebe apenas a **lista de inscritos referente a si**, gerada e entregue pela Secretaria (impressa ou em arquivo).

### 1.3 Licença

O sistema é distribuído sob **GNU General Public License (GPL)**.

### 1.4 Ambiente de Execução

- aplicação **web**, acessada via navegador
- executa **em uma única máquina**, na Secretaria Municipal de Educação, sem necessidade de servidor remoto
- banco de dados **local**, armazenado na mesma máquina da aplicação
- não depende de conexão com a internet para funcionar
- um único operador utiliza o sistema; as unidades escolares são apenas cadastradas como referência, não como usuárias

---

## 2. Problema a Ser Resolvido

O processo de inscrição, quando feito manualmente ou em planilhas soltas, apresenta:

- risco de duplicidade de inscrições para a mesma criança no mesmo ano
- dificuldade de localizar inscrições antigas
- **retrabalho massivo**: responsáveis precisam ditar nome, endereço e documentos todo ano
- ausência de comprovante padronizado para o responsável
- dificuldade de consolidar números para planejamento de vagas
- dificuldade de repassar às unidades, de forma organizada, a lista de crianças inscritas para cada uma delas

O sistema centraliza esse registro em uma aplicação local simples, operada por um único funcionário na Secretaria, que **aprende com o histórico** para agilizar atendimentos futuros.

---

## 3. Usuário do Sistema

O sistema possui **um único perfil de usuário**: o **Operador** — o funcionário da Secretaria Municipal de Educação responsável pelo atendimento e registro das inscrições de todas as unidades.

**Permissões (todas concentradas no Operador):**
- cadastrar unidades (creches) e turmas
- registrar inscrições
- cadastrar responsáveis e crianças durante o processo de inscrição
- editar registros **apenas durante o período ativo da campanha**
- consultar inscrições (inclusive de anos anteriores)
- reemitir comprovantes de inscrição
- gerar relatórios e listas por unidade
- exportar CSV

**Restrições:**
- não é possível excluir inscrições já registradas
- após o encerramento do período (outubro), o sistema entra em **modo apenas-consulta** para aquele ano

> As unidades escolares não possuem login nem acesso ao sistema — recebem apenas a lista de inscritos referente a si, fornecida pelo Operador.

---

## 4. Fluxo Principal do Sistema

1. abrir a aplicação (login simples, ver seção 5.1)
2. definir o **Ano de Referência** (ex: 2027) ao iniciar a campanha
3. cadastrar unidades (creches) e turmas (reutilizar do ano anterior ou ajustar)
4. iniciar inscrição informando o CPF da criança
5. **sistema verifica:**
   - já existe inscrição para o **ano vigente** com este CPF? → bloqueia e exibe data/hora da inscrição já registrada
   - existe inscrição em **anos anteriores**? → oferece importação automática:
     > *"Dados de [ANO] encontrados. Deseja importá-los para agilizar o cadastro deste ano?"*
     - se **SIM**: pré-preenche **todos os campos** (responsável, criança, endereço, situação socioeconômica, documentos, saúde, unidade e turma pretendidas)
     - se **NÃO**: abre formulário em branco
   - não existe histórico → formulário em branco
6. cadastrar/confirmar responsável
7. cadastrar/confirmar criança, editando o que for necessário (unidade e turma podem ser alteradas livremente)
8. cadastrar irmãos (se houver) — com reuso de dados e limpeza por clique no campo
9. conferir dados da inscrição (resumo completo)
10. editar informações se necessário
11. registrar inscrição vinculada ao **Ano de Referência vigente**
12. sistema gera **PDF do comprovante + arquivo JSON** automaticamente
13. entregar comprovante ao responsável e armazenar o JSON (backup lógico)
14. consultar inscrições
15. gerar relatórios e listas por unidade

---

## 5. Funcionalidades do Sistema

### 5.1 Autenticação (Simplificada)

Como o sistema roda em uma única máquina operada por um único funcionário, a autenticação serve apenas como proteção básica de acesso local.

**Campos:**
- senha local de acesso

**Comportamento:**
- solicitar senha ao abrir a aplicação
- redefinição de senha deve ser solicitada ao suporte técnico
- bloquear acesso após número configurável de tentativas inválidas consecutivas

---

### 5.2 Cadastro de Unidades (Creches)

**Campos da unidade:**
- nome da unidade
- endereço completo
- telefone/contato (para envio da lista de inscritos)

---

### 5.3 Cadastro de Turmas

Cada turma é vinculada a uma unidade.

**Campos da turma:**
- unidade (creche)
- nome da turma (ex.: Berçário I, Berçário II, 1º Período, 2º Período)
- turno (manhã, tarde ou integral)
- faixa etária mínima (em meses ou anos completos em 31/03)
- faixa etária máxima (em meses ou anos completos em 31/03)
- número de vagas disponíveis

---

### 5.4 Regra de Corte Etário

A elegibilidade da criança considera o **corte etário de 31 de março do Ano de Referência**.

**Comportamento do sistema:**
- calcular automaticamente a idade na data de corte com base na data de nascimento
- sugerir a turma compatível, dentro da unidade selecionada, com a faixa etária calculada
- bloquear seleção de turma incompatível, exibindo mensagem explicativa

---

### 5.5 Período de Inscrição e Início da Inscrição

O período de inscrição é **fixo**: **setembro a outubro** de cada ano (data limite configurável, mas definida institucionalmente). Após o encerramento, o sistema entra em modo leitura para aquele ano.

**Início da inscrição:** o Operador informa o **CPF da criança**.

**Comportamento do sistema:**

1. Verificar se já existe inscrição associada ao CPF **para o ano de referência vigente**.
2. **Se existir:** bloquear nova inscrição e exibir mensagem: *"CPF já inscrito para a campanha de [ANO]. Inscrição registrada em [data/hora]."*
3. **Se não existir:** pesquisar no histórico (todos os anos anteriores).
   - **Se encontrado:** exibir caixa de diálogo:
     > *"Encontramos os dados da criança referentes a [ANO anterior]. Deseja importá-los para agilizar o cadastro deste ano? Você poderá editar todos os campos antes de salvar."*
     - Se **SIM**: pré-preencher **todos** os campos do formulário (incluindo unidade e turma pretendidas).
     - Se **NÃO**: iniciar formulário em branco.
   - **Se não encontrado:** iniciar formulário em branco.
4. O Operador pode editar qualquer campo pré-preenchido antes de salvar. A edição da unidade ou turma é livre, desde que respeitada a faixa etária (o sistema recalcula a sugestão com base na idade).

> **Nota sobre importação:** a importação de dados históricos **não altera nem apaga** o registro do ano anterior. Ela apenas copia os valores para o novo registro do ano vigente.

---

## 6. Cadastro do Responsável

### 6.1 Dados de Identificação

- nome completo
- CPF
- RG
- parentesco com a criança (mãe, pai, responsável legal, familiar, cuidador)
- telefone de contato

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
- renda per capita familiar

---

## 7. Cadastro da Criança

### 7.1 Identificação

- nome completo
- data de nascimento
- CPF (obrigatório — pré-preenchido a partir do início da inscrição)
- nome do pai
- nome da mãe

### 7.2 Solicitação de Vaga

- unidade (creche) pretendida — o responsável pode escolher livremente qualquer unidade da rede
- turma pretendida (sugerida automaticamente pelo sistema com base na unidade selecionada e no corte etário; seleção incompatível é bloqueada)

> **Na importação de dados históricos:** unidade e turma são pré-preenchidas com os valores do ano anterior. O Operador pode alterá-las livremente.

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

Após concluir o cadastro de uma criança, o sistema pergunta:

> **Deseja cadastrar irmão(ã) desta criança?**

Se positivo:
- abre novo formulário de criança
- reutiliza automaticamente **todos os dados do responsável** já cadastrado
- os campos **Nome do Pai** e **Nome da Mãe** vêm pré-preenchidos com os valores da criança anterior (pois, na maioria dos casos, são os mesmos)
- o Operador pode **clicar diretamente sobre qualquer campo** que deseje alterar. Ao clicar (evento `onFocus`), o campo é **limpo automaticamente**, permitindo nova digitação sem necessidade de apagar manualmente
- os campos que não forem clicados mantêm os valores pré-preenchidos

**Exemplo:** Se o pai da segunda criança for diferente, o Operador clica no campo "Nome do Pai", ele se esvazia, e digita o nome correto. O campo "Nome da Mãe" permanece inalterado.

Todos os campos permanecem editáveis.

---

## 9. Conferência da Inscrição

Antes de salvar, o sistema exibe um **resumo completo das informações registradas**:

- dados do responsável
- dados da criança
- situação socioeconômica informada
- documentos informados
- encaminhamentos institucionais informados
- dados sociais e de saúde informados
- unidade e turma pretendida

> Campos lógicos (checkboxes, flags) aparecem no resumo **apenas quando marcados como verdadeiros**.

O Operador pode voltar a qualquer seção para corrigir informações antes de confirmar o registro.

---

## 10. Comprovante de Inscrição

Após registrar a inscrição, o sistema gera automaticamente um comprovante.

### 10.1 Conteúdo

**Identificação da inscrição:**
- número da inscrição
- data e hora do registro
- ano de referência

**Dados da criança:**
- nome completo, CPF, data de nascimento, nome do pai, nome da mãe

**Dados do responsável:**
- nome completo, CPF, telefone, endereço

**Solicitação:**
- unidade e turma pretendida

### 10.2 Formato

- impresso diretamente na máquina local
- gerado em PDF para download ou reimpressão

### 10.3 Segurança do PDF e Backup Lógico

- O PDF é gerado com proteção de abertura por senha baseada no CPF da criança (apenas dígitos). Serve para controle de distribuição.
- **Simultaneamente à geração do PDF**, o sistema cria um arquivo **JSON** no mesmo diretório, contendo **todos os campos da inscrição** em formato estruturado e legível (sem criptografia).
- **Finalidade do JSON:** servir como **fonte de recuperação de desastres**. Caso o banco de dados local corrompa, o Operador pode reimportar as inscrições a partir dos JSONs armazenados, sem perda de informações.
- O nome do arquivo JSON segue o padrão: `inscricao_CPF_ANO.json` (ex: `inscricao_12345678900_2027.json`).

---

## 11. Consulta de Inscrições

### 11.1 Critérios de Busca

- nome da criança
- CPF da criança
- número da inscrição
- unidade (creche)
- ano de referência

### 11.2 Funcionalidades

- visualizar dados completos da inscrição selecionada
- reemitir comprovante de inscrição
- visualizar histórico do CPF (anos anteriores)

---

## 12. Relatórios e Distribuição às Unidades

### 12.1 Tipos de Relatórios

**Lista geral de inscritos (por ano):**
- número da inscrição, nome da criança, unidade, turma pretendida, data da inscrição

**Lista de inscritos por unidade** (para envio à respectiva creche):
- nome da criança, data de nascimento, turma pretendida, dados do responsável e contato
- gerada individualmente para cada unidade, contendo apenas os inscritos daquela creche **para o ano vigente**

**Inscrições por turma pretendida ou faixa etária:**
subsidia o planejamento da oferta de vagas

**Relatórios por critérios sociais:**
- renda per capita, situação de vulnerabilidade social, benefícios sociais declarados, encaminhamentos institucionais registrados

### 12.2 Filtros

Todos os relatórios devem permitir filtragem por **unidade** e **ano de referência** e, quando aplicável, por **faixa etária**.

### 12.3 Exportação

- todos os relatórios podem ser exportados em **CSV**
- a lista de inscritos por unidade pode ser impressa ou exportada para envio à creche correspondente

---

## 13. Regras de Negócio Consolidadas

| # | Regra |
| :--- | :--- |
| 1 | O CPF da criança é o identificador único **por ano de referência**. |
| 2 | Uma mesma criança pode ter inscrições em anos diferentes (ex: 2026 e 2027), mas **nunca duas no mesmo ano**. |
| 3 | O CPF é campo obrigatório para iniciar o processo. |
| 4 | A idade da criança é calculada com base no corte etário de **31 de março do Ano de Referência**. |
| 5 | O sistema sugere a turma compatível (com base na unidade selecionada e na idade) e bloqueia seleções incompatíveis. |
| 6 | Campos lógicos (checkboxes) são exibidos no resumo apenas quando verdadeiros. |
| 7 | **Edições:** permitidas **apenas durante o período ativo da campanha** (set-out). Após a data limite, o sistema fica em modo leitura para todos os registros daquele ano. |
| 8 | A importação de dados históricos **não edita nem apaga** os registros antigos — ela apenas copia os valores para criar um novo registro no ano vigente. |
| 9 | Nenhuma inscrição pode ser excluída (apenas inativada administrativamente, se necessário). |
| 10 | O comprovante é gerado em PDF com senha + JSON de backup obrigatório. |
| 11 | Cada unidade tem acesso apenas à lista de inscritos referente a si — nunca ao sistema. |

---

## 14. Requisitos Não Funcionais

### Segurança

- senha local de acesso à aplicação
- proteção por senha dos comprovantes em PDF
- não há necessidade de HTTPS, já que a aplicação roda localmente sem tráfego de rede externa

### Disponibilidade

- o sistema **não depende de internet** — funciona inteiramente offline, com banco de dados local
- não há requisito de disponibilidade de rede, já que não existe servidor remoto

### Usabilidade

- formulários simples e objetivos
- preenchimento automático sempre que possível (CPF pré-preenchido, turma sugerida, dados do responsável reutilizados para irmãos, **importação completa de anos anteriores**)
- no cadastro de irmãos, clique no campo para limpá-lo (`onFocus`)
- mensagens de erro claras e orientadas à ação

### Integridade de Dados

- validação de CPF (dígitos verificadores)
- prevenção de duplicidade por CPF **no mesmo ano**
- validação de faixa etária conforme corte de 31 de março
- campos obrigatórios validados antes do registro

### Proteção de Dados (LGPD)

- armazenamento local seguro de informações sensíveis (dados de saúde, situação social)
- rastreabilidade de alterações (campo, valor anterior, valor novo) — ver seção 15

### Backup e Recuperação

- rotina de backup local do banco de dados (ex.: cópia periódica do arquivo de banco para outro local/mídia), com periodicidade mínima diária
- **backup lógico complementar:** cada inscrição gera um arquivo JSON individual, permitindo recuperação granular em caso de falha
- procedimento simples documentado de restauração do backup em caso de falha da máquina

---

## 15. Registro de Alterações (Histórico)

Mantém-se um **histórico simplificado de alterações**, útil para corrigir erros de digitação e rastrear o que foi modificado — durante o período ativo da campanha.

### 15.1 Operações Registradas

- criação de inscrições, unidades, turmas
- edição de registros (apenas durante a janela ativa)

### 15.2 Informações Registradas por Evento

- data e hora
- entidade afetada (inscrição, unidade, turma)
- identificador do registro afetado
- campo alterado, valor anterior, valor novo (nas edições)

### 15.3 Finalidade

- permitir corrigir erros de digitação com rastreabilidade
- manter histórico consultável por unidade, por criança e por ano

---

## 16. Regras Operacionais

- há **várias creches (unidades)**; o atendimento e o registro no sistema são **centralizados na Secretaria Municipal de Educação**
- as unidades não acessam o sistema — recebem apenas a lista de inscritos referente a si
- o período de inscrição ocorre **anualmente, entre setembro e outubro**, para levantamento da demanda do ano seguinte
- o volume anual de inscrições costuma ficar **abaixo de 400 crianças**
- o atendimento é **presencial**, por ordem de chegada, com distribuição de senha física (gestão da fila é feita fora do sistema)
- o sistema registra a **intenção de vaga (pré-matrícula)**, não são matrículas definitivas
- algumas documentações são apenas conferidas presencialmente, podendo permanecer arquivadas fisicamente
- o cadastro pode ser realizado por responsável legal, familiar ou cuidador

### Persistência de Registros

- nenhuma inscrição poderá ser excluída do sistema
- todos os registros permanecem armazenados no banco de dados local para consulta e análise histórica
- edições são permitidas **apenas durante o período ativo da campanha**; após o encerramento, os dados daquele ano tornam-se somente leitura

### Distribuição às Unidades

- a lista de inscritos de cada unidade (para o ano vigente) é gerada pelo Operador e entregue à creche correspondente (impressa ou em arquivo)
- a unidade não possui qualquer forma de acesso direto ao sistema

---

## 17. Decisões de Escopo

Este documento reflete as seguintes decisões de escopo tomadas durante a revisão da versão 4.0:

1. **Sazonalidade anual:** o sistema opera em campanhas fixas (set-out), vinculando cada inscrição a um "Ano de Referência".
2. **Reuso de dados históricos:** ao digitar um CPF, o sistema busca anos anteriores e oferece importação completa de todos os campos, evitando retrabalho.
3. **Edição controlada:** edições são permitidas apenas durante o período ativo. Após outubro, os dados daquele ano são congelados.
4. **Backup em JSON:** cada comprovante PDF é acompanhado de um arquivo JSON com todos os dados da inscrição, servindo como fonte de recuperação de desastres.
5. **Cadastro de irmãos:** campos são limpos ao serem clicados (`onFocus`), dando controle total ao Operador sobre quais dados reutilizar.
6. **Bloqueio de duplicidade:** uma criança pode ter inscrições em anos diferentes, mas nunca duas no mesmo ano.