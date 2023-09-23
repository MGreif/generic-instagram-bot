export const sleep = (millis: number) =>
  new Promise((res) => setTimeout(res, millis))
