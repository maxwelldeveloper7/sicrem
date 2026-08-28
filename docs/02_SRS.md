# SRS — Sistema de Inscrição em Creches (Censo Anual de Demanda)
**Versão:** 1.0 (Baseado no PRD v5.1)  
**Stack Tecnológico:** Python 3.10+, Flask 2.x, PostgreSQL 14+, HTML5, CSS3 (Bootstrap 5 ou CSS puro), JavaScript (ES6)  
**Ambiente:** Execução local em uma única máquina (Windows/Linux), offline-first.

---

## 1. Introdução

### 1.1 Propósito
Este documento especifica os requisitos funcionais e não funcionais para o desenvolvimento de uma aplicação web local destinada à Secretaria Municipal de Educação. O sistema permite o cadastro anual (setembro-outubro) de crianças **novas** ou **com histórico** para levantamento de demanda de vagas em creches para o ano letivo subsequente.

### 1.2 Escopo do Sistema
O sistema gerencia:
- Cadastro de Unidades (Creches) e Turmas.
- Cadastro de Responsáveis, Crianças e Irmãos.
- Importação automática de dados de campanhas anteriores (via CPF).
- Geração de comprovante (PDF) e backup lógico (JSON).
- Relatórios gerenciais e listas por unidade (CSV/Impressão).
- Auditoria de alterações (histórico de edições).

### 1.3 Definições e Siglas
- **Ano de Referência:** Ano letivo para o qual a vaga é solicitada (ex: 2027).
- **Campanha:** Período ativo de cadastros (1º de setembro a 31 de outubro).
- **Operador:** Único usuário do sistema (funcionário da Secretaria).

---

## 2. Visão Geral da Arquitetura

### 2.1 Modelo Arquitetural
Adotaremos o padrão **MVC (Model-View-Controller)** síncrono:
- **View:** Templates Jinja2 renderizados no servidor. Formulários com CSRF protection (Flask-WTF).
- **Controller:** Rotas Flask que processam requisições `GET` (exibir) e `POST` (salvar/atualizar).
- **Model:** Camada de persistência usando SQLAlchemy (ORM) ou psycopg2 raw (recomendo SQLAlchemy para manter a sanidade nos relacionamentos).

### 2.2 Fluxo de Requisição (Localhost)
Navegador -> (HTTP/1.1) -> Flask (Werkzeug) -> PostgreSQL (na mesma máquina, via `localhost:5432`).

### 2.3 Estrutura de Diretórios (Sugerida)
```
creche_system/
├── app/
│   ├── __init__.py          # Factory create_app()
│   ├── models/              # Definição das tabelas (SQLAlchemy)
│   ├── routes/              # Blueprints: auth, inscricoes, unidades, relatorios
│   ├── forms/               # WTForms (ResponsavelForm, CriancaForm, etc.)
│   ├── services/            # Lógica de negócio (importacao_historico, gerador_pdf)
│   ├── static/              # CSS, JS, imagens
│   │   └── backups/         # Pasta onde PDFs e JSONs são salvos
│   └── templates/           # Arquivos .html (base.html, inscricao.html, etc.)
├── instance/                # Banco SQLite (se usado) ou config
├── migrations/              # Alembic (controle de versão do schema)
├── config.py                # Configurações (SECRET_KEY, DATABASE_URL)
├── requirements.txt         # Dependências
└── run.py                   # Ponto de entrada (flask run)
```

---

## 3. Requisitos Funcionais Detalhados (FR)

### FR-01: Autenticação Local
- **Descrição:** Tela inicial com campo de senha fixa (armazenada em hash no banco ou em variável de ambiente).
- **Regras:** 
  - 5 tentativas inválidas bloqueiam o acesso por 15 minutos (armazenar em sessão ou cache local).
  - Redefinição de senha: apenas via script de linha de comando (`flask reset-password`).
- **Tecnologia:** `flask-login` (simplificado) ou sessão customizada.

### FR-02: Gerenciamento de Unidades e Turmas (CRUD)
- **Tabelas:** `unidades` (id, nome, endereco, telefone), `turmas` (id, unidade_id, nome, turno, idade_min_meses, idade_max_meses, vagas).
- **Regras:**
  - Turmas só podem ser deletadas se não houver inscrições vinculadas ao ano vigente.
  - Faixa etária calculada em meses (ex: 0 a 18 meses para Berçário I).
- **Endpoint:** `/unidades` e `/turmas` com métodos GET/POST para criar/editar.

