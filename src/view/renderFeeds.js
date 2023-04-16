const renderFeeds = (elements, i18nextInstance) => {
  const { input, feedback, form } = elements;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = i18nextInstance.t('success');

  input.focus();
  form.reset();
};

export default renderFeeds;
