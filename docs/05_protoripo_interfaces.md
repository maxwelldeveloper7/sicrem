# Protótipo de Interface — Sistema de Inscrição em Creches

**Versão:** 1.0  
**Data:** Setembro de 2026  
**Licença:** GPL  
**Tecnologias:** Bootstrap 5, HTML/CSS/JS, fontes padrão do sistema  
**Resolução alvo:** 1280×720 px (desktop)

---

## 1. Visão Geral

O protótipo descreve todas as telas do sistema e suas interações. A interface é composta por:

- **Tela de Login** (acesso inicial)
- **Layout Base** (após autenticação, com menu superior)
- **Tela Inicial (Dashboard simples)**
- **Fluxo de Nova Inscrição** (entrada do CPF e formulário único)
- **Consulta de Inscrições**
- **Relatórios**
- **Tela de Suporte (rota oculta)**

---

## 2. Tela de Login

**URL:** `/login`

**Descrição:**  
Tela centralizada, com fundo neutro (cinza claro). Cartão branco com sombra.

**Elementos:**

| Elemento | Tipo | Descrição |
|----------|------|-----------|
| Logo / Título | Texto | "Sistema de Inscrição em Creches" (ou nome da Secretaria) |
| Campo Usuário | Input | Pré-preenchido com "Operador" (somente leitura) |
| Campo Senha | Input tipo password | Foco inicial |
| Botão Entrar | Button | Desabilitado se campos vazios |
| Link "Contate o suporte técnico em caso de senha esquecida." | Texto | Abaixo do botão |

**Comportamento:**

- Ao enviar formulário:
  - Se credenciais corretas → redireciona para `/`.
  - Se incorretas → exibe alerta **"Usuário ou senha inválidos."** (alerta Bootstrap vermelho).
  - Após 5 tentativas inválidas → bloqueia por 5 minutos e mostra alerta com contagem regressiva: **"Acesso bloqueado. Tente novamente em 4:59"** (atualiza a cada segundo).
- O campo usuário não é editável, mas pode ser alterado no banco se necessário.

---

## 3. Layout Base (comum a todas as telas autenticadas)

**Elementos fixos:**

- **Barra superior (navbar):**
  - Marca: "SICREM" (ou similar) à esquerda.
  - Links de navegação: **Início**, **Nova Inscrição**, **Consulta**, **Relatórios**.
  - À direita: indicador de campanha (ex.: **Campanha 2027 — Ativa** ou **Somente leitura**), nome do usuário "Operador" e botão **Sair**.
- **Conteúdo central:** área que varia conforme a rota.
- **Rodapé opcional:** versão e licença.

**Indicador de campanha:**

- Se período ativo (set–out): badge verde "Campanha 2027 Ativa".
- Se fora do período: badge cinza "Campanha 2027 Encerrada — Somente leitura".

---

## 4. Tela Inicial (`/`)

**Descrição:**  
Página simples com cartões de atalho e resumo rápido.

**Elementos:**

- Título "Bem-vindo".
- Três cartões:
  1. **Nova Inscrição** → link para `/inscricao/nova`.
  2. **Consultar Inscrições** → link para `/consulta`.
  3. **Relatórios** → link para `/relatorios`.
- Indicador do total de inscrições do ano corrente (ex.: "127 inscrições registradas em 2027").

---

## 5. Fluxo de Nova Inscrição

### 5.1 Tela de Entrada do CPF

**URL:** `/inscricao/nova`

**Descrição:**  
Página centralizada com um cartão.

**Elementos:**

- Título: "Nova Inscrição — Informe o CPF da criança".
- Campo CPF com máscara `111.222.333-44` (placeholder).
- Botão "Avançar" (primário, desabilitado até CPF válido).
- Botão "Cancelar" (secundário) → redireciona para `/`.

**Comportamento:**

- Ao perder o foco no campo:
  - Valida CPF (11 dígitos e dígitos verificadores).
  - Se inválido: exibe mensagem abaixo do campo ("Número de CPF inválido").
  - Se válido: libera o botão "Avançar".
