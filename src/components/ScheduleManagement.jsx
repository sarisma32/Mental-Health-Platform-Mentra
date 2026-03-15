import React, { useState, useEffect } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [formData, setFormData] = useState({
    scheduleDate: '',
    startTime: '09:00',
    endTime: '17:00'
  });
  const [notification, setNotification] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(0);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Get schedules for next 3 months
      const today = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      
      const startDate = today.toISOString().split('T')[0];
      const endDate = threeMonthsLater.toISOString().split('T')[0];
      
      const response = await fetch(
        buildApiUrl(`${API_ENDPOINTS.DOCTOR_SCHEDULE}/${user.id}?startDate=${startDate}&endDate=${endDate}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setSchedules(data.schedule || []);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      showNotification('Failed to load schedules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.scheduleDate || !formData.startTime || !formData.endTime) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      showNotification('Start time must be before end time', 'error');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.ADD_SCHEDULE_SLOT),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();
      
      if (data.success) {
        showNotification('Schedule slot added successfully!', 'success');
        setShowAddForm(false);
        setFormData({ scheduleDate: '', startTime: '09:00', endTime: '17:00' });
        fetchSchedules();
      } else {
        showNotification(data.message || 'Failed to add schedule slot', 'error');
      }
    } catch (error) {
      console.error('Error adding schedule:', error);
      showNotification('Failed to add schedule slot', 'error');
    }
  };

  const handleDeleteSchedule = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this schedule slot?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        buildApiUrl(`${API_ENDPOINTS.DELETE_SCHEDULE_SLOT}/${slotId}`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        showNotification('Schedule slot deleted successfully!', 'success');
        fetchSchedules();
      } else {
        showNotification(data.message || 'Failed to delete schedule slot', 'error');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      showNotification('Failed to delete schedule slot', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate calendar for date selection
  const getAvailableMonths = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push({
        name: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        year: date.getFullYear(),
        month: date.getMonth(),
        daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
        firstDayOfWeek: date.getDay()
      });
    }
    return months;
  };

  const availableMonths = getAvailableMonths();
  const currentMonthData = availableMonths[currentMonth];

  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    const isCurrentMonth = currentMonth === 0;
    
    // Empty cells for days before month starts
    for (let i = 0; i < currentMonthData.firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= currentMonthData.daysInMonth; day++) {
      const isPastDate = isCurrentMonth && day < today.getDate();
      const dateString = `${currentMonthData.year}-${(currentMonthData.month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const hasSchedule = schedules.some(s => s.schedule_date === dateString);
      
      days.push({
        day,
        isPastDate,
        dateString,
        hasSchedule
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const nextMonth = () => {
    if (currentMonth < 2) {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth > 0) {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
    setFormData({ ...formData, scheduleDate: dateString });
    setShowAddForm(true);
  };

  // Group schedules by date
  const groupSchedulesByDate = () => {
    const grouped = {};
    schedules.forEach(schedule => {
      const date = schedule.schedule_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(schedule);
    });
    return grouped;
  };

  const groupedSchedules = groupSchedulesByDate();
  const sortedDates = Object.keys(groupedSchedules).sort();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3B18A] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Your Schedule</h2>
            <p className="text-gray-600 mt-1">Select dates and set your available time slots</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#A3B18A] hover:bg-[#8FA076] text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{showAddForm ? 'Cancel' : 'Add Time Slot'}</span>
          </button>
        </div>
      </div>

      {/* Add Schedule Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Time Slot</h3>
          
          {/* Calendar for date selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Date
            </label>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <button 
                  type="button" 
                  onClick={prevMonth}
                  disabled={currentMonth === 0}
                  className={`p-2 rounded transition-colors ${
                    currentMonth === 0 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h4 className="text-lg font-semibold text-gray-900">{currentMonthData.name}</h4>
                <button 
                  type="button" 
                  onClick={nextMonth}
                  disabled={currentMonth === 2}
                  className={`p-2 rounded transition-colors ${
                    currentMonth === 2 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dayData, index) => {
                  if (!dayData) {
                    return <div key={`empty-${index}`} className="p-3"></div>;
                  }
                  
                  const { day, isPastDate, dateString, hasSchedule } = dayData;
                  const isSelected = formData.scheduleDate === dateString;
                  
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => !isPastDate && handleDateSelect(dateString)}
                      disabled={isPastDate}
                      className={`p-3 text-sm rounded-lg transition-all duration-200 relative ${
                        isPastDate
                          ? 'text-gray-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#A3B18A] text-white font-semibold'
                          : hasSchedule
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {day}
                      {hasSchedule && !isSelected && (
                        <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {formData.scheduleDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Selected Date:</span> {formatDate(formData.scheduleDate)}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ scheduleDate: '', startTime: '09:00', endTime: '17:00' });
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.scheduleDate}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  formData.scheduleDate
                    ? 'bg-[#A3B18A] hover:bg-[#8FA076] text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedule List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Schedule</h3>
        
        {schedules.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 mb-4">No schedule slots added yet</p>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="text-[#A3B18A] hover:text-[#8FA076] font-medium"
            >
              Add your first time slot
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDates.map(date => {
              const dateSchedules = groupedSchedules[date];
              
              return (
                <div key={date} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 text-[#A3B18A] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(date)}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {dateSchedules.map(schedule => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-[#A3B18A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-900 font-medium">
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete slot"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">How Schedule Management Works</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Select specific dates from the calendar</li>
              <li>• Set your available time slots for each date</li>
              <li>• Patients can only book appointments on dates you've set</li>
              <li>• You can add multiple time slots per date</li>
              <li>• Delete slots you no longer want to be available</li>
              <li>• Green highlighted dates have existing schedules</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;
