export const sleep = (millis: number) =>
  new Promise((res) => setTimeout(res, millis))

export const getRandomArrayEntry = <D>(array: Array<D>) =>
  array[Math.floor(Math.random() * array.length - 1)]
