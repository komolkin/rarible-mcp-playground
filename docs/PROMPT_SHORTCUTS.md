# Prompt Shortcuts

## 🚀 Overview

The chat interface now includes **Quick Prompt Shortcuts** to help users quickly access common NFT queries without typing them manually.

## 🎯 Features

### Quick Access Badges

- **Smart Display**: Shortcuts appear when input is empty or when "Quick prompts" button is clicked
- **One-Click Input**: Click any badge to instantly populate the input field
- **Auto-Hide**: Shortcuts hide when typing to keep the interface clean

### Available Shortcuts

1. **Doodles #2336** - Quick access to specific NFT metadata
2. **Floor Price** - "What's the floor price of Doodles collection?"
3. **Collection Stats** - "Show me Doodles collection statistics"
4. **Cheapest NFTs** - "Find the cheapest NFTs in Doodles collection"
5. **BAYC Stats** - "Show me Bored Ape Yacht Club collection statistics"
6. **Search Collections** - "Search for popular NFT collections"

## 🎨 User Experience

### Visual Design

- **Toggle Button**: "Quick prompts" button with lightning icon (⚡)
- **Badge Style**: Secondary badges with hover effects
- **Responsive Layout**: Flex wrap for mobile compatibility
- **Clean Integration**: Appears above the input field without disrupting layout

### Interaction Flow

1. **Empty Input**: Shortcuts visible by default
2. **Click "Quick prompts"**: Toggle shortcuts visibility
3. **Click Badge**: Instantly populates input field and hides shortcuts
4. **Start Typing**: Shortcuts auto-hide to reduce clutter

## 🛠️ Technical Implementation

### Component Structure

```typescript
// Located in: components/textarea.tsx

const PROMPT_SHORTCUTS = [
  { label: "Display Name", prompt: "Actual prompt text" },
  // ... more shortcuts
];
```

### State Management

- `showShortcuts`: Boolean state for toggle visibility
- Auto-show when `input === ""`
- Auto-hide when user starts typing

### Event Handling

```typescript
const handleShortcutClick = (prompt: string) => {
  // Create synthetic event to update input
  const event = {
    target: { value: prompt },
  } as React.ChangeEvent<HTMLTextAreaElement>;
  handleInputChange(event);
  setShowShortcuts(false);
};
```

## 📱 Responsive Design

### Desktop

- Shortcuts display in a horizontal row
- All badges visible simultaneously
- Hover effects for better UX

### Mobile

- Flex wrap ensures badges don't overflow
- Touch-friendly badge sizing
- Maintains readability on small screens

## 🎯 Benefits

### For Users

- **Faster Queries**: No need to type common prompts
- **Discovery**: Learn about available query types
- **Consistency**: Standardized prompt formats
- **Efficiency**: Quick access to popular NFT operations

### For Developers

- **Extensible**: Easy to add new shortcuts
- **Maintainable**: Centralized shortcut definitions
- **Customizable**: Simple to modify prompts or styling
- **Analytics Ready**: Can track shortcut usage

## 🔧 Customization

### Adding New Shortcuts

```typescript
const PROMPT_SHORTCUTS = [
  // Existing shortcuts...
  {
    label: "New Feature",
    prompt: "Your custom prompt here",
  },
];
```

### Styling Modifications

- Badge styling: `className` in Badge component
- Toggle button: Modify Button component props
- Layout: Adjust flex container classes

## 🚀 Future Enhancements

### Potential Features

1. **Dynamic Shortcuts**: Based on user's recent queries
2. **Categories**: Group shortcuts by type (Collections, Stats, Search)
3. **Favorites**: Let users save custom shortcuts
4. **Context-Aware**: Show different shortcuts based on current conversation
5. **Keyboard Navigation**: Arrow keys to navigate shortcuts
6. **Search Shortcuts**: Filter shortcuts by typing

### Analytics Opportunities

- Track most-used shortcuts
- A/B test different prompt phrasings
- Monitor shortcut effectiveness vs manual typing
- User engagement metrics

## 📋 Usage Examples

### Common User Flows

1. **New User**: Sees shortcuts, clicks "Floor Price" to learn about collections
2. **Power User**: Uses "Doodles #2336" for quick specific NFT lookup
3. **Explorer**: Clicks "Search Collections" to discover new projects
4. **Analyst**: Uses "Collection Stats" for research purposes

### Integration with MCP Tools

Each shortcut is designed to trigger specific MCP tools:

- **Floor Price** → `NFT-data-and-historical-statistics-get-floor-price`
- **Collection Stats** → `NFT-data-and-historical-statistics-get-collection-stats`
- **Search Collections** → `search-API-search-collection`
- **Cheapest NFTs** → `NFT-items-get-items-by-collection`

## ✨ Best Practices

### Shortcut Design

- **Clear Labels**: Use descriptive, action-oriented names
- **Concise Prompts**: Keep prompts focused and specific
- **Popular Queries**: Include most commonly requested information
- **Balanced Coverage**: Mix specific examples with general queries

### UX Considerations

- **Non-Intrusive**: Don't overwhelm the interface
- **Discoverable**: Make shortcuts visible but not dominant
- **Consistent**: Maintain uniform styling and behavior
- **Accessible**: Ensure keyboard and screen reader compatibility
