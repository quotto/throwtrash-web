import property from "./property";
import {BackendResponse} from "./interface";
import { TrashData } from "trash-common";
import { SessionItem } from "./interface";

export default (session: SessionItem): BackendResponse =>{
    let body:{name: string,preset: TrashData[] | null} = {
        name: "",
        preset: null
    };
    if(session && session.userInfo && "name" in session.userInfo && "preset" in session.userInfo) {
        body.name = session.userInfo.name;
        body.preset = session.userInfo.preset;
    }
    return {
        statusCode: 200,
        body: JSON.stringify(body),
        headers: {
            "Access-Control-Allow-Origin": property.URL_ACCOUNT_LINK,
            "Access-Control-Allow-Credentials": true
        }
    }
}