import { useState, useEffect } from 'react';
import { 
  IoPersonOutline, 
  IoMailOutline, 
  IoEyeOffOutline,
  IoEyeOutline,
  IoSaveOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';

const UserBasicProfile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Form State - Name & Email Only
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await updateProfile(profileData);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    if (!passwordData.currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    setIsSaving(true);

    try {
      await changePassword(passwordData);
      setSuccessMessage('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to change password.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account information and security.</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <IoCheckmarkCircleOutline className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
          {errorMessage}
        </div>
      )}

      {/* Profile Information */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          {!isEditing ? (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                <IoCloseOutline className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button variant="success" onClick={handleSaveProfile} disabled={isSaving}>
                <IoSaveOutline className="w-4 h-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
                disabled={!isEditing}
                icon={IoPersonOutline}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
                disabled={!isEditing}
                icon={IoPersonOutline}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              name="email"
              type="email"
              value={profileData.email}
              onChange={handleProfileChange}
              disabled={!isEditing}
              icon={IoMailOutline}
              placeholder="email@example.com"
            />
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <IoShieldCheckmarkOutline className="w-5 h-5 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 bg-white"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 bg-white"
                placeholder="Enter new password (min. 6 characters)"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 bg-white"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isSaving}
              className="px-8 py-2.5"
            >
              {isSaving ? 'Changing Password...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserBasicProfile;
