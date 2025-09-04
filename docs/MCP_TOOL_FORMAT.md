# MCP Tool Format Requirements

## 🚨 **Critical Issue Resolved**

The MCP tools require parameters to be wrapped in a `"request"` object, but the AI was calling them with flat parameters, causing validation errors.

## ❌ **Previous Error**

```json
// AI was calling tools like this (WRONG):
{
  "itemId": "ETHEREUM:0x8a90cab2b38dba80c64b7734e58ee1db38b8992e:2336"
}

// Error result:
"MCP error -32602: Invalid arguments for tool NFT-items-get-item-by-id:
Expected 'object' for 'request' parameter, received 'undefined'"
```

## ✅ **Correct Format**

```json
// AI now calls tools like this (CORRECT):
{
  "request": {
    "itemId": "ETHEREUM:0x8a90cab2b38dba80c64b7734e58ee1db38b8992e:2336"
  }
}
```

## 🎯 **Implementation**

### **System Message Update**

Added explicit instructions in `app/api/chat/route.ts`:

```typescript
system: `IMPORTANT: For MCP tools, always wrap parameters in a "request" object. Examples:
- NFT-items-get-item-by-id: {"request": {"itemId": "ETHEREUM:0x..."}}
- NFT-collections-get-collection-by-id: {"request": {"collection": "ETHEREUM:0x..."}}
- search-API-search-items: {"request": {"query": "doodles", "limit": 10}}

NEVER use flat parameters like {"itemId": "..."} - ALWAYS wrap in {"request": {...}}`;
```

## 📋 **Tool Format Examples**

### **NFT Item Lookup**

```json
// Tool: NFT-items-get-item-by-id
{
  "request": {
    "itemId": "ETHEREUM:0x8a90cab2b38dba80c64b7734e58ee1db38b8992e:2336"
  }
}
```

### **Collection Lookup**

```json
// Tool: NFT-collections-get-collection-by-id
{
  "request": {
    "collection": "ETHEREUM:0x8a90cab2b38dba80c64b7734e58ee1db38b8992e"
  }
}
```

### **Search Operations**

```json
// Tool: search-API-search-items
{
  "request": {
    "query": "doodles",
    "limit": 10,
    "offset": 0
  }
}
```

### **Floor Price Data**

```json
// Tool: NFT-data-and-historical-statistics-get-floor-price
{
  "request": {
    "id": "ETHEREUM:0x8a90cab2b38dba80c64b7734e58ee1db38b8992e"
  }
}
```

## 🔧 **Technical Details**

### **MCP Protocol Requirement**

- **All MCP tools** expect parameters wrapped in a `request` object
- **Schema Validation**: Tools validate against this specific structure
- **Error Code -32602**: "Invalid params" when format is incorrect

### **AI Model Training**

- **System Message**: Explicit instructions for proper format
- **Examples**: Concrete examples for common tools
- **Negative Examples**: What NOT to do (flat parameters)

## 🎯 **Impact on User Queries**

### **Before Fix**

```
User: "Doodles #2336"
AI calls: NFT-items-get-item-by-id with {"itemId": "..."}
Result: ❌ MCP error -32602: Invalid arguments
```

### **After Fix**

```
User: "Doodles #2336"
AI calls: NFT-items-get-item-by-id with {"request": {"itemId": "..."}}
Result: ✅ NFT metadata retrieved successfully
```

## 🚀 **Benefits**

- **✅ No More MCP Errors**: Proper parameter formatting
- **✅ Successful Tool Calls**: NFT data retrieved correctly
- **✅ Rich Visual Previews**: NFT cards display properly
- **✅ Better User Experience**: Queries work as expected

## 📝 **Best Practices**

### **For Future Tool Additions**

1. **Always check MCP tool schemas** for required parameter structure
2. **Add examples** to system message for new tools
3. **Test tool calls** with correct format before deployment
4. **Monitor logs** for parameter validation errors

### **Common Patterns**

- **Most MCP tools**: Require `{"request": {...}}` wrapper
- **Search tools**: Often need `query`, `limit`, `offset` in request
- **ID-based tools**: Usually need `id`, `itemId`, or `collection` in request
- **Statistical tools**: May need `period`, `size`, `endTime` parameters

## 🔍 **Debugging**

### **Check Tool Call Format**

```javascript
// In terminal logs, look for:
"toolArgs": {
  "request": {        // ✅ CORRECT - wrapped in request
    "itemId": "..."
  }
}

// vs.

"toolArgs": {
  "itemId": "..."     // ❌ WRONG - flat parameters
}
```

### **Monitor for Errors**

- **Error Code -32602**: Invalid parameters format
- **"Expected object"**: Missing request wrapper
- **"Required"**: Missing required request object

## ✨ **Success Indicators**

When working correctly, you'll see:

- ✅ No MCP validation errors in logs
- ✅ Successful tool execution responses
- ✅ NFT metadata in chat responses
- ✅ Visual NFT previews displaying

The fix ensures that when users ask about "Doodles #2336", the `NFT-items-get-item-by-id` tool is called with the correct format and returns the rich metadata needed for beautiful visual previews! 🎉
