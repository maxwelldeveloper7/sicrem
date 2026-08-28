# PRD — Sistema de Inscrição em Creches
## Documento de Requisitos de Produto

**Versão:** 4.0 (revisada a partir da v3.0)
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

**Sistema de Inscrição em Creches**

### 1.2 Propósito

Disponibilizar uma aplicação web local, com banco de dados armazenado na própria máquina da **Secretaria Municipal de Educação**, para **registro e controle centralizado das inscrições de crianças nas creches da rede**, operada por um único funcionário, permitindo:

- cadastro padronizado das inscrições, por unidade (creche) pretendida
- geração de comprovante de inscrição
- geração de relatórios simples para apoio ao planejamento
- geração de listas de inscritos para envio a cada unidade

> **Nota de escopo:** o sistema realiza o registro de pré-matrículas. Critérios de priorização e chamada de vagas continuam fora do escopo do sistema, sendo decisões administrativas externas.
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

- risco de duplicidade de inscrições para a mesma criança
- dificuldade de localizar inscrições antigas
- ausência de comprovante padronizado para o responsável
- dificuldade de consolidar números para planejamento de vagas
- dificuldade de repassar às unidades, de forma organizada, a lista de crianças inscritas para cada uma delas

O sistema centraliza esse registro em uma aplicação local simples, operada por um único funcionário na Secretaria, que distribui às unidades apenas as informações que lhes dizem respeito.

---

## 3. Usuário do Sistema

O sistema possui **um único perfil de usuário**: o **Operador** — o funcionário da Secretaria Municipal de Educação responsável pelo atendimento e registro das inscrições de todas as unidades.

**Permissões (todas concentradas no Operador):**
- cadastrar unidades (creches) e turmas
- registrar inscrições
- cadastrar responsáveis e crianças durante o processo de inscrição
- editar registros, a qualquer momento
- consultar inscrições
- reemitir comprovantes de inscrição
- gerar relatórios e listas por unidade
- exportar CSV

**Restrições:**
- não é possível excluir inscrições já registradas

> As unidades escolares não possuem login nem acesso ao sistema — recebem apenas a lista de inscritos referente a si, fornecida pelo Operador.

---

## 4. Fluxo Principal do Sistema

1. abrir a aplicação (login simples, ver seção 5.1)
2. cadastrar unidades (creches) e turmas
3. iniciar inscrição informando o CPF da criança
4. cadastrar responsável
5. cadastrar criança, incluindo a unidade pretendida
6. cadastrar irmãos (se houver)
7. conferir dados da inscrição
8. editar informações se necessário
9. registrar inscrição
10. gerar e entregar comprovante
11. consultar inscrições
12. gerar relatórios e listas por unidade

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

A elegibilidade da criança considera o **corte etário de 31 de março do ano de referência**, definido pela data de início do período de inscrição vigente (ver 5.5).

**Comportamento do sistema:**
- calcular automaticamente a idade na data de corte com base na data de nascimento
- sugerir a turma compatível, dentro da unidade selecionada, com a faixa etária calculada
- bloquear seleção de turma incompatível, exibindo mensagem explicativa

---

### 5.5 Período de Inscrição e Início da Inscrição

O Operador pode configurar um período de inscrição (data de início e fim), usado apenas para organizar a janela de recebimento de novas inscrições — **não bloqueia edição de inscrições já registradas**.

**Início da inscrição:** o Operador informa o **CPF da criança**.

**Comportamento do sistema:**

1. verificar se já existe inscrição ativa associada ao CPF
2. **se existir:** bloquear nova inscrição e exibir data, horário e unidade da inscrição já registrada
3. **se não existir:** prosseguir para o cadastro do responsável e da criança, pré-preenchendo o CPF no formulário da criança

> **Nota:** o CPF é campo obrigatório para inscrição, pois toda criança nascida no Brasil recebe CPF no registro da certidão de nascimento.
>
> **Nota sobre reinscrição:** como não há mais separação por ano letivo, cada CPF possui **no máximo uma inscrição ativa por vez**, independente do ano. Não há necessidade de nova inscrição a cada ano.

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

> **Deseja cadastrar outra criança para este responsável?**

Se positivo:
- abre novo formulário de criança
- reutiliza automaticamente os dados do responsável já cadastrado
- pergunta: **é filho(a) do mesmo relacionamento? Não pergunte ao resonsável, verifique nos documentos da criança para evitar constragimento.**
- se sim, preenche automaticamente nome do pai e nome da mãe

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

**Dados da criança:**
- nome completo, CPF, data de nascimento, nome do pai, nome da mãe

**Dados do responsável:**
- nome completo, CPF, telefone, endereço

**Solicitação:**
- unidade e turma pretendida

### 10.2 Formato

- impresso diretamente na máquina local
- gerado em PDF para download ou reimpressão

### 10.3 Segurança do PDF

O arquivo PDF é gerado com proteção de abertura por senha baseada no CPF da criança (apenas dígitos). Serve para controle de distribuição — os dados ficam armazenados localmente no banco de dados da máquina.

---

## 11. Consulta de Inscrições

### 11.1 Critérios de Busca

- nome da criança
- CPF da criança
- número da inscrição
- unidade (creche)

### 11.2 Funcionalidades

- visualizar dados completos da inscrição selecionada
- reemitir comprovante de inscrição

---

## 12. Relatórios e Distribuição às Unidades

### 12.1 Tipos de Relatórios

**Lista geral de inscritos:**
- número da inscrição, nome da criança, unidade, turma pretendida, data da inscrição

**Lista de inscritos por unidade** (para envio à respectiva creche):
- nome da criança, data de nascimento, turma pretendida, dados do responsável e contato
- gerada individualmente para cada unidade, contendo apenas os inscritos daquela creche

