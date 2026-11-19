# Promessa Real

Revisor inteligente e preventivo de promessas publicitárias em saúde, cosméticos e suplementos alimentares voltado ao mercado brasileiro. O sistema audita textos publicitários identificando alegações proibidas ou exageradas frente às diretrizes gerais da Anvisa, Código de Defesa do Consumidor e Código Conar, sugerindo reescritas seguras em tom atrativo de venda.

Projeto de demonstracao para o Desafio de Inovacao YouShop 2027.

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.5-flash
```

- `GEMINI_API_KEY`: Chave da API do Google Gemini (obrigatória).
- `GEMINI_MODEL`: Modelo utilizado pela API serverless (padrão: `gemini-2.5-flash`).

## Como Rodar

### Instalação de dependências:
```bash
npm install
```

### Desenvolvimento Frontend:
```bash
npm run dev
```

### Desenvolvimento Completo (Frontend + Serverless API Local):
Para executar a API serverless (`api/analyze.js`) localmente com leitura das variáveis de ambiente:
```bash
vercel dev
```

## Aviso Legal

Ferramenta de apoio. Não substitui análise jurídica ou regulatória.
