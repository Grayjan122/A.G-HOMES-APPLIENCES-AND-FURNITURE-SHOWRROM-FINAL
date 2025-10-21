'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import "./css/login.css";
import Image from 'next/image';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import { LogInSuccess } from './Components/SweetAlert/logIn';
import { showAlertError } from './Components/SweetAlert/error';

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [modalHeader, setModalHeader] = useState('');
  const [modalBody, setModalBody] = useState('');
  const [borderColor, setBorderColor] = useState('');

  const router = useRouter();

  // Base URL configuration
  const BASE_URL = 'https://ag-home.site/backend/';

  // Add debug log
  const addDebugLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      time: timestamp,
      message: message,
      data: data
    };
    setDebugInfo(prev => [...prev, logEntry]);
    console.log(`[${timestamp}] ${message}`, data || '');
  };

  // Test backend connection with detailed error reporting
  const testConnection = async () => {
    addDebugLog('Testing connection to backend...', BASE_URL);

    try {
      // First, try a simple GET request to see if the server responds
      const testUrl = BASE_URL;
      addDebugLog('Attempting basic connection test to:', testUrl);

      const response = await axios.get(testUrl, {
        timeout: 10000,
        validateStatus: function (status) {
          // Accept any status code to see what the server returns
          return status < 600;
        }
      });

      addDebugLog('Server responded with status:', response.status);
      addDebugLog('Response headers:', response.headers);

      if (response.data) {
        addDebugLog('Response data:', response.data);
      }

      sessionStorage.setItem('baseURL', BASE_URL);
      return true;

    } catch (error) {
      addDebugLog('Connection test failed:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });

      // Set the URL anyway for further testing
      sessionStorage.setItem('baseURL', BASE_URL);
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      sessionStorage.clear();
      await testConnection();
      const input = document.getElementById('email');
      input?.focus();
      generateRandomNumbers();
    };

    init();
  }, []);

  // Custom Eye Icons (keeping your existing icons)
  const EyeIcon = () => (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: '#666' }}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: '#666' }}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (userAnswer === '') {
      setBorderColor('0px solid #D9D9D9');
      return;
    }

    if (num1 + num2 == parseInt(userAnswer)) {
      setBorderColor('4px solid #0ceb35');
    } else {
      setBorderColor('4px solid #ed021a');
    }
  }, [userAnswer]);

  const generateRandomNumbers = () => {
    setNum1(Math.floor(Math.random() * 49) + 1);
    setNum2(Math.floor(Math.random() * 8) + 1);
    setUserAnswer('');
    setError('');
    setSuccess('');
  };

  const Logs = async (accID, acct) => {
    const baseURL = sessionStorage.getItem('baseURL') || BASE_URL;
    const url = baseURL + 'audit-log.php';

    const Details = {
      accID: accID,
      activity: acct
    };

    try {
      addDebugLog('Sending audit log:', { url, Details });

      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(Details),
          operation: "Logs"
        },
        timeout: 10000,
        validateStatus: (status) => status < 600
      });

      addDebugLog('Audit log response:', {
        status: response.status,
        data: response.data
      });

    } catch (error) {
      addDebugLog('Audit log error:', {
        message: error.message,
        response: error.response?.data
      });
    }
  };

  const OnlineState = async (accID) => {
    const baseURL = sessionStorage.getItem('baseURL') || BASE_URL;
    const url = baseURL + 'login.php';

    const Details = {
      userID: accID,
      state: 'Online'
    };

    try {
      addDebugLog('Updating online state:', { url, Details });

      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(Details),
          operation: "actStatus"
        },
        timeout: 10000,
        validateStatus: (status) => status < 600
      });

      addDebugLog('Online state response:', {
        status: response.status,
        data: response.data
      });

    } catch (error) {
      addDebugLog('Online state error:', {
        message: error.message,
        response: error.response?.data
      });
    }
  };

  const login = async (e) => {
    e.preventDefault();

    if (isLoading) return;
    setIsLoading(true);

    // Clear previous debug logs for this login attempt
    setDebugInfo([]);
    addDebugLog('=== Starting Login Process ===');

    try {
      // Verify captcha
      const correctAnswer = num1 + num2;
      addDebugLog('Captcha check:', {
        expected: correctAnswer,
        received: parseInt(userAnswer),
        valid: parseInt(userAnswer) === correctAnswer
      });

      if (parseInt(userAnswer) !== correctAnswer) {
        showAlertError({
          icon: "error",
          title: "Oops!",
          text: 'Please solve the authentication question correctly!',
          button: 'Try Again'
        });
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem('loginSuccess', 'true');
      const baseURL = sessionStorage.getItem('baseURL') || BASE_URL;
      const url = baseURL + 'login.php';
      const LogCredentials = {
        username: email.trim(),
        password: password
      };

      addDebugLog('Login attempt details:', {
        url: url,
        credentials: {
          username: email.trim(),
          password: '***' + password.slice(-2) // Show only last 2 chars for security
        },
        method: 'GET',
        params: {
          operation: "login"
        }
      });

      // Create axios instance with interceptors for debugging
      const axiosInstance = axios.create({
        timeout: 15000,
        validateStatus: function (status) {
          // Don't throw error for any status code so we can debug
          return status < 600;
        }
      });

      // Add request interceptor
      axiosInstance.interceptors.request.use(
        (config) => {
          addDebugLog('Request being sent:', {
            url: config.url,
            params: config.params,
            headers: config.headers
          });
          return config;
        },
        (error) => {
          addDebugLog('Request error:', error);
          return Promise.reject(error);
        }
      );

      // Add response interceptor
      axiosInstance.interceptors.response.use(
        (response) => {
          addDebugLog('Response received:', {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
          });
          return response;
        },
        (error) => {
          addDebugLog('Response error:', {
            message: error.message,
            code: error.code,
            response: error.response
          });
          return Promise.reject(error);
        }
      );

      const response = await axiosInstance.get(url, {
        params: {
          json: JSON.stringify(LogCredentials),
          operation: "login"
        }
      });

      // Check if we got a 500 error
      if (response.status === 500) {
        addDebugLog('❌ Server Error 500 - PHP script has an error');
        addDebugLog('Server response:', response.data);

        // Try to parse any error message from the server
        let errorDetails = 'Internal server error';
        if (typeof response.data === 'string') {
          // Check if it's a PHP error message
          if (response.data.includes('Fatal error') || response.data.includes('Warning') || response.data.includes('Parse error')) {
            errorDetails = 'PHP Error detected. Check server logs.';
            addDebugLog('PHP Error found in response:', response.data);
          }
        }

        showAlertError({
          icon: "error",
          title: "Server Error",
          text: `The server encountered an error (500). ${errorDetails}`,
          button: 'Try Again'
        });

        setIsLoading(false);
        return;
      }

      // Check for successful response
      if (response.status === 200) {
        addDebugLog('✅ Server responded with 200 OK');

        if (response.data && response.data.length > 0) {
          const userData = response.data[0];
          addDebugLog('User data received:', {
            ...userData,
            password: undefined // Don't log password
          });

          // Store user data
          sessionStorage.setItem('user_id', userData.account_id);
          sessionStorage.setItem('location_id', userData.location_id);
          sessionStorage.setItem('user_fname', userData.fname);
          sessionStorage.setItem('user_role', userData.role_name);
          sessionStorage.setItem('fullname', `${userData.fname} ${userData.mname || ''} ${userData.lname}`.trim());

          if (userData.location_name) {
            sessionStorage.setItem('location_name', userData.location_name);
          }

          // Update online status
          await OnlineState(userData.account_id);

          // Log the activity
          await Logs(userData.account_id, 'Online');

          // Route based on role
          const roleRoutes = {
            'Admin': '/adminPage',
            'Inventory Manager': '/inventoryPage',
            'Warehouse Representative': '/warehousePage',
            'Sales Clerk': '/salesClerkPage'
          };

          const route = roleRoutes[userData.role_name];
          if (route) {
            addDebugLog(`✅ Login successful! Redirecting to ${route}`);
            router.push(route);
          } else {
            throw new Error(`Unknown role: ${userData.role_name}`);
          }

        } else {
          addDebugLog('❌ No user data in response');
          showAlertError({
            icon: "error",
            title: "Account not found⚠️",
            text: 'User credentials are not found, please check your email and password!',
            button: 'Try Again'
          });
          generateRandomNumbers();
        }
      } else {
        addDebugLog(`⚠️ Unexpected status code: ${response.status}`);
      }

    } catch (error) {
      addDebugLog('❌ Login error caught:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });

      let errorMessage = 'An error occurred during login. Please check the debug panel for details.';

      if (error.response) {
        errorMessage = `Server error: ${error.response.status}. Check debug panel for details.`;
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      }

      showAlertError({
        icon: "error",
        title: "Login Failed",
        text: errorMessage,
        button: 'Try Again'
      });

      generateRandomNumbers();
    } finally {
      setIsLoading(false);
      addDebugLog('=== Login Process Completed ===');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading) {
      login(e);
    }
  };

  // Debug Panel Component
  const DebugPanel = () => (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      maxHeight: '300px',
      backgroundColor: '#1e1e1e',
      color: '#fff',
      border: '2px solid #333',
      borderRadius: '8px',
      padding: '15px',
      overflowY: 'auto',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        borderBottom: '1px solid #444',
        paddingBottom: '10px'
      }}>
        <h5 style={{ margin: 0, color: '#fff' }}>🐛 Debug Console</h5>
        <button
          onClick={() => setShowDebugPanel(false)}
          style={{
            background: '#ff4444',
            border: 'none',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
      <div>
        {debugInfo.map((log, index) => (
          <div key={index} style={{
            marginBottom: '8px',
            padding: '5px',
            backgroundColor: '#2a2a2a',
            borderRadius: '4px'
          }}>
            <span style={{ color: '#00ff00' }}>[{log.time}]</span>{' '}
            <span style={{ color: '#ffff00' }}>{log.message}</span>
            {log.data && (
              <pre style={{
                margin: '5px 0 0 0',
                color: '#00ffff',
                fontSize: '11px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {typeof log.data === 'object'
                  ? JSON.stringify(log.data, null, 2)
                  : log.data}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Modal show={show} onHide={handleClose} animation={true}>
        <Modal.Header closeButton>
          <Modal.Title>{modalHeader}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalBody}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <div className='main_div'>
        {/* Debug Toggle Button */}
        {/* <button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#ff6b6b',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 1000,
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          {showDebugPanel ? '🐛 Hide Debug' : '🐛 Show Debug'}
        </button> */}

        <div className='as'>
          <div className='pic-slog'>
            <Image src={'/assets/images/AG.png'} width={90} height={90} alt='logo' className='logo' />
            <h1>A.G Home Appliance <br />
              & Furniture Showroom</h1>
          </div>

          <form onSubmit={login} className='log-in-form'>
            <h2 className='Log-1'>Sign in to start your session</h2>

            <div>
              <label className='label'>
                Username:
              </label>
              <input
                placeholder='Enter username'
                className='log-input'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id='email'
                disabled={isLoading}
              />
            </div>

            <div style={{ marginTop: '10px' }}>
              <label className='label'>
                Password:
              </label>
              <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                <input
                  placeholder='Enter password'
                  className='log-input'
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete='current-password'
                  disabled={isLoading}
                  style={{
                    paddingRight: '45px',
                    width: '100%'
                  }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  style={{
                    position: 'absolute',
                    right: '5px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    zIndex: 2,
                    color: '#666',
                    opacity: isLoading ? 0.5 : 1
                  }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div style={{ marginTop: '10px' }} className='athen'>
              <label className='label-1'>{num1}</label>
              <label className='operator'>+</label>
              <label className='label-1'>{num2}</label>
              <label className='operator'>=</label>
              <input
                style={{ border: borderColor }}
                className="authen-input"
                type="number"
                required
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button
                type="button"
                className='operator-1'
                onClick={generateRandomNumbers}
                disabled={isLoading}
              >
                <Image src={'/assets/images/refresh.png'} width={60} height={55} alt="Refresh" />
              </button>
            </div>

            <button
              type="submit"
              className='sub-button'
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
      </div>

      {/* Debug Panel */}
      {showDebugPanel && <DebugPanel />}
    </>
  );
}