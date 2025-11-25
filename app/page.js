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
import { AlertSucces } from './Components/SweetAlert/success';

export default function HomePage() {
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

  // Forgot Password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Enter email, 2: Enter code, 3: New password
  const [accountId, setAccountId] = useState(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const router = useRouter();

  // Base URL configuration - dynamically set based on environment
  const BASE_URL = typeof window !== 'undefined' 
    ? (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.'))
      ? `http://${window.location.hostname}/capstone-api/api/`
      : 'https://ag-home.site/backend/api/'
    : 'http://localhost/capstone-api/api/';
    

  // const BASE_URL = http://localhost/capstone-api/;
  //  const BASE_URL = 'http://192.168.137.180/capstone-api/api/';


  // Check if we're in the browser (client-side)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCooldown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendCooldown, canResend]);

  // Add debug log
  const addDebugLog = (message, data = null) => {
    if (typeof window === 'undefined') return; // Don't log on server
    
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

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('baseURL', BASE_URL);
      }
      return true;

    } catch (error) {
      addDebugLog('Connection test failed:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });

      // Set the URL anyway for further testing
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('baseURL', BASE_URL);
      }
      return false;
    }
  };

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const init = async () => {
      setIsMounted(true);
      sessionStorage.clear();
      await testConnection();
      generateRandomNumbers();
      
      // Focus input after a short delay to ensure DOM is ready
      setTimeout(() => {
        const input = document.getElementById('email');
        input?.focus();
      }, 100);
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

  const generateRandomNumbers = (e) => {
    // Add rotation animation only when button is clicked
    if (e && e.currentTarget && e.currentTarget.classList) {
      const button = e.currentTarget;
      button.classList.add('rotating');
      setTimeout(() => {
        if (button && button.classList) {
          button.classList.remove('rotating');
        }
      }, 500); // Match animation duration
    }
    
    setNum1(Math.floor(Math.random() * 49) + 1);
    setNum2(Math.floor(Math.random() * 8) + 1);
    setUserAnswer('');
    setError('');
    setSuccess('');
  };

  const Logs = async (accID, acct) => {
    const baseURL = (typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null) || BASE_URL;
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
    const baseURL = (typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null) || BASE_URL;
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

      // Check if successful
      if (response.status === 200) {
        console.log('✅ User status set to Online successfully');
        addDebugLog('✅ User status set to Online successfully');
      } else {
        console.error('❌ Failed to set user status to Online. Status:', response.status);
        addDebugLog('❌ Failed to set user status. Response:', response.data);
      }

      return response.data;

    } catch (error) {
      console.error('❌ Online state error:', error);
      addDebugLog('Online state error:', {
        message: error.message,
        response: error.response?.data
      });
      // Don't throw - allow login to continue even if status update fails
      return null;
    }
  };

  // Force login retry function (when user chooses to logout other session)
  const forceLoginRetry = async () => {
    addDebugLog('=== Force Login Retry Started ===');
    setIsLoading(true);

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('loginSuccess', 'true');
      }
      const baseURL = (typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null) || BASE_URL;
      const url = baseURL + 'login.php';
      const LogCredentials = {
        username: email.trim(),
        password: password,
        forceLogout: true  // ⭐ Force logout flag
      };

      addDebugLog('Attempting force login with:', {
        url: url,
        username: LogCredentials.username,
        forceLogout: true
      });

      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(LogCredentials),
          operation: "login"
        },
        timeout: 10000,
        validateStatus: (status) => status < 600
      });

      addDebugLog('Force login response:', {
        status: response.status,
        data: response.data
      });

      if (response.status === 200 && response.data && response.data.length > 0) {
        const userData = response.data[0];
        
        // Store user data
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('user_id', userData.account_id);
          sessionStorage.setItem('location_id', userData.location_id);
          sessionStorage.setItem('user_fname', userData.fname);
          sessionStorage.setItem('user_role', userData.role_name);
          sessionStorage.setItem('fullname', `${userData.fname} ${userData.mname || ''} ${userData.lname}`.trim());
          
          // ⭐ Store session token for session validation
          if (userData.session_token) {
            sessionStorage.setItem('session_token', userData.session_token);
            sessionStorage.setItem('freshLogin', 'true'); // Flag to indicate fresh login
            addDebugLog('✅ Session token stored:', userData.session_token.substring(0, 10) + '...');
          }

          if (userData.location_name) {
            sessionStorage.setItem('location_name', userData.location_name);
          }
        }

        // Log the activity
        try {
          await Logs(userData.account_id, 'Online');
        } catch (err) {
          console.warn('Failed to create audit log, but continuing login:', err);
        }

        // Route based on role
        const roleRoutes = {
          'Admin': '/adminPage',
          'Inventory Manager': '/inventoryPage',
          'Warehouse Representative': '/warehousePage',
          'Sales Clerk': '/salesClerkPage'
        };

        const route = roleRoutes[userData.role_name];
        if (route) {
          addDebugLog(`✅ Force login successful! Redirecting to ${route}`);
          router.push(route);
        } else {
          throw new Error(`Unknown role: ${userData.role_name}`);
        }
      } else {
        throw new Error('Force login failed');
      }
    } catch (error) {
      addDebugLog('❌ Force login error:', error);
      showAlertError({
        icon: "error",
        title: "Login Failed",
        text: 'Force login attempt failed. Please try again.',
        button: 'OK'
      });
      setIsLoading(false);
      generateRandomNumbers();
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

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('loginSuccess', 'true');
      }
      const baseURL = (typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null) || BASE_URL;
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
        addDebugLog('Response data type:', typeof response.data);
        addDebugLog('Response data:', response.data);

        // Check if response is an error object (account in use, deactivated, or suspended)
        // Backend can return error in two ways: as object or inside array
        const errorData = response.data?.error ? response.data : 
                         (Array.isArray(response.data) && response.data[0]?.error ? response.data[0] : null);
        
        if (errorData && errorData.error) {
          addDebugLog('❌ Login blocked:', errorData.error);
          
          // Handle "account in use" with force logout option
          if (errorData.error === 'account_in_use' && errorData.can_force_logout) {
            addDebugLog('Account in use - showing force logout option');
            
            // Import Swal dynamically
            import('sweetalert2').then((Swal) => {
              Swal.default.fire({
                icon: 'warning',
                title: 'Account Already In Use',
                html: `
                  <div style="text-align: left; padding: 10px;">
                    <p style="margin-bottom: 15px;">
                      <strong>🔒 Security Notice:</strong> This account is currently active in another session.
                    </p>
                    <p style="margin-bottom: 15px;">
                      For security reasons, only <strong>one active session</strong> is allowed per account.
                    </p>
                    <p style="margin-bottom: 15px;">
                      <strong>Options:</strong>
                    </p>
                    <ul style="text-align: left; margin-left: 20px;">
                      <li>Click <strong>"Force Logout"</strong> to terminate the other session and login here</li>
                      <li>Click <strong>"Cancel"</strong> to keep the other session active</li>
                    </ul>
                    <p style="margin-top: 15px; color: #666; font-size: 14px;">
                      <em>Note: If the other session is yours, it will be logged out automatically.</em>
                    </p>
                  </div>
                `,
                showCancelButton: true,
                confirmButtonText: '🔓 Force Logout & Login',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                reverseButtons: true,
                allowOutsideClick: false
              }).then((result) => {
                if (result.isConfirmed) {
                  addDebugLog('User chose to force logout - retrying login');
                  // Retry login with forceLogout flag
                  forceLoginRetry();
                } else {
                  addDebugLog('User cancelled force logout');
                  setIsLoading(false);
                  generateRandomNumbers();
                }
              });
            });
            return;
          }
          
          // Handle other errors (deactivated, suspended)
          let title = 'Login Failed';
          let icon = 'warning';
          
          if (errorData.error === 'account_deactivated') {
            title = 'Access Denied';
            icon = 'error';
          } else if (errorData.error === 'account_suspended') {
            title = 'Account Suspended';
            icon = 'warning';
          }
          
          showAlertError({
            icon: icon,
            title: title,
            text: errorData.message || 'Unable to login at this time.',
            button: 'OK'
          });
          setIsLoading(false);
          generateRandomNumbers();
          return;
        }

        if (response.data && response.data.length > 0) {
          const userData = response.data[0];
          addDebugLog('User data received:', {
            ...userData,
            password: undefined // Don't log password
          });

          // Note: Backend now handles "account already online" by forcing logout of previous session
          // So we don't need to check active_status here anymore
          
          // Check if account is deactivated or suspended
          if (userData.status === 'Deactive') {
            addDebugLog('❌ Account is deactivated');
            showAlertError({
              icon: "error",
              title: "Access Denied",
              text: 'This user no longer has access to the system. Please contact your administrator for more information.',
              button: 'OK'
            });
            setIsLoading(false);
            generateRandomNumbers();
            return;
          }
          
          if (userData.status === 'Suspended') {
            addDebugLog('❌ Account is suspended');
            showAlertError({
              icon: "warning",
              title: "Account Suspended",
              text: 'Your account has been temporarily suspended. Please contact your administrator for assistance.',
              button: 'OK'
            });
            setIsLoading(false);
            generateRandomNumbers();
            return;
          }

          // Store user data
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('user_id', userData.account_id);
            sessionStorage.setItem('location_id', userData.location_id);
            sessionStorage.setItem('user_fname', userData.fname);
            sessionStorage.setItem('user_role', userData.role_name);
            sessionStorage.setItem('fullname', `${userData.fname} ${userData.mname || ''} ${userData.lname}`.trim());
            
            // ⭐ Store session token for session validation
            if (userData.session_token) {
              sessionStorage.setItem('session_token', userData.session_token);
              sessionStorage.setItem('freshLogin', 'true'); // Flag to indicate fresh login
              addDebugLog('✅ Session token stored:', userData.session_token.substring(0, 10) + '...');
            }

            if (userData.location_name) {
              sessionStorage.setItem('location_name', userData.location_name);
            }
          }

          // Note: active_status is now updated automatically by the backend login function
          // No need to call OnlineState() here anymore
          
          // Log the activity (non-blocking - don't stop login if it fails)
          try {
            await Logs(userData.account_id, 'Online');
          } catch (err) {
            console.warn('Failed to create audit log, but continuing login:', err);
          }

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

  // Password validation function
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return minLength && hasUpperCase && hasNumber && hasSpecialChar;
  };

  const getPasswordStrength = (password) => {
    const checks = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    return checks;
  };

  // Forgot Password Functions
  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setResetStep(1);
    setForgotEmail('');
    setEnteredCode('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setResetStep(1);
    setForgotEmail('');
    setVerificationCode('');
    setEnteredCode('');
    setNewPassword('');
    setConfirmPassword('');
    setAccountId(null);
    setPasswordError('');
    setResendCooldown(0);
    setCanResend(true);
  };

  const sendVerificationCode = async () => {
    if (!forgotEmail.trim()) {
      showAlertError({
        icon: "error",
        title: "Email Required",
        text: 'Please enter your email address',
        button: 'OK'
      });
      return;
    }

    // Check if still in cooldown period
    if (!canResend) {
      showAlertError({
        icon: "warning",
        title: "Please Wait",
        text: `You can resend the code in ${resendCooldown} seconds`,
        button: 'OK'
      });
      return;
    }

    setIsSendingCode(true);

    try {
      const baseURL = (typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null) || BASE_URL;
      const url = baseURL + 'forgot-password.php';

      console.log('🔍 Checking email:', forgotEmail.trim());
      console.log('📡 API URL:', url);
      console.log('📦 Sending data:', { email: forgotEmail.trim() });

      const response = await axios.get(url, {
        params: {
          json: JSON.stringify({ email: forgotEmail.trim() }),
          operation: "checkEmail"
        },
        timeout: 15000
      });

      console.log('📥 Server response:', response.data);

      if (response.data && response.data.exists) {
        setAccountId(response.data.account_id);

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setVerificationCode(code);

        // Send email with code
        const emailResponse = await axios.get(url, {
          params: {
            json: JSON.stringify({
              email: forgotEmail.trim(),
              code: code,
              name: response.data.fname
            }),
            operation: "sendCode"
          },
          timeout: 15000
        });

        if (emailResponse.data.success) {
          setResetStep(2);
          
          // Start 30-second cooldown timer
          setCanResend(false);
          setResendCooldown(30);
          
          showAlertError({
            icon: "success",
            title: "Code Sent!",
            text: `A verification code has been sent to ${forgotEmail}`,
            button: 'OK'
          });
        } else {
          throw new Error('Failed to send email');
        }
      } else {
        // console.error('❌ Email not found. Response:', response.data);
        showAlertError({
          icon: "error",
          title: "Email Not Found",
          text: response.data?.error || 'This email address is not registered in our system',
          button: 'OK'
        });
      }
    } catch (error) {
      // console.error('❌ Error sending verification code:', error);
      // console.error('Error details:', error.response?.data);
      showAlertError({
        icon: "error",
        title: "Error",
        text: 'Failed to send verification code. Please try again.',
        button: 'OK'
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyCode = () => {
    if (enteredCode.trim() === verificationCode) {
      setResetStep(3);
    } else {
      showAlertError({
        icon: "error",
        title: "Invalid Code",
        text: 'The verification code you entered is incorrect',
        button: 'Try Again'
      });
    }
  };

  const resetPassword = async () => {
    setPasswordError('');

    // Validate password strength
    if (!validatePassword(newPassword)) {
      setPasswordError('Password must have 8+ characters, 1 uppercase, 1 number, and 1 special character.');
      showAlertError({
        icon: "error",
        title: "Weak Password",
        text: 'Password must have 8+ characters, 1 uppercase, 1 number, and 1 special character.',
        button: 'OK'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      showAlertError({
        icon: "error",
        title: "Passwords Don't Match",
        text: 'Please make sure both passwords match',
        button: 'OK'
      });
      return;
    }

    try {
      const baseURL = (typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null) || BASE_URL;
      const url = baseURL + 'forgot-password.php';

      const response = await axios.get(url, {
        params: {
          json: JSON.stringify({
            account_id: accountId,
            new_password: newPassword
          }),
          operation: "resetPassword"
        },
        timeout: 15000
      });

      let result = response.data;
      if (typeof result === 'string') {
        try {
          result = JSON.parse(result);
        } catch (parseError) {
          console.warn('Unable to parse reset password response string:', result);
          result = null;
        }
      } else if (result == null && response.request?.responseText) {
        try {
          result = JSON.parse(response.request.responseText);
        } catch (parseError) {
          console.warn('Unable to parse responseText for reset password:', response.request.responseText);
          result = null;
        }
      }

      console.log('Password reset response:', result);

      if ((result && result.success) || (!result && response.status === 200)) {
        AlertSucces(
          'Your password has been successfully reset. You can now login with your new password.',
          'success',
          true,
          'OK'
        );
        closeForgotPassword();
      } else {
        // Check for password history violation
        if (result && result.error_code === 'PASSWORD_HISTORY_VIOLATION') {
          setPasswordError(result.message || result.error);
          showAlertError({
            icon: "warning",
            title: "🔒 Password Previously Used",
            text: '⚠️ Security Policy ou cannot reuse any of your last 5 passwords.',
            button: 'Okay'
          });

        } else {
          // Other errors
          throw new Error(result?.error || 'Failed to reset password');
        }
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to reset password. Please try again.';
      showAlertError({
        icon: "error",
        title: "Error",
        text: errorMessage,
        button: 'OK'
      });
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

  // Prevent hydration mismatch by only rendering after mount
  if (!isMounted) {
    return (
      <div className='main_div' style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: '#fff', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

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
          <div className='pic-slog' style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            padding: '10px'
          }}>
            <Image 
              src={'/assets/images/AG.png'} 
              width={90} 
              height={90} 
              alt='logo' 
              className='logo' 
              style={{
                width: 'clamp(60px, 15vw, 90px)',
                height: 'clamp(60px, 15vw, 90px)',
                objectFit: 'contain'
              }}
            />
            <h1 style={{ 
              color: 'white', 
              textAlign: 'center', 
              margin: 0,
              fontSize: 'clamp(16px, 4vw, 28px)',
              lineHeight: '1.3',
              fontWeight: '600',
              padding: '0 10px',
              wordWrap: 'break-word'
            }}>
              A.G Home Appliance <br />
              & Furniture Showroom
            </h1>
          </div>

          <form onSubmit={login} className='log-in-form'>
            <h2 className='Log-1'>Sign in to start your session</h2>

            <div className='form-group'>
              <label className='label'>
                Username
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

            <div className='form-group'>
              <label className='label'>
                Password
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

            <div className='form-group'>
              <label className='label'>Verification</label>
              <div className='athen'>
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

            {/* Forgot Password Link */}
            <div style={{
              marginTop: '15px',
              textAlign: 'center'
            }}>
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                disabled={isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  textDecoration: 'underline',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: isLoading ? 0.5 : 1
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Shop Link */}
            {/* <div style={{
              marginTop: '10px',
              textAlign: 'center'
            }}>
              <button
                type="button"
                onClick={() => router.push('/shop')}
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: isLoading ? 0.5 : 1,
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                🛒 Visit Our Shop
              </button>
            </div> */}
          </form>
        </div>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
      </div>

      {/* Forgot Password Modal */}
      <Modal
        show={showForgotPassword}
        onHide={closeForgotPassword}
        centered
        backdrop="static"
        className="forgot-password-modal"
        style={{
          '--bs-modal-width': '90%',
          '--bs-modal-max-width': '500px'
        }}
      >
        <Modal.Header closeButton style={{
          padding: '15px 20px',
          borderBottom: '2px solid #667eea',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <Modal.Title style={{
            fontSize: 'clamp(18px, 5vw, 24px)',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {resetStep === 1 && <><span>🔐</span> Verify Email</>}
            {resetStep === 2 && <><span>📧</span> Enter Verification Code</>}
            {resetStep === 3 && <><span>🔑</span> Reset Password</>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{
          padding: '20px',
          maxHeight: '70vh',
          overflowY: 'auto'
        }}>
          {/* Progress Indicator */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '30px',
            position: 'relative'
          }}>
            <div style={{ 
              width: '100%', 
              height: '3px', 
              background: '#e9ecef', 
              position: 'absolute',
              top: '15px',
              left: 0,
              zIndex: 0
            }}></div>
            <div style={{ 
              width: resetStep === 1 ? '0%' : resetStep === 2 ? '50%' : '100%',
              height: '3px', 
              background: 'linear-gradient(90deg, #667eea, #764ba2)', 
              position: 'absolute',
              top: '15px',
              left: 0,
              zIndex: 1,
              transition: 'width 0.3s ease'
            }}></div>
            {[1, 2, 3].map((step) => (
              <div key={step} style={{ 
                width: '35px', 
                height: '35px', 
                borderRadius: '50%',
                background: resetStep >= step ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e9ecef',
                color: resetStep >= step ? 'white' : '#6c757d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                zIndex: 2,
                position: 'relative',
                transition: 'all 0.3s ease',
                boxShadow: resetStep >= step ? '0 2px 8px rgba(102, 126, 234, 0.3)' : 'none'
              }}>
                {step}
              </div>
            ))}
          </div>

          {/* Password Error Alert */}
          {passwordError && (
            <Alert variant="danger" style={{
              fontSize: 'clamp(12px, 3vw, 13px)',
              padding: '10px',
              marginBottom: '15px',
              borderRadius: '8px'
            }}>
              {passwordError}
            </Alert>
          )}

          {/* Step 1: Enter Email */}
          {resetStep === 1 && (
            <div>
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#f0f4ff', 
                borderRadius: '10px',
                marginBottom: '20px',
                borderLeft: '4px solid #667eea'
              }}>
                <p style={{ 
                  margin: 0, 
                  color: '#495057', 
                  fontSize: 'clamp(13px, 3.5vw, 14px)' 
                }}>
                  <strong>📧 Email Verification Required</strong><br/>
                  <span style={{ fontSize: 'clamp(12px, 3vw, 13px)' }}>
                    We'll send a 6-digit verification code to your email address
                  </span>
                </p>
              </div>
              <Form.Group>
                <Form.Label style={{
                  fontSize: 'clamp(13px, 3.5vw, 15px)',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  📧 Email Address
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={isSendingCode}
                  style={{
                    fontSize: 'clamp(13px, 3.5vw, 15px)',
                    padding: '10px 12px',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
              </Form.Group>
            </div>
          )}

          {/* Step 2: Enter Verification Code */}
          {resetStep === 2 && (
            <div>
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#e8f5e9', 
                borderRadius: '10px',
                marginBottom: '20px',
                borderLeft: '4px solid #4caf50',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: '#2e7d32', fontSize: 'clamp(13px, 3.5vw, 14px)' }}>
                  <strong>✉️ Code Sent!</strong><br/>
                  <span style={{ fontSize: 'clamp(12px, 3vw, 13px)' }}>
                    Check your inbox at <strong>{forgotEmail}</strong>
                  </span>
                </p>
              </div>
              <Form.Group>
                <Form.Label style={{
                  fontSize: 'clamp(13px, 3.5vw, 15px)',
                  fontWeight: '600',
                  marginBottom: '8px',
                  textAlign: 'center',
                  display: 'block'
                }}>
                  🔢 Enter Verification Code
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="• • • • • •"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                  maxLength={6}
                  style={{
                    fontSize: 'clamp(16px, 4vw, 18px)',
                    padding: '12px',
                    textAlign: 'center',
                    letterSpacing: '5px',
                    fontWeight: 'bold',
                    border: '2px solid #667eea',
                    borderRadius: '10px'
                  }}
                />
              </Form.Group>
              <div style={{
                marginTop: '15px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <small style={{ color: '#6c757d', fontSize: 'clamp(11px, 3vw, 12px)' }}>
                  Didn't receive the code?{' '}
                  <span
                    onClick={() => {
                      // Resend code to the same email without going back to step 1
                      if (canResend && !isSendingCode) {
                        setEnteredCode('');
                        sendVerificationCode();
                      }
                    }}
                    style={{
                      color: (!canResend || isSendingCode) ? '#999' : '#667eea',
                      cursor: (!canResend || isSendingCode) ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      textDecoration: 'underline',
                      opacity: (!canResend || isSendingCode) ? 0.5 : 1
                    }}
                  >
                    {isSendingCode ? '⏳ Sending...' : 
                     !canResend ? `⏱️ Wait ${resendCooldown}s` : 
                     '🔄 Resend Code'}
                  </span>
                </small>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: 'clamp(10px, 2.5vw, 11px)', 
                  color: '#999' 
                }}>
                  Code will be sent to: <strong style={{ color: '#667eea' }}>{forgotEmail}</strong>
                </div>
                {!canResend && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: 'clamp(10px, 2.5vw, 11px)',
                    color: '#ff9800',
                    fontWeight: '600'
                  }}>
                    ⏳ Please wait {resendCooldown} seconds before resending
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Enter New Password */}
          {resetStep === 3 && (
            <div>
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#e8f5e9', 
                borderRadius: '10px',
                marginBottom: '20px',
                borderLeft: '4px solid #4caf50',
                textAlign: 'center'
              }}>
                <p style={{ 
                  margin: 0, 
                  color: '#2e7d32', 
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  fontWeight: '600'
                }}>
                  ✅ Email Verified Successfully!<br/>
                  <span style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 'normal' }}>
                    Now create your new password
                  </span>
                </p>
              </div>

              <Form.Group style={{ marginBottom: '15px' }}>
                <Form.Label style={{
                  fontSize: 'clamp(13px, 3.5vw, 15px)',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  New Password
                </Form.Label>
                <div style={{ position: 'relative' }}>
                  <Form.Control
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError('');
                    }}
                    style={{
                      paddingRight: '45px',
                      fontSize: 'clamp(13px, 3.5vw, 15px)',
                      padding: '10px 45px 10px 12px',
                      borderColor: passwordError ? '#dc3545' : '#ced4da'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '5px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </Form.Group>

              {/* Password Requirements Checklist */}
              {newPassword && (
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  border: '1px solid #e9ecef'
                }}>
                  <p style={{
                    fontSize: 'clamp(11px, 3vw, 12px)',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#495057'
                  }}>
                    Password Requirements:
                  </p>
                  <div style={{ fontSize: 'clamp(11px, 2.8vw, 12px)' }}>
                    <div style={{
                      color: getPasswordStrength(newPassword).minLength ? '#28a745' : '#dc3545',
                      marginBottom: '4px'
                    }}>
                      {getPasswordStrength(newPassword).minLength ? '✓' : '✗'} At least 8 characters
                    </div>
                    <div style={{
                      color: getPasswordStrength(newPassword).hasUpperCase ? '#28a745' : '#dc3545',
                      marginBottom: '4px'
                    }}>
                      {getPasswordStrength(newPassword).hasUpperCase ? '✓' : '✗'} At least 1 uppercase letter
                    </div>
                    <div style={{
                      color: getPasswordStrength(newPassword).hasNumber ? '#28a745' : '#dc3545',
                      marginBottom: '4px'
                    }}>
                      {getPasswordStrength(newPassword).hasNumber ? '✓' : '✗'} At least 1 number
                    </div>
                    <div style={{
                      color: getPasswordStrength(newPassword).hasSpecialChar ? '#28a745' : '#dc3545'
                    }}>
                      {getPasswordStrength(newPassword).hasSpecialChar ? '✓' : '✗'} At least 1 special character (!@#$%^&*...)
                    </div>
                  </div>
                </div>
              )}

              <Form.Group>
                <Form.Label style={{
                  fontSize: 'clamp(13px, 3.5vw, 15px)',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Confirm Password
                </Form.Label>
                <div style={{ position: 'relative' }}>
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                    }}
                    style={{
                      paddingRight: '45px',
                      fontSize: 'clamp(13px, 3.5vw, 15px)',
                      padding: '10px 45px 10px 12px',
                      borderColor: passwordError ? '#dc3545' : '#ced4da'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '5px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{
          padding: '15px 20px',
          borderTop: '2px solid #e9ecef',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'flex-end'
        }}>
          {resetStep === 1 && (
            <>
              <Button
                variant="secondary"
                onClick={closeForgotPassword}
                style={{
                  fontSize: 'clamp(13px, 3.5vw, 15px)',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={sendVerificationCode}
                disabled={isSendingCode}
                style={{
                  background: isSendingCode ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontSize: 'clamp(13px, 3.5vw, 15px)',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  minWidth: '120px',
                  boxShadow: isSendingCode ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                  cursor: isSendingCode ? 'not-allowed' : 'pointer'
                }}
              >
                {isSendingCode ? '📤 Sending...' : '📧 Send Code'}
              </Button>
            </>
          )}
          {resetStep === 2 && (
            <>
              <Button
                variant="secondary"
                onClick={() => setResetStep(1)}
                style={{
                  fontSize: 'clamp(13px, 3.5vw, 15px)',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '600'
                }}
              >
                ← Back
              </Button>
              <Button
                onClick={verifyCode}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontSize: 'clamp(13px, 3.5vw, 15px)',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  minWidth: '120px',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
              >
                ✓ Verify Code
              </Button>
            </>
          )}
          {resetStep === 3 && (
            <>
              <Button
                variant="secondary"
                onClick={closeForgotPassword}
                style={{
                  fontSize: 'clamp(13px, 3.5vw, 15px)',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={resetPassword}
                style={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  border: 'none',
                  fontSize: 'clamp(13px, 3.5vw, 15px)',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  minWidth: '140px',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)'
                }}
              >
                🔑 Reset Password
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Debug Panel */}
      {showDebugPanel && <DebugPanel />}
    </>
  );
}
