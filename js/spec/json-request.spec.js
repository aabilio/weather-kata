import { jsonRequestFactory } from '../src/json-request';

describe('jsonRequest should', () => {
  let request;
  let jsonRequest;

  beforeEach(() => {
    // Request mock
    request = jasmine.createSpy('request');
    jsonRequest = jsonRequestFactory(request);
  });

  it('just work calling request once with the correct arguments', (done) => {
    const expected = { success: true };
    const promise = jsonRequest('/fake');
    promise.then((response) => {
      expect(request).toHaveBeenCalledTimes(1);
      expect(request).toHaveBeenCalledWith('/fake', { json: true }, jasmine.any(Function));
      expect(response).toEqual(expected);
      done();
    });

    promise.forceResolve({ success: true });
  });
});
