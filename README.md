# FiscalFlow

Orquestração Serverless para integração com NFSe Nacional (IBS/CBS) usando AWS SAM, Lambda e Step Functions.

## 📋 Sobre o Projeto

FiscalFlow é uma solução serverless que automatiza o processamento, emissão e notificação de Notas Fiscais de Serviço Eletrônicas (NFSe) conforme as especificações da Receita Federal (NT 1.01.03 - Anexo IV).

O sistema processa arquivos de backup carregados em um bucket S3, valida e transforma os dados, emite as notas fiscais e notifica os responsáveis via e-mail, tudo de forma automatizada através de uma Step Function orquestrada.

## 🏗️ Arquitetura

```
S3 Upload (backups/) 
    ↓ (EventBridge)
Step Functions Pipeline
    ↓
[Processor] → Valida e parseia dados
    ↓
[Approval Gate?] → Aprovação manual (prod)
    ↓
[Emitter] → Gera XML e comunica com portal
    ↓
[Notifier] → Envia notificações via SES
    ↓
Arquivos finalizados → processed/
```

### Componentes

- **ProcessorFunction**: Lê arquivos do S3, parseia e valida dados das notas fiscais
- **EmitterFunction**: Gera XML no formato nacional e salva resultado no S3
- **NotifierFunction**: Gerencia notificações por e-mail (aprovação, sucesso, falha)
- **NfseStateMachine**: Orquestra o fluxo completo com retry policies e error handling

## 🚀 Tecnologias

- **AWS SAM** (Serverless Application Model)
- **AWS Lambda** (Node.js 20.x)
- **AWS Step Functions** (State Machine)
- **Amazon S3** (Armazenamento)
- **Amazon EventBridge** (Triggers)
- **Amazon SES** (Notificações)
- **AWS CloudFormation** (Infraestrutura como código)

## 📂 Estrutura do Projeto

```
fiscal-flow/
├── src/
│   ├── handlers/
│   │   ├── processor.mjs    # Processamento de arquivos
│   │   ├── emitter.mjs      # Emissão de NFSe
│   │   └── notifier.mjs     # Notificações por e-mail
│   └── utils/
│       └── config.mjs        # Configurações centralizadas
├── statemachine/
│   └── nfse-pipeline.asl.json  # Definição da Step Function
├── events/
│   ├── s3-event.json        # Mock de evento S3
│   └── mock-payload.json    # Dados de teste
├── docs/
│   └── ENVIRONMENTS.md      # Documentação de ambientes
├── .study/
│   └── comandos-sam.md      # Referência de comandos
├── template.yaml            # Template SAM principal
├── samconfig.toml           # Configuração de ambientes
└── package.json             # Scripts npm
```

## ⚙️ Pré-requisitos

