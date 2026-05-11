import React from 'react';
import { Form, Input, Select, InputNumber, DatePicker, Button } from 'antd';
import type { Ticket, TicketType } from '../types';

const lbl: React.CSSProperties = { fontSize: 11, color: '#666', marginBottom: 4, marginTop: 2, display: 'block' };
const inp: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 7, border: '1px solid #e0e0e0',
  background: '#fff', fontSize: 12, color: '#111', width: '100%',
  boxSizing: 'border-box', outline: 'none',
};
const fw = { width: '100%' };
const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 14,
  boxShadow: '0 2px 16px rgba(21,101,192,0.08)',
  padding: '20px 24px 8px',
  marginBottom: 16,
};
const cardTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: '#1565C0',
  letterSpacing: 0.3,
  marginBottom: 16,
  paddingBottom: 10,
  borderBottom: '1px solid #e8f0fe',
};

interface TicketTypeFormProps {
  ticketType: TicketType;
  form: any;
}

const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' };
const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' };

export const InsuranceTicketForm: React.FC<TicketTypeFormProps> = ({ form }) => (
  <div style={card}>
    <div style={cardTitle}>🛡️ Insurance Ticket Details</div>
    <div style={grid2}>
      <Form.Item name="insurer" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
        <label style={lbl}>Insurer <span style={{ color:'#f5222d' }}>*</span></label>
        <Select placeholder="Select…" style={fw}>
          {['HDFC Ergo','Bajaj Allianz','ICICI Lombard','New India Assurance','Oriental Insurance'].map(i =>
            <Select.Option key={i} value={i}>{i}</Select.Option>)}
        </Select>
      </Form.Item>
      <Form.Item name="policyType" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
        <label style={lbl}>Policy Type <span style={{ color:'#f5222d' }}>*</span></label>
        <Select placeholder="Select…" style={fw}>
          {['Comprehensive','ThirdParty','OwnDamage','ZeroDep'].map(t =>
            <Select.Option key={t} value={t}>{t}</Select.Option>)}
        </Select>
      </Form.Item>
      <Form.Item name="policyNumber" style={{ marginBottom: 14 }}>
        <label style={lbl}>Policy Number</label>
        <Input placeholder="POL-00012345" style={inp} />
      </Form.Item>
      <Form.Item name="idv" style={{ marginBottom: 14 }}>
        <label style={lbl}>IDV (₹)</label>
        <InputNumber style={fw} placeholder="920000" formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
      </Form.Item>
      <Form.Item name="netPremium" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
        <label style={lbl}>Net Premium (₹) <span style={{ color:'#f5222d' }}>*</span></label>
        <InputNumber style={fw} placeholder="15000" formatter={v => `₹ ${v}`} />
      </Form.Item>
      <Form.Item name="ncb" style={{ marginBottom: 14 }}>
        <label style={lbl}>NCB %</label>
        <Select placeholder="Select…" style={fw}>
          {[0,20,25,35,45,50].map(n => <Select.Option key={n} value={n}>{n}%</Select.Option>)}
        </Select>
      </Form.Item>
      <Form.Item name="startDate" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
        <label style={lbl}>Start Date <span style={{ color:'#f5222d' }}>*</span></label>
        <DatePicker style={fw} format="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item name="expiryDate" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
        <label style={lbl}>Expiry Date <span style={{ color:'#f5222d' }}>*</span></label>
        <DatePicker style={fw} format="DD/MM/YYYY" />
      </Form.Item>
    </div>
  </div>
);

