export default (data) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(data, 'application/xml');
  const parseError = parsedData.querySelector('parsererror');
  if (parseError) {
    throw new Error(parseError);
  }

  const title = parsedData.documentElement.querySelector('title').textContent;
  const description = parsedData.documentElement.querySelector('description').textContent;
  const feed = { title, description };

  const items = Array.from(parsedData.querySelectorAll('item'));
  const posts = items.map((item) => {
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
