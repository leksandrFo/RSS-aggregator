/* eslint no-param-reassign: ["error", { "props": false }] */

const renderText = (elements, i18nextInstance) => {
  const {
    title,
    subtitle,
    placeholder,
    example,
  } = elements.text;
  const { submitButton } = elements;
  title.textContent = i18nextInstance.t('title');
  subtitle.textContent = i18nextInstance.t('subtitle');
  placeholder.textContent = i18nextInstance.t('placeholder');
  submitButton.textContent = i18nextInstance.t('submitButton');
  example.textContent = i18nextInstance.t('example');
};

const renderFeeds = (elements, initialState, i18nextInstance) => {
  elements.feeds.innerHTML = '';
  const { feeds } = initialState.data;

  const divCardBorder = document.createElement('div');
  divCardBorder.classList.add('card', 'border-0');

  const divCardBody = document.createElement('div');
  divCardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nextInstance.t('feeds');

  divCardBody.append(cardTitle);
  divCardBorder.append(divCardBody);

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');

  feeds.forEach((feed) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.textContent = feed.title;
    const feedDescription = document.createElement('p');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedDescription.textContent = feed.description;
    listItem.append(feedTitle, feedDescription);
    listGroup.append(listItem);
  });

  divCardBody.append(listGroup);
  elements.feeds.append(divCardBorder);
};

const renderPosts = (elements, initialState, i18nextInstance) => {
  elements.posts.innerHTML = '';
  const { posts } = initialState.data;

  const divCardBorder = document.createElement('div');
  divCardBorder.classList.add('card', 'border-0');

  const divCardBody = document.createElement('div');
  divCardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nextInstance.t('posts');

  divCardBody.append(cardTitle);
  divCardBorder.append(divCardBody);

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');

  posts.forEach((post) => {
    const listItem = document.createElement('li');
    listItem.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    const link = document.createElement('a');
    link.classList.add('fw-bold');
    link.setAttribute('href', post.link);
    link.setAttribute('data-id', post.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.title;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = i18nextInstance.t('view');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');

    listItem.append(link, button);
    listGroup.append(listItem);
  });

  divCardBody.append(listGroup);
  elements.posts.append(divCardBorder);
};

const renderError = (elements, initialState, i18nextInstance) => {
  elements.submitButton.removeAttribute('disabled');
  elements.input.removeAttribute('disabled');
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  if (
    initialState.form.processError === 'network'
    || initialState.form.processError === 'doesNotContainsRSS'
  ) {
    elements.feedback.textContent = i18nextInstance.t(
      `errors.${initialState.form.processError}`,
    );
  } else {
    elements.feedback.textContent = initialState.form.processError;
  }
};

const handlerProcessState = (elements, initialState, i18nextInstance) => {
  const { processState } = initialState.form;
  switch (processState) {
    case 'filling':
      elements.submitButton.removeAttribute('disabled');
      elements.input.removeAttribute('disabled');
      break;
    case 'sending':
      elements.submitButton.setAttribute('disabled', 'disabled');
      elements.input.setAttribute('disabled', 'disabled');
      break;
    case 'finished':
      elements.submitButton.removeAttribute('disabled');
      elements.input.removeAttribute('disabled');
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18nextInstance.t('success');
      break;
    case 'error':
      renderError(elements, initialState, i18nextInstance);
      break;
    default:
      break;
  }
};

const render = (elements, initialState, i18nextInstance) => (path) => {
  switch (path) {
    case 'form.processState':
      handlerProcessState(elements, initialState, i18nextInstance);
      break;

    case 'form.processError':
      renderError(elements, initialState, i18nextInstance);
      break;

    case 'data.feeds':
      renderFeeds(elements, initialState, i18nextInstance);
      break;

    case 'data.posts':
      renderPosts(elements, initialState, i18nextInstance);
      break;

    default:
      break;
  }
};

export { render, renderText };
