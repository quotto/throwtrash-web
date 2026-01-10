import property from "./property";

export default {
    ServerError: {
        statusCode: 301,
        headers: {
            Location: `${property.FRONTEND_URL}/500.html`
        }
    },
    UserError: {
        statusCode: 301,
        headers: {
            Location: `${property.FRONTEND_URL}/400.html`
        }
    }

}
