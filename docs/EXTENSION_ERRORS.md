# Chrome Extension Errors

## Overview

This application may encounter Chrome extension errors, particularly related to wallet extensions when using Privy for authentication. These errors typically manifest as:

```
TypeError: Error in invocation of runtime.sendMessage(optional string extensionId, any message, optional object options, optional function callback): chrome.runtime.sendMessage() called from a webpage must specify an Extension ID (string) for its first argument.
```

## Root Cause

- **Wallet Extensions**: Browser wallet extensions (MetaMask, Coinbase Wallet, etc.) sometimes try to communicate with each other
- **Privy Integration**: Our Privy authentication triggers wallet detection, which can cause extension interactions
- **Missing Extension ID**: Extensions make `chrome.runtime.sendMessage()` calls without proper extension IDs

## Solutions Implemented

### 1. Error Suppression

- **Location**: `app/layout.tsx` and `lib/extension-error-handler.ts`
- **Function**: Catches and suppresses Chrome extension errors that don't affect app functionality
- **Benefit**: Prevents console spam while maintaining app stability

### 2. Privy Configuration

- **Location**: `app/providers.tsx`
- **Changes**:
  - Limited external wallet connectors
  - Prioritized embedded wallets
  - Configured smart wallet options
- **Benefit**: Reduces extension conflicts by limiting wallet interactions

### 3. Smart Error Handling

- **Location**: `lib/extension-error-handler.ts`
- **Features**:
  - Intelligent error pattern detection
  - Rate-limited logging to prevent spam
  - Statistics tracking for debugging

## User Impact

- **Functionality**: ✅ No impact on core app features
- **Performance**: ✅ No performance degradation
- **User Experience**: ✅ Errors are hidden from users
- **Development**: ✅ Errors are logged for debugging

## Debugging

To check suppressed extension errors in development:

```javascript
// In browser console
import { ExtensionErrorHandler } from "@/lib/extension-error-handler";
console.log(ExtensionErrorHandler.getStats());
```

## Alternative Solutions

If issues persist, consider:

1. **Disable External Wallets**: Use only Privy embedded wallets
2. **Update Privy Config**: Adjust `loginMethods` to prioritize email
3. **Browser Testing**: Test in incognito mode to isolate extension conflicts
4. **Extension Management**: Advise users to disable conflicting wallet extensions

## Related Files

- `app/providers.tsx` - Privy configuration
- `app/layout.tsx` - Global error handling
- `lib/extension-error-handler.ts` - Extension error utilities
- `components/privy-connect-button.tsx` - Wallet connection UI
