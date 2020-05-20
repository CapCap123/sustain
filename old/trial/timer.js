  
  if(!business.yahooData) {
    setTimeout(displayData, 5000)
    console.log('timer started')
    } else {
    displayData();
    myEmitter.emit('data ready')
    console.log('timer not started')
    }

function displayData() {
  myEmitter.emit('data ready')
  console.log('data ready event emitted');
};