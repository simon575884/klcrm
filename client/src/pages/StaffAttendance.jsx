import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, Users, Clock, Plus, Edit2, Trash2, LogIn, LogOut as LogOutIcon, Calendar } from 'lucide-react';

function StaffAttendance() {
  const [activeTab, setActiveTab] = useState('staff');
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  
  const [staffForm, setStaffForm] = useState({
    name: '', phone: '', email: '', position: '', joining_date: '', status: 'Active'
  });

  const [attendanceForm, setAttendanceForm] = useState({
    staff_id: '', date: '', notes: ''
  });

  useEffect(() => {
    fetchStaff();
    fetchAttendance();
    fetchTodayAttendance();
  }, []);

  const fetchStaff = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('/api/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(response.data);
    } catch (error) {
      console.error('Failed to fetch staff', error);
    }
  };

  const fetchAttendance = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('/api/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance', error);
    }
  };

  const fetchTodayAttendance = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('/api/attendance/today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodayAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch today attendance', error);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (editingStaff) {
        await axios.put(`/api/staff/${editingStaff.id}`, staffForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/staff', staffForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowStaffModal(false);
      resetStaffForm();
      fetchStaff();
    } catch (error) {
      alert(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleCheckIn = async (staffId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('/api/attendance/check-in', { staff_id: staffId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTodayAttendance();
      fetchAttendance();
      alert('Checked in successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Check-in failed');
    }
  };

  const handleCheckOut = async (staffId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('/api/attendance/check-out', { staff_id: staffId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTodayAttendance();
      fetchAttendance();
      alert('Checked out successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Check-out failed');
    }
  };

  const handleMarkLeave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('/api/attendance/leave', attendanceForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAttendanceModal(false);
      resetAttendanceForm();
      fetchAttendance();
      fetchTodayAttendance();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to mark leave');
    }
  };

  const resetStaffForm = () => {
    setStaffForm({ name: '', phone: '', email: '', position: '', joining_date: '', status: 'Active' });
    setEditingStaff(null);
  };

  const resetAttendanceForm = () => {
    setAttendanceForm({ staff_id: '', date: '', notes: '' });
  };

  const handleDeleteStaff = async (id) => {
    if (!confirm('Delete this staff member?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStaff();
    } catch (error) {
      alert('Failed to delete staff');
    }
  };

  const openEditStaffModal = (staffMember) => {
    setEditingStaff(staffMember);
    setStaffForm(staffMember);
    setShowStaffModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-success text-white';
      case 'Leave': return 'bg-warning text-darkBg';
      case 'Absent': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const isCheckedIn = (staffId) => {
    return todayAttendance.find(a => a.staff_id === staffId && a.status === 'Present');
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary flex items-center gap-3">
            <UserCheck className="text-danger" />
            Staff & Attendance
          </h1>
          <p className="text-textSecondary mt-1">Manage staff and track attendance</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'staff'
              ? 'bg-danger text-white shadow-lg'
              : 'bg-darkCard text-textSecondary hover:text-textPrimary border border-borderColor'
          }`}
        >
          <Users className="inline mr-2" size={20} />
          Staff Management
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'attendance'
              ? 'bg-danger text-white shadow-lg'
              : 'bg-darkCard text-textSecondary hover:text-textPrimary border border-borderColor'
          }`}
        >
          <Clock className="inline mr-2" size={20} />
          Attendance Records
        </button>
        <button
          onClick={() => setActiveTab('today')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'today'
              ? 'bg-danger text-white shadow-lg'
              : 'bg-darkCard text-textSecondary hover:text-textPrimary border border-borderColor'
          }`}
        >
          <Calendar className="inline mr-2" size={20} />
          Today's Attendance
        </button>
      </div>

      {/* Staff Management Tab */}
      {activeTab === 'staff' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setShowStaffModal(true); resetStaffForm(); }} className="btn-primary flex items-center gap-2">
              <Plus size={20} /> Add Staff
            </button>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-borderColor">
                  <th className="text-left py-3 px-4 text-textPrimary">Name</th>
                  <th className="text-left py-3 px-4 text-textPrimary">Phone</th>
                  <th className="text-left py-3 px-4 text-textPrimary">Position</th>
                  <th className="text-left py-3 px-4 text-textPrimary">Joining Date</th>
                  <th className="text-left py-3 px-4 text-textPrimary">Status</th>
                  <th className="text-left py-3 px-4 text-textPrimary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b border-borderColor hover:bg-darkCardHover transition-colors">
                    <td className="py-3 px-4 text-textPrimary">{s.name}</td>
                    <td className="py-3 px-4 text-textSecondary">{s.phone}</td>
                    <td className="py-3 px-4 text-textPrimary">{s.position}</td>
                    <td className="py-3 px-4 text-textSecondary">{s.joining_date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${s.status === 'Active' ? 'bg-success text-white' : 'bg-gray-500 text-white'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEditStaffModal(s)} className="text-info hover:text-blue-400">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDeleteStaff(s.id)} className="text-danger hover:text-red-400">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Today's Attendance Tab */}
      {activeTab === 'today' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowAttendanceModal(true)} className="btn-primary flex items-center gap-2">
              <Plus size={20} /> Mark Leave
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {staff.filter(s => s.status === 'Active').map((s) => {
              const checkedIn = isCheckedIn(s.id);
              return (
                <div key={s.id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-textPrimary">{s.name}</h3>
                      <p className="text-sm text-textSecondary">{s.position}</p>
                    </div>
                    {checkedIn && (
                      <span className="px-2 py-1 bg-success text-white text-xs rounded-full">Present</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!checkedIn ? (
                      <button onClick={() => handleCheckIn(s.id)} className="btn-success flex-1 flex items-center justify-center gap-2">
                        <LogIn size={16} /> Check In
                      </button>
                    ) : !checkedIn.check_out_time ? (
                      <button onClick={() => handleCheckOut(s.id)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                        <LogOutIcon size={16} /> Check Out
                      </button>
                    ) : (
                      <div className="text-center text-textSecondary text-sm w-full">
                        Checked out at {checkedIn.check_out_time}
                      </div>
                    )}
                  </div>
                  {checkedIn && checkedIn.check_in_time && (
                    <div className="mt-2 text-xs text-textSecondary text-center">
                      In: {checkedIn.check_in_time} {checkedIn.check_out_time && `| Out: ${checkedIn.check_out_time}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attendance Records Tab */}
      {activeTab === 'attendance' && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-borderColor">
                <th className="text-left py-3 px-4 text-textPrimary">Staff Name</th>
                <th className="text-left py-3 px-4 text-textPrimary">Date</th>
                <th className="text-left py-3 px-4 text-textPrimary">Check In</th>
                <th className="text-left py-3 px-4 text-textPrimary">Check Out</th>
                <th className="text-left py-3 px-4 text-textPrimary">Status</th>
                <th className="text-left py-3 px-4 text-textPrimary">Notes</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id} className="border-b border-borderColor hover:bg-darkCardHover transition-colors">
                  <td className="py-3 px-4 text-textPrimary">{a.staff_name}</td>
                  <td className="py-3 px-4 text-textSecondary">{a.date}</td>
                  <td className="py-3 px-4 text-textSecondary">{a.check_in_time || '-'}</td>
                  <td className="py-3 px-4 text-textSecondary">{a.check_out_time || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-textSecondary">{a.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-darkCard border border-borderColor rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-textPrimary mb-4">
              {editingStaff ? 'Edit Staff' : 'Add Staff'}
            </h2>
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div>
                <label className="label">Name *</label>
                <input type="text" className="input-field" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input type="tel" className="input-field" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Position *</label>
                <input type="text" className="input-field" value={staffForm.position} onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })} required />
              </div>
              <div>
                <label className="label">Joining Date *</label>
                <input type="date" className="input-field" value={staffForm.joining_date} onChange={(e) => setStaffForm({ ...staffForm, joining_date: e.target.value })} required />
              </div>
              {editingStaff && (
                <div>
                  <label className="label">Status</label>
                  <select className="input-field" value={staffForm.status} onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}
              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" onClick={() => setShowStaffModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Leave Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-darkCard border border-borderColor rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-textPrimary mb-4">Mark Leave</h2>
            <form onSubmit={handleMarkLeave} className="space-y-4">
              <div>
                <label className="label">Staff Member *</label>
                <select className="input-field" value={attendanceForm.staff_id} onChange={(e) => setAttendanceForm({ ...attendanceForm, staff_id: e.target.value })} required>
                  <option value="">Select staff...</option>
                  {staff.filter(s => s.status === 'Active').map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Date *</label>
                <input type="date" className="input-field" value={attendanceForm.date} onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })} required />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input-field" rows="3" value={attendanceForm.notes} onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })} placeholder="Reason for leave..." />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">Mark Leave</button>
                <button type="button" onClick={() => setShowAttendanceModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffAttendance;
