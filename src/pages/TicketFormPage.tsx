import React from 'react';
import { Card, Form, Input, Select, InputNumber, DatePicker, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/mockApi';
import { useMutation } from '../hooks';
import type { Ticket } from '../types';
import type { Dayjs } from 'dayjs';

export default function TicketFormPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutate: create, loading } = useMutation(api.createTicket);

  const onFinish = async (vals: Record<string, unknown>) => {
    const startDate = (vals.startDate as Dayjs)?.format('YYYY-MM-DD') ?? '';
    const expiryDate = (vals.expiryDate as Dayjs)?.format('YYYY-MM-DD') ?? '';
    const net = (vals.netPremium as number) ?? 0;

    const t = await create({
      title: `${vals.vehicleRegNo ?? 'New'} — ${vals.insurer ?? 'Policy'}`,
      priority: vals.priority as Ticket['priority'],
      status: vals.status as Ticket['status'],
      vehicleRegNo: vals.vehicleRegNo as string ?? '',
      vehicleName:  `${vals.make ?? ''} ${vals.model ?? ''}`.trim(),
      customerName:   vals.ownerName as string ?? '',
      customerMobile: vals.mobile    as string ?? '',
      internalNotes:  vals.notes     as string,
      policy: {
        id: '', insurer: vals.insurer as string ?? '',
        policyType: vals.policyType as Ticket['policy']['policyType'],
        policyNumber: vals.policyNumber as string,
        idv: vals.idv as number,
        netPremium: net,
        gst: Math.round(net * 0.18),
        totalPremium: Math.round(net * 1.18),
        ncbPercent: vals.ncb as number ?? 0,
        startDate,
        expiryDate,
        insuranceStatus: vals.insuranceStatus as Ticket['policy']['insuranceStatus'] ?? 'Active',
      },
      payment: {
        amount: Math.round(net * 1.18),
        paymentStatus: vals.paymentStatus as Ticket['payment']['paymentStatus'] ?? 'Pending',
      },
    } as Partial<Ticket>);

    if (t) {
      message.success('Ticket created successfully!');
      navigate(`/tickets/${t.id}`);
    }
  };

  const fw = { width: '100%' };
  const fl = { fontSize: 12, color: '#666' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <Button onClick={() => navigate('/tickets')}>← Back</Button>
          <div>
            <h2 style={{ margin:0 }}>New ticket</h2>
            <p style={{ margin:0, color:'#888', fontSize:13 }}>Fill vehicle and insurance details</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Button onClick={() => form.resetFields()}>Clear form</Button>
          <Button type="primary" loading={loading} onClick={() => form.submit()}
            style={{ background:'#C8102E', borderColor:'#C8102E' }}>Create ticket</Button>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ priority:'High', status:'Open', ncb:0, insuranceStatus:'Active', paymentStatus:'Pending' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:14 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            <Card title="Vehicle details" style={{ borderRadius:10 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Form.Item name="vehicleRegNo" label={<span style={fl}>Registration no. *</span>} rules={[{ required:true, message:'Required' }]}>
                  <Input placeholder="TN40AE6775" style={fw} /></Form.Item>
                <Form.Item name="make" label={<span style={fl}>Make *</span>} rules={[{ required:true }]}>
                  <Input placeholder="Mahindra" style={fw} /></Form.Item>
                <Form.Item name="model" label={<span style={fl}>Model *</span>} rules={[{ required:true }]}>
                  <Input placeholder="XUV3XO MX2 PRO" style={fw} /></Form.Item>
                <Form.Item name="year" label={<span style={fl}>Year</span>}>
                  <Input placeholder="2024" style={fw} /></Form.Item>
                <Form.Item name="fuelType" label={<span style={fl}>Fuel type</span>}>
                  <Select placeholder="Select…" style={fw}>
                    {['Petrol','Diesel','Electric','CNG','Hybrid'].map(f => <Select.Option key={f} value={f}>{f}</Select.Option>)}
                  </Select></Form.Item>
                <Form.Item name="colour" label={<span style={fl}>Colour</span>}>
                  <Input placeholder="White" style={fw} /></Form.Item>
                <Form.Item name="chassisNo" label={<span style={fl}>Chassis no.</span>}>
                  <Input placeholder="MA1FT2…" style={fw} /></Form.Item>
                <Form.Item name="engineNo" label={<span style={fl}>Engine no.</span>}>
                  <Input placeholder="G15B…" style={fw} /></Form.Item>
              </div>
              <div style={{ borderTop:'1px solid #f0f0f0', paddingTop:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Form.Item name="ownerName" label={<span style={fl}>Owner name *</span>} rules={[{ required:true }]}>
                  <Input placeholder="Full name" style={fw} /></Form.Item>
                <Form.Item name="mobile" label={<span style={fl}>Mobile *</span>} rules={[{ required:true }]}>
                  <Input placeholder="+91 98xxxxxxxx" style={fw} /></Form.Item>
                <Form.Item name="address" label={<span style={fl}>Address</span>} style={{ gridColumn:'1/-1' }}>
                  <Input placeholder="Street, city, PIN" style={fw} /></Form.Item>
              </div>
            </Card>

            <Card title="Insurance details" style={{ borderRadius:10 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Form.Item name="insurer" label={<span style={fl}>Insurer *</span>} rules={[{ required:true }]}>
                  <Select placeholder="Select…" style={fw}>
                    {['HDFC Ergo','Bajaj Allianz','ICICI Lombard','New India Assurance','Oriental Insurance','United India','Reliance General','Tata AIG'].map(i => <Select.Option key={i} value={i}>{i}</Select.Option>)}
                  </Select></Form.Item>
                <Form.Item name="policyType" label={<span style={fl}>Policy type *</span>} rules={[{ required:true }]}>
                  <Select placeholder="Select…" style={fw}>
                    {['Comprehensive','ThirdParty','OwnDamage','ZeroDep'].map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
                  </Select></Form.Item>
                <Form.Item name="policyNumber" label={<span style={fl}>Policy number</span>}>
                  <Input placeholder="Policy number" style={fw} /></Form.Item>
                <Form.Item name="idv" label={<span style={fl}>IDV (₹)</span>}>
                  <InputNumber placeholder="920000" style={fw} formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} /></Form.Item>
                <Form.Item name="netPremium" label={<span style={fl}>Net premium (₹) *</span>} rules={[{ required:true }]}>
                  <InputNumber placeholder="18400" style={fw} formatter={v => `₹ ${v}`} /></Form.Item>
                <Form.Item name="ncb" label={<span style={fl}>NCB %</span>}>
                  <Select style={fw}>{[0,20,25,35,45,50].map(n => <Select.Option key={n} value={n}>{n}%</Select.Option>)}</Select></Form.Item>
                <Form.Item name="startDate" label={<span style={fl}>Start date *</span>} rules={[{ required:true }]}>
                  <DatePicker style={fw} format="DD/MM/YYYY" /></Form.Item>
                <Form.Item name="expiryDate" label={<span style={fl}>Expiry date *</span>} rules={[{ required:true }]}>
                  <DatePicker style={fw} format="DD/MM/YYYY" /></Form.Item>
                <Form.Item name="renewalDate" label={<span style={fl}>Renewal date</span>}>
                  <DatePicker style={fw} format="DD/MM/YYYY" /></Form.Item>
                <Form.Item name="insuranceStatus" label={<span style={fl}>Insurance status</span>}>
                  <Select style={fw}>{['Active','ExpiringSoon','Expired','NewPolicy'].map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}</Select></Form.Item>
                <Form.Item name="paymentStatus" label={<span style={fl}>Payment status</span>}>
                  <Select style={fw}>{['Pending','Paid','Partial'].map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}</Select></Form.Item>
              </div>
            </Card>

            <Card title={<span>Documents <span style={{ fontSize:12, fontWeight:400, color:'#888' }}>(optional — upload anytime)</span></span>} style={{ borderRadius:10 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {['RC copy','Insurance copy'].map(label => (
                  <Upload key={label} beforeUpload={() => false} accept=".pdf,.jpg,.jpeg,.png" showUploadList>
                    <div style={{ border:'1px dashed #d9d9d9', borderRadius:8, padding:'18px 16px', textAlign:'center', cursor:'pointer', background:'#fafafa' }}>
                      <UploadOutlined style={{ fontSize:20, color:'#888', marginBottom:6 }} />
                      <div style={{ fontSize:12, color:'#666' }}>Upload {label}</div>
                      <div style={{ fontSize:11, color:'#bbb' }}>PDF · JPG · PNG · max 10 MB</div>
                    </div>
                  </Upload>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <Card title="Ticket settings" size="small" style={{ borderRadius:10 }}>
              <Form.Item name="priority" label={<span style={fl}>Priority</span>}>
                <Select style={fw}>{['High','Medium','Low'].map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}</Select></Form.Item>
              <Form.Item name="assignedTo" label={<span style={fl}>Assign to</span>}>
                <Select style={fw} placeholder="Select agent">
                  {['Rajesh Kumar','Karthik S','Priya V','Anand Raj'].map(a => <Select.Option key={a} value={a}>{a}</Select.Option>)}
                </Select></Form.Item>
              <Form.Item name="status" label={<span style={fl}>Initial status</span>}>
                <Select style={fw}>{['Open','InProgress'].map(s => <Select.Option key={s} value={s}>{s === 'InProgress' ? 'In progress' : s}</Select.Option>)}</Select></Form.Item>
              <Form.Item name="dueDate" label={<span style={fl}>Due date</span>}>
                <DatePicker style={fw} format="DD/MM/YYYY" /></Form.Item>
            </Card>
            <Card title="Internal notes" size="small" style={{ borderRadius:10 }}>
              <Form.Item name="notes" noStyle>
                <Input.TextArea rows={4} placeholder="Notes for the team…" style={{ resize:'none', width:'100%' }} />
              </Form.Item>
            </Card>
            <div style={{ background:'#f6f6f6', borderRadius:10, padding:'12px 14px', fontSize:11, color:'#888', lineHeight:1.7 }}>
              <strong style={{ color:'#555' }}>Required:</strong> Registration no., owner name, mobile, insurer, policy type, net premium, start &amp; expiry dates.<br /><br />
              Documents are optional and can be uploaded anytime after ticket creation.
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
