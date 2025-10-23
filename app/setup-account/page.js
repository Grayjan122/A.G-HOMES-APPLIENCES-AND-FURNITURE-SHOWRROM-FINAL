'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import '../css/login.css';
import { showAlertError } from '../Components/SweetAlert/error';
import { AlertSucces } from '../Components/SweetAlert/success';

export default function SetupAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);


  const BASE_URL = 'https://ag-home.site/backend/api';
  // const BASE_URL = 'http://localhost/capstone-api/api/';

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setTokenValid(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (username.length >= 3) {
      checkUsername();
    } else {
      setUsernameAvailable(null);
    }
  }, [username]);

  useEffect(() => {
    if (password) {
      checkPasswordStrength(password);
    } else {
      setPasswordStrength({ score: 0, text: '', color: '' });
    }
  }, [password]);

  const checkUsername = async () => {
    if (username.length < 3) return;
    
    setCheckingUsername(true);
    try {
      const response = await axios.get(BASE_URL + 'users.php', {
        params: {
          json: JSON.stringify({ username }),
          operation: 'CheckUsername'
        }
      });
      setUsernameAvailable(response.data.available);
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const checkPasswordStrength = (pwd) => {
    let score = 0;
    
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    const strengths = [
      { score: 0, text: 'Very Weak', color: '#dc3545' },
      { score: 1, text: 'Weak', color: '#fd7e14' },
      { score: 2, text: 'Fair', color: '#ffc107' },
      { score: 3, text: 'Good', color: '#20c997' },
      { score: 4, text: 'Strong', color: '#28a745' },
      { score: 5, text: 'Very Strong', color: '#0d6efd' }
    ];

    setPasswordStrength(strengths[score]);
  };

  const validateForm = () => {
    if (username.length < 3) {
      showAlertError({
        icon: 'warning',
        title: 'Invalid Username',
        text: 'Username must be at least 3 characters long',
        button: 'OK'
      });
      return false;
    }

    if (!usernameAvailable) {
      showAlertError({
        icon: 'warning',
        title: 'Username Taken',
        text: 'This username is already in use. Please choose another.',
        button: 'OK'
      });
      return false;
    }

    if (password.length < 8) {
      showAlertError({
        icon: 'warning',
        title: 'Weak Password',
        text: 'Password must be at least 8 characters long',
        button: 'OK'
      });
      return false;
    }

    if (passwordStrength.score < 2) {
      showAlertError({
        icon: 'warning',
        title: 'Weak Password',
        text: 'Please use a stronger password. Include uppercase, lowercase, numbers, and special characters.',
        button: 'OK'
      });
      return false;
    }

    if (password !== confirmPassword) {
      showAlertError({
        icon: 'warning',
        title: 'Passwords Do Not Match',
        text: 'Please make sure both passwords match',
        button: 'OK'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const response = await axios.get(BASE_URL + 'users.php', {
        params: {
          json: JSON.stringify({
            token,
            username,
            password
          }),
          operation: 'CompleteSetup'
        }
      });

      if (response.data.success) {
        AlertSucces(
          'Account setup completed! You can now log in.',
          'success',
          true,
          'Go to Login'
        );
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        showAlertError({
          icon: 'error',
          title: 'Setup Failed',
          text: response.data.message || 'Failed to complete account setup',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred. Please try again.',
        button: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className='login-main' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px', maxWidth: '500px' }}>
          <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>Invalid Link</h2>
          <p>This account setup link is invalid or has expired.</p>
          <button onClick={() => router.push('/')} style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='login-main'>
      <div className='login-container' style={{ maxWidth: '500px' }}>
        <div className='login-header'>
          <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Complete Your Account Setup</h1>
          <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '30px' }}>
            Create your username and password to activate your account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Username *
            </label>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
              placeholder='Choose a username'
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
              disabled={isLoading}
            />
            {username.length >= 3 && (
              <div style={{ marginTop: '8px', fontSize: '13px' }}>
                {checkingUsername ? (
                  <span style={{ color: '#6c757d' }}>⏳ Checking...</span>
                ) : usernameAvailable === true ? (
                  <span style={{ color: '#28a745' }}>✓ Username available</span>
                ) : usernameAvailable === false ? (
                  <span style={{ color: '#dc3545' }}>✗ Username already taken</span>
                ) : null}
              </div>
            )}
            <small style={{ color: '#6c757d', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Minimum 3 characters, lowercase letters and numbers only
            </small>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Create a strong password'
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '45px',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                required
                disabled={isLoading}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{
                  height: '6px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    height: '100%',
                    backgroundColor: passwordStrength.color,
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
                <span style={{ fontSize: '13px', color: passwordStrength.color, fontWeight: '600' }}>
                  {passwordStrength.text}
                </span>
              </div>
            )}
            <small style={{ color: '#6c757d', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Minimum 8 characters. Use uppercase, lowercase, numbers, and special characters for a stronger password.
            </small>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Confirm Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Confirm your password'
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '45px',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                required
                disabled={isLoading}
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {confirmPassword && (
              <div style={{ marginTop: '8px', fontSize: '13px' }}>
                {password === confirmPassword ? (
                  <span style={{ color: '#28a745' }}>✓ Passwords match</span>
                ) : (
                  <span style={{ color: '#dc3545' }}>✗ Passwords do not match</span>
                )}
              </div>
            )}
          </div>

          <button
            type='submit'
            disabled={isLoading || !usernameAvailable || password !== confirmPassword}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Setting Up...' : 'Complete Setup'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a 
            href='/'
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}

