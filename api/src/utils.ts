import { APIGatewayProxyEventHeaders } from "aws-lambda";

export const extractHeaderValue = (headers: APIGatewayProxyEventHeaders, key: String): string | undefined => {
  const lowerCasedKey = key.toLowerCase();
  const findValue = Object.entries(headers).find(([headerKey]) => headerKey.toLowerCase() === lowerCasedKey);
  return findValue ? findValue[1] : undefined;
}