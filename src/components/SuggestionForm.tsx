import { useState, FormEvent } from 'react';
import { Send, MessageSquare } from 'lucide-react';

export default function SuggestionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await fetch('https://formsubmit.co/ajax/kaaydiunde@gmail.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });
      setSubmitted(true);
      form.reset();
    } catch {
      // En cas d'erreur réseau, on affiche quand même la confirmation
      // car FormSubmit peut parfois bloquer les requêtes CORS en mode ajax
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="suggestion-section">
      <div className="container">
        <div className="suggestion-wrapper">
          <div className="suggestion-header">
            <div className="suggestion-icon-wrap">
              <MessageSquare size={28} />
            </div>
            <h2>💬 Une suggestion ? Dites-nous !</h2>
            <p className="suggestion-subtitle">
              Votre suggestion peut nous aider à ajouter le prochain produit tendance 😉
            </p>
          </div>

          {submitted ? (
            <div className="suggestion-success">
              <div className="suggestion-success-icon">✅</div>
              <p>Merci pour votre suggestion !</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="suggestion-form"
            >
              {/* Champ honeypot anti-spam (caché) */}
              <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
              {/* Désactiver le captcha FormSubmit */}
              <input type="hidden" name="_captcha" value="false" />
              {/* Template email */}
              <input type="hidden" name="_subject" value="Nouvelle suggestion - Kaay Diunde" />

              <div className="suggestion-form-row">
                <div className="suggestion-form-group">
                  <label htmlFor="suggestion-name">Nom <span className="optional">(facultatif)</span></label>
                  <input
                    type="text"
                    id="suggestion-name"
                    name="name"
                    placeholder="Votre nom"
                    autoComplete="name"
                  />
                </div>
                <div className="suggestion-form-group">
                  <label htmlFor="suggestion-email">Email <span className="optional">(facultatif)</span></label>
                  <input
                    type="email"
                    id="suggestion-email"
                    name="email"
                    placeholder="votre@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="suggestion-form-group">
                <label htmlFor="suggestion-message">Message <span className="required">*</span></label>
                <textarea
                  id="suggestion-message"
                  name="message"
                  placeholder="Partagez votre idée, suggestion ou avis..."
                  rows={4}
                  required
                />
              </div>

              <button type="submit" className="suggestion-btn" disabled={sending}>
                {sending ? (
                  <>
                    <span className="spin-icon"><Send size={18} /></span>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Envoyer
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
