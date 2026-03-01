import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Clock } from 'lucide-react';
import api from '../lib/api';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '', vehicle_id: '', appointment_date: '', appointment_time: '',
    service_type: '', notes: '', status: 'scheduled'
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await api.appointments.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await api.appointments.update(editingAppointment.id, formData);
      } else {
        await api.appointments.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchAppointments();
    } catch (error) {
      alert(error.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '', vehicle_id: '', appointment_date: '', appointment_time: '',
      service_type: '', notes: '', status: 'scheduled'
    });
    setEditingAppointment(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this appointment?')) return;
    try {
      await api.appointments.delete(id);
      fetchAppointments();
    } catch (error) {
      alert('Failed to delete appointment');
    }
  };

  const openEditModal = (appointment) => {
    setEditingAppointment(appointment);
    setFormData(appointment);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-warning text-darkBg';
      case 'Confirmed': return 'bg-info text-white';
      case 'Completed': return 'bg-success text-white';
      case 'Cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary flex items-center gap-3">
            <Calendar className="text-danger" />
            Appointments
          </h1>
          <p className="text-textSecondary mt-1">Manage client appointments</p>
        </div>
        <button onClick={() => { setShowModal(true); resetForm(); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Book Appointment
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-borderColor">
              <th className="text-left py-3 px-4 text-textPrimary">Client</th>
              <th className="text-left py-3 px-4 text-textPrimary">Phone</th>
              <th className="text-left py-3 px-4 text-textPrimary">Service</th>
              <th className="text-left py-3 px-4 text-textPrimary">Date & Time</th>
              <th className="text-left py-3 px-4 text-textPrimary">Status</th>
              <th className="text-left py-3 px-4 text-textPrimary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id} className="border-b border-borderColor hover:bg-darkCardHover transition-colors">
                <td className="py-3 px-4 text-textPrimary">{apt.client_name}</td>
                <td className="py-3 px-4 text-textSecondary">{apt.phone}</td>
                <td className="py-3 px-4 text-textPrimary">{apt.service_type}</td>
                <td className="py-3 px-4 text-textSecondary">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {apt.appointment_date}
                    <Clock size={16} className="ml-2" />
                    {apt.appointment_time}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(apt)} className="text-info hover:text-blue-400 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(apt.id)} className="text-danger hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-darkCard border border-borderColor rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-textPrimary mb-6">
              {editingAppointment ? 'Edit Appointment' : 'Book New Appointment'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Client Name *</label>
                  <input type="text" className="input-field" value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <input type="tel" className="input-field" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input-field" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="label">Vehicle Number</label>
                  <input type="text" className="input-field" value={formData.vehicle_number} onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Service Type *</label>
                <select className="input-field" value={formData.service_type} onChange={(e) => setFormData({ ...formData, service_type: e.target.value })} required>
                  <option value="">Select service...</option>
                  <option value="Tire Change">Tire Change</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Brake Service">Brake Service</option>
                  <option value="Engine Repair">Engine Repair</option>
                  <option value="General Checkup">General Checkup</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Appointment Date *</label>
                  <input type="date" className="input-field" value={formData.appointment_date} onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Appointment Time *</label>
                  <input type="time" className="input-field" value={formData.appointment_time} onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })} required />
                </div>
              </div>
              {editingAppointment && (
                <div>
                  <label className="label">Status</label>
                  <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}
              <div>
                <label className="label">Problem Description</label>
                <textarea className="input-field" rows="3" value={formData.problem_description} onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">Save Appointment</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;
