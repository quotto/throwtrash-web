const Client = require('./client.js')

Client.getEnableTrashes("731739605817397250-E6xRTQ2ngBa5BYaMdEoGd5sQXZYysDg","EmL2SlbmkBf3aw9u4Z25ayeCc81TEG4NmUEAGk4K86bJu")
.then((response)=> {
    console.log(response)
    var body = JSON.parse(response)
    console.log(body.result[0])
})
