import { useEffect, useState } from 'react';

export const useColorScheme = () => {
    const [colorScheme, setColorScheme] = useState(
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        : "none"
    );

    useEffect(() => {
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handler = () => setColorScheme(mediaQuery.matches ? 'dark' : 'light');

          mediaQuery.addEventListener('change', handler);
          return () => mediaQuery.removeEventListener('change', handler);
        }
    }, []);

    return colorScheme;
};
