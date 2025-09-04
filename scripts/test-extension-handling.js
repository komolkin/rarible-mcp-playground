/**
 * Test script to verify Chrome extension error handling is working
 * Run this in the browser console to test error suppression
 */

console.log("🧪 Testing Chrome Extension Error Handling...\n");

// Test 1: Simulate chrome.runtime.sendMessage error
console.log("Test 1: Simulating chrome.runtime.sendMessage error...");
try {
  // This would normally throw an error
  const fakeError = new Error(
    "chrome.runtime.sendMessage() called from a webpage must specify an Extension ID (string) for its first argument."
  );
  fakeError.name = "TypeError";

  // Dispatch as a window error event
  window.dispatchEvent(
    new ErrorEvent("error", {
      error: fakeError,
      message: fakeError.message,
      filename: "chrome-extension://opfgelmcmbiajamepnmloijbpoleiama/inpage.js",
      lineno: 1012806,
      colno: 1,
    })
  );

  console.log(
    "✅ Error event dispatched - check for suppression warning above"
  );
} catch (e) {
  console.log("❌ Error dispatching test event:", e);
}

// Test 2: Check if ExtensionErrorHandler is loaded
console.log("\nTest 2: Checking ExtensionErrorHandler...");
try {
  if (typeof window.ExtensionErrorHandler !== "undefined") {
    console.log("✅ ExtensionErrorHandler is available");
    console.log("📊 Stats:", window.ExtensionErrorHandler.getStats());
  } else {
    console.log(
      "ℹ️ ExtensionErrorHandler not globally available (this is normal)"
    );
  }
} catch (e) {
  console.log("ℹ️ ExtensionErrorHandler check skipped:", e.message);
}

// Test 3: Simulate unhandled promise rejection
console.log("\nTest 3: Simulating unhandled promise rejection...");
try {
  const rejectionReason = {
    message:
      "Error in invocation of runtime.sendMessage: chrome.runtime.sendMessage() called from a webpage must specify an Extension ID",
    stack:
      "at chrome-extension://opfgelmcmbiajamepnmloijbpoleiama/inpage.js:1:1013562",
  };

  window.dispatchEvent(
    new PromiseRejectionEvent("unhandledrejection", {
      promise: Promise.reject(rejectionReason),
      reason: rejectionReason,
    })
  );

  console.log(
    "✅ Promise rejection event dispatched - check for suppression warning above"
  );
} catch (e) {
  console.log("❌ Error dispatching promise rejection:", e);
}

// Test 4: Check console.error override
console.log("\nTest 4: Testing console.error override...");
try {
  console.error(
    "chrome.runtime.sendMessage error from opfgelmcmbiajamepnmloijbpoleiama"
  );
  console.log(
    "✅ Console.error override test completed - check for suppression warning above"
  );
} catch (e) {
  console.log("❌ Console.error override test failed:", e);
}

// Test 5: Test normal console.error (should not be suppressed)
console.log("\nTest 5: Testing normal console.error (should appear)...");
console.error("This is a normal error that should NOT be suppressed");
console.log("✅ Normal error test completed - error above should be visible");

console.log("\n🎉 Extension error handling tests completed!");
console.log("📝 Expected results:");
console.log(
  "  - Extension-related errors should show as warnings with 🔧 prefix"
);
console.log("  - Normal errors should appear as usual");
console.log("  - Check the console above for suppression messages");

// Helper function to manually test error patterns
window.testExtensionErrorPattern = function (message) {
  console.log(`\n🧪 Testing pattern: "${message}"`);

  const patterns = [
    "chrome.runtime.sendMessage",
    "Extension ID",
    "chrome-extension://",
    "inpage.js",
    "opfgelmcmbiajamepnmloijbpoleiama",
    "runtime.sendMessage() called from a webpage",
    "must specify an Extension ID",
  ];

  const matches = patterns.filter((pattern) =>
    message.toLowerCase().includes(pattern.toLowerCase())
  );

  if (matches.length > 0) {
    console.log(`✅ Pattern matches: ${matches.join(", ")}`);
    console.log("🔧 This error would be suppressed");
  } else {
    console.log("❌ No pattern matches - error would NOT be suppressed");
  }
};

console.log(
  '\n💡 Use testExtensionErrorPattern("your error message") to test custom patterns'
);
