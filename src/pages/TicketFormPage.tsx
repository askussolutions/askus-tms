import React, { useEffect, useState } from 'react';
import { Form, Input, Select, InputNumber, DatePicker, Upload, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { api } from '../api/mockApi';
import { useMutation } from '../hooks';
import type { Ticket } from '../types';
import type { Dayjs } from 'dayjs';

export default function TicketFormPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [loadingTicket, setLoadingTicket] = useState(isEdit);
  const { mutate: create, loading: creating } = useMutation(api.createTicket);
  const { mutate: update, loading: updating } = useMutation(api.updateTicket);
  const loading = creating || updating;

  /* ── Load existing ticket when editing ─────────────────────────────── */
  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const t = await api.getTicketById(id);
        if (!t) { message.error('Ticket not found'); navigate('/tickets'); return; }
        const [makePart, ...modelParts] = (t.vehicleName ?? '').split(' ');
        form.setFieldsValue({
          vehicleRegNo:    t.vehicleRegNo,
          make:            makePart ?? '',
          model:           modelParts.join(' '),
          ownerName:       t.customerName,
          mobile:          t.customerMobile,
          insurer:         t.policy.insurer,
          policyType:      t.policy.policyType,
          policyNumber:    t.policy.policyNumber,
          idv:             t.policy.idv,
          netPremium:      t.policy.netPremium,
          ncb:             t.policy.ncbPercent,
          startDate:       t.policy.startDate  ? dayjs(t.policy.startDate)  : undefined,
          expiryDate:      t.policy.expiryDate ? dayjs(t.policy.expiryDate) : undefined,
          renewalDate:     t.policy.renewalDate ? dayjs(t.policy.renewalDate) : undefined,
          insuranceStatus: t.policy.insuranceStatus,
          paymentStatus:   t.payment.paymentStatus,
          priority:        t.priority,
          status:          t.status,
          assignedTo:      t.assignedToName,
          dueDate:         t.dueDate ? dayjs(t.dueDate) : undefined,
          notes:           t.internalNotes,
        });
      } catch {
        message.error('Failed to load ticket');
      } finally {
        setLoadingTicket(false);
      }
    })();
  }, [id, isEdit, form, navigate]);

  const onFinish = async (vals: Record<string, unknown>) => {
    const startDate  = (vals.startDate  as Dayjs)?.format('YYYY-MM-DD') ?? '';
    const expiryDate = (vals.expiryDate as Dayjs)?.format('YYYY-MM-DD') ?? '';
    const net = (vals.netPremium as number) ?? 0;

    const payload: Partial<Ticket> = {
      title: `${vals.vehicleRegNo ?? 'New'} — ${vals.insurer ?? 'Policy'}`,
      priority: vals.priority as Ticket['priority'],
      status:   vals.status   as Ticket['status'],
      vehicleRegNo:   vals.vehicleRegNo as string ?? '',
      vehicleName:    `${vals.make ?? ''} ${vals.model ?? ''}`.trim(),
      customerName:   vals.ownerName as string ?? '',
      customerMobile: vals.mobile    as string ?? '',
      internalNotes:  vals.notes     as string,
      policy: {
        id: '', insurer: vals.insurer as string ?? '',
        policyType:   vals.policyType as Ticket['policy']['policyType'],
        policyNumber: vals.policyNumber as string,
        idv:          vals.idv as number,
        netPremium:   net,
        gst:          Math.round(net * 0.18),
        totalPremium: Math.round(net * 1.18),
        ncbPercent:   vals.ncb as number ?? 0,
        startDate, expiryDate,
        insuranceStatus: vals.insuranceStatus as Ticket['policy']['insuranceStatus'] ?? 'Active',
      },
      payment: {
        amount:        Math.round(net * 1.18),
        paymentStatus: vals.paymentStatus as Ticket['payment']['paymentStatus'] ?? 'Pending',
      },
    };

    if (isEdit && id) {
      const t = await update(id, payload);
      if (t) { message.success('Ticket updated successfully!'); navigate(`/tickets/${id}`); }
    } else {
      const t = await create(payload);
      if (t) { message.success('Ticket created successfully!'); navigate(`/tickets/${t.id}`); }
    }
  };

  /* ─── shared style tokens (mirrors RegisterPage) ─────────────────────── */
  const pageStyle: React.CSSProperties = {
    minHeight: '100%',
    background: 'linear-gradient(145deg, #e8f0fe 0%, #f0e8ff 50%, #fce4ec 100%)',
    padding: '24px 28px 40px',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  };

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

  const lbl: React.CSSProperties = { fontSize: 11, color: '#666', marginBottom: 4, marginTop: 2, display: 'block' };
  const inp: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 7, border: '1px solid #e0e0e0',
    background: '#fff', fontSize: 12, color: '#111', width: '100%',
    boxSizing: 'border-box', outline: 'none',
  };
  const fw = { width: '100%' };
  const fl: React.CSSProperties = { fontSize: 11, color: '#666' };

  const primaryBtn: React.CSSProperties = {
    padding: '9px 28px', color: '#fff', border: 'none',
    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
  };
  const ghostBtn: React.CSSProperties = {
    padding: '8px 20px', color: '#555', border: '1px solid #d0d0d0',
    borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
    background: '#fff',
  };

  return (
    <div style={pageStyle}>
      {loadingTicket ? (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:300 }}>
          <Spin size="large" tip="Loading ticket…" />
        </div>
      ) : (
      <>
      {/* ── Header bar ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 22,
        background: '#fff', borderRadius: 12, padding: '14px 20px',
        boxShadow: '0 2px 10px rgba(21,101,192,0.07)',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={ghostBtn} onClick={() => navigate(isEdit ? `/tickets/${id}` : '/tickets')}>← Back</button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1565C0', margin: 0 }}>
              {isEdit ? 'Edit Ticket' : 'New Ticket'}
            </div>
            <div style={{ fontSize: 12, color: '#888', margin: 0 }}>
              {isEdit ? 'Update vehicle & insurance details' : 'Fill in vehicle & insurance details'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!isEdit && <button style={ghostBtn} onClick={() => form.resetFields()}>Clear form</button>}
          <button
            style={{ ...primaryBtn, opacity: loading ? 0.8 : 1 }}
            onClick={() => form.submit()}
            disabled={loading}
          >
            {loading ? <Spin size="small" /> : isEdit ? 'Save Changes' : 'Create Ticket'}
          </button>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}
        initialValues={{ priority:'High', status:'Open', ncb:0, insuranceStatus:'Active', paymentStatus:'Pending' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>

          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div>

            {/* Vehicle details */}
            <div style={card}>
              <div style={cardTitle}>🚗 Vehicle Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <Form.Item name="vehicleRegNo" rules={[{ required:true, message:'Required' }]}
                  style={{ marginBottom: 14 }}>
                  <label style={lbl}>Registration No. <span style={{ color:'#f5222d' }}>*</span></label>
                  <Input placeholder="TN40AE6775" style={{ ...inp }} />
                </Form.Item>
                <Form.Item name="make" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
                  <label style={lbl}>Make <span style={{ color:'#f5222d' }}>*</span></label>
                  <Input placeholder="Mahindra" style={inp} />
                </Form.Item>
                <Form.Item name="model" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
                  <label style={lbl}>Model <span style={{ color:'#f5222d' }}>*</span></label>
                  <Input placeholder="XUV3XO MX2 PRO" style={inp} />
                </Form.Item>
                <Form.Item name="year" style={{ marginBottom: 14 }}>
                  <label style={lbl}>Year</label>
                  <Input placeholder="2024" style={inp} />
                </Form.Item>
                <Form.Item name="fuelType" style={{ marginBottom: 14 }}>
                  <label style={lbl}>Fuel Type</label>
                  <Select placeholder="Select…" style={fw}>
                    {['Petrol','Diesel','Electric','CNG','Hybrid'].map(f =>
                      <Select.Option key={f} value={f}>{f}</Select.Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="colour" style={{ marginBottom: 14 }}>
                  <label style={lbl}>Colour</label>
                  <Input placeholder="White" style={inp} />
                </Form.Item>
                <Form.Item name="chassisNo" style={{ marginBottom: 14 }}>
                  <label style={lbl}>Chassis No.</label>
                  <Input placeholder="MA1FT2…" style={inp} />
                </Form.Item>
                <Form.Item name="engineNo" style={{ marginBottom: 14 }}>
                  <label style={lbl}>Engine No.</label>
                  <Input placeholder="G15B…" style={inp} />
                </Form.Item>
              </div>

              <div style={{ borderTop: '1px solid #e8f0fe', marginTop: 4, paddingTop: 14,
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <Form.Item name="ownerName" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
                  <label style={lbl}>Owner Name <span style={{ color:'#f5222d' }}>*</span></label>
                  <Input placeholder="Full name" style={inp} />
                </Form.Item>
                <Form.Item name="mobile" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
                  <label style={lbl}>Mobile <span style={{ color:'#f5222d' }}>*</span></label>
                  <Input placeholder="+91 98xxxxxxxx" style={inp} />
                </Form.Item>
                <Form.Item name="address" style={{ marginBottom: 14, gridColumn: '1 / -1' }}>
                  <label style={lbl}>Address</label>
                  <Input placeholder="Street, city, PIN" style={inp} />
                </Form.Item>
              </div>
            </div>

            {/* Insurance details */}
            <div style={card}>
              <div style={cardTitle}>🛡️ Insurance Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <Form.Item name="insurer" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
                  <label style={lbl}>Insurer <span style={{ color:'#f5222d' }}>*</span></label>
                  <Select placeholder="Select…" style={fw}>
                    {['HDFC Ergo','Bajaj Allianz','ICICI Lombard','New India Assurance',
                      'Oriental Insurance','United India','Reliance General','Tata AIG'].map(i =>
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
                  <Input placeholder="Policy number" style={inp} />
                </Form.Item>
                <Form.Item name="idv" style={{ marginBottom: 14 }}>
                  <label style={lbl}>IDV (₹)</label>
                  <InputNumber placeholder="920000" style={fw}
                    formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
                <Form.Item name="netPremium" rules={[{ required:true, message:'Required' }]} style={{ marginBottom: 14 }}>
                  <label style={lbl}>Net Premium (₹) <span style={{ color:'#f5222d' }}>*</span></label>
                  <InputNumber placeholder="18400" style={fw} formatter={v => `₹ ${v}`} />
                </Form.Item>
                <Form.Item name="ncb" style={{ marginBottom: 14 }}>
                  <label style={lbl}>NCB %</label>
                  <Select style={fw}>
                    {[0,20,25,35,45,50].map(n =>
                      <Select.Option key={n} value={n}>{n}%</Select.Option>)}
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
                <Form.Item name="renewalDate" style={{ marginBottom: 14 }}>
                  <label style={lbl}>Renewal Date</label>
                  <DatePicker style={fw} format="DD/MM/YYYY" />
                </Form.Item>
                <Form.Item name="insuranceStatus" style={{ marginBottom: 14 }}>
                  <label style={lbl}>Insurance Status</label>
                  <Select style={fw}>
                    {['Active','ExpiringSoon','Expired','NewPolicy'].map(s =>
                      <Select.Option key={s} value={s}>{s}</Select.Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="paymentStatus" style={{ marginBottom: 14 }}>
                  <label style={lbl}>Payment Status</label>
                  <Select style={fw}>
                    {['Pending','Paid','Partial'].map(s =>
                      <Select.Option key={s} value={s}>{s}</Select.Option>)}
                  </Select>
                </Form.Item>
              </div>
            </div>

            {/* Documents */}
            <div style={card}>
              <div style={cardTitle}>
                📎 Documents&nbsp;
                <span style={{ fontSize: 11, fontWeight: 400, color: '#aaa' }}>(optional — upload anytime)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {['RC Copy', 'Insurance Copy'].map(label => (
                  <Upload key={label} beforeUpload={() => false} accept=".pdf,.jpg,.jpeg,.png" showUploadList>
                    <div style={{
                      border: '1.5px dashed #c5d8f5', borderRadius: 10,
                      padding: '18px 16px', textAlign: 'center', cursor: 'pointer',
                      background: '#f4f8ff',
                    }}>
                      <UploadOutlined style={{ fontSize: 22, color: '#1565C0', marginBottom: 6 }} />
                      <div style={{ fontSize: 12, color: '#1565C0', fontWeight: 500 }}>Upload {label}</div>
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>PDF · JPG · PNG · max 10 MB</div>
                    </div>
                  </Upload>
                ))}
              </div>
            </div>

          </div>{/* end left */}

          {/* ── RIGHT COLUMN ────────────────────────────────────────── */}
          <div>

            {/* Ticket settings */}
            <div style={{ ...card, marginBottom: 14 }}>
              <div style={cardTitle}>⚙️ Ticket Settings</div>
              <Form.Item name="priority" style={{ marginBottom: 14 }}>
                <label style={lbl}>Priority</label>
                <Select style={fw}>
                  {['High','Medium','Low'].map(p =>
                    <Select.Option key={p} value={p}>{p}</Select.Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="assignedTo" style={{ marginBottom: 14 }}>
                <label style={lbl}>Assign To</label>
                <Select style={fw} placeholder="Select agent">
                  {['Rajesh Kumar','Karthik S','Priya V','Anand Raj'].map(a =>
                    <Select.Option key={a} value={a}>{a}</Select.Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="status" style={{ marginBottom: 14 }}>
                <label style={lbl}>Initial Status</label>
                <Select style={fw}>
                  {['Open','InProgress'].map(s =>
                    <Select.Option key={s} value={s}>{s === 'InProgress' ? 'In Progress' : s}</Select.Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="dueDate" style={{ marginBottom: 8 }}>
                <label style={lbl}>Due Date</label>
                <DatePicker style={fw} format="DD/MM/YYYY" />
              </Form.Item>
            </div>

            {/* Internal notes */}
            <div style={{ ...card, marginBottom: 14 }}>
              <div style={cardTitle}>📝 Internal Notes</div>
              <Form.Item name="notes" noStyle>
                <Input.TextArea rows={4} placeholder="Notes for the team…"
                  style={{ resize: 'none', width: '100%', borderRadius: 7,
                    border: '1px solid #e0e0e0', fontSize: 12, padding: '8px 12px' }} />
              </Form.Item>
            </div>

            {/* Helper hint */}
            <div style={{
              background: 'linear-gradient(135deg,#e8f0fe 0%,#f0e8ff 100%)',
              borderRadius: 12, padding: '14px 16px',
              fontSize: 11, color: '#555', lineHeight: 1.8,
              border: '1px solid #d0e2ff',
            }}>
              <div style={{ fontWeight: 700, color: '#1565C0', marginBottom: 4 }}>Required fields</div>
              Registration no., owner name, mobile, insurer, policy type, net premium, start &amp; expiry dates.
              <div style={{ marginTop: 8, color: '#888' }}>
                Documents are optional and can be uploaded anytime after ticket creation.
              </div>
            </div>

          </div>{/* end right */}
        </div>
      </Form>
      </>
      )}
    </div>
  );
}
