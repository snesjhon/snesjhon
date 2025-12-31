function promiseLike(arr: PromiseLike<any>[]) {
  return new Promise((resolve, reject) => {
    arr.forEach((promise) => {
      Promise.resolve();
    });
  });
}