- [AWS CLI](https://aws.amazon.com/cli/) configurado
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) instalado
- [Node.js 20.x](https://nodejs.org/) ou superior
- Conta AWS com permissões adequadas

## 🔧 Configuração Inicial

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/fiscal-flow.git
cd fiscal-flow
```

### 2. Configure AWS Profiles

Crie três perfis AWS para cada ambiente:

```bash
aws configure --profile ci-fiscalflow-dev
aws configure --profile ci-fiscalflow-pre
aws configure --profile ci-fiscalflow-prod
```

### 3. Configure variáveis de ambiente (opcional)

Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Edite `.env` com suas credenciais e configurações.

### 4. Instale dependências

```bash
npm install
```

## 🚢 Deploy

### Ambientes Disponíveis

O projeto suporta três ambientes isolados:

| Ambiente | Stack | Profile | Aprovação Manual | Log Level |
|----------|-------|---------|------------------|-----------|
| **Dev** | `fiscal-flow-local` | `ci-fiscalflow-dev` | ❌ | DEBUG |
| **Pre** | `fiscal-flow-test` | `ci-fiscalflow-pre` | ❌ | INFO |
| **Prod** | `fiscal-flow-prod` | `ci-fiscalflow-prod` | ✅ | ERROR |

### Deploy por Ambiente

```bash
# Desenvolvimento
npm run sam:deploy:dev

# Pré-produção
npm run sam:deploy:pre

# Produção
npm run sam:deploy:prod
```

### Deploy Guiado (Primeira Vez)

```bash
sam deploy --guided
```

## 🧪 Testes

### Teste Local (Invocar Lambda)

```bash
npm run sam:invoke:processor
```

### Teste End-to-End (Upload no S3)

Após o deploy, faça upload de um arquivo na pasta `backups/`:

```bash
aws s3 cp events/mock-payload.json \
  s3://rentafit-fiscal-local-<ACCOUNT_ID>/backups/teste.json \
  --profile ci-fiscalflow-dev
```

### Monitorar Logs

```bash
# Dev
npm run sam:logs

# Pre
npm run sam:logs:test

# Prod
npm run sam:logs:prod
```

### Hot Reload (Desenvolvimento Iterativo)

```bash
sam sync --watch --stack-name fiscal-flow-local --profile ci-fiscalflow-dev
```

## 📊 Monitoramento

Acesse o Console AWS para monitorar:

- **Step Functions**: Visualize execuções da `NfseStateMachine`
- **CloudWatch Logs**: Logs detalhados de cada Lambda
- **S3**: Verifique arquivos em `backups/` e `processed/`
- **SES**: Confirme envio de e-mails de notificação

## 🔐 Segurança

### Credenciais

- **NUNCA** commite arquivos `.env` com credenciais reais
- Use AWS Secrets Manager para credenciais sensíveis em produção
- Habilite MFA para o profile de produção

### Permissões IAM

O projeto usa políticas gerenciadas do SAM:
- `S3ReadPolicy` / `S3WritePolicy` / `S3CrudPolicy`
- `LambdaInvokePolicy`
- `SESCrudPolicy`

### Tags

Todos os recursos são tagueados automaticamente com:
- `Environment`: (local/test/prod)
- `Project`: FiscalFlow

## 🛠️ Comandos Úteis

```bash
# Build
sam build

# Validar template
sam validate

# Deletar stack
sam delete --stack-name fiscal-flow-local --no-prompts --profile ci-fiscalflow-dev

# Ver identidade AWS
aws sts get-caller-identity --profile ci-fiscalflow-dev

# Listar stacks
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE

# Listar buckets
aws s3 ls --profile ci-fiscalflow-dev
```

Para mais comandos, veja [.study/comandos-sam.md](.study/comandos-sam.md).

## 📖 Documentação Adicional

- [Configuração de Ambientes](docs/ENVIRONMENTS.md)
- [Comandos SAM](.study/comandos-sam.md)

## 🗂️ Variáveis de Ambiente (Lambda)

Todas as funções Lambda recebem:

- `STAGE`: Ambiente atual (local/test/prod)
- `LOG_LEVEL`: Nível de log (DEBUG/INFO/ERROR)
- `BUCKET_NAME`: Nome do bucket S3
- `ADMIN_EMAIL`: Email do administrador (NotifierFunction)

## 🔄 Fluxo de Trabalho (Dev → Pre → Prod)

### Desenvolvimento
1. Desenvolva localmente com `sam sync --watch`
2. Teste com `npm run sam:invoke:processor`
3. Deploy: `npm run sam:deploy:dev`

### Pré-produção
1. Merge para branch `develop`
2. Deploy automático (CI/CD) ou manual: `npm run sam:deploy:pre`
3. Testes de integração e UAT

### Produção
1. Merge para branch `main`
2. Code review obrigatório
3. Deploy: `npm run sam:deploy:prod`
4. Aprovação manual de changesets
5. Monitoramento contínuo

## ⚠️ Troubleshooting

### Stack em ROLLBACK_COMPLETE

```bash
sam delete --stack-name fiscal-flow-local --no-prompts --profile ci-fiscalflow-dev
npm run sam:deploy:dev
```

### Erro: "The role cannot be assumed by Lambda"

Aguarde 10-15 segundos e tente novamente (propagação do IAM).

### EventBridge não dispara Step Function

Verifique se o EventBridge está habilitado no bucket:

```bash
aws s3api get-bucket-notification-configuration \
  --bucket <BUCKET_NAME> \
  --profile ci-fiscalflow-dev
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- **Seu Nome** - *Desenvolvimento inicial*

## 🙏 Agradecimentos

- AWS SAM Documentation
- Receita Federal - Especificação NT 1.01.03 (Anexo IV)
- Comunidade AWS Serverless

---

**Nota**: Este é um projeto educacional/demonstrativo. Para uso em produção, implemente validações adicionais, testes automatizados e práticas de segurança robustas.
