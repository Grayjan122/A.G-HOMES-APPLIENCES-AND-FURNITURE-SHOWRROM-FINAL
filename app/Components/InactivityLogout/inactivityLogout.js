'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default function InactivityLogout() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Inactivity timeout: 1 hour (3600000 ms)
  const INACTIVITY_TIMEOUT = 3600000; // 1 hour
  // Warning before logout: 1 minute (60000 ms)
  const WARNING_TIME = 60000; // 1 minute
  // Show warning at: 59 minutes
  const TIME_BEFORE_WARNING = INACTIVITY_TIMEOUT - WARNING_TIME;

  // Function to call backend to set user offline
  const setUserOffline = async () => {
    const userId = sessionStorage.getItem('user_id');
    const baseURL = sessionStorage.getItem('baseURL');
    
    if (!userId || !baseURL) return;

    try {
      const url = baseURL + 'login.php';
      await axios.get(url, {
        params: {
          json: JSON.stringify({
            userID: userId,
            state: 'Offline'
          }),
          operation: 'actStatus'
        }
      });
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  };

  // Function to log activity
  const logActivity = async (activity) => {
    const userId = sessionStorage.getItem('user_id');
    const baseURL = sessionStorage.getItem('baseURL');
    
    if (!userId || !baseURL) return;

    try {
      const url = baseURL + 'audit-log.php';
      await axios.get(url, {
        params: {
          json: JSON.stringify({
            accID: userId,
            activity: activity
          }),
          operation: 'Logs'
        }
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Function to handle logout
  const handleLogout = async (reason = 'Manual Logout') => {
    await logActivity(reason);
    await setUserOffline();
    
    // Clear all timers
    clearTimeout(inactivityTimerRef.current);
    clearTimeout(warningTimerRef.current);
    clearInterval(countdownIntervalRef.current);
    
    // Clear session
    sessionStorage.clear();
    
    // Redirect to login
    router.push('/');
  };

  // Function to reset inactivity timer
  const resetInactivityTimer = () => {
    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Hide warning if showing
    setShowWarning(false);
    setCountdown(60);

    // Set warning timer (59 minutes)
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);

      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            handleLogout('Auto Logout - Inactivity Timeout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, TIME_BEFORE_WARNING);

    // Set final logout timer (60 minutes)
    inactivityTimerRef.current = setTimeout(() => {
      handleLogout('Auto Logout - Inactivity Timeout');
    }, INACTIVITY_TIMEOUT);
  };

  // Handle "Stay Logged In" button
  const handleStayLoggedIn = () => {
    setShowWarning(false);
    resetInactivityTimer();
  };

  // Track user activity
  useEffect(() => {
    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Throttle activity tracking to avoid too many resets
    let throttleTimeout;
    const throttledResetTimer = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          resetInactivityTimer();
          throttleTimeout = null;
        }, 1000); // Throttle to 1 second
      }
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, throttledResetTimer);
    });

    // Initialize timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledResetTimer);
      });
      clearTimeout(inactivityTimerRef.current);
      clearTimeout(warningTimerRef.current);
      clearInterval(countdownIntervalRef.current);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, []);

  // Handle browser/tab close ONLY (not navigation)
  useEffect(() => {
    const userId = sessionStorage.getItem('user_id');
    const baseURL = sessionStorage.getItem('baseURL');

    if (!userId || !baseURL) {
      // Don't attach event listeners if not logged in
      return;
    }

    // Use sendBeacon for reliable logout on page close
    const sendLogoutBeacon = () => {
      const currentUserId = sessionStorage.getItem('user_id');
      const currentBaseURL = sessionStorage.getItem('baseURL');
      
      if (!currentUserId || !currentBaseURL) return;

      try {
        const url = currentBaseURL + 'login.php';
        
        // Create FormData for POST request
        const formData = new FormData();
        formData.append('operation', 'actStatus');
        formData.append('json', JSON.stringify({
          userID: currentUserId,
          state: 'Offline'
        }));
        
        // sendBeacon sends POST with FormData
        navigator.sendBeacon(url, formData);
        console.log('🚀 Tab closing - User will be set offline');
      } catch (error) {
        console.error('Error sending logout beacon:', error);
      }
    };

    // Use pagehide event - fires ONLY when tab/window is actually closed
    // Does NOT fire during normal Next.js navigation
    const handlePageHide = (e) => {
      // e.persisted is true if the page is going into bfcache (back/forward cache)
      // We only logout if NOT going to cache (actual close)
      if (!e.persisted) {
        sendLogoutBeacon();
      }
    };

    // Handle back button navigation
    const handlePopState = () => {
      // User clicked back button - log them out
      sendLogoutBeacon();
      sessionStorage.clear();
      // The browser will navigate back automatically
    };

    // Handle visibility change for tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, record the time
        sessionStorage.setItem('tabHiddenTime', Date.now().toString());
      } else {
        // Tab is visible again, check how long it was hidden
        const hiddenTime = sessionStorage.getItem('tabHiddenTime');
        if (hiddenTime) {
          const timeHidden = Date.now() - parseInt(hiddenTime);
          // If hidden for more than 1 hour, logout
          if (timeHidden > INACTIVITY_TIMEOUT) {
            handleLogout('Auto Logout - Browser Inactive');
          }
          sessionStorage.removeItem('tabHiddenTime');
        }
      }
    };

    // Add event listeners with a small delay to avoid initial navigation issues
    const timeoutId = setTimeout(() => {
      window.addEventListener('pagehide', handlePageHide);
      window.addEventListener('popstate', handlePopState);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }, 1000); // Wait 1 second after mount before attaching listeners

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <Modal
        show={showWarning}
        backdrop="static"
        keyboard={false}
        centered
        style={{ zIndex: 99999 }}
      >
        <Modal.Header style={{ backgroundColor: '#ff9800', color: 'white' }}>
          <Modal.Title>⚠️ Inactivity Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h4 style={{ marginBottom: '20px' }}>
              You have been inactive for too long!
            </h4>
            <p style={{ fontSize: '16px', marginBottom: '15px' }}>
              You will be automatically logged out in:
            </p>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: countdown <= 10 ? '#dc3545' : '#ff9800',
                marginBottom: '20px'
              }}
            >
              {countdown}s
            </div>
            <p style={{ color: '#666' }}>
              Click "Stay Logged In" to continue your session, or you will be
              redirected to the login page.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ justifyContent: 'center' }}>
          <Button
            variant="success"
            size="lg"
            onClick={handleStayLoggedIn}
            style={{ minWidth: '200px', fontSize: '18px' }}
          >
            ✓ Stay Logged In
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={() => handleLogout('Manual Logout - From Warning')}
            style={{ minWidth: '200px', fontSize: '18px' }}
          >
            ✗ Logout Now
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

