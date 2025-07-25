import i18n, { getMessagesFromLocale } from '../plugins/i18n';
import { HOUR, HOUR_IN_SECONDS, MINUTE, MINUTE_IN_SECONDS, Time } from './time';

export function convertHHMMToSeconds(hours: number, minutes: number) {
  return hours * HOUR_IN_SECONDS + minutes * MINUTE_IN_SECONDS;
}

export function convertHHMMToMilliSeconds(hours: number, minutes: number) {
  return hours * HOUR + minutes * MINUTE;
}

export function convertSecondsToHHMM(seconds: number): Time {
  const hours = Math.floor(seconds / HOUR_IN_SECONDS);
  const totalSeconds = seconds % HOUR_IN_SECONDS;
  const mins = Math.floor(totalSeconds / MINUTE_IN_SECONDS);

  return {
    hours: hours,
    minutes: mins,
  };
}

export function convertMilliSecondsToHHMM(seconds: number): Time {
  const hours = Math.floor(seconds / HOUR);
  const totalSeconds = seconds % HOUR;
  const mins = Math.floor(totalSeconds / MINUTE);

  return {
    hours: hours,
    minutes: mins,
  };
}

export function convertSummaryTimeToBadgeString(summaryTime: number): string {
  const totalSeconds = summaryTime;
  const hours = totalSeconds / 3600; // Calculate hours as decimal
  const seconds = totalSeconds % 60; // Get just the seconds part

  if (hours >= 1) {
    // For times with hours, show as decimal hours (2 places) + seconds
    return `${hours.toFixed(2)}h${seconds}s`;
  } else if (totalSeconds >= 60) {
    // For times with minutes but less than an hour, show as minutes + seconds
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes}m${seconds}s`;
  } else {
    // For times less than a minute, just show seconds
    return `${seconds}s`;
  }
}

export function convertSummaryTimeToString(summaryTime: number) {
  let days = Math.floor(summaryTime / 3600 / 24);
  const totalHours = summaryTime % (3600 * 24);
  let hours = Math.floor(totalHours / 3600);
  const totalSeconds = summaryTime % 3600;
  let mins = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  function appendTime(value: number, stringPrefix: string, isUseZero: boolean = false) {
    return value > 0 ? `${isUseZero ? zeroAppend(value) : value} ${stringPrefix}` : '';
  }

  const daysStr = appendTime(days, i18n.global.t('d.message'));
  const hoursStr = appendTime(hours, i18n.global.t('h.message'), daysStr == '' ? false : true);
  const minsStr = appendTime(mins, i18n.global.t('m.message'), hoursStr == '' ? false : true);
  const secondsStr = appendTime(seconds, i18n.global.t('s.message'), minsStr == '' ? false : true);

  return `${daysStr} ${hoursStr} ${minsStr} ${secondsStr}`;
}

export function convertLimitTimeToString(summaryTime: number) {
  const totalHours = summaryTime % (3600 * 24);
  let hours = Math.floor(totalHours / 3600);
  const totalSeconds = summaryTime % 3600;
  let mins = Math.floor(totalSeconds / 60);

  function appendTime(value: number, stringPrefix: string, isUseZero: boolean = false) {
    return `${isUseZero ? zeroAppend(value) : value} ${stringPrefix}`;
  }

  return `${appendTime(hours, getMessagesFromLocale()['h']['message'])} ${appendTime(
    mins,
    getMessagesFromLocale()['m']['message'],
    true,
  )}`;
}

function zeroAppend(time: number) {
  if (time < 10) return `0${time}`;
  else return time;
}

export function convertStringTimeIntervalToSeconds(timeInterval: string) {
  const time = timeInterval.split(':');
  return Number(time[0]) * HOUR_IN_SECONDS + Number(time[1]) * MINUTE_IN_SECONDS + Number(time[2]);
}

export function convertHoursToTime(time: number) {
  const timeInSeconds = Math.floor(time * MINUTE_IN_SECONDS);
  return convertSummaryTimeToString(timeInSeconds);
}
