**Versão:** 3.0 (simplificada a partir da v2.0)
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
12. [Relatórios](#12-relatórios)
13. [Regras de Negócio Consolidadas](#13-regras-de-negócio-consolidadas)
14. [Requisitos Não Funcionais](#14-requisitos-não-funcionais)
15. [Registro de Alterações (Histórico)](#15-registro-de-alterações-histórico)
16. [Regras Operacionais](#16-regras-operacionais)
17. [Decisões de Escopo](#17-decisões-de-escopo)

---

## 1. Visão Geral do Produto

### 1.1 Nome do Produto

**Sistema de Inscrição para Creche**

### 1.2 Propósito

Disponibilizar uma aplicação web local, com banco de dados armazenado na própria máquina, para **registro e controle das inscrições de crianças em uma creche**, operada por um único funcionário, permitindo:

- cadastro padronizado das inscrições
- geração de comprovante de inscrição
- consulta de inscrições por ano letivo
- geração de relatórios simples para apoio ao planejamento

> **Nota de escopo:** o sistema realiza o registro de pré-matrículas. Critérios de priorização e chamada de vagas continuam fora do escopo do sistema, sendo decisões administrativas externas.

### 1.3 Licença

O sistema é distribuído sob **GNU General Public License (GPL)**.

### 1.4 Ambiente de Execução

- aplicação **web**, acessada via navegador
- executa **em uma única máquina**, sem necessidade de servidor remoto
- banco de dados **local**, armazenado na mesma máquina da aplicação
- não depende de conexão com a internet para funcionar
- não há múltiplos usuários simultâneos nem múltiplas unidades escolares

---

## 2. Problema a Ser Resolvido

O processo de inscrição, quando feito manualmente ou em planilhas soltas, apresenta:

- risco de duplicidade de inscrições para a mesma criança
- dificuldade de localizar inscrições antigas
- ausência de comprovante padronizado para o responsável
- dificuldade de consolidar números para planejamento de vagas

O sistema centraliza esse registro em uma aplicação local simples, sem a complexidade de um sistema multiusuário em rede.

---

## 3. Usuário do Sistema

O sistema possui **um único perfil de usuário**: o **Operador** — o funcionário responsável pelo atendimento e registro das inscrições.

**Permissões (todas concentradas no Operador):**
- cadastrar e configurar turmas
- definir o período de inscrição do ano letivo
- registrar inscrições
- cadastrar responsáveis e crianças durante o processo de inscrição
- editar registros **durante o período oficial de inscrição**
- consultar inscrições
- reemitir comprovantes de inscrição
- gerar relatórios
- exportar CSV

**Restrições:**
- não é possível excluir inscrições já registradas
- não é possível editar inscrições após o encerramento do período oficial

> Não há hierarquia de perfis, múltiplas unidades ou controle de acesso por papel — o sistema foi simplificado para um único operador em uma única máquina.

---

## 4. Fluxo Principal do Sistema

1. abrir a aplicação (login simples opcional, ver seção 5.1)
2. cadastrar/configurar turmas (uma vez por ano letivo)
3. iniciar inscrição informando o CPF da criança
4. cadastrar responsável
5. cadastrar criança
6. cadastrar irmãos (se houver)
7. conferir dados da inscrição
8. editar informações se necessário
9. registrar inscrição
10. gerar e entregar comprovante
11. consultar inscrições
12. gerar relatórios

---

## 5. Funcionalidades do Sistema

### 5.1 Autenticação (Simplificada)

Como o sistema roda em uma única máquina operada por um único funcionário, a autenticação serve apenas como proteção básica de acesso local — não há necessidade de gestão de perfis ou hierarquia de aprovação.

**Campos:**
- senha local de acesso

**Comportamento:**
- solicitar senha ao abrir a aplicação
- permitir redefinição de senha diretamente na máquina (sem envio de e-mail ou fluxo de recuperação institucional)
- bloquear acesso após número configurável de tentativas inválidas consecutivas

> **Assunção:** como não há múltiplos usuários nem acesso remoto, não é necessário log de IP, dispositivo ou hierarquia de suporte para recuperação de senha. Se preferir, a autenticação pode ser removida completamente, já que o controle de acesso físico à máquina já limita o uso.

---

### 5.2 Cadastro de Turmas

Não há mais cadastro de "unidades escolares" — existe apenas a creche onde o sistema é operado.

**Campos da turma:**
- nome da turma (ex.: Berçário I, Berçário II, 1º Período, 2º Período)
- turno (manhã, tarde ou integral)
- faixa etária mínima (em meses ou anos completos em 31/03)
- faixa etária máxima (em meses ou anos completos em 31/03)
- número de vagas disponíveis
- ano letivo

---

### 5.3 Configuração do Período de Inscrição

O próprio Operador define o período oficial de inscrição.

**Campos:**
- ano letivo
- data de início
- data de encerramento
- status (aberto / encerrado)

**Regras:**
- o período de inscrição ocorre uma vez por ano letivo
- fora do período, o sistema bloqueia o registro de novas inscrições
- após encerramento, inscrições existentes tornam-se imutáveis

---

### 5.4 Regra de Corte Etário

A elegibilidade da criança considera o **corte etário de 31 de março do ano letivo da inscrição**.

**Comportamento do sistema:**
- calcular automaticamente a idade na data de corte com base na data de nascimento
- sugerir a turma compatível com a faixa etária calculada
- bloquear seleção de turma incompatível, exibindo mensagem explicativa

---

### 5.5 Início da Inscrição

O Operador inicia uma inscrição informando o **CPF da criança**.

**Comportamento do sistema:**

1. verificar se já existe inscrição ativa associada ao CPF no ano letivo vigente
2. **se existir:** bloquear nova inscrição e exibir data e horário da inscrição já registrada
3. **se não existir:** prosseguir para o cadastro do responsável e da criança, pré-preenchendo o CPF no formulário da criança

> **Nota:** o CPF é campo obrigatório para inscrição, pois toda criança nascida no Brasil recebe CPF no registro da certidão de nascimento.

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

Coletadas para fins de planejamento interno da creche.

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

- turma pretendida (sugerida automaticamente pelo sistema com base no corte etário; seleção incompatível é bloqueada)

### 7.3 Situação Documental

- certidão em que não conste pai ou mãe
- irmão(ã) já matriculado(a) na creche

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
- pergunta: **é filho(a) do mesmo relacionamento?**
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
- turma pretendida

> Campos lógicos (checkboxes, flags) aparecem no resumo **apenas quando marcados como verdadeiros**.

O Operador pode voltar a qualquer seção para corrigir informações antes de confirmar o registro.

---

## 10. Comprovante de Inscrição

Após registrar a inscrição, o sistema gera automaticamente um comprovante.

### 10.1 Conteúdo

**Identificação da inscrição:**
- número da inscrição
- data e hora do registro
- ano letivo

**Dados da criança:**
- nome completo, CPF, data de nascimento, nome do pai, nome da mãe

**Dados do responsável:**
- nome completo, CPF, telefone, endereço

**Solicitação:**
- turma pretendida

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
- **ano letivo** (filtro obrigatório, padrão: ano letivo vigente)

### 11.2 Funcionalidades

- visualizar dados completos da inscrição selecionada
- reemitir comprovante de inscrição

---

## 12. Relatórios

### 12.1 Tipos de Relatórios

**Lista geral de inscritos:**
- número da inscrição, nome da criança, turma pretendida, data da inscrição

**Inscrições por turma pretendida ou faixa etária:**
subsidia o planejamento da oferta de vagas

**Relatórios por critérios sociais:**
- renda per capita, situação de vulnerabilidade social, benefícios sociais declarados, encaminhamentos institucionais registrados

### 12.2 Filtros

Todos os relatórios devem permitir filtragem por **ano letivo**.

### 12.3 Exportação

- todos os relatórios podem ser exportados em **CSV**
- após o encerramento do período de inscrição, o sistema disponibiliza a geração do **arquivo CSV oficial** contendo todos os registros do período

---

## 13. Regras de Negócio Consolidadas

1. o CPF da criança é o identificador único de inscrição no sistema
2. não pode existir mais de uma inscrição por CPF no mesmo ano letivo
3. o CPF é campo obrigatório para inscrição
4. a idade da criança é calculada com base no corte etário de **31 de março** do ano letivo
5. o sistema sugere a turma compatível e bloqueia seleções incompatíveis com a faixa etária
6. campos lógicos são exibidos no resumo apenas quando verdadeiros
7. nenhuma inscrição pode ser excluída
8. após o encerramento do período de inscrição, nenhuma inscrição pode ser editada no sistema
9. comprovantes devem ser gerados em PDF com proteção por senha
10. registros ficam associados ao ano letivo e devem ser consultáveis por filtro de ano

---

## 14. Requisitos Não Funcionais

### Segurança

- senha local de acesso à aplicação (opcional, ver seção 5.1)
- proteção por senha dos comprovantes em PDF
- não há necessidade de HTTPS, já que a aplicação roda localmente sem tráfego de rede externa

### Disponibilidade

- o sistema **não depende de internet** — funciona inteiramente offline, com banco de dados local
- não há requisito de disponibilidade de rede, já que não existe servidor remoto
- formulários em andamento não devem ser perdidos em caso de fechamento acidental da aba/navegador — o sistema deve alertar o operador antes de qualquer perda de dados

### Usabilidade

- formulários simples e objetivos
- preenchimento automático sempre que possível (CPF pré-preenchido, turma sugerida, dados do responsável reutilizados para irmãos)
- mensagens de erro claras e orientadas à ação

### Integridade de Dados

- validação de CPF (dígitos verificadores)
- prevenção de duplicidade por CPF no mesmo ano letivo
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

Como há apenas um operador, não é necessário um sistema completo de auditoria multiusuário (IP, dispositivo, perfil). Mantém-se um **histórico simplificado de alterações**, útil para corrigir erros de digitação e rastrear o que foi modificado.

### 15.1 Operações Registradas

- criação de inscrições, turmas
- edição de registros (durante o período de inscrição)

### 15.2 Informações Registradas por Evento

- data e hora
- entidade afetada (inscrição, turma)
- identificador do registro afetado
- campo alterado, valor anterior, valor novo (nas edições)

### 15.3 Finalidade

- permitir corrigir erros de digitação com rastreabilidade
- manter histórico consultável por ano letivo

---

## 16. Regras Operacionais

- a creche possui **uma única unidade** (a própria máquina/local de atendimento)
- o volume anual de inscrições costuma ficar **abaixo de 400 crianças**
- o atendimento é **presencial**, por ordem de chegada, com distribuição de senha física (gestão da fila é feita fora do sistema)
- o sistema registra **pré-matrículas**, não são matrículas definitivas
- algumas documentações são apenas conferidas presencialmente, podendo permanecer arquivadas fisicamente
- o cadastro pode ser realizado por responsável legal, familiar ou cuidador, mediante assinatura de **termo físico**

### Persistência de Registros

- nenhuma pré-matrícula poderá ser excluída do sistema
- todos os registros permanecem armazenados no banco de dados local para consulta e análise histórica
- registros são associados ao ano letivo e recuperáveis por filtro

### Bloqueio de Alterações

Após o encerramento do período oficial de inscrição:
- nenhuma inscrição poderá ser editada no sistema
- nenhuma informação de responsável ou criança poderá ser alterada

Correções posteriores ao encerramento ocorrem por **procedimento administrativo externo ao sistema**.

### Exportação Oficial

Após o encerramento do período de inscrição, o sistema disponibiliza a geração do **arquivo CSV oficial** contendo todos os registros do período.

---

## 17. Decisões de Escopo

| Decisão | Justificativa |
|---|---|
| Sistema **multiusuário e multiperfil removido** | Apenas um operador utiliza o sistema, em uma única máquina — não há necessidade de hierarquia de perfis (Administrador, Secretário de Educação, Diretor, Secretário Escolar). |
| Múltiplas **unidades escolares removidas** | O sistema atende a uma única creche, na própria máquina onde roda. |
| Sistema passa a operar **localmente, offline** | Elimina a dependência de servidor remoto, HTTPS e conectividade constante — o banco de dados fica na própria máquina. |
| Auditoria completa (IP, dispositivo, perfil) **simplificada** para histórico básico de alterações | Sem múltiplos usuários ou acessos remotos, o rastreamento de IP/dispositivo perde utilidade; mantém-se apenas o registro de campo/valor anterior/valor novo. |
| Critérios de priorização de vagas continuam **fora do escopo** | Decisão administrativa, não muda com a simplificação técnica. |
| Convocação e chamada de vagas continuam **fora do escopo** | O sistema encerra seu papel no registro da pré-matrícula. |
| CPF continua **obrigatório** para inscrição | Toda criança nascida no Brasil recebe CPF na certidão de nascimento. |

---

*Documento simplificado a partir da versão 2.0, adaptado para operação por um único funcionário em uma aplicação web local com banco de dados na própria máquina.*