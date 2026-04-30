import React, { useState } from 'react';
import { Card, Tabs, Button, Select, Descriptions, Tag, Upload, Input, message, Spin } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTicket, useMutation } from '../hooks';
import { api } from '../api/mockApi';
import { WorkflowSteps, StatusBadge, PriorityTag, InsuranceStatusTag, PaymentStatusTag, DocStatus, AvatarInitials } from '../components/shared';
import type { TicketStatus } from '../types';

const STATUS_OPTS = [
  { value:'Open', label:'Open' },
  { value:'InProgress', label:'In progress' },
  { value:'Completed', label:'Completed' },
  { value:'Closed', label:'Closed' },
];

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ticket, loading, refetch } = useTicket(id!);
  const [comment, setComment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const navigate = useNavigate();
  const { mutate: updateStatus, loading: saving } = useMutation(api.updateTicketStatus);
  const { mutate: addCommentFn, loading: commenting } = useMutation(api.addComment);

  if (loading) return <Spin size="large" style={{ display:'block', margin:'80px auto' }} />;
  if (!ticket) return <div style={{ padding:40, color:'#888' }}>Ticket not found</div>;

  const expiryDays = Math.ceil((new Date(ticket.policy.expiryDate).getTime() - Date.now()) / 86400000);
  const hasRC  = ticket.documents.some(d => d.type === 'RC');
  const hasIns = ticket.documents.some(d => d.type === 'Insurance');

  const handleStatusSave = async () => {
    const target = newStatus || ticket.status;
    await updateStatus(ticket.id, target);
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

  const tabs = [
    {
      key: 'vehicle', label: 'Vehicle',
      children: (
        <Descriptions column={2} size="small" bordered
          labelStyle={{ fontSize:12, color:'#888', width:130 }} contentStyle={{ fontSize:12 }}>
          <Descriptions.Item label="Registration no."><strong>{ticket.vehicleRegNo}</strong></Descriptions.Item>
          <Descriptions.Item label="Vehicle">{ticket.vehicleName}</Descriptions.Item>
          <Descriptions.Item label="Owner name">{ticket.customerName}</Descriptions.Item>
          <Descriptions.Item label="Mobile">{ticket.customerMobile}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'insurance', label: 'Insurance',
      children: (
        <Descriptions column={2} size="small" bordered
          labelStyle={{ fontSize:12, color:'#888', width:130 }} contentStyle={{ fontSize:12 }}>
          <Descriptions.Item label="Insurer"><strong>{ticket.policy.insurer}</strong></Descriptions.Item>
          <Descriptions.Item label="Policy type">{ticket.policy.policyType}</Descriptions.Item>
          <Descriptions.Item label="Policy no.">{ticket.policy.policyNumber ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="IDV">₹{ticket.policy.idv?.toLocaleString('en-IN') ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Net premium">₹{ticket.policy.netPremium.toLocaleString('en-IN')}</Descriptions.Item>
          <Descriptions.Item label="Total (incl. GST)"><strong>₹{ticket.policy.totalPremium.toLocaleString('en-IN')}</strong></Descriptions.Item>
          <Descriptions.Item label="Start date">{new Date(ticket.policy.startDate).toLocaleDateString('en-IN')}</Descriptions.Item>
          <Descriptions.Item label="Expiry date">
            <span style={{ color: expiryDays <= 0 ? '#cf1322' : expiryDays <= 30 ? '#d46b08' : undefined, fontWeight: expiryDays <= 30 ? 600 : 400 }}>
              {new Date(ticket.policy.expiryDate).toLocaleDateString('en-IN')}
              {expiryDays <= 0 ? ' (Expired)' : expiryDays <= 30 ? ` · ${expiryDays}d left` : ''}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="NCB">{ticket.policy.ncbPercent}%</Descriptions.Item>
          <Descriptions.Item label="Status"><InsuranceStatusTag status={ticket.policy.insuranceStatus} /></Descriptions.Item>
          <Descriptions.Item label="Renewal date">{ticket.policy.renewalDate ?? '—'}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'payment', label: 'Payment',
      children: (
        <div>
          <Descriptions column={2} size="small" bordered style={{ marginBottom:16 }}
            labelStyle={{ fontSize:12, color:'#888', width:130 }} contentStyle={{ fontSize:12 }}>
            <Descriptions.Item label="Amount">₹{ticket.payment.amount.toLocaleString('en-IN')}</Descriptions.Item>
            <Descriptions.Item label="Status"><PaymentStatusTag status={ticket.payment.paymentStatus} /></Descriptions.Item>
            <Descriptions.Item label="Mode">{ticket.payment.paymentMode ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Transaction ID">{ticket.payment.transactionId ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Paid on">{ticket.payment.paidAt ? new Date(ticket.payment.paidAt).toLocaleDateString('en-IN') : '—'}</Descriptions.Item>
          </Descriptions>
          {ticket.payment.paymentStatus === 'Pending' && (
            <div style={{ background:'#fafafa', border:'1px solid #f0f0f0', borderRadius:8, padding:14 }}>
              <div style={{ fontWeight:500, fontSize:13, marginBottom:12 }}>Record payment</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:12, color:'#888', marginBottom:4 }}>Payment mode</div>
                  <Select style={{ width:'100%' }} defaultValue="UPI">
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
                <div style={{ border:'1px dashed #d9d9d9', borderRadius:8, padding:'18px 16px', textAlign:'center', cursor:'pointer', background:'#fafafa' }}>
                  <UploadOutlined style={{ fontSize:20, color:'#888', marginBottom:6 }} />
                  <div style={{ fontSize:12, color:'#666' }}>Upload {type} copy</div>
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

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Button onClick={() => navigate('/tickets')}>← Back</Button>
          <div>
            <h2 style={{ margin:0, fontSize:18 }}>{ticket.ticketNumber} · {ticket.title}</h2>
            <p style={{ margin:0, color:'#888', fontSize:12 }}>Created {new Date(ticket.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <Select defaultValue={ticket.status} style={{ width:140 }} onChange={v => setNewStatus(v)}>
            {STATUS_OPTS.map(o => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)}
          </Select>
          <Button type="primary" loading={saving} onClick={handleStatusSave}
            style={{ background:'#C8102E', borderColor:'#C8102E' }}>Save status</Button>
        </div>
      </div>

      <Card style={{ marginBottom:14, borderRadius:10 }} styles={{ body:{ padding:'14px 20px' } }}>
        <WorkflowSteps current={ticket.status as TicketStatus} />
      </Card>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:14 }}>
        <Card style={{ borderRadius:10 }}>
          <Tabs items={tabs} />
        </Card>

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
