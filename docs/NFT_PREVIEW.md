# NFT Visual Preview Feature

## 🎯 Overview

The chat interface now automatically renders **visual NFT previews** when users ask about specific NFTs. When the AI responds with NFT data from MCP tools, beautiful NFT cards are displayed with images, metadata, pricing, and buy buttons.

## ✨ Features

### 🖼️ **Visual NFT Cards**

- **IPFS Image Loading**: Automatically converts IPFS URLs to HTTP gateway URLs
- **Fallback Handling**: Graceful fallback when images fail to load
- **Responsive Design**: Cards adapt to different screen sizes
- **Loading States**: Skeleton loading while images load

### 📊 **Rich Metadata Display**

- **NFT Name & Collection**: Clear identification
- **Price Information**: ETH price with USD conversion
- **Trait Badges**: Visual display of NFT attributes
- **Description**: NFT description when available
- **Token ID & Contract**: Technical details

### 🛒 **Interactive Elements**

- **Buy Button**: Direct link to marketplace (OpenSea, etc.)
- **View Details**: Expandable view (coming soon)
- **Copy ID**: Quick copy NFT identifier
- **External Link**: Open in marketplace

## 🚀 **How It Works**

### Automatic Detection

The system automatically detects NFT-related messages by:

1. **Keyword Analysis**: Looks for NFT-related terms (#, doodle, bayc, nft, etc.)
2. **Tool Analysis**: Checks if MCP tools returned NFT data
3. **Context Awareness**: Only shows previews for assistant responses

### Smart Rendering

```typescript
// Example: User asks "Doodles #2336"
// 1. AI calls MCP tools to get NFT data
// 2. System detects NFT-related response
// 3. Extracts NFT metadata from tool results
// 4. Renders visual preview alongside text response
```

## 🎨 **Visual Design**

### Card Layout

- **Header**: NFT name, collection, copy button
- **Image**: Large preview with loading states
- **Price**: Prominent pricing display
- **Traits**: Badge-style attribute display
- **Actions**: Buy, view, external link buttons

### Responsive Behavior

- **Single NFT**: Centered card, max-width constrained
- **Multiple NFTs**: Grid layout (1-3 columns based on screen size)
- **Mobile**: Single column, touch-friendly buttons

## 🔧 **Technical Implementation**

### Core Components

#### `NFTPreview.tsx`

```typescript
interface NFTData {
  id: string;
  name?: string;
  image?: string;
  collection?: { name: string; id: string };
  price?: { amount: string; currency: string; usd?: string };
  traits?: Array<{ type: string; value: string; rarity?: number }>;
  marketplace?: { url: string; name: string };
}
```

#### `NFTMessagePart.tsx`

- Integrates with existing message system
- Extracts NFT data from MCP tool results
- Renders markdown content + NFT previews

#### `message.tsx`

- Enhanced to detect NFT-related content
- Conditionally renders NFT previews
- Maintains backward compatibility

### Data Extraction

```typescript
// Automatically extracts NFT data from various MCP tool response formats
extractNFTDataFromToolResult(toolResult: any): NFTData | null
```

### IPFS Image Handling

```typescript
// Converts IPFS URLs to accessible HTTP URLs
const getImageUrl = (url: string) => {
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return url;
};
```

## 📱 **User Experience**

### Interaction Flow

1. **User Query**: "Show me Doodles #2336"
2. **AI Response**: Text explanation + MCP tool calls
3. **Visual Enhancement**: NFT card automatically appears
4. **User Actions**: Can buy, view details, or copy ID

### Smart Features

- **Loading States**: Smooth skeleton loading
- **Error Handling**: Graceful fallbacks for missing images
- **Copy Functionality**: One-click ID copying with toast feedback
- **External Links**: Safe navigation to marketplaces

## 🎯 **Supported NFT Data Sources**

### MCP Tools Integration

- `NFT-items-get-item-by-id`
- `search-API-search-items`
- `NFT-collections-get-collection-by-id`
- Any tool returning NFT metadata

### Marketplace Support

- **OpenSea**: Direct buy links
- **Rarible**: Native marketplace integration
- **Generic**: Extensible for other marketplaces

## 🖼️ **Image Gateway Support**

### IPFS Gateways

- `ipfs.io/ipfs/` (primary)
- `gateway.pinata.cloud/ipfs/`
- `*.ipfs.dweb.link`
- `*.ipfs.cf-ipfs.com`

### Configuration

Added to `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "ipfs.io", pathname: "/ipfs/**" },
    { protocol: "https", hostname: "**.ipfs.dweb.link" },
    // ... more gateways
  ],
}
```

## 🎨 **Styling & Theming**

### CSS Classes

- Fully integrated with existing design system
- Dark/light mode support
- Consistent with app's visual language

### Custom Utilities

```css
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

## 🚀 **Benefits**

### For Users

- **Visual Context**: See NFTs while discussing them
- **Quick Actions**: Buy or view without leaving chat
- **Rich Information**: All metadata at a glance
- **Seamless Experience**: Automatic, no extra steps

### For Developers

- **Extensible**: Easy to add new NFT data sources
- **Maintainable**: Clean component architecture
- **Performant**: Optimized image loading and caching
- **Accessible**: Screen reader friendly

## 🔮 **Future Enhancements**

### Planned Features

1. **Detailed Modal**: Expandable NFT details view
2. **Price History**: Charts showing price trends
3. **Similar NFTs**: Recommendations based on traits
4. **Collection Gallery**: Browse entire collections
5. **Favorites**: Save interesting NFTs
6. **Share**: Social sharing of NFT cards

### Technical Improvements

1. **Caching**: Smart image and metadata caching
2. **Lazy Loading**: Performance optimization for grids
3. **Animation**: Smooth transitions and micro-interactions
4. **Analytics**: Track user interactions with NFTs

## 📋 **Usage Examples**

### Single NFT Query

```
User: "Show me Doodles #2336"
Result: Text response + NFT card with image, price, traits, buy button
```

### Collection Query

```
User: "Find cheapest NFTs in Doodles collection"
Result: Text response + Grid of NFT cards showing cheapest options
```

### Specific Metadata

```
User: "What are the traits of BAYC #1234?"
Result: Text response + NFT card highlighting trait badges
```

## ✅ **Quality Assurance**

### Tested Scenarios

- ✅ IPFS image loading and fallbacks
- ✅ Various NFT metadata formats
- ✅ Mobile responsive design
- ✅ Dark/light mode compatibility
- ✅ Loading states and error handling
- ✅ Marketplace link functionality

### Performance

- ✅ Optimized Next.js Image component
- ✅ Efficient data extraction
- ✅ Minimal bundle size impact
- ✅ Fast rendering and interactions

The NFT preview feature transforms your rAIrible chat from text-only to a rich, visual NFT exploration experience! 🎉
