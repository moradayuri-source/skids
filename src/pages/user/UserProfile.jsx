import { useEffect, useState } from 'react';
import {
  IoCallOutline,
  IoCameraOutline,
  IoCheckboxOutline,
  IoDownloadOutline,
  IoInformationCircleOutline,
  IoLocationOutline,
  IoMailOutline,
  IoPeopleOutline,
  IoPersonOutline,
} from 'react-icons/io5';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { ProfileSkeleton } from '../../components/common/Skeleton';
import useAuth from '../../hooks/useAuth';
import { api } from '../../services/api';
import { cloudinaryOptimizedUrl, uploadToCloudinary } from '../../services/upload';

const splitExistingName = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    lastName: parts.length > 1 ? parts.at(-1) : '',
  };
};

const mapProfile = (user) => {
  const details = user?.profile || {};
  const nameParts = splitExistingName(user?.name);

  return {
    name: user?.name || '',
    firstName: details.firstName || nameParts.firstName,
    middleName: details.middleName || nameParts.middleName,
    lastName: details.lastName || nameParts.lastName,
    suffix: details.suffix || '',
    age: details.age || '',
    gender: details.gender || '',
    email: user?.email || '',
    contact: details.contact || '',
    address: details.address || '',
    region: details.region || '',
    province: details.province || '',
    municipality: details.municipality || '',
    barangay: user?.barangay || '',
    purokZone: details.purokZone || '',
    civilStatus: details.civilStatus || '',
    workStatus: details.workStatus || '',
    voterStatus: details.voterStatus || '',
    youthAgeGroup: details.youthAgeGroup || '',
    educationalBackground: details.educationalBackground || '',
    youthClassifications: details.youthClassifications || [],
    registeredSkVoter:
      details.registeredSkVoter ||
      (details.voterStatus === 'Registered'
        ? 'Yes'
        : details.voterStatus === 'Not Registered'
          ? 'No'
          : ''),
    votedLastSkElection: details.votedLastSkElection || '',
    registeredNationalVoter: details.registeredNationalVoter || '',
    attendedSkAssembly: details.attendedSkAssembly || '',
    assemblyAttendance: details.assemblyAttendance || '',
    avatar: user?.avatar || '',
    avatarPublicId: user?.avatarPublicId || '',
  };
};

const tabs = [
  { id: 'personal', label: 'Personal Info', icon: IoPersonOutline, active: 'bg-primary-600 text-white' },
  { id: 'contact', label: 'Contact Details', icon: IoCallOutline, active: 'bg-emerald-600 text-white' },
  { id: 'location', label: 'Location', icon: IoLocationOutline, active: 'bg-violet-600 text-white' },
  { id: 'demographic', label: 'Demographic', icon: IoPeopleOutline, active: 'bg-orange-500 text-white' },
  { id: 'voter', label: 'Voter Info', icon: IoCheckboxOutline, active: 'bg-rose-600 text-white' },
];

const sectionStyles = {
  personal: {
    panel: 'border-blue-100 bg-blue-50/55',
    icon: 'bg-blue-100 text-blue-600',
  },
  contact: {
    panel: 'border-emerald-100 bg-emerald-50/55',
    icon: 'bg-emerald-100 text-emerald-600',
  },
  location: {
    panel: 'border-violet-100 bg-violet-50/55',
    icon: 'bg-violet-100 text-violet-600',
  },
  demographic: {
    panel: 'border-orange-100 bg-orange-50/55',
    icon: 'bg-orange-100 text-orange-600',
  },
  voter: {
    panel: 'border-rose-100 bg-rose-50/55',
    icon: 'bg-rose-100 text-rose-600',
  },
};

const youthClassificationOptions = [
  'In School Youth',
  'Out of School Youth',
  'Working Youth',
  'Person with Disability',
  'Children in Conflict with Law',
  'Indigenous People',
  'Youth with Specific Needs',
];

const selectClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 disabled:bg-slate-50 disabled:text-slate-500';

const SelectField = ({ label, name, value, onChange, disabled, options, required = false }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
      {label}{required && <span className="ml-1 text-rose-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={selectClassName}
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const RadioField = ({ label, name, value, onChange, disabled, options = ['Yes', 'No'] }) => (
  <fieldset className="rounded-xl border border-slate-200/70 bg-white/70 p-4">
    <legend className="px-1 text-xs font-semibold text-slate-700">{label}</legend>
    <div className="mt-2 flex flex-wrap gap-5">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={onChange}
            disabled={disabled}
            className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          {option}
        </label>
      ))}
    </div>
  </fieldset>
);

