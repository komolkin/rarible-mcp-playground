# NFT Data Extraction Debugging

## 🔍 **Current Issue**

The NFT card is rendering but showing "undefined #undefined" and "No image", indicating that the data extraction from MCP tool responses isn't mapping correctly to the expected fields.

## 🛠️ **Debugging Steps**

### **1. Check Browser Console**

When you ask about an NFT (e.g., "Doodles #2336"), check the browser console for:

```javascript
// These debug logs will show:
"Processing tool invocations for NFT data: [number]";
"Processing tool: NFT-items-get-item-by-id";
"Found NFT-items-get-item-by-id result: [actual response]";
"NFT Tool Result Structure: [detailed JSON]";
"Successfully extracted NFT data: [extracted data]";
"Final NFT data for rendering: [array of NFT data]";
```

### **2. Examine MCP Response Structure**

Look for the "NFT Tool Result Structure" log to understand the actual API response format.

### **3. Common Response Patterns**

The extractor now handles multiple field name variations:

#### **NFT Name/Title**

- `data.name`
- `data.title`
- `data.meta?.name`
- `data.metadata?.name`
- `data.token_name`

#### **NFT Image**

- `data.image`
- `data.imageUrl`
- `data.image_url`
- `data.meta?.image`
- `data.meta?.image_url`
- `data.metadata?.image`
- `data.meta?.content?.[0]?.url`

#### **Collection Info**

- `data.collection?.name`
- `data.collectionName`
- `data.collection_name`

#### **Price Data**

- `data.price`
- `data.orders?.[0]`
- `data.bestSellOrder`
- `data.sell_orders?.[0]`

## 🔧 **Enhanced Data Extraction**

### **Current Mapping Logic**

```typescript
const nftData: NFTData = {
  id:
    data.id ||
    data.tokenId ||
    data.token_id ||
    `${data.contract}:${data.tokenId}`,
  name: data.name || data.title || data.meta?.name || data.metadata?.name,
  image: data.image || data.meta?.image || data.metadata?.image,
  // ... enhanced field mapping
};
```

### **Fallback Mechanisms**

1. **Name Generation**: If no name found, creates `"Collection #TokenID"`
2. **Image Fallback**: Shows "No image" placeholder if image missing
3. **Collection Fallback**: Shows "Unknown Collection" if collection missing

## 🎯 **Expected Card Behavior**

### **With Complete Data**

- ✅ **Title**: "Doodle #2336" or actual NFT name
- ✅ **Collection**: "Doodles" collection name
- ✅ **Image**: IPFS image loaded and displayed
- ✅ **Price**: "0.785 ETH (~$3,511)" with buy button
- ✅ **Traits**: Badge-style trait display

### **With Partial Data**

- ✅ **Title**: Generated from collection + token ID
- ✅ **Collection**: Shows "Unknown Collection" if missing
- ✅ **Image**: "No image" placeholder with eye icon
- ✅ **Price**: Hidden if no price data
- ✅ **Traits**: Hidden if no trait data

## 📊 **Debugging Checklist**

### **Step 1: Verify Tool Call**

Check terminal logs for:

```
Selected tools: [
  'NFT-items-get-item-by-id',  ← Should be FIRST
  ...
]
```

### **Step 2: Check MCP Response**

Look for successful tool execution (not MCP errors):

```
✅ No "MCP error -32602" messages
✅ Tool execution completed successfully
```

### **Step 3: Verify Data Structure**

Check browser console for:

```javascript
"NFT Tool Result Structure: {
  // This shows the actual API response
}"
```

### **Step 4: Confirm Extraction**

Look for:

```javascript
"Successfully extracted NFT data: {
  id: "...",
  name: "...",
  image: "...",
  // ... other fields
}"
```

## 🔧 **Troubleshooting**

### **If NFT Card Shows "undefined #undefined"**

1. **Check**: Browser console for "NFT Tool Result Structure"
2. **Verify**: The response has `name`, `title`, or `meta.name` fields
3. **Update**: Add new field mappings to `extractNFTDataFromToolResult`

### **If Image Shows "No image"**

1. **Check**: Console for image URL in response
2. **Verify**: IPFS URLs are being converted properly
3. **Test**: Image URL accessibility in browser

### **If Buy Button Missing**

1. **Check**: Price data in MCP response
2. **Verify**: `orders`, `price`, or `bestSellOrder` fields exist
3. **Update**: Price extraction logic if needed

## 🛡️ **Fallback Strategies**

### **Missing Name**

```typescript
// Generates: "Doodles #2336" if collection and tokenId available
if (!nftData.name && nftData.collection?.name && nftData.tokenId) {
  nftData.name = `${nftData.collection.name} #${nftData.tokenId}`;
}
```

### **Missing Image**

- Shows placeholder with eye icon
- Displays "Image unavailable" message
- Card still renders with other metadata

### **Missing Price**

- Hides price section entirely
- Disables buy button
- Shows view and copy buttons only

## 🎯 **Next Steps**

1. **Test with "Doodles #2336" shortcut**
2. **Check browser console** for debug logs
3. **Identify missing fields** in MCP response
4. **Update extraction logic** based on actual response structure
5. **Remove debug logs** once working properly

## 📋 **Common MCP Response Formats**

### **Rarible API Format**

```json
{
  "id": "ETHEREUM:0x8a90cab2b38dba80c64b7734e58ee1db38b8992e:2336",
  "meta": {
    "name": "Doodle #2336",
    "description": "...",
    "image": "ipfs://QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS",
    "content": [...]
  },
  "collection": {...},
  "bestSellOrder": {...}
}
```

Once you test with the shortcut, the debug logs will show us exactly what structure we're getting and we can adjust the extraction accordingly! 🔍
