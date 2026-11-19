import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { EXAMPLES } from './examples.js';

export default function App() {
  const [texto, setTexto] = useState('');
  const [analyzedText, setAnalyzedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const characterCount = texto.length;
  const isSubmitDisabled = characterCount < 20 || characterCount > 4000 || isLoading;

  const analyzeContent = async (textToAnalyze) => {
    const content = typeof textToAnalyze === 'string' ? textToAnalyze : texto;
    if (content.trim().length < 20 || content.length > 4000) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setAnalyzedText(content);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texto: content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.erro || 'Erro ao processar a análise.');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'Falha na comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeContent(texto);
  };

  const handleExampleClick = (exampleText) => {
    setTexto(exampleText);
    analyzeContent(exampleText);
  };

  const handleCopy = async (sugestao, index) => {
    try {
      await navigator.clipboard.writeText(sugestao);
      setCopiedIndex(index);
      setTimeout(() => {
        setCopiedIndex((prev) => (prev === index ? null : prev));
      }, 2000);
    } catch {
      // Falha silenciosa no clipboard
    }
  };

  const renderHighlightedOriginalText = (originalText, trechos) => {
    if (!originalText) return null;
    if (!Array.isArray(trechos) || trechos.length === 0) {
      return <p className="original-plain-paragraph">{originalText}</p>;
    }

    let currentIndex = 0;
    const parts = [];

    trechos.forEach((trecho, idx) => {
      const snippet = trecho?.texto;
      if (!snippet) return;

      const foundIndex = originalText.indexOf(snippet, currentIndex);
      if (foundIndex !== -1) {
        if (foundIndex > currentIndex) {
          parts.push({
            type: 'text',
            content: originalText.slice(currentIndex, foundIndex),
            key: `plain-${currentIndex}-${foundIndex}`,
          });
        }

        parts.push({
          type: 'highlight',
          content: snippet,
          nivel: trecho.nivel,
          key: `highlight-${foundIndex}-${idx}`,
        });

        currentIndex = foundIndex + snippet.length;
      }
    });

    if (currentIndex < originalText.length) {
      parts.push({
        type: 'text',
        content: originalText.slice(currentIndex),
        key: `plain-${currentIndex}-end`,
      });
    }

    return (
      <div className="annotated-text-box">
        {parts.map((part) => {
          if (part.type === 'text') {
            return <span key={part.key}>{part.content}</span>;
          }
          return (
            <mark
              key={part.key}
              className={`text-mark mark-${part.nivel}`}
              title={`Classificação: ${part.nivel}`}
            >
              {part.content}
            </mark>
          );
        })}
      </div>
    );
  };

  const getRiskMeta = (risco) => {
    switch (risco) {
      case 'alto':
        return {
          icon: <XCircle size={24} aria-hidden="true" />,
          label: 'Risco Alto',
          classe: 'risk-badge-red',
        };
      case 'baixo':
        return {
          icon: <CheckCircle2 size={24} aria-hidden="true" />,
          label: 'Risco Baixo',
          classe: 'risk-badge-green',
        };
      case 'medio':
      default:
        return {
          icon: <AlertTriangle size={24} aria-hidden="true" />,
          label: 'Risco Médio',
          classe: 'risk-badge-yellow',
        };
    }
  };

  const getSnippetBadge = (nivel) => {
    switch (nivel) {
      case 'vermelho':
        return {
          icon: <XCircle size={16} aria-hidden="true" />,
          label: 'Promessa Proibida (Vermelho)',
          classe: 'level-tag-red',
        };
      case 'verde':
        return {
          icon: <CheckCircle2 size={16} aria-hidden="true" />,
          label: 'Descrição Permitida (Verde)',
          classe: 'level-tag-green',
        };
      case 'amarelo':
      default:
        return {
          icon: <AlertTriangle size={16} aria-hidden="true" />,
          label: 'Atenção / Precisa de Prova (Amarelo)',
          classe: 'level-tag-yellow',
        };
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-container">
          <div className="brand-group">
            <span className="brand-kicker">Revisor de promessas em saúde e beleza</span>
            <h1 className="brand-title">Promessa Real</h1>
          </div>
          <p className="brand-subtitle">
            Revisor preventivo de alegações publicitárias em saúde, cosméticos e suplementos.
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="workspace-grid">
          {/* Coluna 1: Entrada e Exemplos */}
          <section className="input-panel" aria-label="Editor de texto para análise">
            <form onSubmit={handleSubmit} className="analysis-form">
              <div className="form-header">
                <label htmlFor="anuncio-texto" className="form-label">
                  Texto do anúncio ou postagem
                </label>
                <span
                  className={`char-counter ${
                    characterCount > 4000
                      ? 'counter-error'
                      : characterCount < 20 && characterCount > 0
                      ? 'counter-warn'
                      : ''
                  }`}
                  aria-live="polite"
                >
                  {characterCount} / 4000 caracteres
                  {characterCount > 0 && characterCount < 20 && ' (mínimo 20)'}
                </span>
              </div>

              <textarea
                id="anuncio-texto"
                name="texto"
                className="text-input"
                rows={9}
                placeholder="Cole aqui o texto da postagem, legenda ou página de vendas para auditar promessas antes de publicar..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                maxLength={4000}
                required
              />

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitDisabled}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="spinner" size={18} aria-hidden="true" />
                      <span>Analisando conformidade...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} aria-hidden="true" />
                      <span>Analisar promessas</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mandatory-notice" role="note">
                <p>Ferramenta de apoio. Não substitui análise jurídica ou regulatória.</p>
              </div>
            </form>

            <div className="examples-card">
              <span className="examples-heading">Exemplos prontos (textos fictícios)</span>
              <div className="examples-button-group">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    className="example-btn"
                    onClick={() => handleExampleClick(ex.texto)}
                    disabled={isLoading}
                  >
                    Testar com: {ex.rotulo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Coluna 2: Resultados */}
          <section
            className="output-panel"
            aria-live="polite"
            aria-busy={isLoading}
            aria-label="Resultados da análise"
          >
            {error && (
              <div className="alert-box" role="alert">
                <AlertTriangle size={20} className="alert-icon" aria-hidden="true" />
                <div className="alert-content">
                  <h3 className="alert-title">Não foi possível concluir a análise</h3>
                  <p className="alert-message">{error}</p>
                </div>
              </div>
            )}

            {isLoading && !result && (
              <div className="loading-state">
                <Loader2 className="spinner-large" size={36} aria-hidden="true" />
                <h3>Auditando texto com base nos critérios Anvisa e Conar...</h3>
                <p>Mapeando alegações numéricas, promessas terapêuticas e claims superlativos.</p>
              </div>
            )}

            {!isLoading && !result && !error && (
              <div className="empty-state">
                <div className="empty-badge">Aguardando texto</div>
                <h3 className="empty-title">Nenhuma análise realizada ainda</h3>
                <p className="empty-text">
                  Cole um texto no campo ou escolha um exemplo para ver os trechos marcados e as sugestões.
                </p>
              </div>
            )}

            {result && (
              <div className="results-container">
                {/* Faixa de Risco Geral e Resumo */}
                {(() => {
                  const riskMeta = getRiskMeta(result.risco_geral);
                  return (
                    <div className={`risk-banner ${riskMeta.classe}`}>
                      <div className="risk-banner-header">
                        {riskMeta.icon}
                        <div>
                          <span className="risk-banner-label">Nível Geral: {riskMeta.label}</span>
                          <h2 className="risk-banner-title">Diagnóstico do Anúncio</h2>
                        </div>
                      </div>
                      <p className="risk-summary">{result.resumo}</p>
                    </div>
                  );
                })()}

                {/* Texto original com trechos destacados */}
                <div className="annotated-view-card">
                  <div className="view-card-header">
                    <h3 className="view-card-title">Texto auditado no contexto</h3>
                    <div className="view-legend">
                      <span className="legend-chip legend-red">Vermelho: Proibido</span>
                      <span className="legend-chip legend-yellow">Amarelo: Ajustar</span>
                      <span className="legend-chip legend-green">Verde: Permitido</span>
                    </div>
                  </div>
                  {renderHighlightedOriginalText(analyzedText, result.trechos)}
                </div>

                {/* Lista detalhada de trechos */}
                <div className="trechos-section">
                  <h3 className="trechos-title">
                    Detalhamento por Trecho ({result.trechos?.length || 0})
                  </h3>

                  <div className="trechos-feed">
                    {result.trechos?.map((item, index) => {
                      const badge = getSnippetBadge(item.nivel);
                      const isCopied = copiedIndex === index;

                      return (
                        <article
                          key={`trecho-${index}`}
                          className={`trecho-card card-border-${item.nivel}`}
                        >
                          <div className="trecho-card-header">
                            <span className={`trecho-tag ${badge.classe}`}>
                              {badge.icon}
                              <span>{badge.label}</span>
                            </span>
                            <span className="trecho-index">Trecho #{index + 1}</span>
                          </div>

                          <blockquote className="trecho-quote">
                            "{item.texto}"
                          </blockquote>

                          <div className="trecho-body">
                            <div className="trecho-meta-item">
                              <span className="trecho-meta-label">Motivo da classificação:</span>
                              <p className="trecho-meta-value">{item.motivo}</p>
                            </div>

                            <div className="trecho-meta-item">
                              <span className="trecho-meta-label">Diretriz de referência:</span>
                              <p className="trecho-meta-value">{item.regra}</p>
                            </div>

                            {item.sugestao && (
                              <div className="suggestion-box">
                                <div className="suggestion-header">
                                  <span className="suggestion-label">Sugestão de reescrita segura:</span>
                                  <button
                                    type="button"
                                    className={`btn-copy ${isCopied ? 'btn-copied' : ''}`}
                                    onClick={() => handleCopy(item.sugestao, index)}
                                    title="Copiar sugestão para a área de transferência"
                                  >
                                    {isCopied ? (
                                      <>
                                        <Check size={14} aria-hidden="true" />
                                        <span>Copiado!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={14} aria-hidden="true" />
                                        <span>Copiar sugestão</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <p className="suggestion-text">{item.sugestao}</p>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <p className="footer-disclaimer">
            Ferramenta de apoio. Não substitui análise jurídica ou regulatória.
          </p>
        </div>
      </footer>
    </div>
  );
}
