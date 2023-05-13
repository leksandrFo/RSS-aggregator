import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';
import localeConfig from './locales/localeConfig.js';
import watch from './view.js';
import parse from './parser.js';

const UPDATE_INTERVAL = 5000;
const DEFAULT_LANGUAGE = 'ru';

const validate = (url, feeds) => {
  const addedLinks = feeds.map((feed) => feed.link);
  const schema = yup.string()
    .url()
    .trim()
    .required()
    .notOneOf(addedLinks);
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

    default:
      return 'Unknown error';
  }
};

const rssUpdater = (initialState, watchedState) => {
  const { feeds } = initialState;
  const promises = feeds.map(({ link, id }) => axios.get(addProxy(link))
    .then((response) => {
      const { posts } = parse(response.data.contents);
      const linksOfAddedPosts = initialState.posts.map((post) => post.link);
      const newPosts = posts.filter((post) => !linksOfAddedPosts.includes(post.link));
      const newPostsWithId = newPosts.map((post) => ({
        ...post,
        feedId: id,
        id: _.uniqueId(),
      }));
      watchedState.posts.unshift(...newPostsWithId);
    })
    .catch((error) => {
      throw new Error(error.message);
    }));
  Promise.all(promises)
    .finally(() => setTimeout(() => rssUpdater(initialState, watchedState), UPDATE_INTERVAL));
};

const app = () => {
  const initialState = {
    language: '',
    form: {
      isValidate: false,
      error: null,
    },
    loadingProcess: {
      status: 'idle',
      error: null,
    },
    ui: {
      openedPostId: null,
      readedPosts: new Set(),
    },
    feeds: [],
    posts: [],
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
      title: document.querySelector('.title'),
      subtitle: document.querySelector('.lead'),
      placeholder: document.querySelector('[for="url-input"]'),
      example: document.querySelector('.text-muted'),
      read: document.querySelector('.full-article'),
    },
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance
    .init({
      lng: DEFAULT_LANGUAGE,
      resources,
    })
    .then(() => {
      yup.setLocale(localeConfig);
      const watchedState = watch(elements, initialState, i18nextInstance);

      watchedState.language = DEFAULT_LANGUAGE;
      rssUpdater(initialState, watchedState);

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const link = formData.get(elements.input.name);
        validate(link, watchedState.feeds)
          .then((url) => {
            const updatedFormState = { isValidate: true, error: null };
            const updatedLoadingProcessState = { status: 'loading', error: null };
            watchedState.form = { ...watchedState.form, ...updatedFormState };
            watchedState.loadingProcess = {
              ...watchedState.loadingProcess,
              ...updatedLoadingProcessState,
            };
            return axios.get(addProxy(url));
          })
          .then((response) => {
            const { feed, posts } = parse(response.data.contents);
            watchedState.feeds.unshift({ ...feed, link, id: _.uniqueId() });
            const { id } = watchedState.feeds[0];
            const postsWithId = posts.map((post) => ({
              ...post,
              feedId: id,
              id: _.uniqueId(),
            }));
            watchedState.posts.unshift(...postsWithId);
            const updatedLoadingProcessState = { status: 'success', error: null };
            watchedState.loadingProcess = {
              ...watchedState.loadingProcess,
              ...updatedLoadingProcessState,
            };
          })
          .catch((error) => {
            if (error.name === 'ValidationError') {
              const updatedFormState = { isValidate: false, error: error.message };
              watchedState.form = { ...watchedState.form, ...updatedFormState };
            } else {
              const updatedLoadingProcessState = { error: getErrorType(error), status: 'failed' };
              watchedState.loadingProcess = {
                ...watchedState.loadingProcess,
                ...updatedLoadingProcessState,
              };
            }
          });
      });

      elements.posts.addEventListener('click', (event) => {
        const { link, id } = initialState.posts
          .find((post) => post.id === event.target.dataset.id);
        watchedState.ui.openedPostId = id;
        watchedState.ui.readedPosts.add(link);
      });

      elements.modal.closeButtonHeader.addEventListener('click', () => {
        watchedState.ui.openedPostId = null;
      });

      elements.modal.closeButtonFooter.addEventListener('click', () => {
        watchedState.ui.openedPostId = null;
      });
    });
};

export default app;
