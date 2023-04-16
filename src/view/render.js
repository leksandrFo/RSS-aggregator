import renderFeeds from './renderFeeds.js';
import renderError from './renderError.js';

const render = (elements, initialState, i18nextInstance) => (path, value) => {
  switch (path) {
    case 'data.feeds':
      renderFeeds(elements, i18nextInstance);
      console.log(initialState);
      break;

    case 'form.errors':
      renderError(elements, value);
      break;

    default:
      break;
  }
};

export default render;