export const PaymentTicketForm: React.FC<TicketTypeFormProps> = ({ form }) => (
  <div style={card}>
    <div style={cardTitle}>💳 Payment Ticket Details</div>
    <div style={grid2}>
      <Form.Item name="policyIssuedDate" style={{ marginBottom: 14 }}>
        <label style={lbl}>Policy Issued Date</label>
        <DatePicker style={fw} format="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item name="policyNumber" style={{ marginBottom: 14 }}>
        <label style={lbl}>Policy Number</label>
        <Input placeholder="POL-00012345" style={inp} />
      </Form.Item>
      <Form.Item name="agentName" style={{ marginBottom: 14 }}>
        <label style={lbl}>Customer / Agent Name</label>
        <Input placeholder="Agent name" style={inp} />
      </Form.Item>
      <Form.Item name="insuranceCompany" style={{ marginBottom: 14 }}>
        <label style={lbl}>Insurance Company</label>
        <Input placeholder="Company name" style={inp} />
      </Form.Item>
      <Form.Item name="ownerType" style={{ marginBottom: 14 }}>
        <label style={lbl}>Own / Corporate</label>
        <Select placeholder="Select…" style={fw}>
          <Select.Option value="OWN">Own</Select.Option>
          <Select.Option value="CORPORATE">Corporate</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="partnerName" style={{ marginBottom: 14 }}>
        <label style={lbl}>Partner Name</label>
        <Input placeholder="Partner name" style={inp} />
      </Form.Item>
      <Form.Item name="policyType" style={{ marginBottom: 14 }}>
        <label style={lbl}>Policy Type</label>
        <Select placeholder="Select…" style={fw}>
          {['Comprehensive','ThirdParty','OwnDamage','ZeroDep'].map(t =>
            <Select.Option key={t} value={t}>{t}</Select.Option>)}
        </Select>
      </Form.Item>
      <Form.Item name="policyStatus" style={{ marginBottom: 14 }}>
        <label style={lbl}>Policy Status</label>
        <Select placeholder="Select…" style={fw}>
          <Select.Option value="Active">Active</Select.Option>
          <Select.Option value="Inactive">Inactive</Select.Option>
          <Select.Option value="Renewal">Renewal</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="totalPremium" style={{ marginBottom: 14 }}>
        <label style={lbl}>Total Premium (₹)</label>
        <InputNumber style={fw} placeholder="17700" formatter={v => `₹ ${v}`} />
      </Form.Item>
      <Form.Item name="amountPaidByCustomer" style={{ marginBottom: 14 }}>
        <label style={lbl}>Amount Paid by Customer (₹)</label>
        <InputNumber style={fw} placeholder="10000" formatter={v => `₹ ${v}`} />
      </Form.Item>
      <Form.Item name="balancePremiumAmount" style={{ marginBottom: 14 }}>
        <label style={lbl}>Balance Premium Amount (₹)</label>
        <InputNumber style={fw} placeholder="7700" formatter={v => `₹ ${v}`} />
      </Form.Item>
      <Form.Item name="netCommission" style={{ marginBottom: 14 }}>
        <label style={lbl}>Net Commission (₹)</label>
        <InputNumber style={fw} placeholder="1500" formatter={v => `₹ ${v}`} />
      </Form.Item>
      <Form.Item name="marginAmount" style={{ marginBottom: 14 }}>
        <label style={lbl}>Margin Amount (₹)</label>
        <InputNumber style={fw} placeholder="300" formatter={v => `₹ ${v}`} />
      </Form.Item>
      <Form.Item name="offerDiscount" style={{ marginBottom: 14 }}>
        <label style={lbl}>Offer / Discount (₹)</label>
        <InputNumber style={fw} placeholder="500" formatter={v => `₹ ${v}`} />
      </Form.Item>
      <Form.Item name="tds" style={{ marginBottom: 14 }}>
        <label style={lbl}>TDS (3%) (₹)</label>
        <InputNumber style={fw} placeholder="45" formatter={v => `₹ ${v}`} />
      </Form.Item>
      <Form.Item name="amountReceivableFromCustomer" style={{ marginBottom: 14 }}>
        <label style={lbl}>Amount Receivable From Customer (₹)</label>
        <InputNumber style={fw} placeholder="7700" formatter={v => `₹ ${v}`} />
      </Form.Item>
      <Form.Item name="commissionPercent" style={{ marginBottom: 14 }}>
        <label style={lbl}>Commission %</label>
        <InputNumber style={fw} placeholder="8.5" formatter={v => `${v}%`} />
      </Form.Item>
      <Form.Item name="commissionStatus" style={{ marginBottom: 14 }}>
        <label style={lbl}>Commission Status</label>
        <Select placeholder="Select…" style={fw}>
          <Select.Option value="Pending">Pending</Select.Option>
          <Select.Option value="Approved">Approved</Select.Option>
          <Select.Option value="Paid">Paid</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="paymentMode" style={{ marginBottom: 14 }}>
        <label style={lbl}>Payment Mode</label>
        <Select placeholder="Select…" style={fw}>
          {['UPI','NEFT','Cash','Cheque','Card'].map(m =>
            <Select.Option key={m} value={m}>{m}</Select.Option>)}
        </Select>
      </Form.Item>
      <Form.Item name="paymentReceivingDate" style={{ marginBottom: 14 }}>
        <label style={lbl}>Payment Receiving Date</label>
        <DatePicker style={fw} format="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item name="renewalDueDate" style={{ marginBottom: 14 }}>
        <label style={lbl}>Renewal Due Date</label>
        <DatePicker style={fw} format="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item name="remarks" style={{ marginBottom: 14, gridColumn: '1 / -1' }}>
        <label style={lbl}>Remarks</label>
        <Input.TextArea placeholder="Add remarks…" rows={3} style={{ resize: 'none', ...inp }} />
      </Form.Item>
      <Form.Item name="sourceReferral" style={{ marginBottom: 14 }}>
        <label style={lbl}>Source / Referral Name</label>
        <Input placeholder="Referral source" style={inp} />
      </Form.Item>
      <Form.Item name="commissionToPayReferral" style={{ marginBottom: 14 }}>
        <label style={lbl}>Commission To Pay Referral (₹)</label>
        <InputNumber style={fw} placeholder="100" formatter={v => `₹ ${v}`} />
      </Form.Item>
      <Form.Item name="commissionPaymentStatus" style={{ marginBottom: 14 }}>
        <label style={lbl}>Commission Payment Status</label>
        <Select placeholder="Select…" style={fw}>
          <Select.Option value="Pending">Pending</Select.Option>
          <Select.Option value="Approved">Approved</Select.Option>
          <Select.Option value="Paid">Paid</Select.Option>
        </Select>
      </Form.Item>
    </div>
  </div>
);

