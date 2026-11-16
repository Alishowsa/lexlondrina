# LexLondrina

**As leis municipais de Londrina explicadas em linguagem simples, sempre com o artigo e a fonte oficial.**

🔗 **Acesse:** https://lexlondrina.vercel.app

> Protótipo funcional. As leis do acervo de exemplo são **fictícias** e, no modo demonstração, as respostas da IA são **simuladas** e aparecem com o selo "resposta simulada". Veja a seção [Limitações](#limitações).

---

## 1. O problema

Londrina tem milhares de leis municipais (cerca de 14.300 no acervo da Câmara). Elas definem coisas do dia a dia: onde se pode abrir um bar, quem conserta a calçada, quando é preciso autorização para cortar uma árvore. Mas:

- **o cidadão** não sabe qual lei procurar e, quando encontra, não entende o texto jurídico;
- **o pequeno empreendedor** descobre uma restrição só depois de investir;
- **os vereadores** não têm um retrato organizado de quais leis a população considera ultrapassadas;
- **a assessoria legislativa** compara projetos novos com as leis existentes de forma manual.

## 2. A proposta

O LexLondrina recebe uma pergunta em linguagem comum, encontra os artigos de lei que tratam do assunto e devolve:

1. um **veredito** (permitido, não permitido, depende);
2. uma **explicação curta** em linguagem simples;
3. o **trecho exato da lei** que sustenta a resposta, marcado no texto oficial;
4. a **situação da lei** (vigente, alterada, revogada) e sua linha do tempo.

**Princípio central: a IA não responde sem fonte.** Ela só pode usar os artigos encontrados no acervo. Quando nenhum artigo sustenta uma resposta, o sistema diz que não encontrou, em vez de inventar.

## 3. Funcionalidades

| Tela | Para quem | O que faz |
|---|---|---|
| **Consultar** | Cidadão | Pergunta livre ("Posso abrir uma boate perto de um hospital?"), com veredito, explicação, trecho da lei marcado, as etapas do raciocínio e a linha do tempo da lei. Aceita endereço opcional, que é convertido em zona urbana. |
| **Sugerir mudança** | Cidadão | Em qualquer resposta, a pessoa pode dizer que a regra não faz mais sentido e por quê. Outras pessoas podem apoiar a mesma sugestão. |
| **Minhas sugestões** | Cidadão | Acompanha o andamento (recebida → em análise → respondida → virou projeto) e encaminha à Ouvidoria da Câmara por e-mail. |
| **Painel do vereador** | Vereadores e gabinetes | Ranking dos artigos com mais pedidos de mudança, distribuição por bairro, resumo dos motivos feito pela IA, **rascunho de nova redação** e resposta à população. |
| **Triagem de projeto** | Assessoria legislativa | Compara um projeto de lei com o acervo e aponta **possíveis conflitos** e **repetições** com leis vigentes, com nível de confiança. |
| **Acervo** | Equipe técnica | Importa leis em PDF, HTML, XML ou TXT, divide em artigos, classifica por tema e calcula a vigência a partir das referências "altera" e "revoga" entre as leis. |

## 4. Como funciona

```
Pergunta do cidadão
      │
      ▼
① Busca no acervo ──── algoritmo BM25 sobre os artigos (ranqueamento por relevância)
      │                 + filtro por tema + zona do endereço
      ▼
② Artigos relevantes ── com situação da lei (vigente / alterada / revogada)
      │
      ▼
③ IA redige ─────────── recebe SÓ esses artigos e instruções para:
      │                  · não usar conhecimento externo
      │                  · citar os artigos usados
      │                  · escrever para leigos, em até 4 frases
      ▼
④ Tela de resposta ──── veredito + explicação + trecho marcado na lei oficial
```

**Por que esse desenho?** Modelos de linguagem podem "inventar" informações com aparência confiável. Em um tema jurídico, isso é inaceitável. Ao separar a **busca** (determinística e auditável) da **redação** (feita pela IA) e obrigar a citação, cada resposta pode ser conferida pelo próprio usuário no texto da lei.

### Arquitetura técnica

- **Front-end:** um único arquivo `index.html` (HTML, CSS e JavaScript puro, sem frameworks). Leitura de PDF com [pdf.js](https://mozilla.github.io/pdf.js/).
- **Busca:** índice BM25 implementado no próprio navegador. Não depende de serviço externo.
- **IA:** modelo Claude, da Anthropic, chamado por uma função serverless (`api/ia.js`) na Vercel. **A chave de acesso fica só no servidor** e nunca chega ao navegador de quem usa o site. A função limita o tamanho das mensagens e das respostas, para controlar custo e abuso.
- **Hospedagem:** Vercel (plano gratuito).
- **Dados do protótipo:** acervo e sugestões ficam salvos no navegador de cada usuário (`localStorage`). Em produção, isso iria para um banco de dados compartilhado.

### Modos da IA

| Modo | Quando é usado | Comportamento |
|---|---|---|
| **IA no servidor** | Quando a chave está configurada na Vercel | Respostas reais do modelo Claude. |
| **Demonstração** | Padrão do site publicado, sem custo | Respostas montadas por regras a partir dos artigos encontrados. Sempre marcadas como **"resposta simulada"**. |
| **Chave própria** | Aba "Configurar IA" | A pessoa usa a própria chave (Anthropic ou OpenAI), salva só no navegador dela. |
| **Modo busca** | Sem IA | Mostra os artigos encontrados, sem texto gerado. |

## 5. Identidade visual

A identidade **"Terra Roxa"** foi criada para o projeto. Ela une a cor da terra roxa de Londrina, o aspecto de papel de cartório e a tipografia editorial, para transmitir **documento oficial** em vez de "aplicativo genérico". Alguns elementos reforçam a ideia de que **toda resposta tem fonte**:

- o veredito aparece como um **carimbo**;
- o trecho da lei usado na resposta é marcado como **marca-texto**;
- as citações de lei usam fonte monoespaçada, como um documento datilografado;
- os ícones foram desenhados no mesmo traço, sem emojis.

Fontes: Fraunces (títulos), Inter (texto) e IBM Plex Mono (citações e selos).

## 6. Como testar (roteiro sugerido)

1. Abra **https://lexlondrina.vercel.app**. O acervo de exemplo carrega sozinho.
2. Observe a ficha **"Demonstração ao vivo"** no topo e clique nela.
3. Na resposta, passe o mouse sobre o número **1**: o trecho correspondente pisca na lei ao lado.
4. Clique em **"Sugerir mudança aos vereadores"** e envie uma sugestão.
5. Vá ao **Painel do vereador**, clique em "Carregar sugestões simuladas" e teste **"Resumir motivos"** e **"Gerar rascunho"**.
6. Vá à **Triagem de projeto** e clique em **"Analisar projeto com IA"** com o projeto de exemplo.

Outras perguntas de exemplo: *"Posso cortar a árvore do meu terreno?"*, *"Quem deve arrumar a calçada?"*.

## Limitações

Assumimos estas limitações de forma explícita:

- **Leis fictícias no exemplo.** O acervo de demonstração usa leis inventadas (Lei nº 90.001/2010 etc.), identificadas com o selo "fictícia". Leis reais podem ser importadas na aba Acervo a partir do site da Câmara Municipal.
- **Respostas simuladas no modo demonstração.** Sem chave de IA configurada, as respostas são geradas por regras e marcadas como simuladas. Elas funcionam bem com perguntas parecidas com os exemplos.
- **Não é parecer jurídico.** O sistema orienta e indica a fonte, mas não substitui um advogado nem a análise oficial da Prefeitura ou da Câmara. A triagem de projetos aponta *possíveis* problemas para revisão humana.
- **Dados locais.** No protótipo, sugestões e acervo ficam no navegador de cada pessoa e não são compartilhados entre usuários.
- **Zoneamento simplificado.** A conversão de endereço em zona usa uma tabela manual, até existir integração com o mapa de zoneamento digital do município.

## Próximos passos

- Importar o acervo completo da Câmara Municipal de Londrina, com atualização automática.
- Banco de dados compartilhado para sugestões e respostas dos gabinetes.
- Integração com o mapa oficial de zoneamento (consulta por endereço real).
- Avaliação da qualidade das respostas com especialistas em direito municipal.
- Acessibilidade: leitura em voz alta e versão em linguagem ainda mais simples.

## Estrutura do projeto

```
lexlodrina/
├── index.html     → o sistema inteiro (telas, busca, demonstração, estilos)
├── api/
│   └── ia.js      → função no servidor que chama a IA sem expor a chave
├── README.md      → este documento
├── .gitignore     → arquivos que não vão para o Git
└── .vercelignore  → arquivos que não vão para o site publicado
```

---