### FR-03: Configuração da Campanha (Ano de Referência)
- **Descrição:** O Operador define o **Ano de Referência** ao iniciar o sistema pela primeira vez na campanha.
- **Armazenamento:** Tabela `config` (chave='ano_referencia', valor='2027').
- **Comportamento:** Esta data define o corte etário (31/03/ANO) e o período de edição.

### FR-04: Início da Inscrição (Fluxo de Busca por CPF)
- **Endpoint:** `/inscricao/nova` (GET).
- **Campo:** `cpf_crianca` (string com 11 dígitos, validado por dígitos verificadores).
- **Lógica (Serviço `CpfLookupService`):**
  1. **Validação:** Verifica se o CPF tem 11 dígitos e é matematicamente válido.
  2. **Busca no Ano Vigente:** `SELECT * FROM inscricoes WHERE cpf = :cpf AND ano_referencia = :ano_atual`.
     - Se existe → Redireciona para `/inscricao/visualizar/<id>` com mensagem: *"Já inscrita em [data]."*
  3. **Busca Histórica:** `SELECT * FROM inscricoes WHERE cpf = :cpf AND ano_referencia < :ano_atual ORDER BY ano_referencia DESC LIMIT 1`.
     - Se existe → Renderiza modal/dialog com botão "Importar Dados" (POST para `/inscricao/importar/<id_historico>`).
     - Se não existe → Redireciona para o formulário em branco.

### FR-05: Cadastro/Edição de Inscrição (Formulário)
- **Formulário único** (dividido em abas ou seções longas):
  - Seção A: Responsável (Nome, CPF, RG, Parentesco, Telefone, Endereço).
  - Seção B: Criança (Nome, Data Nascimento, CPF [readonly], Nome Pai, Nome Mãe).
  - Seção C: Solicitação (Unidade pretendida [dropdown], Turma pretendida [dropdown]).
  - Seção D: Situação Socioeconômica e Documentos (checkboxes e campos de texto: NIS, SUS, Laudos).
- **Regras de Front-end (JS):**
  - Ao selecionar a Unidade, o dropdown de Turmas é atualizado via fetch (requisição síncrona para `/api/turmas_por_unidade/<id>`).
  - Cálculo automático de idade (em meses) no `onBlur` da Data de Nascimento para validar se a criança se enquadra na turma selecionada.
- **Importação de Histórico:** O serviço de importação copia campo a campo do registro antigo para um novo dicionário, pré-preenchendo o `request.form` no backend. As turmas são remapeadas se a unidade ainda existir.

### FR-06: Cadastro de Irmãos (Reuso e Limpeza)
- Após salvar a criança (POST), o usuário é redirecionado para uma tela de confirmação com botão "Cadastrar Irmão".
- **Lógica de Reuso:** O formulário para irmão trará os dados do responsável pré-preenchidos.
- **Comportamento "Clique para Limpar" (FR-06.1):**
  - No template Jinja, o campo `<input>` terá o atributo `onfocus="this.value='';"`.
  - Isso garante que, se o pai for diferente, o operador clica no campo e ele esvazia imediatamente.

### FR-07: Persistência e Validação
- **Backend (Flask-WTF):** Validação de CPF, Data de Nascimento (não pode ser futura), e Unidade/Turma compatível (regra de 31/03).
- **Transação:** `db.session.commit()` apenas se todas as validações passarem.
- **Bloqueio de Edição:** Na rota `/inscricao/editar/<id>`, se a data atual > `campanha.fim` (31/10), lançar `403 Forbidden` e redirecionar para visualização.

### FR-08: Geração de Comprovante (PDF + JSON)
- **Trigger:** Após o `commit` bem-sucedido da inscrição, o sistema chama o serviço `GeradorComprovante`.
- **PDF (FR-08.1):** Usar `WeasyPrint` ou `ReportLab`.
  - Template HTML renderizado com os dados.
  - Senha de abertura: apenas os dígitos do CPF (sem formatação).
  - Nome do arquivo: `comprovante_<CPF>_<ANO>.pdf`.
- **JSON (FR-08.2):** Serializar o objeto da inscrição (incluindo relacionamentos) em `dict` e salvar com `json.dump`.
  - Nome do arquivo: `backup_<CPF>_<ANO>.json`.
- **Armazenamento:** Ambos salvos em `app/static/backups/`.

### FR-09: Consulta e Reimpressão
- **Endpoint:** `/consultas` com filtros por Nome, CPF, Número da Inscrição, Unidade.
- **Ação:** Na listagem, botão "Reimprimir" que regenera o PDF (sem alterar o JSON) e dispara o download.

