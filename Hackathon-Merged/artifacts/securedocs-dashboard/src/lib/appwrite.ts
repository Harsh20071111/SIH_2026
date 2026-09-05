import { Client, Account, ID } from 'appwrite';

/**
 * Centralized Appwrite Client Configuration
 * Uses environment variables for client-side configuration with verified defaults.
 * Project: SecureDocs
 * Project ID: 6a9babf9001cc3f047af
 * Endpoint: https://sgp.cloud.appwrite.io/v1
 */
const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '6a9babf9001cc3f047af';

client.setEndpoint(endpoint);
client.setProject(projectId);

export const account = new Account(client);

export { client, ID };
export default client;
