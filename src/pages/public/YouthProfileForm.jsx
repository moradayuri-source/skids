import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackOutline, IoCloudUploadOutline, IoPersonOutline } from 'react-icons/io5';

const YOUTH_PROFILE_DRAFT_KEY = 'skidsYouthProfileDraft';

const YouthProfileForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    suffix: '',
    region: '',
    province: '',
    municipality: '',
    barangay: '',
    purok: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem(YOUTH_PROFILE_DRAFT_KEY, JSON.stringify(formData));
    navigate('/create-account');
  };

  const handleBack = () => {
    navigate('/terms');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 flex items-start justify-center px-4 py-10 overflow-y-auto" style={{ height: '100vh', overflowY: 'auto' }}>
      <div className="w-full max-w-2xl my-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-blue-500 to-yellow-400"></div>

          {/* Back Button */}
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-8 mt-2"
          >
            <IoArrowBackOutline className="w-4 h-4" />
            Back
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400/20 to-blue-500/20 flex items-center justify-center shadow-lg shadow-yellow-500/20 border-2 border-yellow-400/30">
                <IoPersonOutline className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-yellow-400">SK</span>
                <span className="text-blue-600">IDS</span>
              </span>
              <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-400 to-blue-500 rounded-full"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mt-4">Youth Personal Information</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload your 2x2 Photo (if available)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer hover:bg-blue-50/50">
                <IoCloudUploadOutline className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="Enter middle name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Suffix (if applicable)
                </label>
                <input
                  type="text"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="e.g., Jr., Sr., III"
                />
              </div>
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Region
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="Enter region"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Province
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="Enter province"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Municipality
                </label>
                <input
                  type="text"
                  name="municipality"
                  value={formData.municipality}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="Enter municipality"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Barangay
                </label>
                <input
                  type="text"
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="Enter barangay"
                />
              </div>
            </div>

            {/* Purok/Zone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Purok/Zone
              </label>
              <input
                type="text"
                name="purok"
                value={formData.purok}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                placeholder="Enter Purok/Zone"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Submit Information
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default YouthProfileForm;
