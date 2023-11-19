export const sortByTitle = (searchResults) => {
  const sortedResultsByTitle = [...searchResults].sort((next, current) => {
    if (next.title < current.title) {
      return -1;
    }

    if (next.title > current.title) {
      return 1;
    }

    return 0;
  });

  return sortedResultsByTitle;
};

export const sortByTime = (searchResults) => {
  const sortedResultsByTime = [...searchResults].sort((next, current) => {
    if (next.time < current.time) {
      return -1;
    }

    if (next.time > current.time) {
      return 1;
    }

    return 0;
  });

  return sortedResultsByTime;
};

export const sortByVotes = (searchResults) => {
  const sortedResultsByVotes = [...searchResults].sort((next, current) => {
    if (next.votes > current.votes) {
      return -1;
    }

    if (next.votes < current.votes) {
      return 1;
    }

    return 0;
  });

  return sortedResultsByVotes;
};

export const sortDefault = (searchResults) => {
  return [...searchResults];
};