**Inscrições por turma pretendida ou faixa etária:**
subsidia o planejamento da oferta de vagas

**Relatórios por critérios sociais:**
- renda per capita, situação de vulnerabilidade social, benefícios sociais declarados, encaminhamentos institucionais registrados

### 12.2 Filtros

Todos os relatórios devem permitir filtragem por **unidade** e, quando aplicável, por **faixa etária**.

### 12.3 Exportação

- todos os relatórios podem ser exportados em **CSV**
- a lista de inscritos por unidade pode ser impressa ou exportada para envio à creche correspondente

---

## 13. Regras de Negócio Consolidadas

1. o CPF da criança é o identificador único de inscrição no sistema
2. não pode existir mais de uma inscrição **ativa** por CPF (independente de ano)
3. o CPF é campo obrigatório para inscrição
4. a idade da criança é calculada com base no corte etário de **31 de março do ano de referência** do período de inscrição vigente
5. o sistema sugere a turma compatível, dentro da unidade escolhida, e bloqueia seleções incompatíveis com a faixa etária
6. campos lógicos são exibidos no resumo apenas quando verdadeiros
7. nenhuma inscrição pode ser excluída
8. inscrições podem ser editadas a qualquer momento
9. comprovantes devem ser gerados em PDF com proteção por senha
10. cada unidade tem acesso apenas à lista de inscritos referente a si — nunca ao sistema

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
- preenchimento automático sempre que possível (CPF pré-preenchido, turma sugerida, dados do responsável reutilizados para irmãos)
- mensagens de erro claras e orientadas à ação

### Integridade de Dados

- validação de CPF (dígitos verificadores)
- prevenção de duplicidade por CPF (inscrição ativa única)
- validação de faixa etária conforme corte de 31 de março
- campos obrigatórios validados antes do registro

### Proteção de Dados (LGPD)

- armazenamento local seguro de informações sensíveis (dados de saúde, situação social)
- rastreabilidade de alterações (campo, valor anterior, valor novo) — ver seção 15

### Backup e Recuperação

- rotina de backup local do banco de dados (ex.: cópia periódica do arquivo de banco para outro local/mídia), com periodicidade mínima diária
- procedimento simples documentado de restauração do backup em caso de falha da máquina

---

## 15. Registro de Alterações (Histórico)

Mantém-se um **histórico simplificado de alterações**, útil para corrigir erros de digitação e rastrear o que foi modificado — já que edições podem ocorrer a qualquer momento.

### 15.1 Operações Registradas

- criação de inscrições, unidades, turmas
- edição de registros (a qualquer momento)

### 15.2 Informações Registradas por Evento

- data e hora
- entidade afetada (inscrição, unidade, turma)
- identificador do registro afetado
- campo alterado, valor anterior, valor novo (nas edições)

### 15.3 Finalidade

- permitir corrigir erros de digitação com rastreabilidade
- manter histórico consultável por unidade e por criança

---

## 16. Regras Operacionais

- há **várias creches (unidades)**; o atendimento e o registro no sistema são **centralizados na Secretaria Municipal de Educação**
- as unidades não acessam o sistema — recebem apenas a lista de inscritos referente a si
- o volume anual de inscrições costuma ficar **abaixo de 400 crianças**
- o atendimento é **presencial**, por ordem de chegada, com distribuição de senha física (gestão da fila é feita fora do sistema)
- o sistema registra **pré-matrículas**, não são matrículas definitivas
- algumas documentações são apenas conferidas presencialmente, podendo permanecer arquivadas fisicamente
- o cadastro pode ser realizado por responsável legal, familiar ou cuidador

### Persistência de Registros

- nenhuma pré-matrícula poderá ser excluída do sistema
- todos os registros permanecem armazenados no banco de dados local para consulta e análise histórica
- edições permanecem sempre possíveis, sem bloqueio por encerramento de período

### Distribuição às Unidades

- a lista de inscritos de cada unidade é gerada pelo Operador e entregue à creche correspondente (impressa ou em arquivo)
- a unidade não possui qualquer forma de acesso direto ao sistema

---

## 17. Decisões de Escopo

| Decisão | Justificativa |
|---|---|
| Sistema atende **várias creches**, mas com **cadastro e operação centralizados** em um único Operador na Secretaria | Evita a complexidade de um sistema multiusuário: as unidades não precisam de login nem de treinamento no sistema — recebem apenas a lista de inscritos referente a si. |
| **Conceito de ano letivo removido** | Simplifica o modelo de dados: uma inscrição por CPF é válida enquanto ativa, sem necessidade de reinscrição anual nem de filtro por ano. O corte etário de 31/03 passa a usar o ano de referência do período de inscrição vigente. |
| **Edição de inscrições sempre permitida**, sem bloqueio por encerramento de período | Reduz regras condicionais no sistema; correções continuam rastreáveis pelo histórico de alterações (seção 15). |
| Exclusão de inscrições continua **fora de escopo** | Mantém a integridade histórica dos registros para consulta e planejamento. |
| Critérios de priorização de vagas continuam **fora do escopo** | Decisão administrativa da Secretaria, não muda com a simplificação técnica. |
| Convocação e chamada de vagas continuam **fora do escopo** | O sistema encerra seu papel no registro da pré-matrícula. |
| CPF continua **obrigatório** para inscrição | Toda criança nascida no Brasil recebe CPF na certidão de nascimento. |
| Redefinição de senha depende de **suporte técnico** externo | Ainda que o sistema seja de operador único, optou-se por manter esse controle como camada extra de segurança de acesso à máquina. |

---

*Documento revisado a partir da versão 3.0, com reintrodução de múltiplas unidades (creches) sob operação centralizada, remoção do conceito de ano letivo e liberação de edição de inscrições a qualquer momento.*