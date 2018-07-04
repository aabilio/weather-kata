/* eslint-disable no-console */
import request from 'request';
import { jsonRequestFactory } from './json-request';
import { forecastFactory } from './forecast';

const jsonRequest = jsonRequestFactory(request);
const forecast = forecastFactory(jsonRequest);

(async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const madridWeather = await forecast.predictWeather('Madrid');
  console.log('Madrid Weather: ', madridWeather);

  const madridWeatherTomorrow = await forecast.predictWeather('Madrid', tomorrow);
  console.log('Madrid Weather for tomorrow: ', madridWeatherTomorrow);

  const madridWind = await forecast.predictWind('Madrid');
  console.log('Madrid Wind: ', madridWind);

  const madridWindTomorrow = await forecast.predictWind('Madrid', tomorrow);
  console.log('Madrid Wind for tomorrow: ', madridWindTomorrow);

  const madridPrediction = await forecast.predict('Madrid');
  console.log('Madrid prediction: ', madridPrediction);

  try {
    await forecast.predictWeather('Madrid', yesterday);
  } catch (error) {
    console.log('Error on predicting weather for yesterday: ', error);
  }

  try {
    await forecast.predictWeather('Madrid', nextWeek);
  } catch (error) {
    console.log('Error on predicting weather for next week: ', error);
  }
})();
