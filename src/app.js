import 'bootstrap';
import './style.scss';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

const validate = (url, links) => {
  const schema = yup.object().shape({
    url: yup.string().url('Link must be a valid URL').trim().required()
      .notOneOf(links, 'RSS already exists'),
  });
  return schema.validate({ url });
};

export default () => {
  const initialState = {
    form: {
      valid: false,
      processState: 'filling',
      processError: null,
      errors: [],
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
  };

  const watchedState = onChange(initialState, render(elements, initialState));

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
        watchedState.form.errors.push(error.message);
      });
  });
};
