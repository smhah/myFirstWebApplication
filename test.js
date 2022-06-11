function makeSomething(message) {
  return new Promise((resolve, reject) => {
    console.log('first function loaded');
    if (message) {
      resolve(message);
    } else {
      reject('no message entred');
    }
  });
}

function anotherthing(message) {
  return new Promise((resolve, reject) => {
    console.log('next function loaded');
    console.log('message + <' + message + '> loaded');
    if (message == 'Hello') {
      resolve('i know you said hello ;)');
    } else {
      reject("you didn't say hello >.<");
    }
  });
}

// makeSomething("Hello").then((message) =>{
//     console.log("bartaba " + message);
//     return (anotherthing(message));
// }).then((response) => {
//     console.log("response is " + response)
// }).catch(message => {
//     console.log(message);
// })

async function doWork() {
  try {
    const firstPromise = await makeSomething('Hello');
    console.log('bartaba is ' + firstPromise);
    const secondPromise = await anotherthing(firstPromise);
    console.log('response is ' + secondPromise);
  } catch (err) {
    console.log(err);
  }
}
doWork();
