# Browser Extension Troubleshooting Guide

## 🔧 Extension Error: `chrome.runtime.sendMessage`

If you're seeing this error in your browser console:

```
TypeError: Error in invocation of runtime.sendMessage(optional string extensionId, any message, optional object options, optional function callback): chrome.runtime.sendMessage() called from a webpage must specify an Extension ID (string) for its first argument.
```

**Don't worry!** This error is **NOT caused by our application** and **does not affect functionality**.

## 🕵️ What's Happening?

- A browser extension (likely a crypto wallet like MetaMask, Coinbase Wallet, etc.) has a bug
- The extension is trying to communicate with other extensions incorrectly
- The extension ID `opfgelmcmbiajamepnmloijbpoleiama` is the problematic extension

## ✅ Solutions (In Order of Preference)

### 1. **Do Nothing** (Recommended)

- Our app automatically suppresses these errors
- Your app functionality is **completely unaffected**
- The errors are logged as warnings instead of errors

### 2. **Identify the Problematic Extension**

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Look for extension ID: `opfgelmcmbiajamepnmloijbpoleiama`
4. Note the extension name

### 3. **Update the Extension**

1. Check if the extension has updates available
2. Click "Update" if available
3. Restart your browser

### 4. **Disable the Extension Temporarily**

1. Toggle off the problematic extension
2. Refresh your app
3. Check if errors are gone
4. Re-enable if the extension is needed

### 5. **Use Incognito Mode**

1. Open an incognito/private browsing window
2. Extensions are usually disabled in incognito
3. Test if errors persist

## 🚫 What NOT to Do

- **Don't uninstall our app** - the error isn't from our code
- **Don't panic** - this is a cosmetic issue only
- **Don't disable all extensions** - only the problematic one if needed

## 🔍 Technical Details

This error occurs when:

1. Browser extensions inject scripts into web pages
2. These scripts try to communicate with other extensions
3. They fail to provide the required `extensionId` parameter
4. Chrome throws an error for improper API usage

## 🛡️ Our Protection

We've implemented multiple layers of error handling:

- **Global error suppression** in `app/layout.tsx`
- **Smart error detection** in `lib/extension-error-handler.ts`
- **Security headers** in `next.config.ts`
- **Pattern matching** for known extension errors

## 📞 Still Having Issues?

If you continue to see these errors after trying the solutions:

1. **Check our error suppression**: Look for "🔧 Extension error suppressed" in console
2. **Report the extension**: Contact the extension developer
3. **Use a different browser**: Try Firefox, Safari, or Edge
4. **Create a clean Chrome profile**: For testing without extensions

## 🎯 Common Problematic Extensions

- MetaMask
- Coinbase Wallet
- Trust Wallet
- Phantom Wallet
- Other crypto/Web3 extensions

## ✨ Remember

**This error does not affect:**

- ✅ App functionality
- ✅ Performance
- ✅ Security
- ✅ User experience
- ✅ Data integrity

It's purely a browser extension communication issue that we handle gracefully!
