import React, { useState } from 'react';
import { Card, Select, Button, Input, Tag, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../hooks';
import { StatusBadge, PriorityTag, ExpiryTag } from '../components/shared';
import type { TicketStatus, Priority } from '../types';

export default function TicketsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search:'', status:'', priority:'', insurer:'', page:1, pageSize:20 });
  const { data, loading } = useTickets(filters);
  const set = (k: string, v: string) => setFilters(f => ({ ...f, [k]: v, page:1 }));

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <h2 style={{ margin:0 }}>All tickets</h2>
          <p style={{ margin:0, color:'#888', fontSize:13 }}>{data?.total ?? 0} tickets</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Button>Export CSV</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/tickets/new')}
            style={{ background:'#C8102E', borderColor:'#C8102E' }}>New ticket</Button>
        </div>
      </div>

      <Card style={{ marginBottom:14, borderRadius:10 }} styles={{ body:{ padding:'12px 16px' } }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <Input.Search placeholder="Search reg. no., owner, ticket…" style={{ flex:1, minWidth:200 }} allowClear
            onSearch={v => set('search', v)} />
          <Select placeholder="Status" allowClear style={{ width:130 }} onChange={v => set('status', v ?? '')}>
            {['Open','InProgress','Completed','Closed'].map(s =>
              <Select.Option key={s} value={s}>{s === 'InProgress' ? 'In progress' : s}</Select.Option>)}
          </Select>
          <Select placeholder="Priority" allowClear style={{ width:110 }} onChange={v => set('priority', v ?? '')}>
            {['High','Medium','Low'].map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
          </Select>
          <Select placeholder="Insurer" allowClear style={{ width:150 }} onChange={v => set('insurer', v ?? '')}>
            {['HDFC Ergo','Bajaj Allianz','ICICI Lombard','New India','Oriental'].map(i =>
              <Select.Option key={i} value={i}>{i}</Select.Option>)}
          </Select>
        </div>
      </Card>

      <Card style={{ borderRadius:10 }} styles={{ body:{ padding:0 } }}>
        {loading ? <Spin style={{ display:'block', margin:40, textAlign:'center' }} /> : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#fafafa', borderBottom:'1px solid #f0f0f0' }}>
                {['Ticket','Vehicle / Owner','Insurer','Expiry','Status','Priority','Actions'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'.03em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map(t => (
                <tr key={t.id} style={{ borderBottom:'1px solid #f0f0f0', cursor:'pointer' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background='#fafafa'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background=''}
                  onClick={() => navigate(`/tickets/${t.id}`)}>
                  <td style={{ padding:'10px 14px' }}>
                    <span style={{ color:'#1677ff', fontWeight:600, fontSize:12 }}>{t.ticketNumber}</span>
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ fontWeight:500, fontSize:12 }}>{t.vehicleRegNo} · {t.vehicleName}</div>
                    <div style={{ fontSize:11, color:'#888' }}>{t.customerName}</div>
                  </td>
                  <td style={{ padding:'10px 14px', fontSize:12 }}>{t.policy.insurer}</td>
                  <td style={{ padding:'10px 14px' }}><ExpiryTag date={t.policy.expiryDate} /></td>
                  <td style={{ padding:'10px 14px' }}><StatusBadge status={t.status as TicketStatus} /></td>
                  <td style={{ padding:'10px 14px' }}><PriorityTag priority={t.priority as Priority} /></td>
                  <td style={{ padding:'10px 14px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display:'flex', gap:5 }}>
                      <Button size="small" onClick={() => navigate(`/tickets/${t.id}`)}>View</Button>
                      <Button size="small" type="primary" style={{ background:'#C8102E', borderColor:'#C8102E' }}
                        onClick={() => navigate(`/tickets/${t.id}`)}>Edit</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #f0f0f0' }}>
          <span style={{ fontSize:12, color:'#888' }}>Showing {data?.data.length ?? 0} of {data?.total ?? 0}</span>
          <div style={{ display:'flex', gap:6 }}>
            <Button size="small" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page:f.page-1 }))}>← Prev</Button>
            <Button size="small" disabled={(filters.page * filters.pageSize) >= (data?.total ?? 0)}
              onClick={() => setFilters(f => ({ ...f, page:f.page+1 }))}>Next →</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
