const Client = require('./client.js')

Client.getEnableTrashes("1439d8b1-b41e-45f9-9afc-ecdfdaea1d83")
.then((response)=> {
    console.log(response)
})
