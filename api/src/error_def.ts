export default {
    ServerError: {
        statusCode: 301,
        headers: {
            Location: `https://${process.env.FRONT_END_HOST}/500.html`
        }
    },
    UserError: {
        statusCode: 301,
        headers: {
            Location: `https://${process.env.FRONT_END_HOST}/400.html`
        }
    }

}