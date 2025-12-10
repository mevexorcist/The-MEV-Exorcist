// Test Alchemy WebSocket connection
const WebSocket = require('ws');

const ALCHEMY_WSS_URL = 'wss://base-mainnet.g.alchemy.com/v2/VxzNAdEeOM4JedsLKlxqE';

console.log('Testing Alchemy WebSocket connection...');
console.log('URL:', ALCHEMY_WSS_URL);
console.log('');

const ws = new WebSocket(ALCHEMY_WSS_URL);

ws.on('open', () => {
  console.log('✅ WebSocket connected successfully!');
  
  // Subscribe to pending transactions
  const subscribeMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_subscribe',
    params: ['alchemy_pendingTransactions']
  });
  
  console.log('Sending subscription request...');
  ws.send(subscribeMessage);
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('✅ Received message:', JSON.stringify(message, null, 2));
  
  if (message.result) {
    console.log('✅ Subscription successful! Subscription ID:', message.result);
    console.log('');
    console.log('Connection test PASSED! ✅');
    console.log('Waiting 10 seconds for transactions...');
    
    setTimeout(() => {
      console.log('Test complete. Closing connection.');
      ws.close();
      process.exit(0);
    }, 10000);
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  process.exit(1);
});

ws.on('close', () => {
  console.log('WebSocket connection closed');
});

// Timeout after 30 seconds
setTimeout(() => {
  console.error('❌ Connection timeout after 30 seconds');
  ws.close();
  process.exit(1);
}, 30000);
