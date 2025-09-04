# Real MCP Data Extraction

## 🎯 **Current Status**

I've enhanced the NFT data extraction to prioritize **Rarible API format** and handle real MCP responses properly.

## 🔧 **Enhanced Data Mapping**

### **Rarible API Priority Fields**

```typescript
name: actualData.meta?.name; // Rarible stores name in meta.name
image: actualData.meta?.image; // Rarible stores image in meta.image
description: actualData.meta?.description; // Rarible stores description in meta.description
traits: actualData.meta?.attributes; // Rarible stores traits in meta.attributes
price: actualData.bestSellOrder?.takePrice; // Rarible price in bestSellOrder.takePrice
```

### **Price Conversion**

- **Wei to ETH**: Automatically converts large numbers (Wei) to ETH
- **USD Display**: Shows USD equivalent if available
- **Buy Button**: "Buy for {amount} {currency}" format

### **Image Handling**

- **IPFS Priority**: Converts IPFS URLs to HTTP gateways
- **Multiple Sources**: Checks meta.image, meta.content[0].url, direct image
- **Fallback**: Shows "No image" placeholder if missing

## 🧪 **Testing Instructions**

### **1. Test the Shortcut**

- Click **"Doodles #2336"** shortcut in chat input
- This should trigger `NFT-items-get-item-by-id` with highest priority

### **2. Check Browser Console**

Open F12 → Console and look for:

```javascript
// Tool processing
"Processing tool invocations for NFT data: X"
"Processing tool: NFT-items-get-item-by-id"

// MCP Response Structure
"NFT Tool Result Structure: {
  // This shows the ACTUAL response from Rarible MCP API
}"

// Data after unwrapping
"Actual data after unwrapping: {
  // This shows the processed data structure
}"

// Extraction results
"Successfully extracted NFT data: {
  id: "...",
  name: "...",     // Should show actual NFT name
  image: "...",    // Should show IPFS or HTTP image URL
  collection: {...}, // Should show collection info
  price: {...}     // Should show price data
}"
```

### **3. Expected Results**

**If working correctly, you should see:**

- ✅ **Title**: "Doodle #2336" (real NFT name)
- ✅ **Collection**: "Doodles" (real collection name)
- ✅ **Image**: Actual NFT image from IPFS
- ✅ **Buy Button**: "Buy for 0.785 ETH" (real price)
- ✅ **Traits**: Real trait badges (Background, Head, Hair, etc.)

## 🔍 **Debugging Scenarios**

### **If Still Shows "NFT #Unknown"**

1. **Check console logs** for the actual MCP response structure
2. **Look for field names** that don't match our extraction logic
3. **Update field mapping** based on actual response format

### **If No Debug Logs Appear**

1. **Tool not being called**: Check if `NFT-items-get-item-by-id` appears in selected tools
2. **Message not detected**: Check if NFT message part is being triggered
3. **Tool execution error**: Check terminal for MCP errors

### **If Debug Logs Show Empty Data**

1. **MCP tool failed**: Check terminal for tool execution errors
2. **Wrong parameters**: Verify tool is called with correct `{"request": {"itemId": "..."}}`
3. **API response empty**: The NFT might not exist or API might be down

## 🎯 **Key Fields to Look For**

In the console logs, look for these specific fields in the MCP response:

### **Rarible Format**

```json
{
  "id": "ETHEREUM:0x8a90cab2b38dba80c64b7734e58ee1db38b8992e:2336",
  "meta": {
    "name": "Doodle #2336",           ← NFT TITLE
    "image": "ipfs://QmPMc4tc...",    ← NFT IMAGE
    "description": "A Doodle...",     ← NFT DESCRIPTION
    "attributes": [                   ← NFT TRAITS
      {"trait_type": "Background", "value": "Orange"},
      {"trait_type": "Head", "value": "Med"}
    ]
  },
  "collection": {
    "name": "Doodles"                 ← COLLECTION NAME
  },
  "bestSellOrder": {
    "takePrice": "785000000000000000", ← PRICE IN WEI
    "takePriceUsd": "3511"            ← PRICE IN USD
  }
}
```

## 🚀 **Next Steps**

1. **Test the shortcut** and check console logs
2. **Share the response structure** you see in the logs
3. **I'll fine-tune the extraction** based on the actual format
4. **Remove debug logs** once working properly

The enhanced extraction should now properly handle Rarible's API format and display real NFT metadata in the cards! 🎉
