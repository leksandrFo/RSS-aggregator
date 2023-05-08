import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';
import localeConfig from './locales/localeConfig.js';
import { watch, renderText } from './view.js';
import parse from './parser.js';

const validate = (url, links) => {
  const schema = yup.string()
    .url()
    .trim()
    .required()
    .notOneOf(links);
  return schema.validate(url);
};

const addProxy = (url) => {
  const proxy = 'https://allorigins.hexlet.app';
  const proxyUrl = new URL(`${proxy}/get`);
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return proxyUrl;
};

const getErrorType = (error) => {
  switch (error.name) {
    case 'AxiosError':
      return 'errors.network';

    case 'Error':
      return 'errors.doesNotContainsRSS';

    case 'ValidationError':
      return error.message;

    default:
      return 'Unknown error';
  }
};

const rssUpdater = (initialState, watchedState) => {
  const { links } = initialState.rss;
  const updateInterval = 5000;
  const promises = links.map((link) => axios.get(addProxy(link))
    .then((response) => {
      const { posts } = parse(response.data.contents);
      const linksOfAddedPosts = initialState.rss.posts.map((post) => post.link);
      const newPosts = posts.filter((post) => !linksOfAddedPosts.includes(post.link));
      const newPostsWithId = newPosts.map((post) => ({ ...post, id: _.uniqueId() }));
      watchedState.rss.posts.unshift(...newPostsWithId);
    })
    .catch((error) => {
      throw new Error(error.message);
    }));
  Promise.all(promises)
    .finally(() => setTimeout(() => rssUpdater(initialState, watchedState), updateInterval));
};

const defaultLanguage = 'ru';

export default () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    resources,
  })
    .then(() => yup.setLocale(localeConfig));

  const initialState = {
    form: {
      valid: false,
      processState: 'filling',
      processError: null,
      errors: {},
    },
    rss: {
      links: [],
      feeds: [],
      posts: [],
    },
    ui: {
      openedPostId: null,
      readedPosts: [],
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.form-control'),
    submitButton: document.querySelector('[type="submit"]'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    feedback: document.querySelector('.feedback'),
    footer: document.querySelector('.footer'),
    modal: {
      title: document.querySelector('.modal-title'),
      description: document.querySelector('.modal-body'),
      openButton: document.querySelector('.full-article'),
      closeButtonHeader: document.querySelector('div.modal-header button[data-bs-dismiss="modal"]'),
      closeButtonFooter: document.querySelector('div.modal-footer button[data-bs-dismiss="modal"]'),
    },
    text: {
      title: document.querySelector('.display-3'),
      subtitle: document.querySelector('.lead'),
      placeholder: document.querySelector('[for="url-input"]'),
      example: document.querySelector('.text-muted'),
      read: document.querySelector('.full-article'),
    },
  };

  const watchedState = watch(elements, initialState, i18nextInstance);

  renderText(elements, i18nextInstance);
  rssUpdater(initialState, watchedState);

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    watchedState.processError = null;
    const formData = new FormData(event.target);
    const link = formData.get(elements.input.name);
    const addedLinks = watchedState.rss.links.map((lnk) => lnk);
    validate(link, addedLinks)
      .then((url) => {
        watchedState.form.valid = true;
        watchedState.form.processState = 'sending';
        return axios.get(addProxy(url));
      })
      .then((response) => {
        const { feed, posts } = parse(response.data.contents);
        watchedState.rss.feeds.unshift({ ...feed, id: _.uniqueId() });
        const postsWithId = posts.map((post) => ({ ...post, id: _.uniqueId() }));
        watchedState.rss.posts.unshift(...postsWithId);
        watchedState.rss.links.push(link);
        watchedState.form.processState = 'finished';
      })
      .catch((error) => {
        watchedState.form.valid = false;
        watchedState.form.processState = 'error';
        watchedState.form.processError = getErrorType(error);
      });
  });

  elements.posts.addEventListener('click', (event) => {
    const { link, id } = initialState.rss.posts
      .find((post) => post.id === event.target.dataset.id);
    if (event.target.dataset.bsToggle === 'modal') {
      watchedState.ui.openedPostId = id;
      if (!watchedState.ui.readedPosts.includes(link)) {
        watchedState.ui.readedPosts.unshift(link);
      }
    }
    if (!watchedState.ui.readedPosts.includes(link)) {
      watchedState.ui.readedPosts.unshift(link);
    }
  });

  elements.modal.closeButtonHeader.addEventListener('click', () => {
    watchedState.ui.openedPostId = null;
  });

  elements.modal.closeButtonFooter.addEventListener('click', () => {
    watchedState.ui.openedPostId = null;
  });
};
