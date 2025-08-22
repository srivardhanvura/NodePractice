const {readFileSync, readFile, writeFileSync, writeFile} = require('fs')
const path = require('path')

console.log('Doing sync tasks')

const first = readFileSync(path.join('./content', 'first.txt'), 'utf8');
const second = readFileSync(path.join('./content', 'second.txt'), 'utf8');

writeFileSync('./content/result-sync.txt', `Here is the content: ${first} and ${second}`);

console.log('Done with all tasks')

console.log('Doing async tasks')

readFile(path.join('./content', 'first.txt'), 'utf8', (err, result) => {
    if(err){
        console.log(err);
        return
    }
    const firstAsync = result
    readFile(path.join('./content', 'second.txt'), 'utf8', (err, result) => {
        if(err){
            console.log(err);
            return
        }
        const secondAsync = result
        writeFile('./content/result-async.txt', `Here is the async content: ${firstAsync}, ${secondAsync}`, (err, result) => {
            if(err){
                console.log(err)
                return
            }
            console.log(result)
        })
    })
});


console.log('Done with all tasks')