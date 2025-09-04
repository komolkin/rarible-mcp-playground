# NFT Item Query Prioritization

## 🎯 Overview

The system now prioritizes `NFT-items-get-item-by-id` as the primary tool for specific NFT item queries, ensuring users get detailed metadata when asking about individual NFTs.

## 🔍 **Priority System**

### **Ultra-High Priority (3000+ points)**

1. **`NFT-items-get-item-by-id`** - When query contains "#" symbol
   - Score: 3000 for "#" patterns
   - Score: 2800 for "ethereum:" addresses
   - Score: 2500 for "token" or "item" keywords

### **High Priority (1000-1900 points)**

2. **`NFT-items-get-item-by-ids`** - Multiple NFT lookup (1900)
3. **Floor price tools** - Collection pricing (1000)
4. **Collection search** - Discovery tools (900)

### **Standard Priority (500-800 points)**

- Collection statistics and analytics
- Ownership and marketplace data
- Charts and historical data

## 🎯 **Query Detection Patterns**

### **Triggers for NFT Item Priority**

```typescript
// These patterns trigger maximum priority for NFT-items-get-item-by-id:

1. "Doodles #2336" → # symbol detected
2. "ETHEREUM:0x8a90...e:2336" → ethereum: format detected
3. "Show me token 2336" → token keyword detected
4. "Get item metadata for..." → item keyword detected
```

### **Query Examples**

- ✅ **"Doodles #2336"** → `NFT-items-get-item-by-id` (Priority: 3000)
- ✅ **"ETHEREUM:0x8a90cab2b38dba80c64b7734e58ee1db38b8992e:2336"** → `NFT-items-get-item-by-id` (Priority: 2800)
- ✅ **"Show me token 2336 metadata"** → `NFT-items-get-item-by-id` (Priority: 2500)
- ✅ **"What's the floor price of Doodles?"** → Floor price tools (Priority: 1000)

## 🛠️ **Technical Implementation**

### **Tool Scoring Logic**

```typescript
// In app/api/chat/route.ts
const getToolPriority = (toolName: string, toolDesc: string): number => {
  let score = 0;

  // ULTRA-HIGH priority for specific NFT item queries
  if (lowerMessage.includes("#") && toolName === "NFT-items-get-item-by-id")
    score += 3000;

  if (
    lowerMessage.includes("ethereum:") &&
    toolName === "NFT-items-get-item-by-id"
  )
    score += 2800;

  if (
    (lowerMessage.includes("token") || lowerMessage.includes("item")) &&
    toolName === "NFT-items-get-item-by-id"
  )
    score += 2500;

  // ... other tool priorities
};
```

### **Data Extraction Enhancement**

```typescript
// Enhanced metadata extraction from NFT-items-get-item-by-id responses
const nftData: NFTData = {
  id: data.id || data.tokenId || `${data.contract}:${data.tokenId}`,
  name: data.name || data.title || data.meta?.name,
  description: data.description || data.meta?.description,
  image: data.image || data.meta?.image || data.meta?.content?.[0]?.url,
  // ... more fields
};
```

## 🎨 **User Experience Impact**

### **Before Optimization**

- User asks "Doodles #2336"
- System might use collection tools first
- May not get specific item metadata
- Limited visual preview capability

### **After Optimization**

- User asks "Doodles #2336"
- **`NFT-items-get-item-by-id` called first** ✨
- Gets complete item metadata immediately
- Rich NFT preview card displayed
- Buy button with direct marketplace link

## 📊 **Tool Selection Results**

### **Specific NFT Queries**

```
Query: "Doodles #2336"
Priority Order:
1. NFT-items-get-item-by-id (Score: 3000) ← FIRST
2. NFT-collections-get-collection-by-id (Score: 700)
3. search-API-search-items (Score: 600)
4. Other tools...
```

### **Collection Queries**

```
Query: "Doodles collection floor price"
Priority Order:
1. NFT-data-and-historical-statistics-get-floor-price (Score: 1000) ← FIRST
2. search-API-search-collection (Score: 900)
3. NFT-collections-get-collection-by-id (Score: 700)
4. Other tools...
```

## 🔄 **Integration with Visual Previews**

### **Workflow for NFT Item Queries**

1. **User Query**: "Show me Doodles #2336"
2. **Tool Selection**: `NFT-items-get-item-by-id` gets highest priority
3. **API Call**: Fetches complete NFT metadata
4. **Data Extraction**: `extractNFTDataFromToolResult()` processes response
5. **Visual Rendering**: NFT preview card automatically displays
6. **User Actions**: Can buy, view, or copy NFT information

### **Enhanced Metadata Support**

- **Multiple Image Sources**: `data.image`, `data.meta.image`, `data.meta.content[0].url`
- **Flexible Naming**: `data.name`, `data.title`, `data.meta.name`
- **Rich Descriptions**: `data.description`, `data.meta.description`
- **Contract Information**: `data.contract`, `data.contractAddress`

## 🎯 **Benefits**

### **For Users**

- **Faster Results**: Direct item lookup instead of collection search
- **Rich Metadata**: Complete NFT information immediately
- **Visual Context**: Beautiful NFT cards with images
- **Immediate Actions**: Buy buttons and marketplace links

### **For Developers**

- **Predictable Behavior**: Specific queries use specific tools
- **Better UX**: More relevant tool selection
- **Enhanced Debugging**: Clear priority system
- **Maintainable**: Easy to adjust priorities

## 🧪 **Testing Scenarios**

### **High-Priority Patterns**

- ✅ `"Doodles #2336"` → NFT-items-get-item-by-id first
- ✅ `"ETHEREUM:0x...2336"` → NFT-items-get-item-by-id first
- ✅ `"Show me token 2336"` → NFT-items-get-item-by-id first
- ✅ `"Get item metadata"` → NFT-items-get-item-by-id first

### **Collection Patterns**

- ✅ `"Doodles floor price"` → Floor price tools first
- ✅ `"Collection statistics"` → Collection stats tools first
- ✅ `"Search collections"` → Search tools first

## 🚀 **Future Enhancements**

### **Potential Improvements**

1. **Smart ID Detection**: Auto-detect contract:tokenId patterns
2. **Batch Queries**: Handle multiple NFT IDs in one query
3. **Caching**: Cache frequently requested NFT metadata
4. **Fallback Logic**: Try alternative tools if primary fails

### **Advanced Features**

1. **Related NFTs**: Show similar items from same collection
2. **Price History**: Historical pricing for specific NFTs
3. **Trait Analysis**: Rarity and trait comparison
4. **Owner History**: Track ownership changes

## ✨ **Key Takeaway**

**When users ask about specific NFT items, the system now ensures `NFT-items-get-item-by-id` is called first**, providing the most detailed and accurate metadata for rich visual previews and enhanced user experience! 🎉
