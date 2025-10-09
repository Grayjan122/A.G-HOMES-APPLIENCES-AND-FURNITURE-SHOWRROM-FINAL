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

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const input = document.getElementById('email');
    input?.focus();
    generateRandomNumbers();
  }, []);

  const [modalHeader, setModalHeader] = useState('');
  const [modalBody, setModalBody] = useState('');
  const [borderColor, setBorderColor] = useState('');

  const router = useRouter();

  // Custom Eye Icon SVG
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

  // Custom Eye Off Icon SVG
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

  useEffect(() => {
    generateRandomNumbers();
    sessionStorage.clear();
  }, []);

  const generateRandomNumbers = () => {
    setNum1(Math.floor(Math.random() * 49) + 1);
    setNum2(Math.floor(Math.random() * 8) + 1);
    setUserAnswer('');
    setError('');
    setSuccess('');
  };

  const Logs = async (accID, acct) => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'audit-log.php';

    const Details = {
      accID: accID,
      activity: acct
    }
    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(Details),
          operation: "Logs"
        }
      });
    } catch (error) {
      console.error("Error fetching inventory stock out:", error);
    }
    return;
  };

  const OnlineState = async (accID) => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'login.php';

    const Details = {
      userID: accID,
      state: 'Online'
    }
    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(Details),
          operation: "actStatus"
        }
      });
    } catch (error) {
      console.error("Error fetching inventory stock out:", error);
    }
    return;
  };

  const login = async (e) => {
    e.preventDefault();

    sessionStorage.setItem('loginSuccess', 'true');
    sessionStorage.setItem('baseURL', 'http://localhost/capstone-api/api/');
    // sessionStorage.setItem('baseURL', 'http://192.168.254.119//capstone-api/api/');


    const correctAnswer = num1 + num2;
    if (parseInt(userAnswer) !== correctAnswer) {
      // setModalHeader('Authentication Failed⚠️');
      // setModalBody('Please solve the authentication question correctly!');
      // setShow(true);
      showAlertError({
        icon: "error",
        title: "Opss!",
        text: 'Please solve the authentication question correctly!',
        button: 'Try Again'
      });

      return;
    }

    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'login.php';
    const LogCridentials = { username: email, password: password };

    var response = await axios.get(url, {
      params: { json: JSON.stringify(LogCridentials), operation: "login" }
    });

    if (response.data.length > 0) {
      console.log(response.data[0].active_status);

      if (response.data[0].role_name == 'Admin') {
        sessionStorage.setItem('user_id', response.data[0].account_id);
        sessionStorage.setItem('location_id', response.data[0].location_id);
        sessionStorage.setItem('user_fname', response.data[0].fname);
        sessionStorage.setItem('user_role', response.data[0].role_name);
        sessionStorage.setItem('fullname', response.data[0].fname + ' ' + response.data[0].mname + ' ' + response.data[0].lname);

        router.push('/adminPage');
        OnlineState(response.data[0].account_id);

      } else if (response.data[0].role_name == 'Inventory Manager') {
        sessionStorage.setItem('user_id', response.data[0].account_id);
        sessionStorage.setItem('location_id', response.data[0].location_id);
        sessionStorage.setItem('user_fname', response.data[0].fname);
        sessionStorage.setItem('user_role', response.data[0].role_name);
        sessionStorage.setItem('location_name', response.data[0].location_name);
        sessionStorage.setItem('fullname', response.data[0].fname + ' ' + response.data[0].mname + ' ' + response.data[0].lname);

        router.push('/inventoryPage');
        OnlineState(response.data[0].account_id);

      } else if (response.data[0].role_name == 'Warehouse Representative') {
        sessionStorage.setItem('user_id', response.data[0].account_id);
        sessionStorage.setItem('location_id', response.data[0].location_id);
        sessionStorage.setItem('user_fname', response.data[0].fname);
        sessionStorage.setItem('user_role', response.data[0].role_name);
        sessionStorage.setItem('location_name', response.data[0].location_name);
        sessionStorage.setItem('fullname', response.data[0].fname + ' ' + response.data[0].mname + ' ' + response.data[0].lname);


        router.push('/warehousePage');
        OnlineState(response.data[0].account_id);

      } else if (response.data[0].role_name == 'Sales Clerk') {
        sessionStorage.setItem('user_id', response.data[0].account_id);
        sessionStorage.setItem('location_id', response.data[0].location_id);
        sessionStorage.setItem('user_fname', response.data[0].fname);
        sessionStorage.setItem('user_role', response.data[0].role_name);
        sessionStorage.setItem('location_name', response.data[0].location_name);
        sessionStorage.setItem('fullname', response.data[0].fname + ' ' + response.data[0].mname + ' ' + response.data[0].lname);


        router.push('/salesClerkPage');
        OnlineState(response.data[0].account_id);

      } else {
        // setModalHeader('Account not found⚠️');
        // setModalBody('User credentials are not found, please check your email and password!');
        // setShow(true);
        showAlertError({
          icon: "error",
          title: "Account not found⚠️",
          text: 'User credentials are not found, please check your email and password!',
          button: 'Try Again'
        });

        return;
      }

      Logs(response.data[0].account_id, 'Online');
      return;

    } else {
      showAlertError({
          icon: "error",
          title: "Account not found⚠️",
          text: 'User credentials are not found, please check your email and password!',
          button: 'Try Again'
        });
    }

    generateRandomNumbers();
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      login(e);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} animation={true} >
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
        <div className='as'>
          <div className='pic-slog'>
            <Image src={'/assets/images/AG.png'} width={90} height={90} alt='logo' className='logo' />
            <h1>A.G Home Appliance <br></br>
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
              />
            </div>

            {/* Enhanced password input with toggle */}
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
                  style={{
                    paddingRight: '45px',
                    width: '100%'
                  }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  style={{
                    position: 'absolute',
                    right: '5px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    zIndex: 2,
                    color: '#666',

                  }}
                  onMouseEnter={(e) => {
                    // e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                    // e.target.style.color = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#666';
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
              />
              <button type="button" className='operator-1' onClick={generateRandomNumbers}>
                <Image src={'/assets/images/refresh.png'} width={60} height={55} alt="Refresh" />
              </button>
            </div>

            <button type="submit" className='sub-button'>
              Login
            </button>
          </form>
        </div>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
      </div>
    </>
  );
}