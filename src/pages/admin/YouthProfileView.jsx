import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  IoArrowBackOutline, 
  IoDownloadOutline, 
  IoPrintOutline,
  IoPersonOutline,
  IoCallOutline,
  IoLocationOutline,
  IoCheckboxOutline,
  IoPeopleOutline,
  IoInformationCircleOutline
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { generateYouthProfilePDF } from '../../utils/pdfGenerator';

const YouthProfileView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [youth, setYouth] = useState(null);

  useEffect(() => {
    // Fetch youth profile data from API
    // For demo, using localStorage data
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        // const response = await api.getYouthProfile(id);
        // setProfile(response.data);
        
        // Demo data from localStorage
        const savedProfile = localStorage.getItem('youthProfile');
        let parsed = null;
        if (savedProfile) {
          parsed = JSON.parse(savedProfile);
          setProfile(parsed);
        }
        
        // Mock youth data
        setYouth({
          id: id || '1',
          firstName: parsed?.firstName || 'Juan',
          lastName: parsed?.lastName || 'Dela Cruz',
          email: parsed?.email || 'juan@example.com',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleDownloadPDF = () => {
    if (profile) {
      generateYouthProfilePDF(profile, youth);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <IoInformationCircleOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">No Profile Found</h3>
        <p className="text-gray-500">This youth member has not completed their profile yet.</p>
        <button 
          onClick={() => navigate('/admin/youth')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Youth List
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/youth')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <IoArrowBackOutline className="w-5 h-5" />
            Back to Youth List
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Youth Profile</h1>
            <p className="text-gray-500 mt-1">
              {youth?.firstName} {youth?.lastName} • {profile.age || 'Age not set'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="primary" 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2"
          >
            <IoDownloadOutline className="w-4 h-4" />
            Download PDF
          </Button>
          <Button 
            variant="secondary" 
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <IoPrintOutline className="w-4 h-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
              {profile.firstName?.[0] || 'U'}{profile.lastName?.[0] || 'S'}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mt-4">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-sm text-gray-500">{profile.age} years old • {profile.sex || 'Gender not set'}</p>
            <div className="mt-4 w-full pt-4 border-t border-gray-200 space-y-2">
              <p className="text-sm text-gray-600 flex justify-between">
                <span className="font-medium">Barangay:</span>
                <span>{profile.barangay || 'N/A'}</span>
              </p>
              <p className="text-sm text-gray-600 flex justify-between">
                <span className="font-medium">Civil Status:</span>
                <span>{profile.civilStatus || 'N/A'}</span>
              </p>
              <p className="text-sm text-gray-600 flex justify-between">
                <span className="font-medium">SK Voter:</span>
                <span className={profile.isSKVoter === 'Yes' ? 'text-green-600' : 'text-gray-500'}>
                  {profile.isSKVoter || 'N/A'}
                </span>
              </p>
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2 p-6">
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3">
                <span className="p-2 bg-blue-100 rounded-lg">
                  <IoPersonOutline className="w-5 h-5 text-blue-600" />
                </span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div><span className="text-sm text-gray-500">First Name</span><p className="font-medium">{profile.firstName || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Last Name</span><p className="font-medium">{profile.lastName || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Middle Name</span><p className="font-medium">{profile.middleName || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Suffix</span><p className="font-medium">{profile.suffix || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Age</span><p className="font-medium">{profile.age || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Sex</span><p className="font-medium">{profile.sex || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Birthday</span><p className="font-medium">{profile.birthday || 'N/A'}</p></div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3">
                <span className="p-2 bg-emerald-100 rounded-lg">
                  <IoCallOutline className="w-5 h-5 text-emerald-600" />
                </span>
                Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div><span className="text-sm text-gray-500">Email</span><p className="font-medium">{profile.email || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Contact Number</span><p className="font-medium">{profile.contactNo || 'N/A'}</p></div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3">
                <span className="p-2 bg-purple-100 rounded-lg">
                  <IoLocationOutline className="w-5 h-5 text-purple-600" />
                </span>
                Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div><span className="text-sm text-gray-500">Region</span><p className="font-medium">{profile.region || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Province</span><p className="font-medium">{profile.province || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Municipality</span><p className="font-medium">{profile.municipality || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Barangay</span><p className="font-medium">{profile.barangay || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Purok/Zone</span><p className="font-medium">{profile.purokZone || 'N/A'}</p></div>
              </div>
            </div>

            {/* Demographic */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3">
                <span className="p-2 bg-orange-100 rounded-lg">
                  <IoPeopleOutline className="w-5 h-5 text-orange-600" />
                </span>
                Demographic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div><span className="text-sm text-gray-500">Civil Status</span><p className="font-medium">{profile.civilStatus || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Work Status</span><p className="font-medium">{profile.workStatus || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Youth Age Group</span><p className="font-medium">{profile.youthAgeGroup || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Educational Background</span><p className="font-medium">{profile.educationalBackground || 'N/A'}</p></div>
                <div className="md:col-span-2"><span className="text-sm text-gray-500">Youth Classification</span><p className="font-medium">{profile.youthClassification?.join(', ') || 'N/A'}</p></div>
              </div>
            </div>

            {/* Voter Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3">
                <span className="p-2 bg-red-100 rounded-lg">
                  <IoCheckboxOutline className="w-5 h-5 text-red-600" />
                </span>
                Voter Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div><span className="text-sm text-gray-500">Registered SK Voter?</span><p className="font-medium">{profile.isSKVoter || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Voted last SK election?</span><p className="font-medium">{profile.votedLastSK || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Registered National Voter?</span><p className="font-medium">{profile.isNationalVoter || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Times Voted</span><p className="font-medium">{profile.timesVoted || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Attended KK Assembly?</span><p className="font-medium">{profile.attendedKKAssembly || 'N/A'}</p></div>
                {profile.attendedKKAssembly === 'No' && (
                  <div><span className="text-sm text-gray-500">Why not?</span><p className="font-medium">{profile.whyNotAttend || 'N/A'}</p></div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default YouthProfileView;
