// eslint-disable-next-line import/prefer-default-export
export async function sleep(ms) {
  return new Promise((res) => {
    setTimeout(() => res(), ms);
  });
}
