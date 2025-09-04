# Wallet-Database Integration

## 🎯 Overview

The application now seamlessly connects database sessions with wallet addresses, allowing users to access their chat history when they connect their wallet or email through Privy authentication.

## 🔄 How It Works

### User ID System

The system uses a **dual user ID approach**:

1. **Anonymous Users**: Generate random nanoid for temporary sessions
2. **Authenticated Users**: Use wallet address or email as deterministic user ID

### Authentication States

#### 1. **Anonymous State**

- User visits app without connecting wallet
- Gets temporary random user ID (stored in localStorage)
- Chats are saved under this anonymous ID
- Data persists until user clears browser data

#### 2. **Wallet Connected State**

- User connects wallet through Privy
- User ID becomes wallet address (lowercase normalized)
- All new chats saved under wallet address
- Previous anonymous chats remain separate

#### 3. **Email Connected State**

- User connects via email through Privy
- User ID becomes email address (lowercase normalized)
- Same behavior as wallet connection

## 🔧 Technical Implementation

### Core Files

#### `lib/user-id.ts`

```typescript
// New functions added:
setWalletUserId(walletAddress: string)    // Set wallet-based user ID
clearWalletUserId()                       // Return to anonymous ID
getUserIdInfo()                           // Get user type and ID
```

#### `lib/hooks/use-wallet-user.ts`

```typescript
// New hook that integrates with Privy
useWalletUser(): WalletUser               // Complete wallet user state
useUserId(): string                       // Simple user ID (backward compatible)
```

### User ID Priority

1. **Wallet User ID** (if wallet/email connected)
2. **Anonymous User ID** (fallback)

### Database Schema

**No changes required!** The existing schema works perfectly:

```sql
chats:
  - id (primary key)
  - userId (text) -- Now stores wallet address or email when connected
  - title
  - createdAt
  - updatedAt

messages:
  - id (primary key)
  - chatId (foreign key)
  - role
  - parts (JSON)
  - createdAt
```

## 🎨 User Experience

### Connection Flow

1. **User starts anonymous**: Gets random user ID, can chat normally
2. **User connects wallet**:
   - User ID switches to wallet address
   - Previous anonymous chats remain in database but not visible
   - New chats saved under wallet address
3. **User disconnects wallet**:
   - Returns to anonymous mode with new random ID
   - Wallet-associated chats no longer visible
4. **User reconnects same wallet**:
   - Gets same wallet address as user ID
   - All previous wallet chats become visible again

### UI Indicators

#### Sidebar User Display

- **Anonymous**: Shows "User ID" with random ID
- **Wallet**: Shows "Wallet" with shortened address (0x1234...5678)
- **Email**: Shows "Email" with email address
- **Connected Badge**: Shows when authenticated

#### User Management

- **Copy Function**: Adapts label (User ID/Wallet address/Email)
- **Edit Function**: Disabled for wallet users (ID managed by wallet)
- **Visual Feedback**: Clear indication of connection state

## 🔄 Data Persistence

### Scenarios

#### 1. **Anonymous → Wallet Connection**

```
Before: userId = "abc123xyz" (random)
After:  userId = "0x742d35cc6ef32825" (wallet address)

Result: Anonymous chats still in DB but not visible
        New chats saved under wallet address
```

#### 2. **Wallet Disconnection → New Anonymous**

```
Before: userId = "0x742d35cc6ef32825" (wallet)
After:  userId = "def456uvw" (new random)

Result: Wallet chats still in DB but not visible
        New anonymous session starts
```

#### 3. **Wallet Reconnection**

```
Before: userId = "def456uvw" (anonymous)
After:  userId = "0x742d35cc6ef32825" (same wallet)

Result: All previous wallet chats become visible again
```

## 🛡️ Security & Privacy

### Data Isolation

- **Anonymous chats** are isolated from wallet chats
- **Different wallets** have completely separate chat histories
- **Email vs Wallet** connections are treated as different user types

### No Data Migration

- System doesn't automatically migrate anonymous chats to wallet
- This prevents accidental data mixing
- Users can manually recreate important conversations if needed

### Wallet Address Normalization

- All wallet addresses stored as **lowercase**
- Ensures consistent user ID regardless of address casing
- Prevents duplicate users due to case differences

## 🔍 Debugging & Monitoring

### Browser Console

```javascript
// Check current user state
import { getUserIdInfo } from "@/lib/user-id";
console.log(getUserIdInfo());

// Check localStorage state
console.log("Wallet User ID:", localStorage.getItem("ai-chat-wallet-user-id"));
console.log("Anonymous User ID:", localStorage.getItem("ai-chat-user-id"));
```

### Database Queries

```sql
-- Find all chats for a wallet address
SELECT * FROM chats WHERE userId = '0x742d35cc6ef32825';

-- Find all anonymous chats (random IDs)
SELECT * FROM chats WHERE LENGTH(userId) = 21 AND userId NOT LIKE '0x%';

-- Count chats by user type
SELECT
  CASE
    WHEN userId LIKE '0x%' THEN 'wallet'
    WHEN userId LIKE '%@%' THEN 'email'
    ELSE 'anonymous'
  END as user_type,
  COUNT(*) as chat_count
FROM chats
GROUP BY user_type;
```

## 🚀 Benefits

### For Users

- **Persistent Chat History**: Chats saved to wallet/email identity
- **Cross-Device Access**: Same wallet = same chats on any device
- **Privacy**: Anonymous browsing still fully supported
- **Seamless UX**: Automatic switching between modes

### For Developers

- **Backward Compatible**: Existing anonymous users unaffected
- **Simple Integration**: Minimal code changes required
- **Flexible**: Supports both wallet and email authentication
- **Scalable**: No database schema changes needed

## 🛠️ Future Enhancements

### Potential Features

1. **Data Migration Tool**: Allow users to merge anonymous chats with wallet
2. **Multi-Wallet Support**: Manage chats across multiple wallets
3. **Export/Import**: Backup and restore chat data
4. **Shared Chats**: Allow sharing specific chats between users
5. **Chat Categories**: Organize chats by wallet/purpose

### Analytics Opportunities

- Track wallet vs anonymous usage patterns
- Monitor user retention after wallet connection
- Analyze chat data by user type

## 📋 Migration Guide

### For Existing Anonymous Users

1. Connect wallet/email through Privy
2. Previous anonymous chats remain in database
3. Start fresh with wallet-based identity
4. Can disconnect and return to anonymous mode anytime

### For Developers

The integration is **fully backward compatible**:

- Existing `getUserId()` calls work unchanged
- Anonymous users continue working normally
- No database migrations required
- Gradual adoption as users connect wallets
