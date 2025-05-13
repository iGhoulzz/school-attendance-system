// Footer.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Import i18n to change the language

function Footer() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    closeDropdown();
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <p><i className="fa-regular fa-paper-plane"></i> {t('contactUs')}: [Email Placeholder]</p>
        <p><i className="fas fa-map-location-dot"></i> {t('address')}: [Location Placeholder]</p>

        <div className="language-selector">
          <button className="lang-btn" onClick={toggleDropdown}>
            <i className="fa-solid fa-language"></i>
            <span>{t('Language')}</span>
          </button>

          {isOpen && (
            <ul className="lang-dropdown" onMouseLeave={closeDropdown}>
              <li onClick={() => handleLanguageChange('en')}>English</li>
              <li onClick={() => handleLanguageChange('ar')}>العربية</li>
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;