- Ao clicar "Avançar":
  - Chama o serviço para verificar duplicidade.
  - Se já existir inscrição no ano vigente:
    - Exibe alerta com dados: "Já existe inscrição para este CPF em 2027. Data: 15/09/2026 10:23, Unidade: Creche Sementinha."
    - Permite apenas "Cancelar" (volta para `/inscricao/nova` limpa).
  - Se não existir: redireciona para `/inscricao/formulario`.

### 5.2 Formulário Único de Inscrição

**URL:** `/inscricao/formulario`

**Descrição:**  
Página com **menu lateral esquerdo fixo** (300px) contendo links para as seções. À direita, área de conteúdo com **scroll vertical**. Seções empilhadas.

**Menu lateral (fixo):**

- Título "Seções do Formulário".
- Links âncora:
  1. Dados do Responsável
  2. Endereço
  3. Situação Socioeconômica
  4. Dados da Criança
  5. Documentos
  6. Encaminhamentos
  7. Saúde e Dados Sociais
  8. Solicitação de Vaga
- Ao clicar, a página rola suavemente até a seção correspondente (via âncora ou JS).

**Seções e campos (em ordem):**

#### 5.2.1 Dados do Responsável

- Nome completo* (input)
- CPF* (input com máscara)
- RG (input)
- Parentesco* (select: mãe, pai, responsável legal, familiar, cuidador)
- Telefone* (input com máscara)

#### 5.2.2 Endereço

- Logradouro* (input)
- Número* (input)
- Complemento (input, opcional)
- Bairro* (input)
- Município* (input)
- UF* (select)
- CEP* (input com máscara)
- Ponto de referência (input, opcional)

#### 5.2.3 Situação Socioeconômica

- Checkboxes (todos opcionais, default desmarcados):
  - Mãe com vínculo empregatício
  - Demonstrativo de crédito ou benefício
  - LOAS / BPC / seguro-desemprego
  - Trabalhador(a) autônomo(a)
  - Mãe matriculada em rede pública de ensino
  - Situação de vulnerabilidade social
  - Declaração escolar de mãe adolescente
- Renda per capita familiar* (input com máscara monetária)

#### 5.2.4 Dados da Criança

- Nome completo* (input)
- Data de nascimento* (input type date)
- CPF* (pré-preenchido, readonly)
- Nome do pai (input, opcional)
- Nome da mãe (input, opcional)

#### 5.2.5 Documentos

- Checkboxes:
  - Certidão em que não conste pai ou mãe
  - Irmão(ã) já matriculado(a) em unidade da rede

#### 5.2.6 Encaminhamentos Institucionais

- Checkboxes:
  - Vara da Família
  - Conselho Tutelar
  - CRAS
  - CREAS
  - Casa de acolhimento

#### 5.2.7 Saúde e Dados Sociais

- NIS (input, opcional)
- Número do cartão SUS (input, opcional)
- Checkboxes:
  - Laudo de deficiência ou neoplasia
  - Laudo de intolerância alimentar
  - Laudo de neurodivergência

#### 5.2.8 Solicitação de Vaga

- Unidade pretendida* (select, opções de unidades ativas)
- Turma pretendida* (select, preenchido conforme unidade e idade, com bloqueio)
- Turno desejado* (select: manhã, tarde, integral)

**Botões no final do formulário:**

- **"Salvar e gerar comprovante"** (primário)
- **"Cancelar"** (secundário, volta para `/`)

**Comportamento:**

- Ao selecionar unidade e preencher data de nascimento, o sistema calcula idade e filtra turmas compatíveis no select.
- Se não houver turma compatível, exibe mensagem e bloqueia envio.
- Ao mudar data de nascimento, recalcula e limpa turma se incompatível.
- Ao submeter:
  - Valida todos os campos obrigatórios.
  - Se OK, salva inscrição, gera PDF e JSON, e redireciona para tela de sucesso.

### 5.3 Tela de Sucesso

**URL:** `/inscricao/sucesso/<id>`

