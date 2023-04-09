const renderFeed = (elements) => {
  const { input, feedback, form } = elements;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = 'RSS uploaded successfully';

  input.focus();
  form.reset();
};

const renderError = (elements, value) => {
  const { input, feedback } = elements;
  input.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = value;
};

const render = (elements, initialState) => (path, value) => {
  switch (path) {
    case 'data.feeds':
      renderFeed(elements);
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
