# PRD — Sistema de Inscrição em Creches (Censo Anual de Demanda)
## Documento de Requisitos de Produto

**Versão:** 5.1 (consolidada a partir da v4.0)
**Licença:** GNU General Public License (GPL)
**Última revisão:** Setembro de 2026

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

### 1.1 Nome do Produto

**Sistema de Inscrição em Creches — Censo Anual de Demanda**

### 1.2 Propósito

Disponibilizar uma aplicação web local para realizar o **Censo de Demanda Anual** de novas vagas em creches da rede municipal.

O sistema opera em uma janela fixa (**setembro a outubro**) para que a Secretaria Municipal de Educação levante quantas crianças necessitarão de vaga no **ano letivo seguinte**.

O armazenamento é centralizado na máquina da Secretaria, operado por um único funcionário, e tem como objetivos:

- cadastro padronizado e rápido das intenções de vaga por unidade
- reutilização de dados cadastrais de anos anteriores para evitar retrabalho
- geração de comprovante de inscrição para o responsável
- geração de relatórios para planejamento da rede
- geração de listas de inscritos para envio a cada unidade

> **Nota de escopo:** o sistema realiza o levantamento de demanda (pré-matrículas). A alocação de vagas, chamada pública e matrícula definitiva continuam sendo processos administrativos externos ao sistema.
>
> **Nota sobre as unidades:** as creches **não acessam o sistema**. Todo o cadastro é feito exclusivamente pelo Operador na Secretaria. Cada unidade recebe apenas a **lista de inscritos referente a si**, gerada e entregue pela Secretaria (impressa ou em arquivo).

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

O processo de levantamento de demanda, quando feito manualmente ou em planilhas soltas, apresenta:

- risco de duplicidade de inscrições para a mesma criança no mesmo ano
- dificuldade de localizar inscrições de anos anteriores para reaproveitar dados
- retrabalho significativo ao redigitar nomes, endereços e documentos a cada ano
- ausência de comprovante padronizado para o responsável
- dificuldade de consolidar números para planejamento de vagas
- dificuldade de repassar às unidades, de forma organizada, a lista de crianças inscritas para cada uma delas

O sistema centraliza esse registro em uma aplicação local simples, que aprende com o histórico e acelera o atendimento presencial.

---

## 3. Usuário do Sistema

O sistema possui **um único perfil de usuário**: o **Operador** — o funcionário da Secretaria Municipal de Educação responsável pelo atendimento e registro das inscrições de todas as unidades.

**Permissões (todas concentradas no Operador):**
- cadastrar unidades (creches) e turmas
- registrar inscrições
- cadastrar responsáveis e crianças durante o processo de inscrição
- editar registros **durante o período ativo da campanha**
- consultar inscrições (inclusive de anos anteriores)
- reemitir comprovantes de inscrição
- gerar relatórios e listas por unidade
- exportar CSV

**Restrições:**
- não é possível excluir inscrições já registradas
- após o encerramento do período de campanha, o sistema entra em modo **somente leitura** para aquele ano

> As unidades escolares não possuem login nem acesso ao sistema — recebem apenas a lista de inscritos referente a si, fornecida pelo Operador.

---

## 4. Fluxo Principal do Sistema

1. abrir a aplicação (login com senha local)
2. definir o **Ano de Referência** (ex.: 2027) ao iniciar a campanha
3. cadastrar unidades (creches) e turmas (pode ser reutilizado do ano anterior)
4. iniciar inscrição informando o CPF da criança
5. sistema verifica duplicidade no ano vigente e, se for o caso, oferece importação de dados de anos anteriores
6. cadastrar ou confirmar dados do responsável
7. cadastrar ou confirmar dados da criança, incluindo a unidade pretendida
8. cadastrar irmãos (se houver), reutilizando dados do responsável
9. conferir dados da inscrição no resumo
10. editar informações se necessário (somente durante o período ativo)
11. registrar inscrição vinculada ao Ano de Referência
12. gerar comprovante em PDF + arquivo JSON de backup
13. entregar comprovante ao responsável
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

**Campos da unidade (inseridos pelo Operador):**
- nome da unidade
- endereço completo

> O campo `id` é gerado automaticamente pelo sistema como chave primária, sem intervenção do Operador.

---

