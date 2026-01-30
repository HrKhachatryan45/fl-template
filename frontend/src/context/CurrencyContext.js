import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

// Exchange rates (base: AMD)
// 1 USD = 400 AMD
// 1 RUB = 4.5 AMD
const EXCHANGE_RATES = {
  AMD: 1,
  USD: 400,
  RUB: 4.5,
};

const CURRENCY_SYMBOLS = {
  AMD: '֏',
  USD: '$',
  RUB: '₽',
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('AMD');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('dzaghik_currency');
    if (savedCurrency && ['AMD', 'USD', 'RUB'].includes(savedCurrency)) {
      setCurrency(savedCurrency);
    }
  }, []);

  const changeCurrency = (curr) => {
    if (['AMD', 'USD', 'RUB'].includes(curr)) {
      setCurrency(curr);
      localStorage.setItem('dzaghik_currency', curr);
    }
  };

  // Convert price from AMD to selected currency
  const convertPrice = (priceInAMD) => {
    if (!priceInAMD || isNaN(priceInAMD)) return 0;
    
    const price = parseFloat(priceInAMD);
    
    if (currency === 'AMD') {
      return Math.round(price);
    } else if (currency === 'USD') {
      return (price / EXCHANGE_RATES.USD).toFixed(2);
    } else if (currency === 'RUB') {
      return (price / EXCHANGE_RATES.RUB).toFixed(2);
    }
    
    return price;
  };

  // Format price with currency symbol
  const formatPrice = (priceInAMD) => {
    const convertedPrice = convertPrice(priceInAMD);
    const symbol = CURRENCY_SYMBOLS[currency];
    
    if (currency === 'AMD') {
      return `${parseInt(convertedPrice).toLocaleString()} ${symbol}`;
    } else if (currency === 'USD') {
      return `${symbol}${parseFloat(convertedPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (currency === 'RUB') {
      return `${parseFloat(convertedPrice).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
    }
    
    return `${convertedPrice} ${symbol}`;
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    return CURRENCY_SYMBOLS[currency];
  };

  // Convert price back to AMD (for order placement)
  const convertToAMD = (price) => {
    if (!price || isNaN(price)) return 0;
    
    const priceNum = parseFloat(price);
    
    if (currency === 'AMD') {
      return priceNum;
    } else if (currency === 'USD') {
      return priceNum * EXCHANGE_RATES.USD;
    } else if (currency === 'RUB') {
      return priceNum * EXCHANGE_RATES.RUB;
    }
    
    return priceNum;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        changeCurrency,
        convertPrice,
        formatPrice,
        getCurrencySymbol,
        convertToAMD,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
