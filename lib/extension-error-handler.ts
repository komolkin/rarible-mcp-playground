/**
 * Utility to handle Chrome extension communication errors
 * These errors are typically caused by wallet extensions trying to communicate
 * with each other and don't affect the main application functionality.
 */

export interface ExtensionError {
  message: string;
  source?: string;
  extensionId?: string;
}

export class ExtensionErrorHandler {
  private static suppressedErrors: Set<string> = new Set();

  /**
   * Initialize global error handlers for Chrome extension errors
   */
  static initialize(): void {
    if (typeof window === "undefined") return;

    // Handle general errors
    window.addEventListener("error", this.handleError.bind(this));

    // Handle unhandled promise rejections
    window.addEventListener(
      "unhandledrejection",
      this.handleRejection.bind(this)
    );
  }

  /**
   * Handle general window errors
   */
  private static handleError(event: ErrorEvent): void {
    if (this.isChromeExtensionError(event.message)) {
      this.logSuppressedError({
        message: event.message,
        source: event.filename,
      });
      event.preventDefault();
    }
  }

  /**
   * Handle unhandled promise rejections
   */
  private static handleRejection(event: PromiseRejectionEvent): void {
    const reason = event.reason;
    if (
      reason &&
      reason.message &&
      this.isChromeExtensionError(reason.message)
    ) {
      this.logSuppressedError({
        message: reason.message,
        source: "Promise rejection",
      });
      event.preventDefault();
    }
  }

  /**
   * Check if an error is related to Chrome extension communication
   */
  private static isChromeExtensionError(message: string): boolean {
    const extensionErrorPatterns = [
      "chrome.runtime.sendMessage",
      "Extension ID",
      "chrome-extension://",
      "inpage.js",
      "content_script",
      "opfgelmcmbiajamepnmloijbpoleiama", // Specific problematic extension
      "runtime.sendMessage() called from a webpage",
      "must specify an Extension ID",
      "Error in invocation of runtime.sendMessage",
      // Common wallet extension errors
      "MetaMask",
      "Coinbase Wallet",
      "WalletConnect",
      "Web3",
      "ethereum.request",
      "injected provider",
    ];

    return extensionErrorPatterns.some((pattern) =>
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Log suppressed errors (but don't spam the console)
   */
  private static logSuppressedError(error: ExtensionError): void {
    const errorKey = `${error.message}-${error.source}`;

    if (!this.suppressedErrors.has(errorKey)) {
      console.warn(
        "🔧 Chrome extension communication error suppressed:",
        error.message,
        error.source ? `(from: ${error.source})` : ""
      );
      this.suppressedErrors.add(errorKey);

      // Clear the set periodically to avoid memory leaks
      if (this.suppressedErrors.size > 50) {
        this.suppressedErrors.clear();
      }
    }
  }

  /**
   * Get statistics about suppressed errors
   */
  static getStats(): { totalSuppressed: number } {
    return {
      totalSuppressed: this.suppressedErrors.size,
    };
  }
}

// Auto-initialize in browser environment
if (typeof window !== "undefined") {
  ExtensionErrorHandler.initialize();
}
