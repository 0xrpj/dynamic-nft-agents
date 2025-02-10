import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
const client = new SuiClient({ url: getFullnodeUrl('testnet') });
export default client;