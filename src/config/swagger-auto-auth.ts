/**
 * Swagger Auto-Authorization Script
 * Automatically captures JWT tokens from cookies after login/exchange
 */

export const swaggerAutoAuthScript = `
  // Auto-authorization interceptor for cookie-based auth
  window.addEventListener('load', function() {
    setTimeout(function() {
      // Function to get cookie value by name
      function getCookie(name) {
        const value = '; ' + document.cookie;
        const parts = value.split('; ' + name + '=');
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      }
      
      // Function to apply authorization
      function applyAuth(token) {
        const ui = window.ui;
        if (ui && token) {
          ui.authActions.authorize({
            'access-token': {
              name: 'access-token',
              schema: {
                type: 'http',
                scheme: 'bearer'
              },
              value: token
            }
          });
          
          // Show success toast
          const toast = document.createElement('div');
          toast.innerHTML = '✅ Auto-authorized';
          toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#4caf50;color:white;padding:15px 20px;border-radius:5px;z-index:9999;box-shadow:0 2px 5px rgba(0,0,0,0.2);font-family:sans-serif;';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        }
      }
      
      // Function to check and apply auth from cookies
      function checkAndApplyAuth() {
        const accessToken = getCookie('access_token');
        if (accessToken) {
          applyAuth(accessToken);
        }
      }
      
      // Check on page load (if already logged in)
      checkAndApplyAuth();
      
      // Store original fetch
      const originalFetch = window.fetch;
      
      // Override fetch to intercept responses
      window.fetch = function(...args) {
        return originalFetch.apply(this, args)
          .then(async (response) => {
            const url = args[0];
            
            // Check if this is a login/exchange/refresh endpoint
            if (typeof url === 'string' && (url.includes('/auth/login') || url.includes('/auth/exchange') || url.includes('/auth/refresh'))) {
              // Clone response to read body without consuming it
              const clonedResponse = response.clone();
              
              try {
                const data = await clonedResponse.json();
                
                // Try to get token from response body first
                if (data && data.accessToken) {
                  setTimeout(() => {
                    applyAuth(data.accessToken);
                  }, 100);
                } else {
                  // Fallback to cookie
                  setTimeout(() => {
                    checkAndApplyAuth();
                  }, 200);
                }
              } catch (error) {
                // Fallback to cookie
                setTimeout(() => {
                  checkAndApplyAuth();
                }, 200);
              }
            }
            
            // Check for logout
            if (typeof url === 'string' && url.includes('/auth/logout')) {
              setTimeout(() => {
                const ui = window.ui;
                if (ui) {
                  ui.authActions.logout(['access-token']);
                  
                  const toast = document.createElement('div');
                  toast.innerHTML = '🔓 Logged out - authorization cleared';
                  toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#ff9800;color:white;padding:15px 20px;border-radius:5px;z-index:9999;box-shadow:0 2px 5px rgba(0,0,0,0.2);font-family:sans-serif;';
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 3000);
                }
              }, 100);
            }
            
            return response;
          });
      };
    }, 1000);
  });
`;
