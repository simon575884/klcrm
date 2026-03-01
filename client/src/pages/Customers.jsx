import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    }
  };

  const handleSearch = async () => {
    if (!searchPhone) {
      fetchCustomers();
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`/api/customers/search?phone=${searchPhone}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Search failed', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (editingCustomer) {
        await axios.put(`/api/customers/${editingCustomer.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/customers', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setFormData({ name: '', phone: '', email: '', address: '' });
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      alert(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
    } catch (error) {
      alert('Failed to delete customer');
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || ''
    });
    setShowModal(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-textPrimary">Customers</h1>
        <button onClick={() => { setShowModal(true); setEditingCustomer(null); setFormData({ name: '', phone: '', email: '', address: '' }); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by phone number..."
              className="input-field"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="btn-primary flex items-center gap-2">
            <Search size={20} /> Search
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-borderColor">
              <th className="text-left py-3 px-4 text-textPrimary">Name</th>
              <th className="text-left py-3 px-4 text-textPrimary">Phone</th>
              <th className="text-left py-3 px-4 text-textPrimary">Email</th>
              <th className="text-left py-3 px-4 text-textPrimary">Address</th>
              <th className="text-left py-3 px-4 text-textPrimary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-borderColor hover:bg-darkCardHover transition-colors">
                <td className="py-3 px-4 text-textPrimary">{customer.name}</td>
                <td className="py-3 px-4 text-textPrimary">{customer.phone}</td>
                <td className="py-3 px-4 text-textSecondary">{customer.email || '-'}</td>
                <td className="py-3 px-4 text-textSecondary">{customer.address || '-'}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(customer)} className="text-info hover:text-blue-400 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(customer.id)} className="text-danger hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
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
            <h2 className="text-2xl font-bold text-textPrimary mb-4">
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Customer Name *</label>
                <input type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <input type="tel" className="input-field" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Address</label>
                <textarea className="input-field" rows="3" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
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

export default Customers;