### 5.3 Cadastro de Turmas

Cada turma é vinculada a uma unidade.

**Campos da turma (inseridos pelo Operador):**
- unidade (creche) — seleção em lista
- nome da turma (ex.: Berçário I, Berçário II, 1º Período, 2º Período)
- turno (manhã, tarde ou integral)
- faixa etária mínima (em meses ou anos completos em 31/03)
- faixa etária máxima (em meses ou anos completos em 31/03)

> **Campo removido:** número de vagas — este dado não é utilizado, pois o sistema não faz alocação de vagas, apenas levantamento de demanda.

---

### 5.4 Regra de Corte Etário

A elegibilidade da criança considera o **corte etário de 31 de março do Ano de Referência** (definido na abertura da campanha).

**Comportamento do sistema:**
- calcular automaticamente a idade na data de corte com base na data de nascimento
- sugerir a turma compatível, dentro da unidade selecionada, com a faixa etária calculada
- bloquear seleção de turma incompatível, exibindo mensagem explicativa

---

### 5.5 Período de Inscrição e Início da Inscrição

O período de inscrição é **fixo**: **setembro a outubro** de cada ano. O sistema não permite novos cadastros ou edições fora desta janela (apenas consultas).

**Início da inscrição:** o Operador informa o **CPF da criança**.

**Comportamento do sistema:**

1. Verificar se já existe inscrição associada ao CPF **para o Ano de Referência vigente**.
2. **Se existir:** bloquear nova inscrição e exibir data, horário e unidade da inscrição já registrada neste ano.
3. **Se não existir para o ano vigente:** pesquisar no histórico (anos anteriores).
   - **Se encontrado histórico:** exibir caixa de diálogo:
     > *"Encontramos os dados da criança referentes a [ANO anterior]. Deseja importá-los para agilizar o cadastro deste ano? Você poderá editar todos os campos antes de salvar."*
     - **SIM**: pré-preencher **todos** os campos do formulário (responsável, criança, endereço, situação socioeconômica, documentos, saúde, **unidade e turma pretendidas**).
     - **NÃO**: iniciar formulário em branco.
   - **Se não encontrado histórico:** iniciar formulário em branco.
4. O Operador pode editar qualquer campo pré-preenchido antes de salvar. A edição da unidade ou turma é livre, desde que respeitada a faixa etária (o sistema recalcula a sugestão com base na idade).

> **Nota:** A importação de dados históricos **não edita nem apaga** os registros antigos — ela apenas copia os valores para criar um novo registro no ano vigente.

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

> **Deseja cadastrar irmão(ã) desta criança?**

Se positivo:
- abre novo formulário, reutilizando automaticamente **todos os dados do responsável**
- os campos **Nome do Pai** e **Nome da Mãe** vêm pré-preenchidos com os valores da criança anterior (pois, na maioria dos casos, são os mesmos)
- o Operador pode **clicar diretamente sobre qualquer campo** que deseje alterar. Ao clicar, o campo é limpo automaticamente (evento `onFocus`), permitindo nova digitação sem precisar apagar manualmente
- os campos que não forem clicados mantêm os valores pré-preenchidos

**Exemplo:** Se o pai for diferente, o Operador clica no campo "Nome do Pai", ele se esvazia, e digita o nome correto. O campo "Nome da Mãe" permanece inalterado.

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

## 10. Comprovante de Inscrição e Backup Lógico

Após registrar a inscrição, o sistema gera automaticamente um comprovante.

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
- unidade e turma pretendida

### 10.2 Formato

- impresso diretamente na máquina local
- gerado em PDF para download ou reimpressão

### 10.3 Segurança do PDF e Backup Lógico

- O PDF do comprovante é gerado com proteção por senha baseada no CPF da criança (apenas dígitos). Serve para controle de distribuição — os dados ficam armazenados localmente no banco de dados da máquina.
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
- ano de referência (filtro opcional)

### 11.2 Funcionalidades

- visualizar dados completos da inscrição selecionada
- reemitir comprovante de inscrição (PDF + JSON)

---

## 12. Relatórios e Distribuição às Unidades

### 12.1 Tipos de Relatórios

**Lista geral de inscritos por ano:**
- número da inscrição, nome da criança, unidade, turma pretendida, data da inscrição

