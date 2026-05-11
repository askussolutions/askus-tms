import React, { useState } from 'react';
import {
  Card, Tabs, Button, Select, Descriptions, Tag, Upload,
  Input, InputNumber, DatePicker, Form, message, Spin,
} from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined, EyeOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useTicket, useMutation } from '../hooks';
import { api } from '../api/mockApi';
import { WorkflowSteps, StatusBadge, PriorityTag, InsuranceStatusTag, PaymentStatusTag, DocStatus, AvatarInitials } from '../components/shared';
import type { Ticket, TicketStatus } from '../types';
import type { Dayjs } from 'dayjs';

const STATUS_OPTS = [
  { value:'Open',       label:'Open' },
  { value:'InProgress', label:'In progress' },
  { value:'Completed',  label:'Completed' },
  { value:'Closed',     label:'Closed' },
];

/* ── tiny reusable view row ──────────────────────────────────────────── */
function VRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display:'flex', padding:'7px 0', borderBottom:'1px solid #f0f0f0', gap:8 }}>
      <span style={{ fontSize:12, color:'#888', minWidth:140, flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:500, color:'#222', flex:1 }}>{value ?? '—'}</span>
    </div>
  );
}

/* ── section header used in edit mode ───────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize:12, fontWeight:700, color:'#1565C0', letterSpacing:0.3,
      borderBottom:'1px solid #e8f0fe', paddingBottom:8, marginBottom:14, marginTop:4 }}>
      {children}
    </div>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ticket, loading, refetch } = useTicket(id!);
  const navigate = useNavigate();

  /* mode */
  const [editMode, setEditMode] = useState(false);
  const [editForm] = Form.useForm();

  /* status-only quick update */
  const [newStatus, setNewStatus] = useState('');
  const { mutate: updateStatus, loading: statusSaving } = useMutation(api.updateTicketStatus);

  /* full ticket save */
  const { mutate: saveTicket, loading: saving } = useMutation(api.updateTicket);

  /* comment */
  const [comment, setComment] = useState('');
  const { mutate: addCommentFn, loading: commenting } = useMutation(api.addComment);

  /* ── guards ─────────────────────────────────────────────────────── */
  if (loading) return <Spin size="large" style={{ display:'block', margin:'80px auto' }} />;
  if (!ticket) return <div style={{ padding:40, color:'#888' }}>Ticket not found</div>;

  const expiryDays = Math.ceil((new Date(ticket.policy.expiryDate).getTime() - Date.now()) / 86400000);
  const hasRC  = ticket.documents.some(d => d.type === 'RC');
  const hasIns = ticket.documents.some(d => d.type === 'Insurance');

  /* ── enter edit mode: pre-fill form ────────────────────────────── */
  const enterEdit = () => {
    const [makePart, ...modelParts] = (ticket.vehicleName ?? '').split(' ');
    editForm.setFieldsValue({
      vehicleRegNo:    ticket.vehicleRegNo,
      make:            makePart ?? '',
      model:           modelParts.join(' '),
      year:            (ticket as any).year ?? '',
      fuelType:        (ticket as any).fuelType ?? '',
      colour:          (ticket as any).colour ?? '',
      chassisNo:       (ticket as any).chassisNo ?? '',
      engineNo:        (ticket as any).engineNo ?? '',
      ownerName:       ticket.customerName,
      mobile:          ticket.customerMobile,
      address:         (ticket as any).address ?? '',
      insurer:         ticket.policy.insurer,
      policyType:      ticket.policy.policyType,
      policyNumber:    ticket.policy.policyNumber,
      idv:             ticket.policy.idv,
      netPremium:      ticket.policy.netPremium,
      ncb:             ticket.policy.ncbPercent,
      startDate:       ticket.policy.startDate  ? dayjs(ticket.policy.startDate)  : undefined,
      expiryDate:      ticket.policy.expiryDate ? dayjs(ticket.policy.expiryDate) : undefined,
      renewalDate:     ticket.policy.renewalDate ? dayjs(ticket.policy.renewalDate) : undefined,
      insuranceStatus: ticket.policy.insuranceStatus,
      paymentStatus:   ticket.payment.paymentStatus,
      priority:        ticket.priority,
      status:          ticket.status,
      assignedTo:      ticket.assignedToName ?? '',
      ticketType:      ticket.ticketType ?? 'Insurance',
      dueDate:         ticket.dueDate ? dayjs(ticket.dueDate) : undefined,
      notes:           ticket.internalNotes ?? '',
    });
    setEditMode(true);
  };

  /* ── save edited ticket ─────────────────────────────────────────── */
  const handleSave = async (vals: Record<string, unknown>) => {
    const startDate  = (vals.startDate  as Dayjs)?.format('YYYY-MM-DD') ?? ticket.policy.startDate;
    const expiryDate = (vals.expiryDate as Dayjs)?.format('YYYY-MM-DD') ?? ticket.policy.expiryDate;
    const net = (vals.netPremium as number) ?? ticket.policy.netPremium;

    const payload: Partial<Ticket> = {
      title:          `${vals.vehicleRegNo ?? ticket.vehicleRegNo} — ${vals.insurer ?? ticket.policy.insurer}`,
      ticketType:     vals.ticketType as Ticket['ticketType'],
      priority:       vals.priority as Ticket['priority'],
      status:         vals.status   as Ticket['status'],
      vehicleRegNo:   vals.vehicleRegNo as string,
      vehicleName:    `${vals.make ?? ''} ${vals.model ?? ''}`.trim(),
      customerName:   vals.ownerName as string,
      customerMobile: vals.mobile    as string,
      internalNotes:  vals.notes     as string,
      policy: {
        ...ticket.policy,
        insurer:         vals.insurer as string,
        policyType:      vals.policyType as Ticket['policy']['policyType'],
        policyNumber:    vals.policyNumber as string,
        idv:             vals.idv as number,
        netPremium:      net,
        gst:             Math.round(net * 0.18),
        totalPremium:    Math.round(net * 1.18),
        ncbPercent:      vals.ncb as number ?? 0,
        startDate, expiryDate,
        renewalDate:     (vals.renewalDate as Dayjs)?.format('YYYY-MM-DD'),
        insuranceStatus: vals.insuranceStatus as Ticket['policy']['insuranceStatus'],
      },
      payment: {
        ...ticket.payment,
        paymentStatus: vals.paymentStatus as Ticket['payment']['paymentStatus'],
      },
    };

    const updated = await saveTicket(ticket.id, payload);
    if (updated) {
      message.success('Ticket updated successfully!');
      setEditMode(false);
      refetch();
    }
  };

  const handleStatusSave = async () => {
    await updateStatus(ticket.id, newStatus || ticket.status);
    message.success('Status updated');
    refetch();
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    await addCommentFn(ticket.id, comment);
    setComment('');
    refetch();
  };

  const handleUpload = async (file: File, type: string) => {
    await api.uploadDocument(ticket.id, file, type);
    message.success(`${type} copy uploaded`);
    refetch();
    return false;
  };

  const handleMarkPaid = async () => {
    await api.updatePayment(ticket.id, { paymentStatus: 'Paid', paymentMode: 'UPI' });
    message.success('Payment marked as paid');
    refetch();
  };

  /* ── shared form field style ────────────────────────────────────── */
  const fw = { width: '100%' };
  const fl: React.CSSProperties = { fontSize: 11, color: '#666' };
  const grid2: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' };

  /* ── VIEW-mode tab content ──────────────────────────────────────── */
  const viewTabs = [
    {
      key: 'vehicle', label: 'Vehicle',
      children: (
        <div>
          <SectionTitle>🚗 Vehicle Details</SectionTitle>
          <VRow label="Registration No." value={<strong>{ticket.vehicleRegNo}</strong>} />
          <VRow label="Ticket Type" value={ticket.ticketType} />
          <VRow label="Vehicle" value={ticket.vehicleName} />
          <VRow label="Year" value={(ticket as any).year} />
          <VRow label="Fuel Type" value={(ticket as any).fuelType} />
          <VRow label="Colour" value={(ticket as any).colour} />
          <VRow label="Chassis No." value={(ticket as any).chassisNo} />
          <VRow label="Engine No." value={(ticket as any).engineNo} />
          <div style={{ marginTop:14 }}>
            <SectionTitle>👤 Owner Details</SectionTitle>
          </div>
          <VRow label="Owner Name" value={ticket.customerName} />
          <VRow label="Mobile" value={ticket.customerMobile} />
          <VRow label="Address" value={(ticket as any).address} />
        </div>
      ),
    },
    {
      key: 'insurance', label: 'Insurance',
      children: (
        <div>
          <SectionTitle>🛡️ Insurance Details</SectionTitle>
          <VRow label="Insurer" value={<strong>{ticket.policy.insurer}</strong>} />
          <VRow label="Policy Type" value={ticket.policy.policyType} />
          <VRow label="Policy No." value={ticket.policy.policyNumber} />
          <VRow label="IDV" value={ticket.policy.idv ? `₹${ticket.policy.idv.toLocaleString('en-IN')}` : undefined} />
          <VRow label="Net Premium" value={`₹${ticket.policy.netPremium.toLocaleString('en-IN')}`} />
          <VRow label="GST (18%)" value={`₹${ticket.policy.gst.toLocaleString('en-IN')}`} />
          <VRow label="Total Premium" value={<strong>₹{ticket.policy.totalPremium.toLocaleString('en-IN')}</strong>} />
          <VRow label="NCB %" value={`${ticket.policy.ncbPercent}%`} />
          <VRow label="Start Date" value={new Date(ticket.policy.startDate).toLocaleDateString('en-IN')} />
          <VRow label="Expiry Date" value={
            <span style={{ color: expiryDays <= 0 ? '#cf1322' : expiryDays <= 30 ? '#d46b08' : undefined, fontWeight: expiryDays <= 30 ? 600 : 400 }}>
              {new Date(ticket.policy.expiryDate).toLocaleDateString('en-IN')}
              {expiryDays <= 0 ? ' (Expired)' : expiryDays <= 30 ? ` · ${expiryDays}d left` : ''}
            </span>
          } />
          <VRow label="Renewal Date" value={ticket.policy.renewalDate ? new Date(ticket.policy.renewalDate).toLocaleDateString('en-IN') : undefined} />
          <VRow label="Insurance Status" value={<InsuranceStatusTag status={ticket.policy.insuranceStatus} />} />
        </div>
      ),
    },
    {
      key: 'payment', label: 'Payment',
      children: (
        <div>
          <SectionTitle>💳 Payment Details</SectionTitle>
          <VRow label="Amount" value={`₹${ticket.payment.amount.toLocaleString('en-IN')}`} />
          <VRow label="Status" value={<PaymentStatusTag status={ticket.payment.paymentStatus} />} />
          <VRow label="Mode" value={ticket.payment.paymentMode} />
          <VRow label="Transaction ID" value={ticket.payment.transactionId} />
          <VRow label="Paid On" value={ticket.payment.paidAt ? new Date(ticket.payment.paidAt).toLocaleDateString('en-IN') : undefined} />

          {ticket.payment.paymentStatus === 'Pending' && (
            <div style={{ marginTop:16, background:'#fafafa', border:'1px solid #f0f0f0', borderRadius:8, padding:14 }}>
              <div style={{ fontWeight:500, fontSize:13, marginBottom:12 }}>Record payment</div>
              <div style={{ ...grid2, marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:12, color:'#888', marginBottom:4 }}>Payment mode</div>
                  <Select style={fw} defaultValue="UPI">
                    {['UPI','NEFT','Cash','Cheque','Card'].map(m => <Select.Option key={m} value={m}>{m}</Select.Option>)}
                  </Select>
                </div>
                <div>
                  <div style={{ fontSize:12, color:'#888', marginBottom:4 }}>Transaction ID</div>
                  <Input placeholder="UTR / ref number" />
                </div>
              </div>
              <Button type="primary" size="small" style={{ background:'#C8102E', borderColor:'#C8102E' }} onClick={handleMarkPaid}>
                Mark as paid
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'documents', label: 'Documents',
      children: (
        <div>
          <SectionTitle>📎 Documents</SectionTitle>
          {ticket.documents.length === 0 && (
            <div style={{ background:'#fff7e6', border:'1px solid #ffd591', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#d46b08', marginBottom:14 }}>
              No documents attached. RC copy and insurance copy recommended.
            </div>
          )}
          {ticket.documents.map(doc => (
            <div key={doc.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#f8f8f8', borderRadius:8, marginBottom:8 }}>
              <Tag color="blue">{doc.type}</Tag>
              <span style={{ flex:1, fontSize:12 }}>{doc.fileName}</span>
              <span style={{ fontSize:11, color:'#bbb' }}>{(doc.fileSizeBytes/1024/1024).toFixed(1)} MB</span>
              <Button size="small" href={doc.fileUrl} target="_blank">View</Button>
              <Button size="small" danger icon={<DeleteOutlined />}
                onClick={async () => { await api.deleteDocument(ticket.id, doc.id); refetch(); }} />
            </div>
          ))}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:14 }}>
            {(['RC','Insurance'] as const).filter(type => !ticket.documents.some(d => d.type === type)).map(type => (
              <Upload key={type} beforeUpload={file => { handleUpload(file, type); return false; }}
                showUploadList={false} accept=".pdf,.jpg,.jpeg,.png">
                <div style={{ border:'1.5px dashed #c5d8f5', borderRadius:10, padding:'18px 16px', textAlign:'center', cursor:'pointer', background:'#f4f8ff' }}>
                  <UploadOutlined style={{ fontSize:20, color:'#1565C0', marginBottom:6 }} />
                  <div style={{ fontSize:12, color:'#1565C0' }}>Upload {type} copy</div>
                  <div style={{ fontSize:11, color:'#bbb' }}>PDF · JPG · PNG · max 10 MB</div>
                </div>
              </Upload>
            ))}
            {hasRC && hasIns && <div style={{ gridColumn:'1/-1', textAlign:'center', color:'#52c41a', fontSize:13 }}>✓ Both documents attached</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'activity', label: 'Activity log',
      children: (
        <div>
          {[...ticket.activityLog].reverse().map(log => (
            <div key={log.id} style={{ display:'flex', gap:10, paddingBottom:12, borderBottom:'1px solid #f5f5f5', marginBottom:12 }}>
              <AvatarInitials name={log.performedByName} size={28} />
              <div>
                <div style={{ fontSize:12 }}><strong>{log.performedByName}</strong> {log.action}</div>
                {log.note && <div style={{ fontSize:12, color:'#666', background:'#f8f8f8', padding:'6px 10px', borderRadius:6, marginTop:4 }}>{log.note}</div>}
                <div style={{ fontSize:11, color:'#bbb', marginTop:3 }}>{new Date(log.createdAt).toLocaleString('en-IN')}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop:14, borderTop:'1px solid #f0f0f0', paddingTop:14 }}>
            <Input.TextArea rows={3} placeholder="Add a comment or note…" value={comment}
              onChange={e => setComment(e.target.value)} style={{ marginBottom:8 }} />
            <Button type="primary" size="small" loading={commenting} onClick={handleComment}
              style={{ background:'#C8102E', borderColor:'#C8102E' }}>Post comment</Button>
          </div>
        </div>
      ),
    },
  ];

  /* ── EDIT-mode inline form ──────────────────────────────────────── */
  const editContent = (
    <Form form={editForm} layout="vertical" onFinish={handleSave}>
      {/* Vehicle */}
      <SectionTitle>🚗 Vehicle Details</SectionTitle>
      <div style={grid2}>
        <Form.Item name="vehicleRegNo" label={<span style={fl}>Registration No. *</span>} rules={[{ required:true }]} style={{ marginBottom:12 }}>
          <Input style={fw} />
        </Form.Item>
        <Form.Item name="make" label={<span style={fl}>Make</span>} style={{ marginBottom:12 }}>
          <Input style={fw} />
        </Form.Item>
        <Form.Item name="model" label={<span style={fl}>Model</span>} style={{ marginBottom:12 }}>
          <Input style={fw} />
        </Form.Item>
        <Form.Item name="year" label={<span style={fl}>Year</span>} style={{ marginBottom:12 }}>
          <Input style={fw} />
        </Form.Item>
        <Form.Item name="fuelType" label={<span style={fl}>Fuel Type</span>} style={{ marginBottom:12 }}>
          <Select style={fw}>
            {['Petrol','Diesel','Electric','CNG','Hybrid'].map(f => <Select.Option key={f} value={f}>{f}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="colour" label={<span style={fl}>Colour</span>} style={{ marginBottom:12 }}>
          <Input style={fw} />
        </Form.Item>
        <Form.Item name="chassisNo" label={<span style={fl}>Chassis No.</span>} style={{ marginBottom:12 }}>
          <Input style={fw} />
        </Form.Item>
        <Form.Item name="engineNo" label={<span style={fl}>Engine No.</span>} style={{ marginBottom:12 }}>
          <Input style={fw} />
        </Form.Item>
      </div>

      {/* Owner */}
      <SectionTitle>👤 Owner Details</SectionTitle>
      <div style={grid2}>
        <Form.Item name="ownerName" label={<span style={fl}>Owner Name *</span>} rules={[{ required:true }]} style={{ marginBottom:12 }}>
          <Input style={fw} />
        </Form.Item>
        <Form.Item name="mobile" label={<span style={fl}>Mobile *</span>} rules={[{ required:true }]} style={{ marginBottom:12 }}>
          <Input style={fw} />
        </Form.Item>
        <Form.Item name="address" label={<span style={fl}>Address</span>} style={{ marginBottom:12, gridColumn:'1/-1' }}>
          <Input style={fw} />
        </Form.Item>
      </div>

      {/* Insurance */}
      <SectionTitle>🛡️ Insurance Details</SectionTitle>
      <div style={grid2}>
        <Form.Item name="insurer" label={<span style={fl}>Insurer *</span>} rules={[{ required:true }]} style={{ marginBottom:12 }}>
          <Select style={fw}>
            {['HDFC Ergo','Bajaj Allianz','ICICI Lombard','New India Assurance','Oriental Insurance','United India','Reliance General','Tata AIG'].map(i => <Select.Option key={i} value={i}>{i}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="policyType" label={<span style={fl}>Policy Type *</span>} rules={[{ required:true }]} style={{ marginBottom:12 }}>
          <Select style={fw}>
            {['Comprehensive','ThirdParty','OwnDamage','ZeroDep'].map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="policyNumber" label={<span style={fl}>Policy Number</span>} style={{ marginBottom:12 }}>
          <Input style={fw} />
        </Form.Item>
        <Form.Item name="idv" label={<span style={fl}>IDV (₹)</span>} style={{ marginBottom:12 }}>
          <InputNumber style={fw} formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} />
        </Form.Item>
        <Form.Item name="netPremium" label={<span style={fl}>Net Premium (₹) *</span>} rules={[{ required:true }]} style={{ marginBottom:12 }}>
          <InputNumber style={fw} formatter={v => `₹ ${v}`} />
        </Form.Item>
        <Form.Item name="ncb" label={<span style={fl}>NCB %</span>} style={{ marginBottom:12 }}>
          <Select style={fw}>
            {[0,20,25,35,45,50].map(n => <Select.Option key={n} value={n}>{n}%</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="startDate" label={<span style={fl}>Start Date *</span>} rules={[{ required:true }]} style={{ marginBottom:12 }}>
          <DatePicker style={fw} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item name="expiryDate" label={<span style={fl}>Expiry Date *</span>} rules={[{ required:true }]} style={{ marginBottom:12 }}>
          <DatePicker style={fw} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item name="renewalDate" label={<span style={fl}>Renewal Date</span>} style={{ marginBottom:12 }}>
          <DatePicker style={fw} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item name="insuranceStatus" label={<span style={fl}>Insurance Status</span>} style={{ marginBottom:12 }}>
          <Select style={fw}>
            {['Active','ExpiringSoon','Expired','NewPolicy'].map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
          </Select>
        </Form.Item>
      </div>

      {/* Payment */}
      <SectionTitle>💳 Payment</SectionTitle>
      <div style={grid2}>
        <Form.Item name="paymentStatus" label={<span style={fl}>Payment Status</span>} style={{ marginBottom:12 }}>
          <Select style={fw}>
            {['Pending','Paid','Partial'].map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
          </Select>
        </Form.Item>
      </div>

      {/* Ticket settings */}
      <SectionTitle>⚙️ Ticket Settings</SectionTitle>
      <div style={grid2}>
        <Form.Item name="ticketType" label={<span style={fl}>Ticket Type</span>} rules={[{ required:true }]} style={{ marginBottom:12 }}>
          <Select style={fw}>
            {['Insurance','Payment','Office','Other'].map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="priority" label={<span style={fl}>Priority</span>} style={{ marginBottom:12 }}>
          <Select style={fw}>
            {['High','Medium','Low'].map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="status" label={<span style={fl}>Status</span>} style={{ marginBottom:12 }}>
          <Select style={fw}>
            {STATUS_OPTS.map(o => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="assignedTo" label={<span style={fl}>Assigned To</span>} style={{ marginBottom:12 }}>
          <Select style={fw} placeholder="Select agent">
            {['Rajesh Kumar','Karthik S','Priya V','Anand Raj'].map(a => <Select.Option key={a} value={a}>{a}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="dueDate" label={<span style={fl}>Due Date</span>} style={{ marginBottom:12 }}>
          <DatePicker style={fw} format="DD/MM/YYYY" />
        </Form.Item>
      </div>

      {/* Notes */}
      <SectionTitle>📝 Internal Notes</SectionTitle>
      <Form.Item name="notes" style={{ marginBottom:12 }}>
        <Input.TextArea rows={3} style={{ resize:'none', width:'100%' }} placeholder="Notes for the team…" />
      </Form.Item>
    </Form>
  );

  /* ═══════════════════════════════════════════════════════════════════ */
  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Button onClick={() => navigate('/tickets')}>← Back</Button>
          <div>
            <h2 style={{ margin:0, fontSize:18 }}>{ticket.ticketNumber} · {ticket.title}</h2>
            <p style={{ margin:0, color:'#888', fontSize:12 }}>
              Created {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
              {editMode && <span style={{ marginLeft:10, color:'#1565C0', fontWeight:600 }}>✏️ Edit Mode</span>}
            </p>
          </div>
        </div>

        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {editMode ? (
            <>
              <Button icon={<CloseOutlined />} onClick={() => setEditMode(false)}>Cancel</Button>
              <Button type="primary" icon={<SaveOutlined />} loading={saving}
                onClick={() => editForm.submit()}
                style={{ background:'#1565C0', borderColor:'#1565C0' }}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button icon={<EyeOutlined />} disabled style={{ color:'#1565C0', borderColor:'#1565C0' }}>View</Button>
              <Button icon={<EditOutlined />} onClick={enterEdit}
                style={{ background:'#1565C0', borderColor:'#1565C0', color:'#fff' }}>
                Edit
              </Button>
              <Select defaultValue={ticket.status} style={{ width:140 }} onChange={v => setNewStatus(v)}>
                {STATUS_OPTS.map(o => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)}
              </Select>
              <Button type="primary" loading={statusSaving} onClick={handleStatusSave}
                style={{ background:'#C8102E', borderColor:'#C8102E' }}>Save status</Button>
            </>
          )}
        </div>
      </div>

      {/* ── Workflow ─────────────────────────────────────────────────── */}
      <Card style={{ marginBottom:14, borderRadius:10 }} styles={{ body:{ padding:'14px 20px' } }}>
        <WorkflowSteps current={ticket.status as TicketStatus} />
      </Card>

      {/* ── Main 2-column layout ────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:14 }}>

        {/* LEFT — view tabs OR edit form */}
        <Card style={{ borderRadius:10 }}>
          {editMode
            ? editContent
            : <Tabs items={viewTabs} />
          }
        </Card>

        {/* RIGHT — sidebar (always visible) */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Card size="small" title="Ticket info" style={{ borderRadius:10 }}>
            {[
              ['Status',      <StatusBadge status={ticket.status as TicketStatus} />],
              ['Priority',    <PriorityTag priority={ticket.priority} />],
              ['Assigned to', ticket.assignedToName ?? '—'],
              ['Due date',    ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString('en-IN') : '—'],
              ['Updated',     new Date(ticket.updatedAt).toLocaleDateString('en-IN')],
            ].map(([k, v]) => (
              <div key={k as string} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:'1px solid #f5f5f5', fontSize:12 }}>
                <span style={{ color:'#888' }}>{k}</span><span>{v}</span>
              </div>
            ))}
          </Card>

          <Card size="small" title="Documents" style={{ borderRadius:10 }}>
            <DocStatus has={hasRC}  label="RC copy" />
            <DocStatus has={hasIns} label="Insurance copy" />
          </Card>

          <Card size="small" title="Insurance status" style={{ borderRadius:10 }}>
            <div style={{ fontSize:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f5f5f5' }}>
                <span style={{ color:'#888' }}>Status</span>
                <InsuranceStatusTag status={ticket.policy.insuranceStatus} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f5f5f5' }}>
                <span style={{ color:'#888' }}>Expiry</span>
                <span style={{ color: expiryDays <= 0 ? '#cf1322' : expiryDays <= 30 ? '#d46b08' : undefined, fontWeight:600 }}>
                  {new Date(ticket.policy.expiryDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0' }}>
                <span style={{ color:'#888' }}>Payment</span>
                <PaymentStatusTag status={ticket.payment.paymentStatus} />
              </div>
            </div>
          </Card>

          <Card size="small" title="Quick actions" style={{ borderRadius:10 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <Button block size="small" onClick={() => message.success('Reminder sent to customer!')}>Send reminder</Button>
              <Button block size="small" onClick={() => message.info('Renewal quote feature coming soon')}>Renewal quote</Button>
              <Button block size="small" onClick={() => message.info('Email sent!')}>Email policy copy</Button>
              <Button block size="small" danger onClick={() => message.warning('Ticket escalated')}>Escalate ticket</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
