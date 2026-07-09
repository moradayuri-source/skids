import { useEffect, useState } from 'react';
import { IoPersonOutline, IoMailOutline, IoCallOutline, IoLocationOutline, IoCameraOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ProfileSkeleton } from '../../components/common/Skeleton';
import { api } from '../../services/api';
import { cloudinaryOptimizedUrl, uploadToCloudinary } from '../../services/upload';
import useAuth from '../../hooks/useAuth';

const mapProfile = (user) => ({
  name: user?.name || 'Juan Dela Cruz',
  age: user?.profile?.age || '',
  gender: user?.profile?.gender || 'Male',
  email: user?.email || '',
  contact: user?.profile?.contact || '',
  barangay: user?.barangay || 'Masagui',
  civilStatus: user?.profile?.civilStatus || 'Single',
  voterStatus: user?.profile?.voterStatus || 'Registered',
  workStatus: user?.profile?.workStatus || 'Student',
  avatar: user?.avatar || '',
  avatarPublicId: user?.avatarPublicId || '',
});

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(() => mapProfile(user));
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await api.user.getProfile();
        if (isMounted) {
          setProfile(mapProfile(response.data));
          updateUser(response.data);
        }
      } catch {
        if (isMounted) {
          setProfile((current) => current);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [updateUser]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview('');
      return undefined;
    }

    const preview = URL.createObjectURL(avatarFile);
    setAvatarPreview(preview);

    return () => URL.revokeObjectURL(preview);
  }, [avatarFile]);

  const handleInputChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    setAvatarFile(e.target.files[0] || null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      let uploadedAvatar = null;

      if (avatarFile) {
        uploadedAvatar = await uploadToCloudinary(avatarFile, {
          purpose: 'avatars',
        });
      }

      const response = await api.user.updateProfile({
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        contact: profile.contact,
        barangay: profile.barangay,
        civilStatus: profile.civilStatus,
        voterStatus: profile.voterStatus,
        workStatus: profile.workStatus,
        ...(uploadedAvatar && {
          avatar: uploadedAvatar.secureUrl,
          avatarPublicId: uploadedAvatar.publicId,
          avatarMetadata: uploadedAvatar,
        }),
      });

      setProfile(mapProfile(response.data));
      updateUser(response.data);
      setAvatarFile(null);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = avatarPreview || cloudinaryOptimizedUrl(
    profile.avatar,
    'c_fill,w_256,h_256,g_face,f_auto,q_auto'
  );

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">View and manage your personal information.</p>
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">View and manage your personal information.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 overflow-hidden rounded-full bg-primary-100 flex items-center justify-center">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <IoPersonOutline className="w-16 h-16 text-primary-600" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white shadow-md hover:bg-primary-700">
                  <IoCameraOutline className="h-5 w-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.age || '-'} years old</p>
            <div className="mt-4 w-full pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Barangay {profile.barangay}</p>
              <p className="text-sm text-gray-600">{profile.voterStatus}</p>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            {!isEditing ? (
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button variant="success" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                icon={IoPersonOutline}
              />
              <Input
                label="Age"
                name="age"
                type="number"
                value={profile.age}
                onChange={handleInputChange}
                disabled={!isEditing}
                icon={IoPersonOutline}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                value={profile.email}
                disabled
                icon={IoMailOutline}
              />
              <Input
                label="Contact Number"
                name="contact"
                value={profile.contact}
                onChange={handleInputChange}
                disabled={!isEditing}
                icon={IoCallOutline}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Barangay"
                name="barangay"
                value={profile.barangay}
                onChange={handleInputChange}
                disabled={!isEditing}
                icon={IoLocationOutline}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label>
                <select
                  name="civilStatus"
                  value={profile.civilStatus}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Status</label>
                <select
                  name="workStatus"
                  value={profile.workStatus}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                >
                  <option value="Student">Student</option>
                  <option value="Employed">Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Self-employed">Self-employed</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