### FR-10: Relatórios e Exportação (CSV)
- **Relatório 1 (Geral):** Lista todos os inscritos do ano vigente.
- **Relatório 2 (Por Unidade):** Filtrado por `unidade_id`. Gerado para entrega à creche.
- **Relatório 3 (Social):** Agrupado por critérios (vulnerabilidade, LOAS, etc.).
- **Exportação:** Usar `csv.writer` do Python para gerar o arquivo. Nome: `relatorio_unidade_<id>_<data>.csv`.

### FR-11: Histórico de Alterações (Auditoria)
- **Tabela `audit_log`:** (id, entidade, registro_id, campo, valor_antigo, valor_novo, data_hora, operador).
- **Implementação:** SQLAlchemy `event.listen` para `before_update` em todas as entidades.
- **Observação:** A importação de dados históricos (FR-04) **não** dispara logs na tabela antiga, apenas na nova.

---

## 4. Modelo de Dados (PostgreSQL - Schema)

### 4.1 Diagrama Entidade-Relacionamento (Resumido)
- `unidades` (1) -> `turmas` (N)
- `inscricoes` (1) -> `responsavel` (1) -> `endereco` (1) (podem ser unificados em uma tabela para simplicidade)
- `inscricoes` (1) -> `crianca` (1)
- `inscricoes` (1) -> `irmaos` (N) (tabela separada ou array JSON)
- `inscricoes` (1) -> `dados_sociais` (1)

### 4.2 Tabelas Principais (SQL DDL - Essenciais)

```sql
CREATE TABLE unidades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20)
);

CREATE TABLE turmas (
    id SERIAL PRIMARY KEY,
    unidade_id INTEGER REFERENCES unidades(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    turno VARCHAR(20) CHECK (turno IN ('manha', 'tarde', 'integral')),
    idade_min_meses INTEGER NOT NULL,
    idade_max_meses INTEGER NOT NULL,
    vagas INTEGER
);

CREATE TABLE inscricoes (
    id SERIAL PRIMARY KEY,
    ano_referencia INTEGER NOT NULL,
    data_hora_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cpf_crianca VARCHAR(11) UNIQUE NOT NULL, -- Único por ano (controlado via código)
    nome_crianca VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    nome_pai VARCHAR(255),
    nome_mae VARCHAR(255) NOT NULL,
    -- Dados do Responsável (desnormalizado para performance)
    nome_responsavel VARCHAR(255) NOT NULL,
    cpf_responsavel VARCHAR(11) NOT NULL,
    rg_responsavel VARCHAR(20),
    parentesco VARCHAR(50),
    telefone VARCHAR(20),
    endereco_logradouro TEXT,
    -- Socioeconômico
    mae_empregada BOOLEAN DEFAULT FALSE,
    vulnerabilidade_social BOOLEAN DEFAULT FALSE,
    renda_per_capita DECIMAL(10,2),
    nis VARCHAR(20),
    cartao_sus VARCHAR(20),
    laudo_deficiencia BOOLEAN DEFAULT FALSE,
    -- Chaves estrangeiras
    unidade_id INTEGER REFERENCES unidades(id),
    turma_id INTEGER REFERENCES turmas(id)
);

CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    entidade VARCHAR(50),
    registro_id INTEGER,
    campo VARCHAR(100),
    valor_antigo TEXT,
    valor_novo TEXT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operador VARCHAR(50) DEFAULT 'Operador'
);
```

> **Nota:** Para manter a simplicidade local, optei por **desnormalizar** os dados do responsável e criança diretamente na tabela `inscricoes`, evitando joins complexos e facilitando a exportação do JSON. Caso prefira a 3ª Forma Normal, divida em tabelas separadas.

---

## 5. Requisitos Não Funcionais (NFR)

### NFR-01: Segurança
- **Senha de Acesso:** Hash utilizando `werkzeug.security.generate_password_hash` (PBKDF2).
- **PDF:** Protegido com senha (CPF) usando `pikepdf` ou a opção nativa do ReportLab (`encrypt`).
- **Sessão:** `Flask-Session` armazenada no lado do servidor (em memória ou arquivo).

### NFR-02: Performance
- A base terá no máximo ~1.500 registros históricos (400/ano * 4 anos). Consultas SQL com índices em `cpf_crianca` e `ano_referencia` são obrigatórias.
- O PDF deve ser gerado em menos de 2 segundos (WeasyPrint é mais lento que ReportLab, mas tem melhor renderização HTML. Para 400 inscrições, ReportLab é preferível).

