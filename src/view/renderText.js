const renderText = (elements, i18nextInstance) => {
  const {
    title, subtitle, placeholder, example,
  } = elements.text;
  const { submitButton } = elements;
  title.textContent = i18nextInstance.t('title');
  subtitle.textContent = i18nextInstance.t('subtitle');
  placeholder.textContent = i18nextInstance.t('placeholder');
  submitButton.textContent = i18nextInstance.t('submitButton');
  example.textContent = i18nextInstance.t('example');
};

export default renderText;
