'use client';
import { useState, useEffect } from 'react';
import "../../css/inventory-css/inventory.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import InitialsAvatar from '../profile/profile';

const ProfileSetting = () => {
    const [userDetails, setUserDetails] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

    // Password states
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Forgot Password states
    const [resetStep, setResetStep] = useState(1); // 1 = verify email, 2 = enter code, 3 = new password
    const [userEmail, setUserEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [enteredCode, setEnteredCode] = useState('');
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Edit Email states
    const [showEditEmailModal, setShowEditEmailModal] = useState(false);
    const [emailStep, setEmailStep] = useState(1); // 1 = enter new email, 2 = verify code
    const [newEmail, setNewEmail] = useState('');
    const [emailVerificationCode, setEmailVerificationCode] = useState('');
    const [emailEnteredCode, setEmailEnteredCode] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);

    // Admin Edit Profile states
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [roleList, setRoleList] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [editFname, setEditFname] = useState('');
    const [editMname, setEditMname] = useState('');
    const [editLname, setEditLname] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editBirthdate, setEditBirthdate] = useState('');
    const [editRole, setEditRole] = useState('');
    const [editRoleID, setEditRoleID] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editLocationID, setEditLocationID] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [editProfileError, setEditProfileError] = useState('');

    const user_id = sessionStorage.getItem('user_id');
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'users.php'; // For user operations
    const loginUrl = baseURL + 'login.php'; // For password verification
    const dropdownUrl = baseURL + 'GetDropDown.php'; // For roles and locations

    useEffect(() => {
        fetchUserDetails();
    }, []);

    // Fetch roles and locations if user is admin
    useEffect(() => {
        if (userDetails.role_name === 'Admin') {
            fetchRoles();
            fetchLocations();
        }
    }, [userDetails.role_name]);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({ userID: user_id }), // Changed to match backend
                    operation: 'GetUserDetails' // Changed to match backend operation
                }
            });

            if (response.data.length > 0) {
                setUserDetails(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    // Fetch roles for admin editing
    const fetchRoles = async () => {
        try {
            const response = await axios.get(dropdownUrl, {
                params: {
                    json: JSON.stringify([]),
                    operation: 'GetRole'
                }
            });
            setRoleList(response.data || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    // Fetch locations for admin editing
    const fetchLocations = async () => {
        try {
            const response = await axios.get(dropdownUrl, {
                params: {
                    json: JSON.stringify([]),
                    operation: 'GetLocation'
                }
            });
            setLocationList(response.data || []);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    // ✅ Password complexity check
    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    // Get individual password strength checks
    const getPasswordStrength = (password) => {
        const checks = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        return checks;
    };

    const handleChangePassword = async () => {
        setPasswordError('');

        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError('All fields are required.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }
        if (!validatePassword(newPassword)) {
            setPasswordError('Password must have 8+ characters, 1 uppercase, 1 number, and 1 special character.');
            return;
        }

        try {
            // ✅ 1. Verify old password by calling login API
            const verifyRes = await axios.get(loginUrl, {
                params: {
                    json: JSON.stringify({ username: userDetails.username, password: oldPassword }),
                    operation: "login"
                }
            });

            if (verifyRes.data.length === 0) {
                setPasswordError('Old password is incorrect.');
                return;
            }

            // ✅ 2. Update password
            const updateParams = new URLSearchParams();
            updateParams.append('json', JSON.stringify({ userID: user_id, newPassword: newPassword }));
            updateParams.append('operation', 'updatePassword');

            const updateResponse = await axios.post(url, updateParams);

            // Check if password was reused
            if (updateResponse.data.error === 'password_reuse') {
                showAlertError({
                    icon: "warning",
                    title: "Password Reuse Detected!",
                    text: updateResponse.data.message,
                    button: 'Choose Different Password'
                });
                return;
            }

            if (updateResponse.data.success) {
                AlertSucces(
                    "Password successfully updated!",
                    "success",
                    true,
                    'Okay'
                );
                setShowModal(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                showAlertError({
                    icon: "error",
                    title: "Update Failed!",
                    text: updateResponse.data.message || 'Failed to update password!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            showAlertError({
                icon: "error",
                title: "Update Failed!",
                text: 'Something went wrong while changing your password!',
                button: 'Try Again'
            });
        }
    };

    // 🔐 Forgot Password Flow Functions
    const openForgotPasswordModal = () => {
        setShowModal(false);
        setShowForgotPasswordModal(true);
        setResetStep(1);
        setUserEmail(userDetails.email || '');
        setEnteredCode('');
        setResetNewPassword('');
        setResetConfirmPassword('');
        setPasswordError('');
    };

    const closeForgotPasswordModal = () => {
        setShowForgotPasswordModal(false);
        setResetStep(1);
        setVerificationCode('');
        setEnteredCode('');
        setResetNewPassword('');
        setResetConfirmPassword('');
        setPasswordError('');
    };

    const sendVerificationCode = async () => {
        if (!userEmail || !userEmail.trim()) {
            showAlertError({
                icon: "warning",
                title: "Email Required!",
                text: 'Please enter your email address!',
                button: 'Okay'
            });
            return;
        }

        console.log('🔍 Starting sendVerificationCode...');
        console.log('📧 User Email:', userEmail);
        console.log('🆔 User ID:', user_id);
        console.log('🌐 URL:', url);

        setIsSendingCode(true);

        try {
            // Verify email belongs to this user
            console.log('1️⃣ Verifying email...');
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        email: userEmail.trim(),
                        user_id: user_id
                    }),
                    operation: "verifyUserEmail"
                },
                timeout: 10000
            });

            console.log('✅ Verify email response:', response.data);

            if (response.data && response.data.exists) {
                // Generate 6-digit code
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                setVerificationCode(code);
                console.log('🔢 Generated code:', code);

                // Send email with code
                console.log('2️⃣ Sending email with code...');
                const emailResponse = await axios.get(url, {
                    params: {
                        json: JSON.stringify({
                            email: userEmail.trim(),
                            code: code,
                            name: userDetails.fname || 'User'
                        }),
                        operation: "sendCode"
                    },
                    timeout: 15000
                });

                console.log('📬 Send code response:', emailResponse.data);

                if (emailResponse.data && emailResponse.data.success) {
                    console.log('✅ Email sent successfully!');
                    setResetStep(2);
                    AlertSucces(
                        `Verification code sent to ${userEmail}`,
                        'success',
                        true,
                        'Okay'
                    );
                } else {
                    console.error('❌ Email sending failed:', emailResponse.data);
                    showAlertError({
                        icon: "error",
                        title: "Email Send Failed!",
                        text: emailResponse.data?.error || 'Failed to send email. Please try again.',
                        button: 'Try Again'
                    });
                }
            } else {
                console.error('❌ Email verification failed:', response.data);
                showAlertError({
                    icon: "error",
                    title: "Email Mismatch!",
                    text: 'Email address does not match your account!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error('❌ ERROR in sendVerificationCode:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            showAlertError({
                icon: "error",
                title: "Verification Failed!",
                text: 'Failed to send verification code. Please try again.',
                button: 'Try Again'
            });
        } finally {
            setIsSendingCode(false);
        }
    };

    const verifyCode = () => {
        if (enteredCode.trim() === verificationCode) {
            setResetStep(3);
            setPasswordError('');
        } else {
            setPasswordError('Invalid verification code');
            showAlertError({
                icon: "error",
                title: "Invalid Code!",
                text: 'The verification code you entered is incorrect!',
                button: 'Try Again'
            });
        }
    };

    const resetPasswordWithCode = async () => {
        setPasswordError('');

        if (!resetNewPassword || !resetConfirmPassword) {
            setPasswordError('All fields are required.');
            return;
        }
        if (resetNewPassword !== resetConfirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }
        if (!validatePassword(resetNewPassword)) {
            setPasswordError('Password must have 8+ characters, 1 uppercase, 1 number, and 1 special character.');
            return;
        }

        try {
            // Update password
            const updateParams = new URLSearchParams();
            updateParams.append('json', JSON.stringify({ userID: user_id, newPassword: resetNewPassword }));
            updateParams.append('operation', 'updatePassword');

            const updateResponse = await axios.post(url, updateParams);

            // Check if password was reused
            if (updateResponse.data.error === 'password_reuse') {
                setPasswordError(updateResponse.data.message);
                showAlertError({
                    icon: "warning",
                    title: "Password Reuse Detected!",
                    text: updateResponse.data.message,
                    button: 'Choose Different Password'
                });
                return;
            }

            if (updateResponse.data.success) {
                AlertSucces(
                    "Password successfully reset!",
                    "success",
                    true,
                    'Okay'
                );
                closeForgotPasswordModal();
            } else {
                showAlertError({
                    icon: "error",
                    title: "Reset Failed!",
                    text: updateResponse.data.message || 'Failed to reset password!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            showAlertError({
                icon: "error",
                title: "Reset Failed!",
                text: 'Something went wrong while resetting your password!',
                button: 'Try Again'
            });
        }
    };

    // 📧 Edit Email Functions
    const openEditEmailModal = () => {
        setShowEditEmailModal(true);
        setEmailStep(1);
        setNewEmail('');
        setEmailEnteredCode('');
        setEmailError('');
    };

    const closeEditEmailModal = () => {
        setShowEditEmailModal(false);
        setEmailStep(1);
        setNewEmail('');
        setEmailVerificationCode('');
        setEmailEnteredCode('');
        setEmailError('');
    };

    const sendEmailVerificationCode = async () => {
        setEmailError('');

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!newEmail || !newEmail.trim()) {
            setEmailError('Please enter an email address');
            return;
        }
        if (!emailRegex.test(newEmail.trim())) {
            setEmailError('Please enter a valid email address');
            return;
        }
        if (newEmail.trim().toLowerCase() === userDetails.email?.toLowerCase()) {
            setEmailError('New email is the same as current email');
            return;
        }

        setIsSendingEmailCode(true);

        try {
            // Check if email is already in use
            const checkResponse = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        email: newEmail.trim()
                    }),
                    operation: "checkEmailExists"
                },
                timeout: 10000
            });

            if (checkResponse.data && checkResponse.data.exists) {
                setEmailError('This email is already in use by another account');
                setIsSendingEmailCode(false);
                return;
            }

            // Generate 6-digit code
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setEmailVerificationCode(code);

            // Send verification code to new email
            const emailResponse = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        email: newEmail.trim(),
                        code: code,
                        name: userDetails.fname,
                        purpose: 'email_change'
                    }),
                    operation: "sendEmailChangeCode"
                },
                timeout: 15000
            });

            if (emailResponse.data.success) {
                setEmailStep(2);
                AlertSucces(
                    `Verification code sent to ${newEmail}`,
                    'success',
                    true,
                    'Okay'
                );
            } else {
                throw new Error('Failed to send verification email');
            }
        } catch (error) {
            console.error('Error sending email verification code:', error);
            setEmailError('Failed to send verification code. Please try again.');
            showAlertError({
                icon: "error",
                title: "Send Failed!",
                text: 'Failed to send verification code. Please try again!',
                button: 'Try Again'
            });
        } finally {
            setIsSendingEmailCode(false);
        }
    };

    const verifyEmailCode = () => {
        if (emailEnteredCode.trim() === emailVerificationCode) {
            updateEmail();
        } else {
            setEmailError('Invalid verification code');
            showAlertError({
                icon: "error",
                title: "Invalid Code!",
                text: 'The verification code you entered is incorrect!',
                button: 'Try Again'
            });
        }
    };

    const updateEmail = async () => {
        try {
            // Update email in database
            const updateParams = new URLSearchParams();
            updateParams.append('json', JSON.stringify({
                userID: user_id,
                newEmail: newEmail.trim()
            }));
            updateParams.append('operation', 'updateEmail');

            await axios.post(url, updateParams);

            // AlertSucces('Email successfully updated!');
             AlertSucces(
                "Email successfully updated!",
                "success",
                true,
                'Okay'
            );

            // Update local state
            setUserDetails(prev => ({
                ...prev,
                email: newEmail.trim()
            }));

            closeEditEmailModal();
        } catch (error) {
            console.error('Error updating email:', error);
            showAlertError({
                icon: "error",
                title: "Update Failed!",
                text: 'Failed to update email. Please try again!',
                button: 'Try Again'
            });
        }
    };

    // Admin Edit Profile Functions
    const openEditProfileModal = async () => {
        // Fetch full user details including phone, address, birth_date, role_id
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({ userID: user_id }),
                    operation: 'GetUserDetails'
                }
            });

            if (response.data.length > 0) {
                const details = response.data[0];
                setEditFname(details.fname || '');
                setEditMname(details.mname || '');
                setEditLname(details.lname || '');
                setEditPhone(details.phone || '');
                setEditAddress(details.address || '');
                // Format birth_date for date input (YYYY-MM-DD)
                const birthDate = details.birth_date || '';
                setEditBirthdate(birthDate.includes('0000-00-00') || birthDate === '' ? '' : birthDate.split(' ')[0]);
                setEditRole(details.role_id || '');
                setEditRoleID(details.role_id || '');
                setEditLocation(details.location_id || '');
                setEditLocationID(details.location_id || '');
                setEditStatus(details.status || '');
                setEditProfileError('');
                setShowEditProfileModal(true);
            }
        } catch (error) {
            console.error('Error fetching user details for edit:', error);
            showAlertError({
                icon: "error",
                title: "Error!",
                text: 'Failed to load user details. Please try again!',
                button: 'Okay'
            });
        }
    };

    const closeEditProfileModal = () => {
        setShowEditProfileModal(false);
        setEditProfileError('');
    };

    const handleRoleChange = (e) => {
        const selectedRoleID = e.target.value;
        const selectedRole = roleList.find(r => r.role_id == selectedRoleID);
        setEditRole(selectedRoleID);
        setEditRoleID(selectedRoleID);
    };

    const handleLocationChange = (e) => {
        const selectedLocationID = e.target.value;
        setEditLocation(selectedLocationID);
        setEditLocationID(selectedLocationID);
    };

    const updateProfile = async () => {
        setEditProfileError('');

        // Validate required fields
        if (!editFname.trim() || !editMname.trim() || !editLname.trim()) {
            setEditProfileError('First name, middle name, and last name are required.');
            return;
        }

        if (!editPhone.trim() || !editAddress.trim() || !editBirthdate.trim()) {
            setEditProfileError('Phone, address, and birthdate are required.');
            return;
        }

        try {
            const updateData = {
                fname: editFname.trim(),
                mname: editMname.trim(),
                lname: editLname.trim(),
                bDate: editBirthdate,
                role: editRoleID,
                location: editLocationID,
                phone: editPhone.trim(),
                email: userDetails.email || '', // Keep existing email
                address: editAddress.trim(),
                accountStatus: editStatus,
                accountID: user_id
            };

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(updateData),
                    operation: 'UpdateUser'
                }
            });

            if (response.data === 'Success') {
                AlertSucces(
                    "Profile successfully updated!",
                    "success",
                    true,
                    'Okay'
                );
                closeEditProfileModal();
                fetchUserDetails(); // Refresh user details
            } else {
                setEditProfileError(response.data || 'Failed to update profile.');
                showAlertError({
                    icon: "error",
                    title: "Update Failed!",
                    text: response.data || 'Failed to update profile. Please try again!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setEditProfileError('Something went wrong while updating your profile.');
            showAlertError({
                icon: "error",
                title: "Update Failed!",
                text: 'Something went wrong while updating your profile!',
                button: 'Try Again'
            });
        }
    };

    const fullName = `${userDetails.fname || ''} ${userDetails.mname || ''} ${userDetails.lname || ''}`.trim();

    // Get status display information
    const getStatusInfo = (status) => {
        const statusMap = {
            'Active': { text: 'Active', class: 'status-active', icon: '✅' },
            'Inactive': { text: 'Inactive', class: 'status-inactive', icon: '⭕' },
            'Pending': { text: 'Pending', class: 'status-pending', icon: '⏳' },
            'Suspend': { text: 'Suspend', class: 'status-suspend', icon: '🚫' },
            // Legacy support for numeric values
            '1': { text: 'Active', class: 'status-active', icon: '✅' },
            '0': { text: 'Inactive', class: 'status-inactive', icon: '⭕' },
            '2': { text: 'Pending', class: 'status-pending', icon: '⏳' },
            '3': { text: 'Suspend', class: 'status-suspend', icon: '🚫' }
        };
        
        return statusMap[status] || { text: 'Unknown', class: 'status-inactive', icon: '❓' };
    };

    return (
        <div className="dash-main" >
            <style jsx>{`
                .profile-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 0 10px;
                }
                .profile-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    padding: clamp(20px, 5vw, 40px);
                    margin-bottom: 30px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    color: white;
                }
                .profile-card {
                    background: white;
                    border-radius: 15px;
                    padding: clamp(15px, 4vw, 30px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
                    margin-bottom: 20px;
                    overflow-x: auto;
                }
                .info-row {
                    display: flex;
                    align-items: center;
                    padding: clamp(10px, 3vw, 15px) clamp(12px, 3vw, 20px);
                    margin-bottom: 10px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border-left: 4px solid #667eea;
                    transition: all 0.3s ease;
                    flex-wrap: wrap;
                    gap: 10px;
                    min-width: 0;
                }
                .info-row:hover {
                    background: #e9ecef;
                    transform: translateX(5px);
                }
                .info-label {
                    font-weight: 600;
                    color: #495057;
                    min-width: clamp(100px, 30%, 140px);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: clamp(0.85rem, 3vw, 1rem);
                    flex-shrink: 0;
                }
                .info-value {
                    color: #212529;
                    font-weight: 500;
                    flex: 1;
                    min-width: 0;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    font-size: clamp(0.85rem, 3vw, 1rem);
                }
                .status-badge {
                    display: inline-block;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: clamp(0.75rem, 2.5vw, 0.85rem);
                    font-weight: 600;
                }
                .status-active {
                    background-color: #d4edda;
                    color: #155724;
                }
                .status-inactive {
                    background-color: #f8d7da;
                    color: #721c24;
                }
                .status-pending {
                    background-color: #fff3cd;
                    color: #856404;
                }
                .status-suspend {
                    background-color: #f8d7da;
                    color: #721c24;
                }
                .action-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    padding: clamp(10px, 3vw, 12px) clamp(20px, 5vw, 30px);
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: clamp(0.85rem, 3vw, 1rem);
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }
                .action-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
                }

                @media (max-width: 768px) {
                    .profile-header > div {
                        flex-direction: column !important;
                        text-align: center;
                        gap: 20px !important;
                    }
                    .info-row {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 8px;
                    }
                    .info-label {
                        min-width: 100%;
                        font-size: 0.9rem;
                    }
                    .info-value {
                        width: 100%;
                        padding-left: 26px;
                        font-size: 0.9rem;
                    }
                }

                @media (max-width: 480px) {
                    .profile-container {
                        padding: 0 5px;
                    }
                    .profile-header {
                        border-radius: 15px;
                        margin-bottom: 20px;
                    }
                    .profile-card {
                        border-radius: 12px;
                        padding: 15px;
                    }
                    .info-row {
                        padding: 12px;
                        margin-bottom: 8px;
                    }
                    .info-label {
                        font-size: 0.85rem;
                    }
                    .info-value {
                        font-size: 0.85rem;
                        padding-left: 24px;
                    }
                }
            `}</style>

            <div className="profile-container">
                {/* Header Section */}
                <div className="profile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
                        <InitialsAvatar name={fullName} size={100} />
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                                fontWeight: '700',
                                wordBreak: 'break-word'
                            }}>
                                {fullName || 'User'}
                            </h2>
                            <p style={{
                                margin: '5px 0 0 0',
                                opacity: 0.9,
                                fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                                wordBreak: 'break-word'
                            }}>
                                @{userDetails.username}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Information Card */}
                <div className="profile-card">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '25px',
                        flexWrap: 'wrap',
                        gap: '15px'
                    }}>
                        <h4 style={{
                            margin: 0,
                            color: '#2d3748',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: 'clamp(1.1rem, 4vw, 1.3rem)'
                        }}>
                            <span style={{ fontSize: 'clamp(1.3rem, 4.5vw, 1.5rem)' }}>ℹ️</span> Personal Information
                        </h4>
                        {userDetails.role_name === 'Admin' && (
                            <Button
                                onClick={openEditProfileModal}
                                style={{
                                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: 'clamp(8px, 2vw, 10px) clamp(20px, 4vw, 25px)',
                                    fontWeight: '600',
                                    fontSize: 'clamp(0.85rem, 3vw, 1rem)',
                                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.6)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.4)';
                                }}
                            >
                                ✏️ Edit Profile
                            </Button>
                        )}
                    </div>

                    <div className="info-row">
                        <div className="info-label">
                            <span>👤</span> Full Name
                        </div>
                        <div className="info-value">{fullName || 'N/A'}</div>
                    </div>

                    <div className="info-row">
                        <div className="info-label">
                            <span>📧</span> Email Address
                        </div>
                        <div className="info-value" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            flex: 1,
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            minWidth: 0
                        }}>
                            <span style={{
                                wordBreak: 'break-all',
                                overflowWrap: 'break-word',
                                flex: '1 1 auto',
                                minWidth: '0'
                            }}>
                                {userDetails.email || 'Not set'}
                            </span>
                            <button
                                onClick={openEditEmailModal}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: 'clamp(5px, 1.5vw, 6px) clamp(12px, 3vw, 15px)',
                                    borderRadius: '8px',
                                    fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                                }}
                            >
                                ✏️ Edit
                            </button>
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="info-label">
                            <span>🔑</span> Username
                        </div>
                        <div className="info-value">{userDetails.username || 'N/A'}</div>
                    </div>

                    <div className="info-row">
                        <div className="info-label">
                            <span>💼</span> Role
                        </div>
                        <div className="info-value">{userDetails.role_name || 'N/A'}</div>
                    </div>

                    <div className="info-row">
                        <div className="info-label">
                            <span>📍</span> Location
                        </div>
                        <div className="info-value">{userDetails.location_name || 'N/A'}</div>
                    </div>

                    <div className="info-row">
                        <div className="info-label">
                            <span>✨</span> Account Status
                        </div>
                        <div className="info-value">
                            <span className={`status-badge ${getStatusInfo(userDetails.status).class}`}>
                                {getStatusInfo(userDetails.status).icon} {getStatusInfo(userDetails.status).text}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="profile-card">
                    <h4 style={{
                        marginBottom: '20px',
                        color: '#2d3748',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: 'clamp(1.1rem, 4vw, 1.3rem)'
                    }}>
                        <span style={{ fontSize: 'clamp(1.3rem, 4.5vw, 1.5rem)' }}>🔐</span> Security Settings
                    </h4>
                    <p style={{
                        color: '#6c757d',
                        marginBottom: '20px',
                        fontSize: 'clamp(0.85rem, 3vw, 1rem)'
                    }}>
                        Keep your account secure by regularly updating your password
                    </p>
                    <Button className="action-btn" onClick={() => setShowModal(true)}>
                        🔑 Change Password
                    </Button>
                </div>
            </div>

            {/* Modal for password change */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md">
                <Modal.Header closeButton style={{ borderBottom: '2px solid #667eea', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <Modal.Title style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>🔐</span> Change Password
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '30px' }}>
                    {passwordError && (
                        <Alert variant="danger" style={{ borderRadius: '10px', borderLeft: '4px solid #dc3545' }}>
                            <strong>⚠️</strong> {passwordError}
                        </Alert>
                    )}

                    <Form.Group className="mb-4">
                        <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                            🔒 Old Password
                        </Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter your current password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            style={{
                                borderRadius: '10px',
                                padding: '12px 15px',
                                border: '2px solid #e9ecef',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                            🔑 New Password
                        </Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter your new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{
                                borderRadius: '10px',
                                padding: '12px 15px',
                                border: '2px solid #e9ecef',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                        />
                    </Form.Group>

                    {/* Password Requirements Checklist */}
                    {newPassword && (
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '15px',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            border: '1px solid #e9ecef'
                        }}>
                            <p style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                marginBottom: '10px',
                                color: '#495057'
                            }}>
                                Password Requirements:
                            </p>
                            <div style={{ fontSize: '0.85rem' }}>
                                <div style={{
                                    color: getPasswordStrength(newPassword).minLength ? '#28a745' : '#dc3545',
                                    marginBottom: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                        {getPasswordStrength(newPassword).minLength ? '✓' : '✗'}
                                    </span>
                                    At least 8 characters
                                </div>
                                <div style={{
                                    color: getPasswordStrength(newPassword).hasUpperCase ? '#28a745' : '#dc3545',
                                    marginBottom: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                        {getPasswordStrength(newPassword).hasUpperCase ? '✓' : '✗'}
                                    </span>
                                    At least 1 uppercase letter
                                </div>
                                <div style={{
                                    color: getPasswordStrength(newPassword).hasNumber ? '#28a745' : '#dc3545',
                                    marginBottom: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                        {getPasswordStrength(newPassword).hasNumber ? '✓' : '✗'}
                                    </span>
                                    At least 1 number
                                </div>
                                <div style={{
                                    color: getPasswordStrength(newPassword).hasSpecialChar ? '#28a745' : '#dc3545',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                        {getPasswordStrength(newPassword).hasSpecialChar ? '✓' : '✗'}
                                    </span>
                                    At least 1 special character (!@#$%^&*...)
                                </div>
                            </div>
                        </div>
                    )}

                    <Form.Group className="mb-4">
                        <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                            ✅ Confirm New Password
                        </Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Re-enter your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{
                                borderRadius: '10px',
                                padding: '12px 15px',
                                border: '2px solid #e9ecef',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                        />
                    </Form.Group>

                    <div className="text-center mt-3 pt-3" style={{ borderTop: '1px solid #e9ecef' }}>
                        <span
                            style={{
                                color: '#667eea',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                transition: 'all 0.3s ease'
                            }}
                            onClick={openForgotPasswordModal}
                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                            🔓 Forgot your password? Reset via email
                        </span>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '2px solid #e9ecef', padding: '20px 30px' }}>
                    <Button
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                        style={{
                            borderRadius: '10px',
                            padding: '10px 25px',
                            fontWeight: '600'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleChangePassword}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 25px',
                            fontWeight: '600',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }}
                    >
                        💾 Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Forgot Password Modal - 3 Step Process */}
            <Modal show={showForgotPasswordModal} onHide={closeForgotPasswordModal} centered size="md">
                <Modal.Header closeButton style={{ borderBottom: '2px solid #667eea', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <Modal.Title style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {resetStep === 1 && <><span>🔐</span> Verify Email</>}
                        {resetStep === 2 && <><span>📧</span> Enter Verification Code</>}
                        {resetStep === 3 && <><span>🔑</span> Reset Password</>}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '30px' }}>
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
                                zIndex: 2,
                                position: 'relative',
                                transition: 'all 0.3s ease'
                            }}>
                                {step}
                            </div>
                        ))}
                    </div>

                    {passwordError && (
                        <Alert variant="danger" style={{ borderRadius: '10px', borderLeft: '4px solid #dc3545' }}>
                            <strong>⚠️</strong> {passwordError}
                        </Alert>
                    )}

                    {/* Step 1: Verify Email */}
                    {resetStep === 1 && (
                        <>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f0f4ff',
                                borderRadius: '10px',
                                marginBottom: '25px',
                                borderLeft: '4px solid #667eea'
                            }}>
                                <p style={{ margin: 0, color: '#495057', fontSize: '0.95rem' }}>
                                    <strong>📧 Email Verification Required</strong><br />
                                    We'll send a 6-digit verification code to your email address
                                </p>
                            </div>
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                                    📧 Email Address
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    disabled={isSendingCode}
                                    style={{
                                        borderRadius: '10px',
                                        padding: '12px 15px',
                                        border: '2px solid #e9ecef',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                />
                            </Form.Group>
                        </>
                    )}

                    {/* Step 2: Enter Verification Code */}
                    {resetStep === 2 && (
                        <>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#e8f5e9',
                                borderRadius: '10px',
                                marginBottom: '25px',
                                borderLeft: '4px solid #4caf50',
                                textAlign: 'center'
                            }}>
                                <p style={{ margin: 0, color: '#2e7d32', fontSize: '0.95rem' }}>
                                    <strong>✉️ Code Sent!</strong><br />
                                    Check your inbox at <strong>{userEmail}</strong>
                                </p>
                            </div>
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px', textAlign: 'center', display: 'block' }}>
                                    🔢 Enter Verification Code
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="• • • • • •"
                                    value={enteredCode}
                                    onChange={(e) => setEnteredCode(e.target.value)}
                                    maxLength={6}
                                    style={{
                                        fontSize: '1.8rem',
                                        letterSpacing: '0.8rem',
                                        textAlign: 'center',
                                        borderRadius: '10px',
                                        padding: '20px',
                                        border: '2px solid #667eea',
                                        fontWeight: '700',
                                        color: '#667eea'
                                    }}
                                />
                            </Form.Group>
                            <div className="text-center mt-4" style={{
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '10px'
                            }}>
                                <small style={{ color: '#6c757d' }}>
                                    Didn't receive the code?
                                    <span
                                        style={{
                                            color: '#667eea',
                                            cursor: 'pointer',
                                            marginLeft: '5px',
                                            fontWeight: '600'
                                        }}
                                        onClick={() => {
                                            setResetStep(1);
                                            setEnteredCode('');
                                        }}
                                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                    >
                                        🔄 Resend Code
                                    </span>
                                </small>
                            </div>
                        </>
                    )}

                    {/* Step 3: Reset Password */}
                    {resetStep === 3 && (
                        <>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#e8f5e9',
                                borderRadius: '10px',
                                marginBottom: '25px',
                                borderLeft: '4px solid #4caf50',
                                textAlign: 'center'
                            }}>
                                <p style={{ margin: 0, color: '#2e7d32', fontSize: '1rem', fontWeight: '600' }}>
                                    ✅ Email Verified Successfully!<br />
                                    <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>Now create your new password</span>
                                </p>
                            </div>

                            <Form.Group className="mb-4">
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                                    🔑 New Password
                                </Form.Label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your new password"
                                        value={resetNewPassword}
                                        onChange={(e) => setResetNewPassword(e.target.value)}
                                        style={{
                                            borderRadius: '10px',
                                            padding: '12px 45px 12px 15px',
                                            border: '2px solid #e9ecef',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                    />
                                    <span
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '15px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer',
                                            fontSize: '1.3rem',
                                            userSelect: 'none'
                                        }}
                                    >
                                        {showPassword ? '👁️' : '🙈'}
                                    </span>
                                </div>
                            </Form.Group>

                            {/* Password Requirements Checklist */}
                            {resetNewPassword && (
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    marginBottom: '20px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        marginBottom: '10px',
                                        color: '#495057'
                                    }}>
                                        Password Requirements:
                                    </p>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        <div style={{
                                            color: getPasswordStrength(resetNewPassword).minLength ? '#28a745' : '#dc3545',
                                            marginBottom: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                {getPasswordStrength(resetNewPassword).minLength ? '✓' : '✗'}
                                            </span>
                                            At least 8 characters
                                        </div>
                                        <div style={{
                                            color: getPasswordStrength(resetNewPassword).hasUpperCase ? '#28a745' : '#dc3545',
                                            marginBottom: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                {getPasswordStrength(resetNewPassword).hasUpperCase ? '✓' : '✗'}
                                            </span>
                                            At least 1 uppercase letter
                                        </div>
                                        <div style={{
                                            color: getPasswordStrength(resetNewPassword).hasNumber ? '#28a745' : '#dc3545',
                                            marginBottom: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                {getPasswordStrength(resetNewPassword).hasNumber ? '✓' : '✗'}
                                            </span>
                                            At least 1 number
                                        </div>
                                        <div style={{
                                            color: getPasswordStrength(resetNewPassword).hasSpecialChar ? '#28a745' : '#dc3545',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                {getPasswordStrength(resetNewPassword).hasSpecialChar ? '✓' : '✗'}
                                            </span>
                                            At least 1 special character (!@#$%^&*...)
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                                    ✅ Confirm New Password
                                </Form.Label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Re-enter your new password"
                                        value={resetConfirmPassword}
                                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                                        style={{
                                            borderRadius: '10px',
                                            padding: '12px 45px 12px 15px',
                                            border: '2px solid #e9ecef',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                    />
                                    <span
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '15px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer',
                                            fontSize: '1.3rem',
                                            userSelect: 'none'
                                        }}
                                    >
                                        {showConfirmPassword ? '👁️' : '🙈'}
                                    </span>
                                </div>
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '2px solid #e9ecef', padding: '20px 30px' }}>
                    {resetStep === 1 && (
                        <>
                            <Button
                                variant="secondary"
                                onClick={closeForgotPasswordModal}
                                style={{
                                    borderRadius: '10px',
                                    padding: '10px 25px',
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
                                    borderRadius: '10px',
                                    padding: '10px 25px',
                                    fontWeight: '600',
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
                                    borderRadius: '10px',
                                    padding: '10px 25px',
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
                                    borderRadius: '10px',
                                    padding: '10px 25px',
                                    fontWeight: '600',
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
                                onClick={closeForgotPasswordModal}
                                style={{
                                    borderRadius: '10px',
                                    padding: '10px 25px',
                                    fontWeight: '600'
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={resetPasswordWithCode}
                                style={{
                                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '10px 25px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)'
                                }}
                            >
                                🔑 Reset Password
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Edit Email Modal - 2 Step Process */}
            <Modal show={showEditEmailModal} onHide={closeEditEmailModal} centered size="md">
                <Modal.Header closeButton style={{ borderBottom: '2px solid #667eea', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <Modal.Title style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {emailStep === 1 && <><span>📧</span> Change Email Address</>}
                        {emailStep === 2 && <><span>🔐</span> Verify New Email</>}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '30px' }}>
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
                            width: emailStep === 1 ? '0%' : '100%',
                            height: '3px',
                            background: 'linear-gradient(90deg, #667eea, #764ba2)',
                            position: 'absolute',
                            top: '15px',
                            left: 0,
                            zIndex: 1,
                            transition: 'width 0.3s ease'
                        }}></div>
                        {[1, 2].map((step) => (
                            <div key={step} style={{
                                width: '35px',
                                height: '35px',
                                borderRadius: '50%',
                                background: emailStep >= step ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e9ecef',
                                color: emailStep >= step ? 'white' : '#6c757d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                zIndex: 2,
                                position: 'relative',
                                transition: 'all 0.3s ease'
                            }}>
                                {step}
                            </div>
                        ))}
                    </div>

                    {emailError && (
                        <Alert variant="danger" style={{ borderRadius: '10px', borderLeft: '4px solid #dc3545' }}>
                            <strong>⚠️</strong> {emailError}
                        </Alert>
                    )}

                    {/* Step 1: Enter New Email */}
                    {emailStep === 1 && (
                        <>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#fff3cd',
                                borderRadius: '10px',
                                marginBottom: '25px',
                                borderLeft: '4px solid #ffc107'
                            }}>
                                <p style={{ margin: 0, color: '#856404', fontSize: '0.95rem' }}>
                                    <strong>⚠️ Important</strong><br />
                                    We'll send a verification code to your new email address to confirm the change.
                                </p>
                            </div>

                            <div style={{
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '10px',
                                marginBottom: '20px'
                            }}>
                                <small style={{ color: '#6c757d' }}>
                                    <strong>Current Email:</strong> {userDetails.email || 'Not set'}
                                </small>
                            </div>

                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                                    📧 New Email Address
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your new email address"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    disabled={isSendingEmailCode}
                                    style={{
                                        borderRadius: '10px',
                                        padding: '12px 15px',
                                        border: '2px solid #e9ecef',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                />
                                <Form.Text style={{
                                    display: 'block',
                                    marginTop: '8px',
                                    fontSize: '0.85rem',
                                    color: '#6c757d'
                                }}>
                                    Make sure you have access to this email to receive the verification code
                                </Form.Text>
                            </Form.Group>
                        </>
                    )}

                    {/* Step 2: Enter Verification Code */}
                    {emailStep === 2 && (
                        <>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#e8f5e9',
                                borderRadius: '10px',
                                marginBottom: '25px',
                                borderLeft: '4px solid #4caf50',
                                textAlign: 'center'
                            }}>
                                <p style={{ margin: 0, color: '#2e7d32', fontSize: '0.95rem' }}>
                                    <strong>✉️ Verification Code Sent!</strong><br />
                                    Check your inbox at <strong>{newEmail}</strong>
                                </p>
                            </div>

                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px', textAlign: 'center', display: 'block' }}>
                                    🔢 Enter Verification Code
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="• • • • • •"
                                    value={emailEnteredCode}
                                    onChange={(e) => setEmailEnteredCode(e.target.value)}
                                    maxLength={6}
                                    style={{
                                        fontSize: '1.8rem',
                                        letterSpacing: '0.8rem',
                                        textAlign: 'center',
                                        borderRadius: '10px',
                                        padding: '20px',
                                        border: '2px solid #667eea',
                                        fontWeight: '700',
                                        color: '#667eea'
                                    }}
                                />
                            </Form.Group>

                            <div className="text-center mt-4" style={{
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '10px'
                            }}>
                                <small style={{ color: '#6c757d' }}>
                                    Didn't receive the code?
                                    <span
                                        style={{
                                            color: '#667eea',
                                            cursor: 'pointer',
                                            marginLeft: '5px',
                                            fontWeight: '600'
                                        }}
                                        onClick={() => {
                                            setEmailStep(1);
                                            setEmailEnteredCode('');
                                        }}
                                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                    >
                                        🔄 Change Email
                                    </span>
                                </small>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '2px solid #e9ecef', padding: '20px 30px' }}>
                    {emailStep === 1 && (
                        <>
                            <Button
                                variant="secondary"
                                onClick={closeEditEmailModal}
                                style={{
                                    borderRadius: '10px',
                                    padding: '10px 25px',
                                    fontWeight: '600'
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={sendEmailVerificationCode}
                                disabled={isSendingEmailCode}
                                style={{
                                    background: isSendingEmailCode ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '10px 25px',
                                    fontWeight: '600',
                                    boxShadow: isSendingEmailCode ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                                    cursor: isSendingEmailCode ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isSendingEmailCode ? '📤 Sending...' : '📧 Send Verification Code'}
                            </Button>
                        </>
                    )}
                    {emailStep === 2 && (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => setEmailStep(1)}
                                style={{
                                    borderRadius: '10px',
                                    padding: '10px 25px',
                                    fontWeight: '600'
                                }}
                            >
                                ← Back
                            </Button>
                            <Button
                                onClick={verifyEmailCode}
                                style={{
                                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '10px 25px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)'
                                }}
                            >
                                ✓ Verify & Update Email
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Edit Profile Modal - Admin Only */}
            {userDetails.role_name === 'Admin' && (
                <Modal show={showEditProfileModal} onHide={closeEditProfileModal} centered size="lg">
                    <Modal.Header closeButton style={{ borderBottom: '2px solid #4caf50', background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)', color: 'white' }}>
                        <Modal.Title style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>✏️</span> Edit Profile Details
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '30px', maxHeight: '70vh', overflowY: 'auto' }}>
                        {editProfileError && (
                            <Alert variant="danger" style={{ borderRadius: '10px', borderLeft: '4px solid #dc3545', marginBottom: '20px' }}>
                                <strong>⚠️</strong> {editProfileError}
                            </Alert>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            {/* First Name */}
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                                    👤 First Name <span style={{ color: '#dc3545' }}>*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter first name"
                                    value={editFname}
                                    onChange={(e) => setEditFname(e.target.value)}
                                    style={{
                                        borderRadius: '10px',
                                        padding: '12px 15px',
                                        border: '2px solid #e9ecef',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4caf50'}
                                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                />
                            </Form.Group>

                            {/* Middle Name */}
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                                    👤 Middle Name <span style={{ color: '#dc3545' }}>*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter middle name"
                                    value={editMname}
                                    onChange={(e) => setEditMname(e.target.value)}
                                    style={{
                                        borderRadius: '10px',
                                        padding: '12px 15px',
                                        border: '2px solid #e9ecef',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4caf50'}
                                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                />
                            </Form.Group>

                            {/* Last Name */}
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                                    👤 Last Name <span style={{ color: '#dc3545' }}>*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter last name"
                                    value={editLname}
                                    onChange={(e) => setEditLname(e.target.value)}
                                    style={{
                                        borderRadius: '10px',
                                        padding: '12px 15px',
                                        border: '2px solid #e9ecef',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4caf50'}
                                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                />
                            </Form.Group>

                            {/* Phone */}
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                                    📞 Phone <span style={{ color: '#dc3545' }}>*</span>
                                </Form.Label>
                                <Form.Control
                                    type="tel"
                                    placeholder="Enter phone number"
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    style={{
                                        borderRadius: '10px',
                                        padding: '12px 15px',
                                        border: '2px solid #e9ecef',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4caf50'}
                                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                />
                            </Form.Group>

                            {/* Address */}
                            <Form.Group style={{ gridColumn: 'span 2' }}>
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                                    📍 Address <span style={{ color: '#dc3545' }}>*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter address"
                                    value={editAddress}
                                    onChange={(e) => setEditAddress(e.target.value)}
                                    style={{
                                        borderRadius: '10px',
                                        padding: '12px 15px',
                                        border: '2px solid #e9ecef',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4caf50'}
                                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                />
                            </Form.Group>

                            {/* Birthdate */}
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                                    🎂 Birthdate <span style={{ color: '#dc3545' }}>*</span>
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    value={editBirthdate}
                                    onChange={(e) => setEditBirthdate(e.target.value)}
                                    style={{
                                        borderRadius: '10px',
                                        padding: '12px 15px',
                                        border: '2px solid #e9ecef',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4caf50'}
                                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                />
                            </Form.Group>

                            {/* Role */}
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                                    💼 Role <span style={{ color: '#dc3545' }}>*</span>
                                </Form.Label>
                                <Form.Select
                                    value={editRole}
                                    onChange={handleRoleChange}
                                    style={{
                                        borderRadius: '10px',
                                        padding: '12px 15px',
                                        border: '2px solid #e9ecef',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4caf50'}
                                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                >
                                    <option value="">Select Role</option>
                                    {roleList.map((role) => (
                                        <option key={role.role_id} value={role.role_id}>
                                            {role.role_name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {/* Location */}
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                                    📍 Location <span style={{ color: '#dc3545' }}>*</span>
                                </Form.Label>
                                <Form.Select
                                    value={editLocation}
                                    onChange={handleLocationChange}
                                    style={{
                                        borderRadius: '10px',
                                        padding: '12px 15px',
                                        border: '2px solid #e9ecef',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4caf50'}
                                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                >
                                    <option value="">Select Location</option>
                                    {locationList.map((location) => (
                                        <option key={location.location_id} value={location.location_id}>
                                            {location.location_name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {/* Account Status */}
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                                    ✨ Account Status <span style={{ color: '#dc3545' }}>*</span>
                                </Form.Label>
                                <Form.Select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    style={{
                                        borderRadius: '10px',
                                        padding: '12px 15px',
                                        border: '2px solid #e9ecef',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4caf50'}
                                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                >
                                    <option value="">Select Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Suspend">Suspend</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: '2px solid #e9ecef', padding: '20px 30px' }}>
                        <Button
                            variant="secondary"
                            onClick={closeEditProfileModal}
                            style={{
                                borderRadius: '10px',
                                padding: '10px 25px',
                                fontWeight: '600'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={updateProfile}
                            style={{
                                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '10px 25px',
                                fontWeight: '600',
                                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)'
                            }}
                        >
                            💾 Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default ProfileSetting;
