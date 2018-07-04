export const predictionFactory = request => (cityName, datetime = null) => {
  const promise = new Promise(async (resolve, reject) => {
    // When date is not provided we look for the current prediction
    let date = datetime;
    if (date === null) {
      date = new Date();
    } else {
      // The datetime have to be within the next 5 days
      const MAX_DAYS = 5;
      // Set today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Set max date
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + MAX_DAYS);
      maxDate.setHours(23, 59, 59);

      if (date < today || date > maxDate) {
        return reject(new Error('Invalid datetime'));
      }
    }
    // We just need the date, ex.: date = "2018-07-06"
    date = date.toISOString().slice(0, 10);

    // Get city id from metaweather API
    const cityResponse = await request(`https://www.metaweather.com/api/location/search/?query=${cityName}`);
    if (!cityResponse || cityResponse.length <= 0 || !Object.prototype.hasOwnProperty.call(cityResponse[0], 'woeid')) {
      return reject(new Error(`City not found (${cityName})`));
    }
    const cityId = cityResponse[0].woeid;
    // Get forecast for the city id from metaweather API
    const weatherResponse = await request(`https://www.metaweather.com/api/location/${cityId}`);
    if (!Object.prototype.hasOwnProperty.call(weatherResponse, 'consolidated_weather')) {
      return reject(new Error(`Forecast not found for city: ${cityName}`));
    }
    // Filter the response to get only the result for the chosen date
    const result = weatherResponse.consolidated_weather
      .find(response => response.applicable_date === date);

      // Return the prediction or error if not found
    return result !== undefined
      ? resolve(result)
      : reject(new Error(`Forecast not found for city: ${cityName} and date: ${date}`));
  });

  return promise;
};

export const predictWeatherFactory = request => async (cityName, datetime = null) => {
  const predict = predictionFactory(request);
  const prediction = await predict(cityName, datetime);
  return prediction.weather_state_name || null;
};

export const predictWindFactory = request => async (cityName, datetime = null) => {
  const predict = predictionFactory(request);
  const prediction = await predict(cityName, datetime);
  return prediction.wind_speed || null;
};

export const forecastFactory = request => ({
  predict: predictionFactory(request),
  predictWeather: predictWeatherFactory(request),
  predictWind: predictWindFactory(request),
});

export default forecastFactory;
