import 'bootstrap';
import './style.scss';
import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';
import { render, renderText } from './view.js';
import parse from './parser.js';

const validate = (url, links) => {
  const schema = yup.object().shape({
    url: yup.string().url().trim().required()
      .notOneOf(links),
  });
  return schema.validate({ url });
};

const getData = (url) => {
  const proxy = 'https://allorigins.hexlet.app';
  const proxyUrl = new URL(`${proxy}/get`);
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return axios.get(proxyUrl);
};

const rssUpdater = (initialState, watchedState) => {
  const { links } = initialState.data;
  const updateInterval = 5000;
  const promises = links.map((link) => getData(link)
    .then((response) => {
      const { posts } = parse(response.data.contents);
      const linksOfAddedPosts = initialState.data.posts.map((post) => post.link);
      const newPosts = posts.filter((post) => !linksOfAddedPosts.includes(post.link));
      const newPostsWithId = newPosts.map((post) => ({ ...post, id: _.uniqueId() }));
      watchedState.data.posts.unshift(...newPostsWithId);
    })
    .catch((error) => {
      throw new Error(error.message);
    }));
  Promise.all(promises)
    .finally(() => setTimeout(() => rssUpdater(initialState, watchedState), updateInterval));
};

export default () => {
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: i18nextInstance.t('errors.alreadyExists'),
      required: i18nextInstance.t('errors.emptyField'),
    },
    string: {
      url: i18nextInstance.t('errors.invalidUrl'),
    },
  });

  const initialState = {
    form: {
      valid: false,
      processState: 'filling',
      processError: null,
      errors: {},
    },
    data: {
      links: [],
      feeds: [],
      posts: [],
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
    text: {
      title: document.querySelector('.display-3'),
      subtitle: document.querySelector('.lead'),
      placeholder: document.querySelector('[for="url-input"]'),
      example: document.querySelector('.text-muted'),
      read: document.querySelector('.full-article'),
    },
  };

  const watchedState = onChange(initialState, render(elements, initialState, i18nextInstance));

  renderText(elements, i18nextInstance);
  rssUpdater(initialState, watchedState);

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    watchedState.processError = null;
    const formData = new FormData(event.target);
    const link = formData.get(elements.input.name);
    const addedLinks = watchedState.data.links.map((lnk) => lnk);
    validate(link, addedLinks, i18nextInstance)
      .then(({ url }) => {
        watchedState.form.valid = true;
        watchedState.form.processState = 'sending';
        return getData(url);
      })
      .then((response) => {
        const { feed, posts } = parse(response.data.contents);
        watchedState.data.feeds.unshift({ ...feed, id: _.uniqueId() });
        const postsWithId = posts.map((post) => ({ ...post, id: _.uniqueId() }));
        watchedState.data.posts.unshift(...postsWithId);
        watchedState.data.links.push(link);
        watchedState.form.processState = 'finished';
      })
      .catch((error) => {
        watchedState.form.valid = false;
        watchedState.form.processState = 'error';
        switch (error.name) {
          case 'AxiosError':
            watchedState.form.processError = 'network';
            break;

          case 'Error':
            watchedState.form.processError = 'doesNotContainsRSS';
            break;

          case 'ValidationError':
            watchedState.form.processError = error.message;
            break;

          default:
            break;
        }
      });
  });
};
