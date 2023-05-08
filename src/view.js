/* eslint no-param-reassign: ["error", { "props": false }] */
import onChange from 'on-change';

const renderText = (elements, i18next) => {
  const {
    title,
    subtitle,
    placeholder,
    example,
  } = elements.text;
  const { submitButton } = elements;
  title.textContent = i18next.t('title');
  subtitle.textContent = i18next.t('subtitle');
  placeholder.textContent = i18next.t('placeholder');
  submitButton.textContent = i18next.t('submitButton');
  example.textContent = i18next.t('example');
};

const renderFeeds = (elements, state, i18next) => {
  elements.feeds.innerHTML = '';
  const { feeds } = state.rss;

  const divCardBorder = document.createElement('div');
  divCardBorder.classList.add('card', 'border-0');

  const divCardBody = document.createElement('div');
  divCardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18next.t('feeds');

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

const renderPosts = (elements, state, i18next) => {
  elements.posts.innerHTML = '';
  const { posts } = state.rss;

  const divCardBorder = document.createElement('div');
  divCardBorder.classList.add('card', 'border-0');

  const divCardBody = document.createElement('div');
  divCardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18next.t('posts');

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
    if (state.ui.readedPosts.includes(post.link)) {
      link.classList.add('fw-normal', 'link-secondary');
    } else {
      link.classList.add('fw-bold');
    }
    link.setAttribute('href', post.link);
    link.setAttribute('data-id', post.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.title;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = i18next.t('view');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    listItem.append(link, button);
    listGroup.append(listItem);
  });

  divCardBody.append(listGroup);
  elements.posts.append(divCardBorder);
};

const renderModal = (elements, state, i18next, value) => {
  if (value) {
    const {
      title,
      description,
      openButton,
      closeButtonFooter,
    } = elements.modal;
    openButton.textContent = i18next.t('modal.read');
    closeButtonFooter.textContent = i18next.t('modal.close');
    const id = state.ui.openedPostId;
    const currentPost = state.rss.posts.find((post) => post.id === id);
    title.textContent = currentPost.title;
    description.textContent = currentPost.description;
    openButton.setAttribute('href', currentPost.link);
    const link = document.querySelector(`a[data-id="${id}"]`);
    link.classList.remove('fw-bold');
    link.classList.add('fw-normal', 'link-secondary');
  }
};

const renderError = (elements, state, i18next) => {
  elements.submitButton.removeAttribute('disabled');
  elements.input.removeAttribute('disabled');
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  elements.feedback.textContent = i18next.t(state.form.processError);
};

const handlerProcessState = (elements, state, i18next) => {
  const { processState } = state.form;
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
      elements.input.value = '';
      elements.input.removeAttribute('disabled');
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18next.t('success');
      break;

    case 'error':
      renderError(elements, state, i18next);
      break;

    default:
      break;
  }
};

const render = (elements, state, i18next) => (path, value) => {
  switch (path) {
    case 'form.processState':
      handlerProcessState(elements, state, i18next);
      break;

    case 'form.processError':
      renderError(elements, state, i18next);
      break;

    case 'rss.feeds':
      renderFeeds(elements, state, i18next);
      break;

    case 'rss.posts':
      renderPosts(elements, state, i18next);
      break;

    case 'ui.openedPostId':
      renderModal(elements, state, i18next, value);
      break;

    case 'ui.readedPosts':
      renderPosts(elements, state, i18next);
      break;

    default:
      break;
  }
};

const watch = (elements, state, i18next) => onChange(state, render(elements, state, i18next));

export { watch, renderText };
