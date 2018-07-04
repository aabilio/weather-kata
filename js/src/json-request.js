// Simple node request wrapper
export const jsonRequestFactory = request => async (url) => {
  let rrsolve;
  let rreject;

  const promise = new Promise((resolve, reject) => {
    rrsolve = resolve;
    rreject = reject;

    request(url, { json: true }, (err, res, body) => {
      if (err) {
        return reject(err);
      }
      return resolve(body);
    });
  });

  // Hack for simple mocking
  /* eslint-disable no-proto */
  promise.__proto__.forceResolve = rrsolve;
  promise.__proto__.forceReject = rreject;

  return promise;
};

export default jsonRequestFactory;
