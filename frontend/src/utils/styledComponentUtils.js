/**
 * Styled Component Utils
 * 
 * This file contains utility functions to help with styled-component issues,
 * particularly handling props that shouldn't be passed to DOM elements.
 */

// This is a list of custom props that we don't want to pass to DOM elements
const OMITTED_PROPS = [
  'active',     // Used for active state in buttons, tabs, etc.
  'isActive',   // Alternative for active state
  'isDesc',     // Used for sorting direction
  'inStock',    // Used for product stock indicator
  'featured',   // Used for featured badges
  'status',     // Used for status badges/indicators
  'small',      // Used for button/component size variants
  'completed',  // Used for completed steps, etc.
];

/**
 * Filter function that can be used with styled-components to prevent 
 * non-standard props from being passed to DOM elements
 * 
 * Usage example:
 * const StyledButton = styled.button.withConfig({
 *   shouldForwardProp: shouldForwardProp,
 * })`
 *   color: ${props => props.active ? 'red' : 'blue'};
 * `;
 */
export const shouldForwardProp = (prop, defaultValidatorFn) => {
  // If it's one of our custom props, don't forward it
  if (OMITTED_PROPS.includes(prop)) {
    return false;
  }
  
  // For all other props, use the default validator if provided
  return defaultValidatorFn ? defaultValidatorFn(prop) : true;
};

/**
 * A HOC that adds the shouldForwardProp configuration to any styled component
 * to prevent DOM warnings about non-standard props
 * 
 * Usage example:
 * const Button = filterProps(styled.button)`
 *   // your styles here
 * `;
 */
export const filterProps = (StyledComponent) => {
  return StyledComponent.withConfig({
    shouldForwardProp,
  });
};
