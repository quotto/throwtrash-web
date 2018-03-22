const Client = require('./client.js')

// not right parameter
Client.getEnableTrashes({test:"aaaa"})
.then((response)=> {},(error)=>{
    console.log(error)
})

// non registration
Client.getEnableTrashes("1439d8b1-b41e-45f9-9afc-ecdfdaea1d83")
.then((response)=> {},(error)=>{
    console.log(error)
})

// success
Client.getEnableTrashes("50f53d89-3ee7-4de0-bb14-93d623674b20")
.then((response)=> {
    console.log(response)
})
