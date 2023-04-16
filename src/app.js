import 'bootstrap';
import './style.scss';
import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import resources from './locales/index.js';
import render from './view/render.js';
import renderText from './view/renderText.js';

const validate = (url, links) => {
  const schema = yup.object().shape({
    url: yup.string().url().trim().required()
      .notOneOf(links),
  });
  return schema.validate({ url });
};

export default () => {
  const defaultLanguage = 'en';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: i18nextInstance.t('errors.alreadyExists'),
    },
    string: {
      required: i18nextInstance.t('errors.emptyField'),
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
      feeds: [],
      posts: [],
    },
    currentLink: '',
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

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const link = formData.get(elements.input.name);
    const addedLinks = watchedState.data.feeds.map((lnk) => lnk);

    validate(link, addedLinks)
      .then(({ url }) => {
        watchedState.form.valid = true;
        watchedState.form.processState = 'sending';
        watchedState.form.errors = [];
        watchedState.data.feeds.push(url);
        watchedState.currentLink = url;
      })
      .catch((error) => {
        watchedState.form.valid = false;
        watchedState.form.processState = 'error';
        watchedState.form.errors = error.message;
      });
  });
};
