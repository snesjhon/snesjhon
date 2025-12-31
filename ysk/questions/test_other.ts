// How would I implement a promise.all?
//
// Promise.all would essentially be given an array of promises, return only when all Promises are `resolved`
// you would return each promise as an array where the `resolution` of each would be in place
//

function promiseAll(arr) {
  return new Promise((resolve, reject) => {
    // base cases

    // main case
    const output: any[] = [];
    const promiseLength = arr.length;
    let resolvedPromises = 0;

    arr.forEach((item, index) => {
      Promise.resolve(item)
        .then((result) => {
          output[index] = result;
          resolvedPromises++;
          if (promiseLength === resolvedPromises) {
            resolve(output);
          }
        })
        .catch(() => reject([]));
    });
  });
}
