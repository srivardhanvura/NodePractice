const os = require('os')

const osData = {
    'user': os.userInfo(),
    'upTime': os.uptime(),
    'name': os.type(),
    'release': os.release(),
    'totalMemory': os.totalmem(),
    'freeMem': os.freemem()
}

console.log(osData)