import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';
import localeConfig from './locales/localeConfig.js';
import watch from './view.js';
import parse from './parser.js';
/* eslint no-param-reassign: "error" */

const UPDATE_INTERVAL = 5000;
const DEFAULT_LANGUAGE = 'ru';

const validate = (url, watchedState) => {
  const addedLinks = watchedState.feeds.map((feed) => feed.link);
  const schema = yup.string()
    .url()
    .trim()
    .required()
    .notOneOf(addedLinks);
  return schema.validate(url);
};

const addProxy = (link) => {
  const proxy = 'https://allorigins.hexlet.app';
  const proxyUrl = new URL(`${proxy}/get`);
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', link);
  return proxyUrl;
};

const getErrorType = (error) => {
  switch (true) {
    case error.isParsingError:
      return 'errors.doesNotContainsRSS';

    case error.isAxiosError:
      if (error.isAxiosError && error.code === 'ECONNABORTED') {
        return 'errors.timeout';
      }
      return 'errors.network';

    default:
      return 'errors.unknown';
  }
};

const loadData = (link, watchedState) => {
  watchedState.loadingProcess = {
    ...watchedState.loadingProcess,
    status: 'loading',
    error: null,
  };

  return axios
    .get(addProxy(link))
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
      watchedState.loadingProcess = {
        ...watchedState.loadingProcess,
        status: 'success',
        error: null,
      };
    })
    .catch((error) => {
      const updatedLoadingProcessState = { error: getErrorType(error), status: 'failed' };
      watchedState.loadingProcess = {
        ...watchedState.loadingProcess,
        ...updatedLoadingProcessState,
      };
    });
};

const rssUpdater = (watchedState) => {
  const { feeds } = watchedState;
  const promises = feeds.map(({ link, id }) => axios.get(addProxy(link))
    .then((response) => {
      const { posts } = parse(response.data.contents);
      const linksOfAddedPosts = watchedState.posts.map((post) => post.link);
      const newPosts = posts
        .filter((post) => !linksOfAddedPosts.includes(post.link))
        .map((post) => ({ ...post, feedId: id, id: _.uniqueId() }));
      watchedState.posts.unshift(...newPosts);
    })
    .catch((error) => {
      throw new Error(error.message);
    }));
  Promise.all(promises)
    .finally(() => setTimeout(() => rssUpdater(watchedState), UPDATE_INTERVAL));
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
      closeButtons: document.querySelectorAll('[data-bs-dismiss="modal"]'),
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
      rssUpdater(watchedState);

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const link = formData.get(elements.input.name);
        validate(link, watchedState)
          .then(() => {
            const updatedFormState = { isValidate: true, error: null };
            watchedState.form = { ...watchedState.form, ...updatedFormState };

            loadData(link, watchedState);
          })
          .catch((error) => {
            const updatedFormState = { isValidate: false, error: error.message };
            watchedState.form = { ...watchedState.form, ...updatedFormState };
          });
      });

      elements.posts.addEventListener('click', (event) => {
        const { id } = watchedState.posts
          .find((post) => post.id === event.target.dataset.id);
        watchedState.ui.openedPostId = id;
        watchedState.ui.readedPosts.add(id);
      });

      elements.modal.closeButtons.forEach((closeButton) => {
        closeButton.addEventListener('click', () => {
          watchedState.ui.openedPostId = null;
        });
      });
    });
};

export default app;
