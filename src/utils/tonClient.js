import { Client } from "@ston-fi/sdk";

// Create a singleton TON API client instance
const tonApiClient = new Client({
  endpoint: "https://toncenter.com/api/v2/jsonRPC",
  apiKey: "9688b0e4d8b6ead095f1271b3d2d3500073a6acb309846e83667bbf9f11e26c8",
});

export default tonApiClient;