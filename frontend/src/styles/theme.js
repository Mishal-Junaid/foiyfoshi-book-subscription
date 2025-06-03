import { createGlobalStyle } from 'styled-components';

// Font imports
import '@fontsource/playfair-display';
import '@fontsource/montserrat';

// FoiyFoshi color palette from the provided image
export const theme = {
  colors: {
    // Main colors
    black: '#0D1012', // Instead of pure black
    darkGrey: '#231F20',
    darkBrown: '#0A0204',
    
    // Gold colors
    gold: '#805A29', // Main gold
    lightGold: '#A47031',
    mediumGold: '#EBBE77',
    paleGold: '#F3D29D',
    
    // Utility colors
    white: '#FFFFFF',
    background: '#FAFAFA',
    lightGrey: '#EEEEEE',
    error: '#D32F2F',
    success: '#388E3C',
  },
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Montserrat', sans-serif",
  },
  breakpoints: {
    xs: '320px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.10), 0 1px 3px rgba(0, 0, 0, 0.08)',
    large: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
  },
  transitions: {
    short: '0.3s ease',
    medium: '0.5s ease',
    long: '0.7s ease',
  },
};

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    overflow-x: hidden;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${props => props.theme.fonts.body};
    font-size: 16px;
    line-height: 1.6;
    color: ${props => props.theme.colors.black};
    background-color: ${props => props.theme.colors.background};
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${props => props.theme.fonts.heading};
    margin-bottom: 1rem;
    line-height: 1.2;
    font-weight: 700;
    color: ${props => props.theme.colors.black};
  }

  h1 {
    font-size: 3rem;
    
    @media (max-width: ${props => props.theme.breakpoints.md}) {
      font-size: 2.5rem;
    }
  }

  h2 {
    font-size: 2.5rem;
    
    @media (max-width: ${props => props.theme.breakpoints.md}) {
      font-size: 2rem;
    }
  }

  h3 {
    font-size: 2rem;
    
    @media (max-width: ${props => props.theme.breakpoints.md}) {
      font-size: 1.75rem;
    }
  }

  p {
    margin-bottom: 1rem;
  }

  a {
    color: ${props => props.theme.colors.gold};
    text-decoration: none;
    transition: ${props => props.theme.transitions.short};
    
    &:hover {
      color: ${props => props.theme.colors.lightGold};
    }
  }

  button {
    font-family: ${props => props.theme.fonts.body};
  }

  img {
    max-width: 100%;
    height: auto;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
`;

export default theme;
