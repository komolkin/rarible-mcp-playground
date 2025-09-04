# Chain Configuration

## 🔗 Supported Chains

The application now supports the following blockchain networks:

### Mainnet Chains

#### 1. **Ethereum Mainnet**

- **Chain ID**: 1
- **Native Currency**: ETH
- **RPC URL**: https://ethereum.publicnode.com
- **Block Explorer**: https://etherscan.io
- **Use Case**: Primary Ethereum network for production transactions

#### 2. **Base Mainnet**

- **Chain ID**: 8453
- **Native Currency**: ETH
- **RPC URL**: https://mainnet.base.org
- **Block Explorer**: https://basescan.org
- **Use Case**: Layer 2 scaling solution built on Ethereum

### Testnet Chains

#### 3. **Base Sepolia Testnet**

- **Chain ID**: 84532
- **Native Currency**: ETH (testnet)
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org
- **Use Case**: Testing and development on Base network

## ⚙️ Configuration

The chain configuration is defined in `app/providers.tsx`:

```typescript
supportedChains: [
  {
    id: 1,
    name: "Ethereum",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: ["https://ethereum.publicnode.com"] },
      public: { http: ["https://ethereum.publicnode.com"] },
    },
    blockExplorers: {
      default: { name: "Etherscan", url: "https://etherscan.io" },
    },
  },
  // ... Base chains
];
```

## 🛠️ Adding New Chains

To add support for additional chains:

1. **Add chain configuration** to the `supportedChains` array
2. **Include required fields**:
   - `id`: Chain ID (number)
   - `name`: Human-readable name
   - `nativeCurrency`: Native token details
   - `rpcUrls`: RPC endpoints
   - `blockExplorers`: Block explorer URLs
   - `testnet`: Boolean flag for test networks (optional)

### Example: Adding Polygon

```typescript
{
  id: 137,
  name: "Polygon",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://polygon.llamarpc.com"] },
    public: { http: ["https://polygon.llamarpc.com"] },
  },
  blockExplorers: {
    default: { name: "PolygonScan", url: "https://polygonscan.com" },
  },
}
```

## 🔧 RPC Providers

### Current RPC Endpoints:

- **Ethereum**: Public Node (free, reliable)
- **Base**: Official Base RPC (maintained by Base team)
- **Base Sepolia**: Official Base testnet RPC

### Alternative RPC Providers:

- **Alchemy**: Requires API key, higher rate limits
- **Infura**: Requires API key, enterprise features
- **QuickNode**: Requires API key, fast performance
- **Ankr**: Public endpoints available

## 📊 Network Selection

Users can switch between supported networks through:

1. **Wallet Interface**: MetaMask, Coinbase Wallet network switcher
2. **Privy Interface**: Built-in network selection (if enabled)
3. **Application Logic**: Programmatic network switching

## 🚨 Important Notes

### Requirements:

- **At least one chain must be configured** (Privy requirement)
- **Chain IDs must be unique** and match official registry
- **RPC URLs must be accessible** and reliable

### Best Practices:

- **Use reliable RPC providers** to avoid connection issues
- **Include both mainnet and testnet** for development
- **Monitor RPC endpoint health** and have fallbacks
- **Keep block explorer URLs updated** for transaction viewing

## 🔍 Troubleshooting

### Common Issues:

#### 1. **"supportedChains must contain at least one chain"**

- **Cause**: Empty or missing `supportedChains` array
- **Solution**: Add at least one valid chain configuration

#### 2. **Network connection errors**

- **Cause**: RPC endpoint is down or unreachable
- **Solution**: Switch to alternative RPC provider or check endpoint status

#### 3. **Wrong network in wallet**

- **Cause**: User's wallet is on unsupported network
- **Solution**: Prompt user to switch to supported network

### Debugging:

```javascript
// Check current network in browser console
console.log("Current chain ID:", window.ethereum?.chainId);
console.log("Supported chains:" /* your supported chains array */);
```

## 🌐 Network Resources

### Official Documentation:

- [Ethereum Networks](https://ethereum.org/en/developers/docs/networks/)
- [Base Documentation](https://docs.base.org/)
- [Chain Registry](https://chainlist.org/)

### RPC Provider Status:

- [Public Node Status](https://publicnode.com/)
- [Base Network Status](https://status.base.org/)
- [Ethereum Network Stats](https://ethstats.net/)
