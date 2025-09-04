# Testing NFT Data Extraction

## 🧪 **Testing Steps**

### **1. Open Browser Console**

- Press F12 → Console tab
- Clear any existing logs

### **2. Use the Shortcut**

- Click the "Doodles #2336" shortcut button in the chat input
- Or type "Show me metadata for Doodles #2336 NFT"

### **3. Check Debug Logs**

Look for these specific console messages:

```javascript
// Tool processing
"Processing tool invocations for NFT data: 1";
"Processing tool: NFT-items-get-item-by-id";

// Raw MCP response
"Found NFT-items-get-item-by-id result: {actual response object}";

// Data structure analysis
"NFT Tool Result Structure: {detailed JSON structure}";
"Actual data after unwrapping: {unwrapped data}";

// Extraction results
"Successfully extracted NFT data: {final NFT object}";
"Final NFT data for rendering: [{NFT array}]";
```

## 🔍 **What to Look For**

### **In the MCP Response Structure**

Look for fields like:

- `name`, `title`, `meta.name`, `metadata.name`
- `image`, `meta.image`, `metadata.image`
- `collection.name`, `collectionName`
- `price`, `orders[0]`, `bestSellOrder`

### **Common Response Patterns**

#### **Rarible Format**

```json
{
  "id": "ETHEREUM:0x...:2336",
  "meta": {
    "name": "Doodle #2336",
    "image": "ipfs://Qm...",
    "attributes": [...]
  },
  "collection": {
    "name": "Doodles"
  },
  "bestSellOrder": {
    "takePrice": "785000000000000000",
    "takePriceUsd": "3511"
  }
}
```

#### **OpenSea Format**

```json
{
  "name": "Doodle #2336",
  "image_url": "https://ipfs.io/ipfs/Qm...",
  "collection": {
    "name": "Doodles"
  },
  "orders": [
    {
      "current_price": "785000000000000000"
    }
  ]
}
```

## 🎯 **Current Extraction Logic**

The system now checks for:

### **Name Extraction**

```typescript
name: actualData.name || // Direct name
  actualData.title || // Title field
  actualData.meta?.name || // Nested in meta
  actualData.metadata?.name || // Nested in metadata
  actualData.token_name || // Token name
  actualData.meta?.title || // Meta title
  actualData.properties?.name; // Properties name
```

### **Image Extraction**

```typescript
image: actualData.image || // Direct image
  actualData.imageUrl || // Image URL
  actualData.meta?.image || // Meta image
  actualData.metadata?.image || // Metadata image
  actualData.properties?.image || // Properties image
  actualData.animation_url; // Animation URL
```

### **Collection Extraction**

```typescript
collection: {
  name: actualData.collection?.name || // Nested collection name
    actualData.collectionName || // Direct collection name
    actualData.collection_name || // Snake case
    "Unknown Collection"; // Fallback
}
```

## 🔧 **Troubleshooting**

### **If Still Showing "NFT #Unknown"**

1. **Check console logs** for the actual response structure
2. **Identify the correct field names** in the MCP response
3. **Update extraction logic** to match the actual field names

### **If Image Not Loading**

1. **Check if image URL is extracted** correctly
2. **Verify IPFS URLs** are being converted to HTTP
3. **Test image URL** directly in browser

### **If Buy Button Missing**

1. **Check price data** in the response
2. **Look for order/pricing fields**
3. **Update price extraction** logic

## 🚀 **Next Steps**

1. **Test the shortcut** and check console logs
2. **Share the response structure** you see in the logs
3. **I'll update the extraction logic** based on the actual structure
4. **Remove debug logs** once working properly

## 📋 **Expected Working Result**

Once the extraction is fixed, you should see:

- ✅ **Title**: "Doodle #2336" (actual NFT name)
- ✅ **Collection**: "Doodles" (collection name)
- ✅ **Image**: IPFS image loaded and displayed
- ✅ **Buy Button**: "Buy for 0.785 ETH" with working link

The debug logs will show us exactly what structure we're getting so we can map the fields correctly! 🔍
