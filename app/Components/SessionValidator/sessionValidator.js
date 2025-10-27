'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function SessionValidator() {
  const router = useRouter();
  const checkIntervalRef = useRef(null);
  const hasShownAlertRef = useRef(false);
  const isLoggingOutRef = useRef(false);
  const checkCountRef = useRef(0); // Track number of checks performed

  useEffect(() => {
    const userId = sessionStorage.getItem('user_id');
    const baseURL = sessionStorage.getItem('baseURL');

    if (!userId || !baseURL) {
      // Not logged in, don't check
      return;
    }
    
    // 🔧 TEMPORARILY DISABLED FOR DEBUGGING
    console.warn('⚠️ SESSION VALIDATOR TEMPORARILY DISABLED');
    console.warn('💡 You can work without interruption while we fix token storage');
    console.warn('🔧 Debugging: Token not being stored in database');
    return; // Exit early - disables all session checking
    
    // Always enable session validation
    // Use a long startup delay to handle both fresh logins and page refreshes safely
    console.log('✅ Session Validator Active - Checking session every 5 seconds');
    console.log('⏱️ Startup delay: 20 seconds (prevents false logout on page load/refresh)');

    // Set global flag that can be checked by logout functions
    if (typeof window !== 'undefined') {
      window.isSessionValidatorActive = true;
      window.preventSessionAlert = function() {
        isLoggingOutRef.current = true;
      };
    }

    // Store the login timestamp when this session started (only if not already set)
    // This prevents resetting the timestamp on page refresh
    let sessionStartTime = sessionStorage.getItem('sessionStartTime');
    if (!sessionStartTime) {
      sessionStartTime = Date.now().toString();
      sessionStorage.setItem('sessionStartTime', sessionStartTime);
    }

    // Function to check if session is still valid
    const checkSessionValidity = async () => {
      try {
        checkCountRef.current += 1;
        const sessionToken = sessionStorage.getItem('session_token');
        const currentUserId = sessionStorage.getItem('user_id');
        
        // If no session token, it might be an old session or database not updated
        // Don't logout - just log warning and skip check
        if (!sessionToken) {
          console.warn('⚠️ No session token found. Session validation skipped.');
          console.warn('💡 Tip: Make sure database has session_token column.');
          return; // Skip validation if no token
        }
        
        // If user ID changed (shouldn't happen but be safe)
        if (currentUserId !== userId) {
          console.warn('⚠️ User ID mismatch - skipping check');
          return;
        }
        
        console.log(`🔍 Session check #${checkCountRef.current} - Token: ${sessionToken.substring(0, 10)}...`);
        
        const url = baseURL + 'session-check.php';
        const response = await axios.get(url, {
          params: {
            json: JSON.stringify({
              userID: userId,
              sessionToken: sessionToken
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
            console.log('🔴 Reason details:', response.data.message);
            
            // Be lenient for the first 3 checks (could be session still establishing)
            if (checkCountRef.current <= 3) {
              console.warn(`⚠️ Check #${checkCountRef.current} - Session appears invalid but within grace period. Skipping termination.`);
              console.warn('💡 Reason:', response.data.reason);
              console.warn('💡 Message:', response.data.message);
              return; // Don't terminate during first 3 checks
            }
            
            // Don't show alert if user is logging out themselves
            if (isLoggingOutRef.current) {
              console.log('✓ Self-initiated logout, skipping alert');
              return;
            }
            
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
            console.log(`✅ Session check #${checkCountRef.current} passed - Token is valid`);
          }
        } else {
          console.warn('⚠️ Unexpected session check response:', response);
        }
      } catch (error) {
        console.error('❌ Session check error:', error.message);
        // Don't logout on error - could be network issue, API problem, or page refresh
        // User can continue using the system
        // This is especially important during page refreshes
      }
    };

    // Wait 20 seconds before starting checks
    // This long delay ensures session is stable for both fresh logins AND page refreshes
    const startupDelay = setTimeout(() => {
      console.log('🔍 Starting session validation checks...');
      
      // Verify we have a token before starting checks
      const initialToken = sessionStorage.getItem('session_token');
      if (!initialToken) {
        console.warn('⚠️ No session token found at startup. Checks will be skipped.');
        return; // Don't start checking if no token
      } else {
        console.log('✅ Session token verified at startup:', initialToken.substring(0, 10) + '...');
      }
      
      // Check session validity every 5 seconds (fast detection of terminated sessions)
      console.log('⏱️ Check interval: 5 seconds');
      checkIntervalRef.current = setInterval(checkSessionValidity, 5000);
      
      // Initial check (after delay)
      checkSessionValidity();
    }, 20000); // Wait 20 seconds - long enough for page refresh to complete

    // Cleanup
    return () => {
      if (startupDelay) {
        clearTimeout(startupDelay);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      // Clean up global flag
      if (typeof window !== 'undefined') {
        window.isSessionValidatorActive = false;
        delete window.preventSessionAlert;
      }
    };
  }, [router]);

  return null; // This component doesn't render anything
}

