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

const ProfileSetting = () => {
    const [userDetails, setUserDetails] = useState({});
    const [showModal, setShowModal] = useState(false);

    // Password states
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const user_id = sessionStorage.getItem('user_id');
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'login.php';

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({ user_id: user_id }),
                    operation: 'getUserDetails'
                }
            });

            if (response.data.length > 0) {
                setUserDetails(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    // ✅ Password complexity check
    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
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
            const verifyRes = await axios.get(url, {
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
            await axios.post(url, new URLSearchParams({
                json: JSON.stringify({ userID: user_id, newPassword: newPassword }),
                operation: 'updatePassword'
            }));

            AlertSucces('Password successfully updated!');
            setShowModal(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error changing password:', error);
            showAlertError('Something went wrong!');
        }
    };

    return (
        <div className="customer-main">
            <h3 className="mb-4">👤 Profile Settings</h3>
            <div className="card p-3 shadow-sm">
                <div className="mb-2"><strong>Full Name:</strong> {userDetails.fname} {userDetails.mname} {userDetails.lname}</div>
                <div className="mb-2"><strong>Username:</strong> {userDetails.username}</div>
                <div className="mb-2"><strong>Role:</strong> {userDetails.role_name}</div>
                <div className="mb-2"><strong>Location:</strong> {userDetails.location_name}</div>
                <div className="mb-2"><strong>Status:</strong> {userDetails.active_status === '1' ? 'Active' : 'Inactive'}</div>
                <Button variant="primary" onClick={() => setShowModal(true)}>Change Password</Button>
            </div>

            {/* Modal for password change */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {passwordError && <Alert variant="danger">{passwordError}</Alert>}
                    <Form.Group className="mb-3">
                        <Form.Label>Old Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter old password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Form.Text className="text-muted">
                            Must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleChangePassword}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ProfileSetting;
