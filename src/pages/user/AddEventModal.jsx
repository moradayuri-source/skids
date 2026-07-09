import { useState } from 'react';
import { IoCloseOutline, IoCalendarOutline, IoTimeOutline, IoLocationOutline } from 'react-icons/io5';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const AddEventModal = ({ isOpen, onClose, onSave, eventToEdit }) => {
  const [formData, setFormData] = useState({
    title: eventToEdit?.title || '',
    time: eventToEdit?.time || '',
    description: eventToEdit?.description || '',
    purpose: eventToEdit?.purpose || '',
    eventColor: eventToEdit?.eventColor || '#3B82F6',
    eventDate: eventToEdit?.eventDate || '',
    location: eventToEdit?.location || '',
    venueDetails: eventToEdit?.venueDetails || '',
    procedure: eventToEdit?.procedure || '',
  });

  const [selectedColor, setSelectedColor] = useState(formData.eventColor);

  const colors = [
    { value: '#3B82F6', label: 'Blue' },
    { value: '#10B981', label: 'Green' },
    { value: '#F59E0B', label: 'Yellow' },
    { value: '#EF4444', label: 'Red' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#14B8A6', label: 'Teal' },
    { value: '#F97316', label: 'Orange' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setFormData(prev => ({ ...prev, eventColor: color }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Event"
      size="lg"
      showCloseButton={false}
    >
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <IoCloseOutline className="w-6 h-6" />
        </button>

        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-gray-400">Dashboard</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-400">Calendar</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium">New Event</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">New Event</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              TITLE
            </label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Operation Libreng Tuli"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              TIME
            </label>
            <div className="relative">
              <IoTimeOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* What is the event? */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              WHAT IS THE EVENT?
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="an event organized by the Department of Health. A free circumcision operation on local barangays that happens every year"
              rows="3"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Why is it being held? */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              WHY IS IT BEING HELD?
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="to promote proper hygiene among youngsters and proper care for reproductive health"
              rows="2"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Event Color */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              EVENT COLOR
            </label>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorSelect(color.value)}
                  className={`w-10 h-10 rounded-full transition-all duration-200 ${
                    selectedColor === color.value 
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' 
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              EVENT DATE
            </label>
            <div className="relative">
              <IoCalendarOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              LOCATION
            </label>
            <div className="relative">
              <IoLocationOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Barangay Covered Court"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Where will it happen? */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              WHERE WILL IT HAPPEN?
            </label>
            <textarea
              name="venueDetails"
              value={formData.venueDetails}
              onChange={handleChange}
              placeholder="it will be held on the barangay's covered court"
              rows="2"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* How will it proceed? */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              HOW WILL IT PROCEED?
            </label>
            <textarea
              name="procedure"
              value={formData.procedure}
              onChange={handleChange}
              placeholder="all youth ages 7-15 are prioritized for the operation and all ages above limit are placed on queue."
              rows="2"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-6 py-2.5"
            >
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddEventModal;
