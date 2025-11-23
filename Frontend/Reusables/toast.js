// ============================================
// toast.js - Enhanced Toast Notification Utility
// ============================================

/**
 * Display a toast notification with custom styling
 * @param {string} toastType - Type: 'success', 'info', 'warning', 'error'
 * @param {string} toastMessage - Message to display
 * @param {Object} options - Optional configuration overrides
 */
export const displayToast = (toastType, toastMessage, options = {}) => {
  // Validate inputs
  const validTypes = ["success", "info", "warning", "error"];
  if (!validTypes.includes(toastType)) {
    console.error(`❌ Invalid toast type: "${toastType}". Valid types: ${validTypes.join(", ")}`);
    return;
  }

  if (!toastMessage || typeof toastMessage !== 'string') {
    console.error('❌ Toast message must be a non-empty string');
    return;
  }

  // Clear existing toasts for mobile clarity
  toastr.clear();

  // Mobile-optimized configuration with theme colors
  const defaultConfig = {
    closeButton: false,
    progressBar: false,
    preventDuplicates: true,
    newestOnTop: false,
    positionClass: "toast-top-right",
    timeOut: 3000,
    extendedTimeOut: 1500,
    showDuration: 300,
    hideDuration: 400,
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "slideDown",
    hideMethod: "fadeOut",
    tapToDismiss: false,
    rtl: false
  };

  // Merge with custom options
  toastr.options = { ...defaultConfig, ...options };

  // Custom styling for theme integration
  const styleId = 'toast-custom-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Toast Container Positioning */
      #toast-container {
        position: fixed !important;
        z-index: 9999 !important;
      }

      .toast-bottom-right {
        right: 12px !important;
        bottom: 12px !important;
      }

      /* Alice Blue, Light Yellow, Orange Theme */
      #toast-container > div {
        border-radius: 14px !important;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15) !important;
        padding: 16px 22px !important;
        font-weight: 600 !important;
        font-size: 0.9rem !important;
        max-width: 90vw !important;
        min-width: 280px !important;
        margin-bottom: 10px !important;
        backdrop-filter: none !important;
        opacity: 1 !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
      }

      /* Success - Solid Green */
      #toast-container > .toast-success {
        background: #4caf50 !important;
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%) !important;
        border-left: 5px solid #2e7d32 !important;
        color: white !important;
      }

      /* Info - Solid Blue */
      #toast-container > .toast-info {
        background: #2196F3 !important;
        background: linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%) !important;
        border-left: 5px solid #0d47a1 !important;
        color: white !important;
      }

      /* Warning - Solid Orange */
      #toast-container > .toast-warning {
        background: #FF8C42 !important;
        background: linear-gradient(135deg, #FF8C42 0%, #FF6B1A 100%) !important;
        border-left: 5px solid #e55100 !important;
        color: white !important;
      }

      /* Error - Solid Red */
      #toast-container > .toast-error {
        background: #f44336 !important;
        background: linear-gradient(135deg, #ef5350 0%, #e53935 100%) !important;
        border-left: 5px solid #b71c1c !important;
        color: white !important;
      }

      /* Ensure text is always white and visible */
      #toast-container > div .toast-message {
        color: white !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
      }

      #toast-container > div .toast-title {
        color: white !important;
        font-weight: 700 !important;
      }

      /* Progress bar styling */
      #toast-container > div .toast-progress {
        height: 5px !important;
        opacity: 0.9 !important;
        border-radius: 0 0 12px 12px !important;
        background-color: rgba(255, 255, 255, 0.4) !important;
      }

      /* Close button */
      #toast-container > div .toast-close-button {
        font-weight: bold !important;
        font-size: 1.3rem !important;
        opacity: 0.9 !important;
        text-shadow: none !important;
        color: white !important;
        right: 8px !important;
        top: 8px !important;
      }

      #toast-container > div .toast-close-button:hover {
        opacity: 1 !important;
        transform: scale(1.1) !important;
      }

      /* Mobile optimization */
      @media (max-width: 576px) {
        .toast-bottom-right {
          right: 8px !important;
          bottom: 8px !important;
          left: 8px !important;
        }

        #toast-container > div {
          font-size: 0.85rem !important;
          padding: 14px 18px !important;
          min-width: unset !important;
          width: calc(100vw - 16px) !important;
        }
      }

      /* Slide Up Animation (Entry) */
      .toast {
        animation: slideUpIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
      }

      @keyframes slideUpIn {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      /* Slide Up Animation (Exit) */
      .toast-closing {
        animation: slideUpOut 0.3s ease-in !important;
      }

      @keyframes slideUpOut {
        from {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        to {
          transform: translateY(-20px) scale(0.95);
          opacity: 0;
        }
      }

      /* Hover effect */
      #toast-container > div:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2) !important;
        transform: translateY(-2px) !important;
        transition: all 0.2s ease !important;
      }
    `;
    document.head.appendChild(style);
  }

  const iconizedMessage = `${toastMessage}`;

  // Display the toast
  toastr[toastType](iconizedMessage);
};

/**
 * Quick toast presets for common scenarios
 */
export const toast = {
  success: (message) => displayToast('success', message),
  error: (message) => displayToast('error', message),
  info: (message) => displayToast('info', message),
  warning: (message) => displayToast('warning', message),
  
  // Extended duration for important messages
  persist: (type, message) => displayToast(type, message, { 
    timeOut: 0, 
    extendedTimeOut: 0,
  }),
  
  // Quick notification (1 second)
  quick: (type, message) => displayToast(type, message, { 
    timeOut: 1000, 
    progressBar: false 
  })
};

// Usage examples:
// displayToast('success', 'Task saved successfully!');
// toast.success('Task saved!');
// toast.quick('info', 'Loading...');
// toast.persist('warning', 'Important: Review this task');