import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // 从 URL 路径获取语言设置
    const path = window.location.pathname;
    if (path.startsWith('/en')) {
      setLanguage('en');
    } else if (path.startsWith('/zh')) {
      setLanguage('zh');
    } else {
      // 默认英文
      setLanguage('en');
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    // 更新 URL
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(/^\/(en|zh)/, `/${newLanguage}`);
    window.history.replaceState(null, '', newPath);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}; 