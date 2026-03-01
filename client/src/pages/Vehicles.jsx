import { useState, useEffect } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import api from '../lib/api';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchPlate, setSearchPlate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    make: '',
    model: '',
    year: '',
    license_plate: '',
    color: ''
  });

  useEffect(() => {
    fetchVehicles();
    fetchCustomers();
  }, []);

  const fetchVehicles = async () => {
    try {
      const data = await api.vehicles.getAll();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to fetch vehicles', error);
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

  const handleSearch = async () => {
    if (!searchPlate) {
      fetchVehicles();
      return;
    }
    try {
      const data = await api.vehicles.getAll();
      const filtered = data.filter(v => v.license_plate?.toLowerCase().includes(searchPlate.toLowerCase()));
      setVehicles(filtered);
    } catch (error) {
      console.error('Search failed', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.vehicles.create(formData);
      setShowModal(false);
      setFormData({ customer_id: '', make: '', model: '', year: '', license_plate: '', color: '' });
      fetchVehicles();
    } catch (error) {
      alert(error.message || 'Failed to add vehicle');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    try {
      await api.vehicles.delete(id);
      fetchVehicles();
    } catch (error) {
      alert('Failed to delete vehicle');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-textPrimary">Vehicles</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Vehicle
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by number plate..."
              className="input-field"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="btn-primary flex items-center gap-2">
            <Search size={20} /> Search
          </button>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-borderColor">
              <th className="text-left py-3 px-4 text-textPrimary">Customer</th>
              <th className="text-left py-3 px-4 text-textPrimary">Car Model</th>
              <th className="text-left py-3 px-4 text-textPrimary">Number Plate</th>
              <th className="text-left py-3 px-4 text-textPrimary">Year</th>
              <th className="text-left py-3 px-4 text-textPrimary">Color</th>
              <th className="text-left py-3 px-4 text-textPrimary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-b border-borderColor hover:bg-darkCardHover transition-colors">
                <td className="py-3 px-4 text-textPrimary">{vehicle.customer_name}</td>
                <td className="py-3 px-4 text-textPrimary">{vehicle.car_model}</td>
                <td className="py-3 px-4 font-semibold text-danger">{vehicle.number_plate}</td>
                <td className="py-3 px-4 text-textSecondary">{vehicle.manufacturing_year}</td>
                <td className="py-3 px-4 text-textSecondary">{vehicle.color || '-'}</td>
                <td className="py-3 px-4">
                  <button onClick={() => handleDelete(vehicle.id)} className="text-danger hover:text-red-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-darkCard rounded-xl p-6 w-full max-w-md border border-borderColor shadow-2xl animate-slide-in">
            <h2 className="text-2xl font-bold text-textPrimary mb-4">Add Vehicle</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Select Customer *</label>
                <select className="input-field" value={formData.customer_id} onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })} required>
                  <option value="">Choose customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Car Model *</label>
                <input type="text" className="input-field" value={formData.car_model} onChange={(e) => setFormData({ ...formData, car_model: e.target.value })} required />
              </div>
              <div>
                <label className="label">Number Plate *</label>
                <input type="text" className="input-field" value={formData.number_plate} onChange={(e) => setFormData({ ...formData, number_plate: e.target.value })} required />
              </div>
              <div>
                <label className="label">Manufacturing Year *</label>
                <input type="number" className="input-field" value={formData.manufacturing_year} onChange={(e) => setFormData({ ...formData, manufacturing_year: e.target.value })} required />
              </div>
              <div>
                <label className="label">Color</label>
                <input type="text" className="input-field" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vehicles;
