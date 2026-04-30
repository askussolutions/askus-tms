import React, { useState } from 'react';
import { Card, Tag, Button, Select, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../hooks';
import { PriorityTag } from '../components/shared';
import type { TicketStatus } from '../types';

const COLS: { key: TicketStatus; label: string; dot: string }[] = [
  { key: 'Open',       label: 'Open',        dot: '#1677ff' },
  { key: 'InProgress', label: 'In progress', dot: '#d46b08' },
  { key: 'Completed',  label: 'Completed',   dot: '#389e0d' },
  { key: 'Closed',     label: 'Closed',      dot: '#888'    },
];

export default function BoardPage() {
  const [agentFilter, setAgentFilter] = useState('');
  const { data, loading } = useTickets({ pageSize: 100 });
  const navigate = useNavigate();

  const tickets = data?.data ?? [];
  const byStatus = (s: TicketStatus) => tickets.filter(t =>
    t.status === s && (!agentFilter || t.assignedToName === agentFilter)
  );
  const daysLeft = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <h2 style={{ margin:0 }}>Ticket board</h2>
          <p style={{ margin:0, color:'#888', fontSize:13 }}>{data?.total ?? 0} tickets</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Select placeholder="All agents" allowClear style={{ width:140 }} onChange={(v) => setAgentFilter(v ?? '')}
            options={['Rajesh Kumar','Karthik S','Priya V','Anand Raj'].map(a => ({ value:a, label:a }))} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/tickets/new')}
            style={{ background:'#C8102E', borderColor:'#C8102E' }}>New ticket</Button>
        </div>
      </div>

      {loading ? <Spin size="large" style={{ display:'block', margin:'80px auto' }} /> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {COLS.map(col => (
            <div key={col.key} style={{ background:'#f5f5f5', borderRadius:10, padding:10, minHeight:420 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ fontWeight:600, fontSize:12, display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:col.dot, display:'inline-block' }} />
                  {col.label}
                </span>
                <Tag style={{ fontSize:10, margin:0 }}>{byStatus(col.key).length}</Tag>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {byStatus(col.key).map(t => {
                  const days = daysLeft(t.policy.expiryDate);
                  return (
                    <Card key={t.id} size="small" style={{ borderRadius:8, cursor:'pointer', border:'1px solid #f0f0f0' }}
                      styles={{ body:{ padding:'10px 12px' } }} onClick={() => navigate(`/tickets/${t.id}`)}>
                      <div style={{ fontSize:10, color:'#bbb', marginBottom:2 }}>{t.ticketNumber}</div>
                      <div style={{ fontWeight:500, fontSize:12, marginBottom:4, lineHeight:1.4 }}>{t.title}</div>
                      <div style={{ fontSize:11, color:'#888', marginBottom:5 }}>{t.vehicleRegNo} · {t.customerName}</div>
                      {days <= 30 && (
                        <div style={{ fontSize:10, color: days < 0 ? '#cf1322' : '#d46b08', marginBottom:5 }}>
                          {days < 0 ? `Expired ${Math.abs(days)}d ago` : `Expiry in ${days}d`}
                        </div>
                      )}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <PriorityTag priority={t.priority} />
                        <span style={{ fontSize:10, color:'#bbb' }}>{t.assignedToName}</span>
                      </div>
                    </Card>
                  );
                })}
                <Button type="dashed" size="small" block icon={<PlusOutlined />}
                  onClick={() => navigate('/tickets/new')} style={{ fontSize:11, color:'#888' }}>
                  Add ticket
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
