'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function SessionValidator() {
  const router = useRouter();
  const checkIntervalRef = useRef(null);
  const hasShownAlertRef = useRef(false);

  useEffect(() => {
    const userId = sessionStorage.getItem('user_id');
    const baseURL = sessionStorage.getItem('baseURL');

    if (!userId || !baseURL) {
      // Not logged in, don't check
      return;
    }

    // Store the login timestamp when this session started
    const sessionStartTime = Date.now();
    sessionStorage.setItem('sessionStartTime', sessionStartTime.toString());

    // Function to check if session is still valid
    const checkSessionValidity = async () => {
      try {
        const url = baseURL + 'session-check.php';
        const response = await axios.get(url, {
          params: {
            json: JSON.stringify({
              userID: userId
            }),
            operation: 'checkSession'
          },
          timeout: 5000
        });

        // Check if we got a valid response
        if (response.status === 200 && response.data) {
          // Check if session is invalid (explicitly offline)
          if (response.data.valid === false) {
            console.log('🔴 Session invalidated:', response.data.reason);
            
            // Show alert only once
            if (!hasShownAlertRef.current) {
              hasShownAlertRef.current = true;
              
              // Dynamically import SweetAlert2
              import('sweetalert2').then((Swal) => {
                Swal.default.fire({
                  icon: 'warning',
                  title: 'Session Terminated',
                  html: `
                    <div style="text-align: center; padding: 10px;">
                      <p style="margin-bottom: 15px;">
                        <strong>Your session has been terminated.</strong>
                      </p>
                      <p style="margin-bottom: 15px;">
                        This account was logged in from another location.
                      </p>
                      <p style="color: #666;">
                        For security reasons, only one active session is allowed per account.
                      </p>
                    </div>
                  `,
                  confirmButtonText: 'Return to Login',
                  confirmButtonColor: '#dc3545',
                  allowOutsideClick: false,
                  allowEscapeKey: false
                }).then(() => {
                  // Clear session and redirect
                  sessionStorage.clear();
                  router.push('/');
                });
              });
            }
          } else if (response.data.valid === true) {
            // Even if status is 'Online', check if it's still OUR session
            // by comparing when we started vs when account was last updated
            const sessionStart = parseInt(sessionStorage.getItem('sessionStartTime') || '0');
            
            // If account is online but we haven't seen any activity yet,
            // it might be a new session. Check by making a test API call
            // (The backend will reject invalid sessions on actual API calls)
            
            console.log('✅ Session check passed');
          }
        } else {
          console.warn('⚠️ Unexpected session check response:', response);
        }
      } catch (error) {
        console.error('❌ Session check error:', error.message);
        // Don't logout on error - could be network issue or API problem
        // User can continue using the system
      }
    };

    // Wait 3 seconds before starting checks (to avoid checking immediately after login)
    const startupDelay = setTimeout(() => {
      // Check session validity every 3 seconds (faster detection)
      checkIntervalRef.current = setInterval(checkSessionValidity, 3000);
      
      // Initial check (after delay)
      checkSessionValidity();
    }, 3000); // Wait 3 seconds after page load

    // Cleanup
    return () => {
      if (startupDelay) {
        clearTimeout(startupDelay);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [router]);

  return null; // This component doesn't render anything
}

