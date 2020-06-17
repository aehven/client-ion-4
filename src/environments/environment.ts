export const environment = {
  production: false,
  apiPath: `http://192.168.2.10:3030/api/v1`, //use this for testing from phone
  // apiPath: `http://localhost:3030`, //use this when not on a 192.168.2 network
  demoUser: "a@null.com",
  demoPassword: "password",
  webSocketPath: `ws://192.168.2.10:3030/cable`, //use this for testing from phone
  // webSocketPath: `ws://localhost:3030/cable`, //use this when not on a 192.168.2 network
  homePath: "/home",
  allowAnonymousUsers: false,
  usersBelongToOrganizations: true,
  version: "0.0.0"
};