const SectionPanel = ({ type, title, icon: Icon, children }) => {
  const styles = sectionStyles[type];
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${styles.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>
      <div className={`rounded-xl border p-4 sm:p-5 ${styles.panel}`}>
        {children}
      </div>
    </Card>
  );
};

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(() => mapProfile(user));
  const [activeTab, setActiveTab] = useState('personal');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    api.user
      .getProfile()
      .then((response) => {
        if (!isMounted) return;
        setProfile(mapProfile(response.data));
        updateUser(response.data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) setLoading(false);
      });
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

  const handleInputChange = (event) => {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleClassificationChange = (classification) => {
    setProfile((current) => ({
      ...current,
      youthClassifications: current.youthClassifications.includes(classification)
        ? current.youthClassifications.filter((item) => item !== classification)
        : [...current.youthClassifications, classification],
    }));
  };

  const handleCancel = () => {
    setProfile(mapProfile(user));
    setAvatarFile(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      let uploadedAvatar = null;
      if (avatarFile) {
        uploadedAvatar = await uploadToCloudinary(avatarFile, { purpose: 'avatars' });
      }

      const response = await api.user.updateProfile({
        name: profile.name,
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName,
        suffix: profile.suffix,
        age: profile.age,
        gender: profile.gender,
        contact: profile.contact,
        address: profile.address,
        region: profile.region,
        province: profile.province,
        municipality: profile.municipality,
        barangay: profile.barangay,
        purokZone: profile.purokZone,
        civilStatus: profile.civilStatus,
        voterStatus: profile.voterStatus,
        workStatus: profile.workStatus,
        youthAgeGroup: profile.youthAgeGroup,
        educationalBackground: profile.educationalBackground,
        youthClassifications: profile.youthClassifications,
        registeredSkVoter: profile.registeredSkVoter,
        votedLastSkElection: profile.votedLastSkElection,
        registeredNationalVoter: profile.registeredNationalVoter,
        attendedSkAssembly: profile.attendedSkAssembly,
        assemblyAttendance: profile.assemblyAttendance,
        ...(uploadedAvatar && {
          avatar: uploadedAvatar.secureUrl,
          avatarPublicId: uploadedAvatar.publicId,
          avatarMetadata: uploadedAvatar,
        }),
      });

      const savedProfile = mapProfile(response.data);
      setProfile(savedProfile);
      updateUser(response.data);
      setAvatarFile(null);
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError.response?.data?.message || saveError.message || 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadProfile = async () => {
    setDownloading(true);
    setError('');
    try {
      const { generateYouthProfilePDF } = await import('../../utils/pdfGenerator');
      await generateYouthProfilePDF(profile);
    } catch (downloadError) {
      setError(downloadError.message || 'Unable to generate your personal information PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const completionValues = [
    profile.firstName,
    profile.middleName,
    profile.lastName,
    profile.age,
    profile.gender,
    profile.email,
    profile.contact,
    profile.region,
    profile.province,
    profile.municipality,
    profile.barangay,
    profile.purokZone,
    profile.civilStatus,
    profile.workStatus,
    profile.youthAgeGroup,
    profile.educationalBackground,
    profile.youthClassifications.length ? 'complete' : '',
    profile.registeredSkVoter,
    profile.votedLastSkElection,
    profile.registeredNationalVoter,
    profile.attendedSkAssembly,
    profile.attendedSkAssembly === 'Yes' ? profile.assemblyAttendance : 'not-applicable',
  ];
  const completedFields = completionValues.filter((value) => String(value || '').trim()).length;
  const completionPercent = Math.round((completedFields / completionValues.length) * 100);
  const avatarSrc = avatarPreview || cloudinaryOptimizedUrl(
    profile.avatar,
    'c_fill,w_256,h_256,g_face,f_auto,q_auto'
  );

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Complete and manage your personal information profile.</p>
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Complete and manage your personal information profile.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Card className="mb-5 overflow-hidden p-0">
        <div className="flex flex-col gap-5 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-primary-100 shadow-lg">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <IoPersonOutline className="h-10 w-10 text-primary-600" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white shadow hover:bg-primary-700">
                  <IoCameraOutline className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => setAvatarFile(event.target.files?.[0] || null)} />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{profile.name || 'Your Name'}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Age {profile.age || 'not set'} - {profile.gender || 'Gender not set'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">Status active</span>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                  Barangay {profile.barangay || 'not set'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleDownloadProfile} disabled={downloading || saving}>
              <IoDownloadOutline className="mr-2 h-4 w-4" />
              {downloading ? 'Generating...' : 'Download Personal Form'}
            </Button>
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={handleCancel} disabled={saving}>Cancel</Button>
                <Button variant="success" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </div>
      </Card>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ id, label, icon: Icon, active }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === id ? active : 'bg-white text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'personal' && (
        <SectionPanel type="personal" title="Personal Information" icon={IoPersonOutline}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="First Name" name="firstName" value={profile.firstName} onChange={handleInputChange} disabled={!isEditing} required />
            <Input label="Last Name" name="lastName" value={profile.lastName} onChange={handleInputChange} disabled={!isEditing} required />
            <Input label="Middle Name" name="middleName" value={profile.middleName} onChange={handleInputChange} disabled={!isEditing} />
            <Input label="Suffix" name="suffix" value={profile.suffix} onChange={handleInputChange} disabled={!isEditing} placeholder="Jr., Sr., III" />
            <Input label="Age" name="age" type="number" min="15" max="30" value={profile.age} onChange={handleInputChange} disabled={!isEditing} required />
            <SelectField
              label="Sex"
              name="gender"
              value={profile.gender}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
              options={['Male', 'Female', 'Other', 'Prefer not to say']}
            />
          </div>
        </SectionPanel>
      )}

      {activeTab === 'contact' && (
        <SectionPanel type="contact" title="Contact Details" icon={IoCallOutline}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Email Address" name="email" type="email" value={profile.email} disabled icon={IoMailOutline} required />
            <Input label="Contact Number" name="contact" value={profile.contact} onChange={handleInputChange} disabled={!isEditing} icon={IoCallOutline} />
          </div>
        </SectionPanel>
      )}

      {activeTab === 'location' && (
        <SectionPanel type="location" title="Location" icon={IoLocationOutline}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Region" name="region" value={profile.region} onChange={handleInputChange} disabled={!isEditing} />
            <Input label="Province" name="province" value={profile.province} onChange={handleInputChange} disabled={!isEditing} />
            <Input label="Municipality" name="municipality" value={profile.municipality} onChange={handleInputChange} disabled={!isEditing} />
            <Input label="Barangay" name="barangay" value={profile.barangay} onChange={handleInputChange} disabled={!isEditing} />
            <div className="md:col-span-2">
              <Input label="Purok / Zone" name="purokZone" value={profile.purokZone} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div className="md:col-span-2">
              <Input label="Complete Address" name="address" value={profile.address} onChange={handleInputChange} disabled={!isEditing} helper="Optional additional address details for the generated form." />
            </div>
          </div>
        </SectionPanel>
      )}

      {activeTab === 'demographic' && (
        <SectionPanel type="demographic" title="Demographic Information" icon={IoPeopleOutline}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField label="Civil Status" name="civilStatus" value={profile.civilStatus} onChange={handleInputChange} disabled={!isEditing} required options={['Single', 'Married', 'Widowed', 'Separated']} />
            <SelectField label="Work Status" name="workStatus" value={profile.workStatus} onChange={handleInputChange} disabled={!isEditing} options={['Student', 'Employed', 'Unemployed', 'Self-employed']} />
            <SelectField label="Youth Age Group" name="youthAgeGroup" value={profile.youthAgeGroup} onChange={handleInputChange} disabled={!isEditing} options={['15-17', '18-24', '25-30']} />
            <SelectField
              label="Educational Background"
              name="educationalBackground"
              value={profile.educationalBackground}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
              options={['Elementary', 'Junior High School', 'Senior High School', 'Vocational', 'College', 'Postgraduate', 'Not in school']}
            />
            <fieldset className="rounded-xl border border-orange-100 bg-white/70 p-4 md:col-span-2">
              <legend className="px-1 text-xs font-semibold text-slate-700">Youth Classification</legend>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {youthClassificationOptions.map((classification) => (
                  <label key={classification} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={profile.youthClassifications.includes(classification)}
                      onChange={() => handleClassificationChange(classification)}
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                    />
                    {classification}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </SectionPanel>
      )}

      {activeTab === 'voter' && (
        <SectionPanel type="voter" title="Voter Information" icon={IoCheckboxOutline}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <RadioField label="Registered SK Voter?" name="registeredSkVoter" value={profile.registeredSkVoter} onChange={handleInputChange} disabled={!isEditing} />
            <RadioField label="Voted last SK election?" name="votedLastSkElection" value={profile.votedLastSkElection} onChange={handleInputChange} disabled={!isEditing} />
            <RadioField label="Registered National Voter?" name="registeredNationalVoter" value={profile.registeredNationalVoter} onChange={handleInputChange} disabled={!isEditing} />
            <div className="md:col-span-3">
              <RadioField label="Have you already attended an SK Assembly?" name="attendedSkAssembly" value={profile.attendedSkAssembly} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            {profile.attendedSkAssembly === 'Yes' && (
              <div className="md:col-span-3">
                <RadioField
                  label="If yes, how many times?"
                  name="assemblyAttendance"
                  value={profile.assemblyAttendance}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  options={['1-2 times', '3-4 times', '5 times & above']}
                />
              </div>
            )}
          </div>
        </SectionPanel>
      )}

      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <IoInformationCircleOutline className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-slate-700">Profile Completion</span>
              <span className="text-xs text-slate-500">
                {completedFields} of {completionValues.length} fields completed
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
          <span className="text-sm font-bold text-primary-700">{completionPercent}%</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
