import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import "./LanguageSelector.css";

function LanguageSelector() {
  const [open, setOpen] = useState(false);

  const { language, setLanguage, currentLanguage, languages, t } =
    useLanguage();

  const handleChooseLanguage = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="language-button"
        onClick={() => setOpen(true)}
      >
        <img
          src={currentLanguage.flagUrl}
          alt={currentLanguage.countryName}
          className="language-button-flag-img"
        />

        <span className="language-button-text">
          {currentLanguage.displayName}
        </span>
      </button>

      {open && (
        <div className="language-modal">
          <div
            className="language-modal-overlay"
            onClick={() => setOpen(false)}
          ></div>

          <div className="language-modal-content simple-language-modal">
            <button
              type="button"
              className="language-close-btn"
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <h2>{t.language.choose}</h2>

            <div className="language-divider"></div>

            <h3>{t.language.suggested}</h3>

            <div className="language-grid simple-language-grid">
              {languages.map((item) => (
                <button
                  type="button"
                  className={`language-option ${
                    language === item.code ? "active" : ""
                  }`}
                  key={item.code}
                  onClick={() => handleChooseLanguage(item.code)}
                >
                  <span className="check-mark">
                    {language === item.code ? "✓" : ""}
                  </span>

                  <img
                    src={item.flagUrl}
                    alt={item.countryName}
                    className="language-flag-img"
                  />

                  <span className="language-name">
                    <strong>{item.countryName}</strong>
                    <small>{item.languageName}</small>
                  </span>
                </button>
              ))}
            </div>

            <p className="language-note">{t.language.foreignNote}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default LanguageSelector;