export const OfficeTicketForm: React.FC<TicketTypeFormProps> = ({ form }) => (
  <div style={card}>
    <div style={cardTitle}>🏢 Office Ticket Details</div>
    <div style={grid2}>
      <Form.Item name="workDescription" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14, gridColumn: '1 / -1' }}>
        <label style={lbl}>Work Description <span style={{ color:'#f5222d' }}>*</span></label>
        <Input.TextArea placeholder="Describe the work to be done…" rows={4} style={{ resize: 'none', ...inp }} />
      </Form.Item>
      <Form.Item name="responsiblePerson" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
        <label style={lbl}>Responsible Person <span style={{ color:'#f5222d' }}>*</span></label>
        <Select placeholder="Select…" style={fw}>
          {['Rajesh Kumar','Karthik S','Priya V','Anand Raj'].map(p =>
            <Select.Option key={p} value={p}>{p}</Select.Option>)}
        </Select>
      </Form.Item>
      <Form.Item name="priority" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
        <label style={lbl}>Priority <span style={{ color:'#f5222d' }}>*</span></label>
        <Select placeholder="Select…" style={fw}>
          {['High','Medium','Low'].map(p =>
            <Select.Option key={p} value={p}>{p}</Select.Option>)}
        </Select>
      </Form.Item>
      <Form.Item name="startDate" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
        <label style={lbl}>Start Date <span style={{ color:'#f5222d' }}>*</span></label>
        <DatePicker style={fw} format="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item name="endDate" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
        <label style={lbl}>End Date <span style={{ color:'#f5222d' }}>*</span></label>
        <DatePicker style={fw} format="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item name="closedDate" style={{ marginBottom: 14 }}>
        <label style={lbl}>Closed Date</label>
        <DatePicker style={fw} format="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item name="remarks" style={{ marginBottom: 14, gridColumn: '1 / -1' }}>
        <label style={lbl}>Remarks</label>
        <Input.TextArea placeholder="Add remarks…" rows={3} style={{ resize: 'none', ...inp }} />
      </Form.Item>
      <Form.Item name="comments" style={{ marginBottom: 14, gridColumn: '1 / -1' }}>
        <label style={lbl}>Comments</label>
        <Input.TextArea placeholder="Add comments…" rows={3} style={{ resize: 'none', ...inp }} />
      </Form.Item>
    </div>
  </div>
);

export const OtherTicketForm: React.FC<TicketTypeFormProps> = ({ form }) => (
  <div style={card}>
    <div style={cardTitle}>📌 Other Ticket Details</div>
    <div style={grid2}>
      <Form.Item name="createdBy" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
        <label style={lbl}>Created By <span style={{ color:'#f5222d' }}>*</span></label>
        <Input placeholder="Your name" style={inp} />
      </Form.Item>
      <Form.Item name="assignedName" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
        <label style={lbl}>Assigned Name <span style={{ color:'#f5222d' }}>*</span></label>
        <Select placeholder="Select…" style={fw}>
          {['Rajesh Kumar','Karthik S','Priya V','Anand Raj'].map(p =>
            <Select.Option key={p} value={p}>{p}</Select.Option>)}
        </Select>
      </Form.Item>
      <Form.Item name="startDate" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
        <label style={lbl}>Start Date <span style={{ color:'#f5222d' }}>*</span></label>
        <DatePicker style={fw} format="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item name="endDate" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
        <label style={lbl}>End Date <span style={{ color:'#f5222d' }}>*</span></label>
        <DatePicker style={fw} format="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item name="remarks" style={{ marginBottom: 14, gridColumn: '1 / -1' }}>
        <label style={lbl}>Remarks</label>
        <Input.TextArea placeholder="Add remarks…" rows={3} style={{ resize: 'none', ...inp }} />
      </Form.Item>
      <Form.Item name="comments" style={{ marginBottom: 14, gridColumn: '1 / -1' }}>
        <label style={lbl}>Comments</label>
        <Input.TextArea placeholder="Add comments…" rows={3} style={{ resize: 'none', ...inp }} />
      </Form.Item>
    </div>
  </div>
);

export const renderTicketTypeFields = (ticketType: TicketType, form: any) => {
  switch (ticketType) {
    case 'Insurance':
      return <InsuranceTicketForm ticketType={ticketType} form={form} />;
    case 'Payment':
      return <PaymentTicketForm ticketType={ticketType} form={form} />;
    case 'Office':
      return <OfficeTicketForm ticketType={ticketType} form={form} />;
    case 'Other':
      return <OtherTicketForm ticketType={ticketType} form={form} />;
    default:
      return <InsuranceTicketForm ticketType="Insurance" form={form} />;
  }
};
