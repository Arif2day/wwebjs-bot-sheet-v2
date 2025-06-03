const {getRandomDelay} = require('./common');
const { dTu, aS, twoDtoJSON } = require('./ind');


// notify use random delay
async function notifierLoop(client,array, func) {
    for (let index = 0; index < array.length; index++) {
        const delay = getRandomDelay();
        await console.log(`\n[Delay System] - wait for ${(delay / 1000).toFixed(2)} seconds...\n`);
        const r = await aS();
        const rr = twoDtoJSON(r);
        if(rr.filter((e)=>{
            return e.nwa == client.info.wid._serialized;
        }).length>0){            
            await new Promise(resolve => setTimeout(resolve, delay));
            await func(array[index], index);
        }
    }
}

// var scream = function screamWord(word) {
//     console.log(word);    
// }

// var words = ['hey', 'you', 'get', 'out', 'of', 'here' ];

// notifierLoop(words,scream)

module.exports = {
    notifierLoop: notifierLoop
};