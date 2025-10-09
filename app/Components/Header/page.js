'use client';

import Link from 'next/link';
import "../../css/header.css";
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import InitialsAvatar from '../profile/profile';



export default function Header() {

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const r = useRouter();

  const [user_id, setUser_id] = useState('');
  const [user_fname, setUser_Fname] = useState('');
  const [user_role, setUser_Role] = useState('');
  const [userFullname, setUserFullname] = useState('');



  useEffect(() => {
    setUser_id(sessionStorage.getItem('user_id'));
    setUser_Fname(sessionStorage.getItem('user_fname'));
    setUser_Role(sessionStorage.getItem('user_role'));
    setUserFullname(sessionStorage.getItem('fullname'));
    

  }, []);

  const OfflineState = async (accID) => {
    // setProdId(id);

    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'login.php';
    // const url = "http://localhost/capstone-api/api/products.php";

    const Details = {
      userID: accID,
      state: 'Offline'
    }
    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(Details), // Send an empty object if required
          operation: "actStatus"
        }
      });
      // if (response.data == 'Success'){alert('gana')};
      // alert(response.data[0].product_name);
      // setStockOutList(response.data);

    } catch (error) {
      console.error("Error fetching invenroty stock out:", error);

    }
    return;
  };

  const Logs = async (accID, act) => {
    // setProdId(id);

    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'audit-log.php';
    // const url = "http://localhost/capstone-api/api/products.php";

    const Details = {
      accID: accID,
      activity: act
    }
    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(Details), // Send an empty object if required
          operation: "Logs"
        }
      });
      // if (response.data == 'Success'){alert('gana')};
      // alert(response.data[0].product_name);
      // setStockOutList(response.data);

    } catch (error) {
      console.error("Error fetching invenroty stock out:", error);

    }
    return;
  };



  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  const logout = () => {

    Logs(user_id, 'Log Out');
    OfflineState(user_id);

    sessionStorage.clear();
    r.push('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ref = () => {
    window.location.reload();

  }

  return (
    <>

      <header className="header" style={{ userSelect: 'none' }}>
        <div className="header-content">
          <div className='head-line'>
            <Image src={'/assets/images/logo.png'} width={90} height={90} className='pic-logo' alt='logo' />
            <h1 className="logo" onClick={ref}>A.G HOME APPLIANCE AND FURNITURE'S SHOWROOM </h1>
          </div>

          <div className='bell-andprof' style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <Image
              src={'/assets/images/bell.png'}
              width={50}
              height={50}
              className='bell'
              alt='notif'
              style={{ cursor: 'pointer' }}
            />

            <div className="profile-container" ref={dropdownRef} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              position: 'relative'
            }} onClick={toggleDropdown}>
              {/* <Image
                src={'/assets/images/noprof.jpg'}
                width={50}
                height={50}
                className='profile-logo'
                alt='profile'
                style={{ borderRadius: '50%' }}
              /> */}
              <InitialsAvatar name={userFullname} size={50} />

              <div style={{
                display: 'flex',
                flexDirection: 'column'
              }}>
                <span style={{
                  color: '#333',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>Hello, {user_fname}</span>
                <span style={{
                  color: '#666',
                  fontSize: '0.8rem'
                }}>{user_role}</span>
              </div>

              <span style={{
                fontSize: '20px',
                color: '#666',
                marginLeft: '5px'
              }}>▼</span>

              {dropdownOpen && (
                <div className='dropdown-new-menu' style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                  marginTop: '10px'
                }}>
                  <ul style={{
                    listStyle: 'none',
                    padding: '8px 0',
                    margin: 0
                  }}>
                    <li style={{
                      padding: '8px 20px',
                      cursor: 'pointer',
                      ':hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }} >Profile</li>
                    <li style={{
                      padding: '8px 20px',
                      cursor: 'pointer',
                      ':hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }} onClick={logout}>Logout</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
