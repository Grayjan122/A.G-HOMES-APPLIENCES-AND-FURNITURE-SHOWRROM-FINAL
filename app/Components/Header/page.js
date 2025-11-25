'use client';

import Link from 'next/link';
import "../../css/header.css";
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import InitialsAvatar from '../profile/profile';
import NotificationBell from '../Notifications/NotificationBell';



export default function Header() {

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const r = useRouter();

  const [user_id, setUser_id] = useState('');
  const [user_fname, setUser_Fname] = useState('');
  const [user_role, setUser_Role] = useState('');
  const [userFullname, setUserFullname] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return;

    setUser_id(sessionStorage.getItem('user_id'));
    setUser_Fname(sessionStorage.getItem('user_fname'));
    const role = sessionStorage.getItem('user_role');
    // Shorten "Warehouse Representative" to "Warehouse Rep"
    setUser_Role(role === 'Warehouse Representative' ? 'Warehouse Rep' : role);
    setUserFullname(sessionStorage.getItem('fullname'));
    OnlineState(sessionStorage.getItem('user_id'));
  }, [isMounted]);

  const OnlineState = async (accID) => {
    const baseURL = typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null;
    if (!baseURL) return null;
    const url = baseURL + 'login.php';

    const Details = {
      userID: accID,
      state: 'Online'
    };

    try {
     

      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(Details),
          operation: "actStatus"
        },
        timeout: 10000,
        validateStatus: (status) => status < 600
      });

      

      // Check if successful
      if (response.status === 200) {
        console.log('✅ User status set to Online successfully');
        
      } else {
        console.error('❌ Failed to set user status to Online. Status:', response.status);
        
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

  const OfflineState = async (accID) => {
    // setProdId(id);

    const baseURL = typeof window !== 'undefined' ? sessionStorage.getItem('baseURL') : null;
    if (!baseURL) return null;
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
    // Import Swal dynamically for confirmation
    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: 'Logout?',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, Logout',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        focusCancel: true
      }).then((result) => {
        if (result.isConfirmed) {
          // Prevent SessionValidator from showing alert during self-initiated logout
          if (typeof window !== 'undefined' && window.preventSessionAlert) {
            window.preventSessionAlert();
          }

          Logs(user_id, 'Log Out');
          OfflineState(user_id);

          sessionStorage.clear();
          r.push('/');
        }
      });
    });
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
            gap: isMobile ? '12px' : '20px'
          }}>
            <NotificationBell />

            <div className="profile-container" ref={dropdownRef} style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '12px',
              cursor: 'pointer',
              position: 'relative',
              padding: isMobile ? '6px 8px' : '8px 12px',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              backgroundColor: dropdownOpen ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
            }} 
            onClick={toggleDropdown}
            onMouseEnter={(e) => {
              if (!dropdownOpen && !isMobile) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!dropdownOpen && !isMobile) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            >
              <InitialsAvatar 
                name={userFullname} 
                size={isMobile ? 40 : 50} 
              />

              {!isMobile && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minWidth: 0
                }}>
                  <span style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>Hello, {user_fname}</span>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>{user_role}</span>
                </div>
              )}

              <span style={{
                fontSize: isMobile ? '12px' : '14px',
                color: 'rgba(255, 255, 255, 0.9)',
                marginLeft: isMobile ? '0' : '5px',
                transition: 'transform 0.2s ease',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>▼</span>

              {dropdownOpen && (
                <div className='dropdown-new-menu' style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: isMobile ? '-10px' : 0,
                  backgroundColor: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  borderRadius: isMobile ? '8px' : '12px',
                  minWidth: isMobile ? '150px' : '220px',
                  maxWidth: isMobile ? 'calc(100vw - 40px)' : 'none',
                  overflow: 'hidden',
                  zIndex: 1000,
                  border: '1px solid #e5e7eb',
                  animation: 'fadeInDown 0.2s ease-out'
                }}>
                  {/* User Info Section */}
                  <div style={{
                    padding: isMobile ? '10px 14px' : '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f8fafc'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      color: '#1f2937',
                      fontSize: isMobile ? '12px' : '14px',
                      marginBottom: isMobile ? '2px' : '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {userFullname || user_fname}
                    </div>
                    <div style={{
                      color: '#6b7280',
                      fontSize: isMobile ? '10px' : '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        width: isMobile ? '6px' : '8px',
                        height: isMobile ? '6px' : '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        flexShrink: 0
                      }}></span>
                      <span style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{user_role}</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <ul style={{
                    listStyle: 'none',
                    padding: isMobile ? '4px 0' : '8px 0',
                    margin: 0
                  }}>
                    <li
                      style={{
                        padding: isMobile ? '8px 12px' : '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '0px' : '12px',
                        transition: 'all 0.2s ease',
                        color: '#374151'
                      }}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.color = '#1f2937';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#374151';
                        }
                      }}
                      onTouchStart={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onTouchEnd={(e) => {
                        setTimeout(() => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }, 200);
                      }}
                      onClick={() => {
                        setDropdownOpen(false);
                        sessionStorage.setItem('activePage', 'profileSetting');
                        window.location.reload();
                      }}
                    >
                      <svg width={isMobile ? "70" : "18"} height={isMobile ? "14" : "18"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isMobile ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span style={{ 
                        fontSize: isMobile ? '12px' : '14px', 
                        fontWeight: '500',
                        flex: 1,
                        minWidth: 0
                      }}>Profile Settings</span>
                    </li>
                    
                    {/* Divider */}
                    <li style={{
                      height: '1px',
                      backgroundColor: '#e5e7eb',
                      margin: isMobile ? '2px 0' : '4px 0'
                    }}></li>
                    
                    <li 
                      style={{
                        padding: isMobile ? '8px 12px' : '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '0px' : '12px',
                        transition: 'all 0.2s ease',
                        color: '#dc2626'
                      }}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.color = '#b91c1c';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#dc2626';
                        }
                      }}
                      onTouchStart={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                      }}
                      onTouchEnd={(e) => {
                        setTimeout(() => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }, 200);
                      }}
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                    >
                      <svg width={isMobile ? "70" : "18"} height={isMobile ? "14" : "18"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isMobile ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      <span style={{ 
                        fontSize: isMobile ? '12px' : '14px', 
                        fontWeight: '500',
                        flex: 1,
                        minWidth: 0
                      }}>Logout</span>
                    </li>
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
