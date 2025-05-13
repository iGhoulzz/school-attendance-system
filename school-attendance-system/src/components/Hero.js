import React from 'react';
import { useTranslation } from 'react-i18next';

function Hero() {
  const { t } = useTranslation();  // t function to access translations

  return (
    <section className="hero">
      <img src="https://via.placeholder.com/400" alt="School Placeholder" />
      <h2>{t('welcomeMessage')}</h2>
      <p>{t('description')}</p>
    </section>
  );
}

export default Hero;
