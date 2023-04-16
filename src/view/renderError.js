const renderError = (elements, value) => {
  const { input, feedback } = elements;
  input.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = value;
};

export default renderError;
