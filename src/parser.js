export default (data) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(data, 'application/xml');
  const parseError = parsedData.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError);
    error.isParsingError = true;
    throw error;
  }

  const title = parsedData.documentElement.querySelector('title').textContent;
  const description = parsedData.documentElement.querySelector('description').textContent;
  const feed = { title, description };

  const posts = Array.from(parsedData.querySelectorAll('item')).map((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const postLink = item.querySelector('link').textContent;
    return {
      title: postTitle,
      description: postDescription,
      link: postLink,
    };
  });

  return { feed, posts };
};
