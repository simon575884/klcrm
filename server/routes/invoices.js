import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Generate invoice number
const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
};

// Get invoice by repair ID
router.get('/:repairId', authenticateToken, async (req, res) => {
  try {
    // Check if invoice already exists
    const { data: existingInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('repair_id', req.params.repairId);

    let invoice;
    if (!existingInvoices || existingInvoices.length === 0) {
      // Create new invoice
      const invoiceNumber = generateInvoiceNumber();
      const { data: newInvoice, error: insertError } = await supabase
        .from('invoices')
        .insert({
          repair_id: req.params.repairId,
          invoice_number: invoiceNumber
        })
        .select()
        .single();

      if (insertError) throw insertError;
      invoice = newInvoice;
    } else {
      invoice = existingInvoices[0];
    }

    // Get repair job details
    const { data: repairJob, error: repairError } = await supabase
      .from('repair_jobs_view')
      .select('*')
      .eq('id', req.params.repairId)
      .single();

    if (repairError) throw repairError;
    if (!repairJob) {
      return res.status(404).json({ error: 'Repair job not found' });
    }

    res.json({
      invoice,
      repairJob
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Get all invoices
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        repair:repair_id (
          customer_name,
          car_model,
          number_plate,
          repair_cost,
          payment_status
        )
      `)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    
    // Flatten the response
    const result = invoices.map(inv => ({
      ...inv,
      customer_name: inv.repair?.customer_name,
      car_model: inv.repair?.car_model,
      number_plate: inv.repair?.number_plate,
      repair_cost: inv.repair?.repair_cost,
      payment_status: inv.repair?.payment_status
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

export default router;
