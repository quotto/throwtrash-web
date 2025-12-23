import property from "./property";

export default {
    ServerError: {
        statusCode: 301,
        headers: {
            Location: `${property.URL_ACCOUNT_LINK}/500.html`
        }
    },
    UserError: {
        statusCode: 301,
        headers: {
            Location: `${property.URL_ACCOUNT_LINK}/400.html`
        }
    }

}
