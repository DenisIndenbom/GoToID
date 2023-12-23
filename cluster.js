const cluster = require('cluster')

if (cluster.isMaster) {
    const workers = require('dotenv').config({ path: __dirname + '/.env' }).parsed.WORKERS

    let cCPUs = workers > 0 ? workers : require('os').cpus().length

    // Create a worker for each CPU
    for (let i = 0; i < cCPUs; i++) {
        cluster.fork()
    }

    cluster.on('online', function (worker) {
        // log
        console.log(`Worker ${worker.process.pid} is online.`)
    })

    cluster.on('exit', function (worker, code, signal) {
        // Fork and report died. This is called by a worker that dies before the worker is removed
        cluster.fork()

        console.log(`Worker ${worker.process.pid} died.`)
    })

} else {
    require('./app.js')
}