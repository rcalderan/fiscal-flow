# Configuração de Ambientes - FiscalFlow

## Ambientes Disponíveis

### 1. **Local** (Desenvolvimento)
- Stack: `fiscal-flow-local`
- Bucket: `fiscal-flow-local-{AccountId}`
- Log Level: `DEBUG`
- Timeout: 30s
- Aprovação Manual: **Desabilitada**
- Email Admin: `dev@costumerental.com`

**Deploy:**
```bash
npm run sam:deploy:local
```

### 2. **Test** (Homologação)
- Stack: `fiscal-flow-test`
- Bucket: `fiscal-flow-test-{AccountId}`
- Log Level: `INFO`
- Timeout: 60s
- Aprovação Manual: **Desabilitada**
- Email Admin: `test-alerts@costumerental.com`

**Deploy:**
```bash
npm run sam:deploy:test
```

### 3. **Prod** (Produção)
- Stack: `fiscal-flow-prod`
- Bucket: `fiscal-flow-prod-{AccountId}`
- Log Level: `ERROR`
- Timeout: 120s
- Aprovação Manual: **Habilitada**
- Email Admin: `ops@costumerental.com`

**Deploy:**
```bash
npm run sam:deploy:prod
```

## Comandos Úteis

### Build
```bash
npm run sam:build
```

### Deploy Guiado (Interactive)
```bash
npm run sam:deploy
```

### Logs por Ambiente
```bash
npm run sam:logs          # Local
npm run sam:logs:test     # Test
npm run sam:logs:prod     # Prod
```

### Teste Local
```bash
npm run sam:invoke:processor
```

## Estrutura de Variáveis de Ambiente

Todas as funções Lambda recebem:
- `STAGE`: Ambiente atual (local/test/prod)
- `LOG_LEVEL`: Nível de log (DEBUG/INFO/ERROR)
- `BUCKET_NAME`: Nome do bucket S3
- `ADMIN_EMAIL`: Email do administrador (somente NotifierFunction)

## Uso no Código

```javascript
import config from '../utils/config.mjs';

// Verificar ambiente
if (config.isProd()) {
  // Lógica específica de produção
}

// Log estruturado
config.log('INFO', 'Processing invoice', { invoiceId: '123' });
```