**Descrição:**  
Exibe mensagem de sucesso e botão para baixar o comprovante.

**Elementos:**

- Alerta verde: "Inscrição registrada com sucesso!"
- Dados resumidos (número da inscrição, nome da criança, unidade/turma).
- Botão "Baixar comprovante (PDF)" → link para `/inscricao/comprovante/<id>`.
- Botão "Nova Inscrição" (se desejar cadastrar irmão ou outra criança) → `/inscricao/nova`.
- Botão "Ir para o início" → `/`.

---

## 6. Consulta de Inscrições

**URL:** `/consulta`

**Descrição:**  
Página com filtros e tabela de resultados.

**Filtros (topo):**

- Nome da criança (input, busca parcial)
- CPF da criança (input com máscara)
- Número da inscrição (input numérico)
- Unidade (select)
- Ano de referência (select, opcional, default ano corrente)
- Status (select: todas, ativas, inativadas) – default "ativas"
- Botão **"Buscar"** e **"Limpar"**

**Tabela de resultados:**

Colunas:

- Número da inscrição
- Ano
- Nome da criança
- CPF da criança
- Unidade
- Turma
- Data/hora
- Status (badge verde/vermelho)
- Ações: **"Visualizar"**, **"Reemitir comprovante"**, **"Editar"** (se período ativo), **"Inativar/Reativar"** (se ativo/inativo)

**Comportamento:**

- Clicar em "Visualizar" abre página de detalhes.
- "Reemitir comprovante" sobrescreve PDF e JSON e baixa.
- "Editar" leva ao formulário preenchido.
- "Inativar" abre modal para justificativa.

### 6.1 Detalhes da Inscrição

**URL:** `/consulta/<id>`

**Descrição:**  
Mostra todos os campos da inscrição em layout de duas colunas, agrupados por seção. Botões para voltar, reemitir comprovante, editar (se ativo), inativar/reativar.

---

## 7. Relatórios

**URL:** `/relatorios`

**Descrição:**  
Página com seleção do tipo de relatório e filtros.

**Elementos:**

- Cards ou abas para tipos:
  1. Lista geral de inscritos por ano
  2. Lista de inscritos por unidade
  3. Relatório por turma/faixa etária
  4. Relatório por critérios sociais
- Filtros comuns:
  - Ano de referência
  - Unidade (opcional)
  - Status (padrão: ativas)
- Filtro adicional para relatório por critérios sociais (ex.: renda, vulnerabilidade, benefícios)
- Botão **"Gerar relatório"**

**Resultado:**

- Tabela HTML com ordenação padrão (unidade, turma, nome crescente).
- Botões **"Exportar CSV"** e **"Imprimir"**.

---

## 8. Tela de Suporte (rota oculta)

**URL:** `/suporte` (não linkada)

**Descrição:**  
Requer autenticação com usuário `suporte`. Apresenta CRUD de unidades e turmas.

**Elementos:**

- Lista de unidades (tabela com ações editar/inativar).
- Botão "Nova unidade".
- Ao clicar em uma unidade, lista suas turmas.
- CRUD de turmas com campos: nome, idade mínima (meses), idade máxima (meses), ativo.
- Acesso exclusivo ao perfil suporte; se operador tentar acessar, redireciona com mensagem de acesso negado.

---

## 9. Navegação e Fluxo Geral (Diagrama)

1. Login → Início
2. Início → Nova Inscrição (CPF)
3. CPF → Formulário Único
4. Formulário → Sucesso
5. Sucesso → Início ou Nova Inscrição
6. Consulta → Detalhes → Editar / Inativar / Reemitir
7. Relatórios → Gerar → Exportar/Imprimir

---

## 10. Observações Finais

- O protótipo é descritivo, servindo como guia para a implementação.
- Elementos Bootstrap devem seguir a paleta neutra (tons de cinza, azul marinho ou azul padrão).
- A experiência do operador prioriza rapidez e poucos cliques; por isso o formulário único com scroll e menu lateral.
