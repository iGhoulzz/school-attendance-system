// Settings.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Adjust the path if necessary
import './Settings.css';

function Settings() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    closeDropdown();
  };

  return (
    <div className="settings-container">
      <h2>{t('Settings')}</h2>
      <p>{t('adjustPreferences')}</p>

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
  );
}

export default Settings;
