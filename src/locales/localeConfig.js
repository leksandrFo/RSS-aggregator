// export default {
//   mixed: {
//     notOneOf: () => ({ key: 'errors.alreadyExists' }),
//     required: () => ({ key: 'errors.emptyField' }),
//   },
//   string: {
//     url: () => ({ key: 'errors.invalidUrl' }),
//   },
// };

export default {
  mixed: {
    notOneOf: 'errors.alreadyExists',
    required: 'errors.emptyField',
  },
  string: {
    url: 'errors.invalidUrl',
  },
};
