import { CustomProductView } from 'CustomProductView';
import { createRoot } from 'react-dom/client';

document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-product-customizer]');
  containers.forEach(container => {
    const productId = container.getAttribute('data-product-id');
    if (productId) {
      const root = createRoot(container);
      root.render(React.createElement(CustomProductView, { productId }));
    }
  });
});