**Lista de inscritos por unidade** (para envio à respectiva creche):
- nome da criança, data de nascimento, turma pretendida, dados do responsável e contato
- gerada individualmente para cada unidade, contendo apenas os inscritos daquela creche para o ano vigente

**Inscrições por turma pretendida ou faixa etária:**
- subsidia o planejamento da oferta de vagas

**Relatórios por critérios sociais:**
- renda per capita, situação de vulnerabilidade social, benefícios sociais declarados, encaminhamentos institucionais registrados

### 12.2 Filtros

Todos os relatórios devem permitir filtragem por **unidade** e, quando aplicável, por **faixa etária** e **ano de referência**.

### 12.3 Exportação

- todos os relatórios podem ser exportados em **CSV**
- a lista de inscritos por unidade pode ser impressa ou exportada para envio à creche correspondente

---

## 13. Regras de Negócio Consolidadas

| # | Regra |
| :--- | :--- |
| 1 | O CPF da criança é o identificador único **por ano de referência**. |
| 2 | Uma mesma criança pode ter inscrições em anos diferentes (ex.: 2026 e 2027), mas nunca duas no mesmo ano. |
| 3 | O CPF é campo obrigatório para iniciar o processo de inscrição. |
| 4 | A idade da criança é calculada com base no corte etário de **31 de março do Ano de Referência**. |
| 5 | O sistema sugere a turma compatível (com base na unidade selecionada e na idade) e bloqueia seleções incompatíveis. |
| 6 | Campos lógicos (checkboxes) aparecem no resumo apenas quando verdadeiros. |
| 7 | **Edições:** permitidas **apenas durante o período ativo da campanha** (set-out). Após a data limite, o sistema fica em modo leitura para todos os registros daquele ano. |
| 8 | A importação de dados históricos **não edita nem apaga** os registros antigos — ela apenas copia os valores para criar um novo registro no ano vigente. |
| 9 | Nenhuma inscrição pode ser excluída (apenas inativada administrativamente, se necessário). |
| 10 | O comprovante é gerado em PDF com senha + JSON de backup obrigatório. |

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
- preenchimento automático sempre que possível (CPF pré-preenchido, turma sugerida, dados do responsável reutilizados para irmãos, importação de anos anteriores)
- mensagens de erro claras e orientadas à ação

### Integridade de Dados

- validação de CPF (dígitos verificadores)
- prevenção de duplicidade por CPF no mesmo ano
- validação de faixa etária conforme corte de 31 de março
- campos obrigatórios validados antes do registro

### Proteção de Dados (LGPD)

- armazenamento local seguro de informações sensíveis (dados de saúde, situação social)
- rastreabilidade de alterações (campo, valor anterior, valor novo) — ver seção 15

### Backup e Recuperação

- rotina de backup local do banco de dados (ex.: cópia periódica do arquivo de banco para outro local/mídia), com periodicidade mínima diária
- procedimento simples documentado de restauração do backup em caso de falha da máquina
- **camada extra de recuperação:** os arquivos JSON gerados a cada inscrição podem ser reimportados individualmente em caso de perda parcial de dados

---

## 15. Registro de Alterações (Histórico)

Mantém-se um **histórico simplificado de alterações**, útil para corrigir erros de digitação e rastrear o que foi modificado — já que edições podem ocorrer durante a janela ativa.

### 15.1 Operações Registradas

- criação de inscrições, unidades, turmas
- edição de registros (durante o período ativo)

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

### Distribuição às Unidades

- a lista de inscritos de cada unidade é gerada pelo Operador e entregue à creche correspondente (impressa ou em arquivo) **após o encerramento da campanha**
- a unidade não possui qualquer forma de acesso direto ao sistema

---

## 17. Decisões de Escopo

Para fins de clareza, ficam registradas as seguintes decisões de escopo que orientaram a construção desta versão:

- o sistema é um **censo de demanda**, não um sistema de alocação de vagas
- o número de vagas por turma **não é cadastrado** no sistema
- o período de coleta é **fixo (set-out)** e não configurável pelo Operador
- os dados de um ano podem ser **importados** para o ano seguinte, mas geram um **novo registro** independente
- a edição de registros é permitida **apenas durante o período ativo**
- o JSON gerado junto com o PDF é a **camada primária de recuperação de desastres**