### NFR-03: Backup e Resiliência
- **Backup do Banco:** O `run.py` deve incluir um comando CLI (ex: `flask backup-db`) que gera um dump SQL.
- **Recuperação:** O JSON gerado junto com o PDF serve como "fonte da verdade" para reimportação em caso de corrupção do banco.

### NFR-04: Usabilidade (Offline)
- Todo CSS/JS/Bootstrap deve ser servido localmente (não usar CDN externo), garantindo funcionamento offline total.

---

## 6. Especificações da Interface de Usuário (Telas)

### Tela 1: Login
- Campo: Senha.
- Botão: Acessar.

### Tela 2: Dashboard / Início da Campanha
- Exibe o Ano de Referência atual.
- Botões principais: "Nova Inscrição", "Consultar Inscrições", "Gerar Relatórios", "Cadastrar Unidades".

### Tela 3: Formulário de Inscrição (Dinâmico)
- **Topo:** CPF da Criança (readonly) + Data/Hora do registro.
- **Seções colapsáveis** (accordion) para organização.
- **Botões:** "Salvar", "Salvar e Cadastrar Irmão".

### Tela 4: Modal de Importação Histórica
- Exibe resumo dos dados encontrados (Nome, Unidade, Ano anterior).
- Botões: "Importar" (POST) ou "Começar do Zero".

### Tela 5: Relatórios
- Filtros (Unidade).
- Tabela com scroll.
- Botões: "Exportar CSV", "Imprimir Lista".

---

## 7. Restrições Técnicas e Decisões de Projeto

1.  **Sem API REST:** Utilizaremos `Flask-WTF` com `POST` endpoints que retornam redirecionamentos (`redirect(url_for(...))`). Apenas uma rota auxiliar `/api/turmas_por_unidade` para o dropdown (retorna JSON) será a única exceção, para melhorar a UX.
2.  **JavaScript:** Utilizar Vanilla JS. Evento `onfocus` para limpar campos, e `fetch` para carregar turmas dinamicamente.
3.  **Geração de PDF:** Usar **ReportLab** (mais rápido para processamento em lote e proteção por senha nativa) ou **WeasyPrint** (melhor fidelidade visual com CSS). Recomendo WeasyPrint por ser puramente Python e fácil de instalar no Windows via pip.
4.  **Logs:** Configurar `logging` do Python para `info` e `error`, salvando em um arquivo `.log` na pasta `instance` para depuração.

---

## 8. Plano de Implementação (Sugestão para o Dev)

1.  **Semana 1:** Setup do Flask, SQLAlchemy, definição dos Models e Migrations (Alembic). Autenticação básica.
2.  **Semana 2:** CRUD de Unidades e Turmas. Implementação do cálculo de idade e validação de turma.
3.  **Semana 3:** Fluxo principal de inscrição (formulário, validação CPF, salvamento).
4.  **Semana 4:** Implementação do serviço de importação histórica (busca no banco e preenchimento do form). Cadastro de irmãos.
5.  **Semana 5:** Geração de PDF + JSON. Testes de integridade (se o banco falha, o JSON ainda está lá).
6.  **Semana 6:** Relatórios (CSV e listas). Auditoria (logs de edição).
7.  **Semana 7:** Testes manuais de ponta a ponta (simular campanha de set-out) e ajustes finos de CSS.

---

## 9. Apêndice: Exemplo de Fluxo de Importação (Código Lógico)

```python
# services/importacao.py
def importar_dados_historicos(cpf, ano_atual):
    inscricao_antiga = Inscricao.query.filter_by(cpf_crianca=cpf).order_by(Inscricao.ano_referencia.desc()).first()
    if not inscricao_antiga:
        return None
    
    # Retorna um dicionário pronto para ser passado como `data` para o Form
    return {
        'nome_crianca': inscricao_antiga.nome_crianca,
        'data_nascimento': inscricao_antiga.data_nascimento,
        'nome_pai': inscricao_antiga.nome_pai,
        'nome_mae': inscricao_antiga.nome_mae,
        'nome_responsavel': inscricao_antiga.nome_responsavel,
        'cpf_responsavel': inscricao_antiga.cpf_responsavel,
        # ... todos os outros campos
        'unidade_id': inscricao_antiga.unidade_id,
        'turma_id': inscricao_antiga.turma_id
    }
```

