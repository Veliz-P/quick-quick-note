export const debounce = <T extends Function>(fn: T, delay: number = 500) => {
  let timer: number | null = null;
  return function (...args: unknown[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};
