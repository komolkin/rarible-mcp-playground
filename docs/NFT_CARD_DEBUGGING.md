# NFT Card Rendering Debug Guide

## 🎯 **Current Setup**

I've added comprehensive debugging and a **force test** to help identify why NFT cards aren't rendering with real metadata.

## 🧪 **Testing Steps**

### **1. Force Test (Should Work)**

- Type or use shortcut: `"ETHEREUM:0x8a90cab2b38dba80c64b7734e58ee1db38b8992e:2336"`
- **Expected Result**: Should show a **"Test NFT (Force Render)"** card
- **If this works**: NFT card component is functional, issue is with data extraction
- **If this doesn't work**: Issue is with card detection/rendering

### **2. Check Browser Console**

Open F12 → Console and look for these debug messages:

```javascript
// Message detection
"Content: [actual AI response text]";
"NFT data length: 0";
"Tool invocations: ['NFT-items-get-item-by-id', ...]";
"Should render NFT preview: true/false";

// Tool processing
"Processing tool invocations for NFT data: X";
"Processing tool: NFT-items-get-item-by-id";
"Tool state: result/call/error";
"Tool args: {request: {itemId: '...'}}";

// Data extraction
"Found NFT-items-get-item-by-id result: [actual response]";
"NFT Tool Result Structure: [detailed JSON]";
"Actual data after unwrapping: [processed data]";
"Successfully extracted NFT data: [final NFT object]";

// Force test
"FORCE TEST: Adding test NFT card for ethereum address";
```

## 🔍 **Diagnostic Scenarios**

### **Scenario A: Force Test Works**

✅ **You see "Test NFT (Force Render)" card**

- Component is working correctly
- Issue is with real data extraction
- Check MCP response structure in console logs

### **Scenario B: No Card At All**

❌ **No NFT card appears**

- Check: `"Should render NFT preview: false"`
- Issue: NFT message part not being triggered
- Check: Message detection logic

### **Scenario C: Card Shows But No Real Data**

⚠️ **Card shows but with "NFT #Unknown"**

- NFT component works
- Data extraction failing
- Check: MCP tool response structure

## 🛠️ **Enhanced Features Added**

### **1. IPFS Link Display**

```typescript
// Shows both IPFS URI and HTTP gateway link
IPFS Link: ipfs://QmPMc4tc...
Gateway: [View Image] → https://ipfs.io/ipfs/QmPMc4tc...
```

### **2. Better Tool Debugging**

- Shows tool execution state (call/result/error)
- Shows tool arguments passed
- Shows why extraction failed

### **3. Relaxed Validation**

- Creates card with any identifying information
- More lenient about missing fields
- Better fallback name generation

### **4. Force Test Mechanism**

- Automatically triggers for specific ethereum addresses
- Uses realistic test data
- Helps isolate component vs data issues

## 🎯 **Expected Debug Output**

### **Working Scenario**

```javascript
"Content: I found information about Doodles #2336...";
"Tool invocations: ['NFT-items-get-item-by-id']";
"Should render NFT preview: true";
"Processing tool: NFT-items-get-item-by-id";
"Tool state: result";
"NFT Tool Result Structure: {id: '...', meta: {name: 'Doodle #2336', image: 'ipfs://...'}}";
"Successfully extracted NFT data: {name: 'Doodle #2336', image: 'ipfs://...'}";
```

### **Force Test Scenario**

```javascript
"Content: [AI response mentioning ethereum:0x8a90...]";
"FORCE TEST: Adding test NFT card for ethereum address";
"Final NFT data for rendering: [{name: 'Test NFT (Force Render)', ...}]";
```

## 🚀 **Next Steps Based on Results**

### **If Force Test Shows Card**

1. **Component works** ✅
2. **Focus on MCP response** structure
3. **Update field mapping** based on actual response
4. **Remove force test** once working

### **If No Card Shows**

1. **Check message detection** logic
2. **Verify NFT message part** is being called
3. **Check tool invocation** filtering

### **If Real Data Issues**

1. **Examine MCP response** in console logs
2. **Map correct field names** from actual response
3. **Update extraction logic** accordingly

## 📋 **Key Debug Questions**

1. **Does the force test card appear?** (Tests component functionality)
2. **What does the console show for "Should render NFT preview"?** (Tests detection)
3. **What's in "Tool invocations" array?** (Tests tool execution)
4. **What's the "NFT Tool Result Structure"?** (Shows real MCP response)

## ✨ **Enhanced IPFS Support**

The card now shows:

- **IPFS URI**: Original `ipfs://` link
- **Gateway Link**: Clickable HTTP gateway URL
- **Image Display**: Converted IPFS URL for image rendering

**Try the ethereum address query now and check the browser console - the debug logs will tell us exactly what's happening!** 🔍
