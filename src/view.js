import onChange from 'on-change';

const handlerText = (elements, i18next) => {
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

const handlerFeeds = (elements, state, i18next) => {
  // eslint-disable-next-line no-param-reassign
  elements.feeds.innerHTML = '';
  const { feeds } = state;

  const cardBorder = document.createElement('div');
  cardBorder.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18next.t('feeds');

  cardBody.append(cardTitle);
  cardBorder.append(cardBody);

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

  cardBody.append(listGroup);
  elements.feeds.append(cardBorder);
};

const handlerPosts = (elements, state, i18next) => {
  // eslint-disable-next-line no-param-reassign
  elements.posts.innerHTML = '';
  const { posts } = state;

  const cardBorder = document.createElement('div');
  cardBorder.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18next.t('posts');

  cardBody.append(cardTitle);
  cardBorder.append(cardBody);

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
    const linkClasses = state.ui.readedPosts.has(post.id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
    link.classList.add(...linkClasses);
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

  cardBody.append(listGroup);
  elements.posts.append(cardBorder);
};

const handlerModal = (elements, state, i18next, value) => {
  if (!value) return;

  const {
    title,
    description,
    openButton,
    closeButtonFooter,
  } = elements.modal;
  openButton.textContent = i18next.t('modal.read');
  closeButtonFooter.textContent = i18next.t('modal.close');
  const id = state.ui.openedPostId;
  const currentPost = state.posts.find((post) => post.id === id);
  title.textContent = currentPost.title;
  description.textContent = currentPost.description;
  openButton.setAttribute('href', currentPost.link);
  const link = document.querySelector(`a[data-id="${id}"]`);
  link.classList.remove('fw-bold');
  link.classList.add('fw-normal', 'link-secondary');
};

const handlerForm = (elements, state, i18next) => {
  const { isValidate } = state.form;
  const { input, feedback, submitButton } = elements;
  if (isValidate) {
    input.classList.remove('is-invalid');
    feedback.classList.add('text-success');
    feedback.textContent = '';
  } else {
    submitButton.removeAttribute('disabled');
    input.removeAttribute('disabled');
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = i18next.t(state.form.error);
  }
};

const handlerLoadingProcess = (elements, state, i18next) => {
  const { status } = state.loadingProcess;
  const { input, feedback, submitButton } = elements;
  switch (status) {
    case 'loading':
      submitButton.setAttribute('disabled', 'disabled');
      input.setAttribute('disabled', 'disabled');
      break;

    case 'success':
      submitButton.removeAttribute('disabled');
      input.value = '';
      input.removeAttribute('disabled');
      input.classList.remove('is-invalid');
      input.focus();
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18next.t('success');
      break;

    case 'failed':
      submitButton.removeAttribute('disabled');
      input.removeAttribute('disabled');
      input.classList.add('is-invalid');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18next.t(state.loadingProcess.error);
      break;

    default:
      break;
  }
};

const render = (elements, state, i18next) => (path, value) => {
  switch (path) {
    case 'language':
      handlerText(elements, i18next);
      break;

    case 'form':
      handlerForm(elements, state, i18next);
      break;

    case 'loadingProcess':
      handlerLoadingProcess(elements, state, i18next);
      break;

    case 'feeds':
      handlerFeeds(elements, state, i18next);
      break;

    case 'posts':
      handlerPosts(elements, state, i18next);
      break;

    case 'ui.openedPostId':
      handlerModal(elements, state, i18next, value);
      break;

    case 'ui.readedPosts':
      handlerPosts(elements, state, i18next);
      break;

    default:
      break;
  }
};

const watch = (elements, state, i18next) => onChange(state, render(elements, state, i18next));

export default watch;
