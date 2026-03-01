import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';
import api from '../lib/api';

function RepairJobs({ user }) {
  const [repairs, setRepairs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRepair, setEditingRepair] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerVehicles, setCustomerVehicles] = useState([]);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedRepairId, setSelectedRepairId] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '', vehicle_id: '', description: '', repair_details: '',
    parts_cost: '0', labor_cost: '0', total_cost: '0', status: 'pending',
    payment_status: 'unpaid'
  });

  useEffect(() => {
    fetchRepairs();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerVehicles(selectedCustomer);
    }
  }, [selectedCustomer]);

  const fetchRepairs = async () => {
    try {
      const data = await api.repairs.getAll();
      setRepairs(data);
    } catch (error) {
      console.error('Failed to fetch repairs', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await api.customers.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    }
  };

  const fetchCustomerVehicles = async (customerId) => {
    try {
      const allVehicles = await api.vehicles.getAll();
      const filtered = allVehicles.filter(v => v.customer_id === parseInt(customerId));
      setCustomerVehicles(filtered);
    } catch (error) {
      console.error('Failed to fetch vehicles', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Calculate total cost
      const parts = parseFloat(formData.parts_cost) || 0;
      const labor = parseFloat(formData.labor_cost) || 0;
      const dataToSubmit = {
        ...formData,
        total_cost: (parts + labor).toString()
      };

      if (editingRepair) {
        await api.repairs.update(editingRepair.id, dataToSubmit);
      } else {
        await api.repairs.create(dataToSubmit);
      }
      setShowModal(false);
      resetForm();
      fetchRepairs();
    } catch (error) {
      alert(error.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '', vehicle_id: '', description: '', repair_details: '',
      parts_cost: '0', labor_cost: '0', total_cost: '0', status: 'pending',
      payment_status: 'unpaid'
    });
    setSelectedCustomer('');
    setCustomerVehicles([]);
    setEditingRepair(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this repair job?')) return;
    try {
      await api.repairs.delete(id);
      fetchRepairs();
    } catch (error) {
      alert('Failed to delete repair job');
    }
  };

  const openEditModal = (repair) => {
    setEditingRepair(repair);
    setSelectedCustomer(repair.customer_id);
    setFormData({
      customer_id: repair.customer_id,
      vehicle_id: repair.vehicle_id,
      problem_description: repair.problem_description,
      repair_details: repair.repair_details || '',
      repair_cost: repair.repair_cost,
      repair_status: repair.repair_status,
      payment_amount: repair.payment_amount,
      payment_method: repair.payment_method || '',
      payment_status: repair.payment_status
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-warning text-white';
      case 'In Progress': return 'bg-blue-500 text-white';
      case 'Completed': return 'bg-success text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const canEdit = user.role === 'owner' || user.role === 'receptionist';

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-textPrimary">Repair Jobs</h1>
        {canEdit && (
          <button onClick={() => { setShowModal(true); resetForm(); }} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Add Repair Job
          </button>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-borderColor">
              <th className="text-left py-3 px-4 text-textPrimary">Customer</th>
              <th className="text-left py-3 px-4 text-textPrimary">Vehicle</th>
              <th className="text-left py-3 px-4 text-textPrimary">Problem</th>
              <th className="text-left py-3 px-4 text-textPrimary">Cost</th>
              <th className="text-left py-3 px-4 text-textPrimary">Status</th>
              <th className="text-left py-3 px-4 text-textPrimary">Payment</th>
              <th className="text-left py-3 px-4 text-textPrimary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {repairs.map((repair) => (
              <tr key={repair.id} className="border-b border-borderColor hover:bg-darkCardHover transition-colors">
                <td className="py-3 px-4">
                  <div className="text-textPrimary">{repair.customer_name}</div>
                  <div className="text-sm text-textSecondary">{repair.customer_phone}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-textPrimary">{repair.car_model}</div>
                  <div className="text-sm text-danger font-semibold">{repair.number_plate}</div>
                </td>
                <td className="py-3 px-4 text-textSecondary">{repair.problem_description}</td>
                <td className="py-3 px-4 text-textPrimary font-semibold">${repair.repair_cost}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(repair.repair_status)}`}>
                    {repair.repair_status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${repair.payment_status === 'Paid' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                    {repair.payment_status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedRepairId(repair.id); setShowInvoice(true); }} className="text-success hover:text-green-400 transition-colors" title="Invoice">
                      <FileText size={18} />
                    </button>
                    {canEdit && (
                      <>
                        <button onClick={() => openEditModal(repair)} className="text-info hover:text-blue-400 transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(repair.id)} className="text-danger hover:text-red-400 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-darkCard rounded-xl p-6 w-full max-w-2xl my-8 border border-borderColor shadow-2xl animate-slide-in">
            <h2 className="text-2xl font-bold text-textPrimary mb-4">
              {editingRepair ? 'Edit Repair Job' : 'Add Repair Job'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Select Customer *</label>
                  <select className="input-field" value={formData.customer_id} onChange={(e) => { setFormData({ ...formData, customer_id: e.target.value }); setSelectedCustomer(e.target.value); }} required disabled={editingRepair}>
                    <option value="">Choose customer...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Select Vehicle *</label>
                  <select className="input-field" value={formData.vehicle_id} onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })} required disabled={editingRepair}>
                    <option value="">Choose vehicle...</option>
                    {customerVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>{vehicle.car_model} - {vehicle.number_plate}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Problem Description *</label>
                <textarea className="input-field" rows="3" value={formData.problem_description} onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })} required />
              </div>
              <div>
                <label className="label">Repair Details</label>
                <textarea className="input-field" rows="3" value={formData.repair_details} onChange={(e) => setFormData({ ...formData, repair_details: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Repair Cost *</label>
                  <input type="number" step="0.01" className="input-field" value={formData.repair_cost} onChange={(e) => setFormData({ ...formData, repair_cost: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Repair Status *</label>
                  <select className="input-field" value={formData.repair_status} onChange={(e) => setFormData({ ...formData, repair_status: e.target.value })} required>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Payment Amount *</label>
                  <input type="number" step="0.01" className="input-field" value={formData.payment_amount} onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Payment Method</label>
                  <select className="input-field" value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}>
                    <option value="">Select...</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="label">Payment Status *</label>
                  <select className="input-field" value={formData.payment_status} onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })} required>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInvoice && (
        <InvoiceModal repairId={selectedRepairId} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
}

export default RepairJobs;
