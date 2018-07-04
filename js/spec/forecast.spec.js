import { forecastFactory } from '../src/forecast';

describe('Forecast should', () => {
  let jsonRequest;
  let forecast;
  let originalTimeout;
  const today = new Date();
  const days = [
    new Date(),
    ...[1, 2, 3, 4].map(() => new Date(today.setDate(today.getDate() + 1))),
  ];
  const searchResponse = [{
    title: 'Madrid',
    location_type: 'City',
    woeid: 766273,
    latt_long: '40.420300,-3.705770',
  }];
  const locationResponse = {
    consolidated_weather: [{
      weather_state_name: 'Example 1',
      applicable_date: days[0].toISOString().slice(0, 10),
      wind_speed: 1.02065994235266,
    },
    {
      weather_state_name: 'Example 2',
      applicable_date: days[1].toISOString().slice(0, 10),
      wind_speed: 2.02065994235266,
    },
    {
      weather_state_name: 'Example 3',
      applicable_date: days[2].toISOString().slice(0, 10),
      wind_speed: 3.02065994235266,
    },
    {
      weather_state_name: 'Example 4',
      applicable_date: days[3].toISOString().slice(0, 10),
      wind_speed: 4.02065994235266,
    },
    {
      weather_state_name: 'Example 5',
      applicable_date: days[4].toISOString().slice(0, 10),
      wind_speed: 5.02065994235266,
    },
    ],
  };

  beforeEach(() => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

    // Request mock
    jsonRequest = jasmine.createSpy('jsonRequest')
      .and.returnValues(Promise.resolve(searchResponse), Promise.resolve(locationResponse));
    forecast = forecastFactory(jsonRequest);
  });

  it('retrieve today\'s weather', async () => {
    const cityName = 'Madrid';

    const expected = 'Example 1';
    const prediction = await forecast.predictWeather(cityName);

    expect(jsonRequest).toHaveBeenCalledTimes(2);
    expect(prediction).toEqual(expected);
  });

  it('retrieve today\'s wind', async () => {
    const cityName = 'Madrid';

    const expected = 1.02065994235266;
    const prediction = await forecast.predictWind(cityName);

    expect(jsonRequest).toHaveBeenCalledTimes(2);
    expect(prediction).toEqual(expected);
  });

  it('retrieve today\'s full prediction', async () => {
    const cityName = 'Madrid';

    const expected = locationResponse.consolidated_weather[0];
    const prediction = await forecast.predict(cityName);

    expect(jsonRequest).toHaveBeenCalledTimes(2);
    expect(prediction).toEqual(expected);
  });


  it('retrieve any day\'s weather', async () => {
    const cityName = 'Madrid';
    const expected = ['Example 1', 'Example 2', 'Example 3', 'Example 4', 'Example 5'];

    const promises = days.map(async (day) => {
      jsonRequest = jasmine.createSpy('jsonRequest')
        .and.returnValues(Promise.resolve(searchResponse), Promise.resolve(locationResponse));
      forecast = forecastFactory(jsonRequest);

      const prediction = await forecast.predictWeather(cityName, day);
      expect(jsonRequest).toHaveBeenCalledTimes(2);
      return prediction;
    });

    const predictions = await Promise.all(promises);
    expect(predictions).toEqual(expected);
  });

  it('retrieve any day\'s wind', async () => {
    const cityName = 'Madrid';
    const expected = [1.02065994235266, 2.02065994235266, 3.02065994235266,
      4.02065994235266, 5.02065994235266,
    ];

    const promises = days.map(async (day) => {
      jsonRequest = jasmine.createSpy('jsonRequest')
        .and.returnValues(Promise.resolve(searchResponse), Promise.resolve(locationResponse));
      forecast = forecastFactory(jsonRequest);

      const prediction = await forecast.predictWind(cityName, day);
      expect(jsonRequest).toHaveBeenCalledTimes(2);
      return prediction;
    });

    const predictions = await Promise.all(promises);
    expect(predictions).toEqual(expected);
  });

  it('return error when requesting a forecast for more than 5 days', (done) => {
    const cityName = 'Madrid';
    const sixthDayForecast = new Date();
    sixthDayForecast.setDate(new Date().getDate() + 6);

    const expected = new Error('Invalid datetime');
    forecast.predict(cityName, sixthDayForecast).catch((error) => {
      expect(jsonRequest).toHaveBeenCalledTimes(0);
      expect(error).toEqual(expected);
      done();
    });
  });

  it('return error when requesting a forecast for a day after today', (done) => {
    const cityName = 'Madrid';
    const yesterday = new Date();
    yesterday.setDate(new Date().getDate() - 1);

    const expected = new Error('Invalid datetime');
    forecast.predict(cityName, yesterday).catch((error) => {
      expect(jsonRequest).toHaveBeenCalledTimes(0);
      expect(error).toEqual(expected);
      done();
    });
  });

  it('return error when requesting a forecast for unknown city', (done) => {
    const cityName = 'Unknown City';

    jsonRequest = jasmine.createSpy('jsonRequest').and.returnValue(Promise.resolve([]));
    forecast = forecastFactory(jsonRequest);

    const expected = new Error(`City not found (${cityName})`);
    forecast.predictWeather(cityName).catch((error) => {
      expect(jsonRequest).toHaveBeenCalledTimes(1);
      expect(error).toEqual(expected);
      done();
    });
  });

  it('return error when requesting a not found forecast', (done) => {
    const cityName = 'Unknown City';

    jsonRequest = jasmine.createSpy('jsonRequest')
      .and.returnValues(Promise.resolve(searchResponse), Promise.resolve([]));
    forecast = forecastFactory(jsonRequest);

    const expected = new Error(`Forecast not found for city: ${cityName}`);
    forecast.predictWeather(cityName).catch((error) => {
      expect(jsonRequest).toHaveBeenCalledTimes(2);
      expect(error).toEqual(expected);
      done();
    });
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });
});
