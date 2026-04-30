import React from 'react';
import { Card, Row, Col, Select } from 'antd';
import { useKPIs, useMonthlyData } from '../hooks';
import { AvatarInitials } from '../components/shared';

export default function AnalyticsPage() {
  const { data: kpis } = useKPIs();
  const { data: monthly } = useMonthlyData();
  const maxT = Math.max(...(monthly?.map(m => m.tickets) ?? [1]));

  const statusBars = [
    { label:'Open',        count:38, pct:27, color:'#1677ff' },
    { label:'In progress', count:21, pct:15, color:'#d46b08' },
    { label:'Completed',   count:63, pct:44, color:'#52c41a' },
    { label:'Closed',      count:20, pct:14, color:'#888'    },
  ];
  const insurers = [
    { name:'HDFC Ergo',    count:50, pct:35, color:'#C8102E' },
    { name:'Bajaj Allianz',count:36, pct:25, color:'#d46b08' },
    { name:'ICICI Lombard',count:26, pct:18, color:'#1677ff' },
    { name:'New India',    count:20, pct:14, color:'#389e0d' },
    { name:'Others',       count:10, pct:8,  color:'#888'    },
  ];
  const agents = [
    { name:'Rajesh Kumar', tickets:52, pct:72 },
    { name:'Karthik S',    tickets:36, pct:50 },
    { name:'Priya V',      tickets:31, pct:43 },
    { name:'Anand Raj',    tickets:23, pct:32 },
  ];
  const expiry = [
    { label:'Expired',      count:4,   color:'#cf1322', sub:'Immediate action' },
    { label:'1–30 days',    count:9,   color:'#d46b08', sub:'Follow up now' },
    { label:'31–60 days',   count:14,  color:'#1677ff', sub:'Plan renewals' },
    { label:'60+ days',     count:115, color:'#52c41a', sub:'Active' },
  ];

  const barRow = (label: string, count: number, pct: number, color: string, labelW = 90) => (
    <div key={label} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
      <span style={{ width:labelW, fontSize:12, color:'#666', textAlign:'right', flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, background:'#f5f5f5', borderRadius:4, height:10, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:4, transition:'width .5s' }} />
      </div>
      <span style={{ width:26, fontSize:11, fontWeight:600, color:'#555' }}>{count}</span>
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
        <div><h2 style={{ margin:0 }}>Analytics</h2><p style={{ margin:0, color:'#888', fontSize:13 }}>April 2026 · All agents</p></div>
        <Select defaultValue="month" style={{ width:140 }}>
          <Select.Option value="month">This month</Select.Option>
          <Select.Option value="q">Last 90 days</Select.Option>
          <Select.Option value="year">This year</Select.Option>
        </Select>
      </div>

      <Row gutter={12} style={{ marginBottom:16 }}>
        {[
          { label:'Total tickets',    value: kpis?.totalTickets ?? 142, color: undefined },
          { label:'Completed',         value: 63,  color:'#389e0d' },
          { label:'Expired policies',  value: kpis?.expiredPolicies ?? 4, color:'#cf1322' },
          { label:'Premium (Apr)',     value:'₹31L', color: undefined },
        ].map(k => (
          <Col span={6} key={k.label}>
            <div style={{ background:'#f5f5f5', borderRadius:10, padding:'14px 18px', textAlign:'center' }}>
              <div style={{ fontSize:26, fontWeight:700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize:11, color:'#888', marginTop:3 }}>{k.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      <Row gutter={14} style={{ marginBottom:14 }}>
        <Col span={12}>
          <Card title="Tickets by status" style={{ borderRadius:10 }}>
            {statusBars.map(r => barRow(r.label, r.count, r.pct, r.color))}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Insurer distribution" style={{ borderRadius:10 }}>
            {insurers.map(r => barRow(r.name, r.count, r.pct, r.color, 100))}
          </Card>
        </Col>
      </Row>

      <Row gutter={14} style={{ marginBottom:14 }}>
        <Col span={12}>
          <Card title="Monthly ticket volume (2026)" style={{ borderRadius:10 }}>
            <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:110, paddingTop:8 }}>
              {(monthly ?? []).map((m, i) => (
                <div key={m.month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <span style={{ fontSize:11, color:'#888', fontWeight:500 }}>{m.tickets}</span>
                  <div style={{
                    width:'100%', borderRadius:'4px 4px 0 0', minHeight:8,
                    background: i === (monthly?.length ?? 0)-1 ? '#C8102E' : '#B5D4F4',
                    height:`${Math.round((m.tickets/maxT)*80)}px`, transition:'height .4s',
                  }} />
                  <span style={{ fontSize:12, color: i === (monthly?.length ?? 0)-1 ? '#C8102E' : '#888', fontWeight: i === (monthly?.length ?? 0)-1 ? 600 : 400 }}>{m.month}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Insurance expiry buckets" style={{ borderRadius:10 }}>
            {expiry.map(e => (
              <div key={e.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #f5f5f5' }}>
                <span style={{ fontSize:12, fontWeight:500, color:e.color }}>{e.label}</span>
                <span style={{ fontSize:11, color:'#888' }}>{e.sub}</span>
                <span style={{ fontSize:14, fontWeight:700, color:e.color }}>{e.count}</span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Row gutter={14}>
        <Col span={12}>
          <Card title="Payment collection" style={{ borderRadius:10 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:10 }}>
              <span style={{ fontSize:32, fontWeight:700, color:'#52c41a' }}>78%</span>
              <span style={{ fontSize:13, color:'#888' }}>of ₹31L collected this month</span>
            </div>
            <div style={{ background:'#f5f5f5', borderRadius:6, height:10, overflow:'hidden', marginBottom:8 }}>
              <div style={{ width:'78%', height:'100%', background:'#52c41a', borderRadius:6 }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#888', marginBottom:14 }}>
              <span>Collected: ₹24.2L</span><span>Pending: ₹6.8L</span>
            </div>
            <div style={{ fontSize:12, color:'#666', marginBottom:8 }}>By payment mode</div>
            {[{ label:'UPI', pct:55, color:'#1677ff' }, { label:'NEFT', pct:28, color:'#52c41a' }, { label:'Cash', pct:17, color:'#888' }].map(p =>
              barRow(p.label, p.pct, p.pct, p.color, 40)
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Agent performance" style={{ borderRadius:10 }}>
            {agents.map(a => (
              <div key={a.name} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <AvatarInitials name={a.name} size={26} />
                <span style={{ width:80, fontSize:12, color:'#555', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.name.split(' ')[0]}</span>
                <div style={{ flex:1, background:'#f5f5f5', borderRadius:4, height:8, overflow:'hidden' }}>
                  <div style={{ width:`${a.pct}%`, height:'100%', background:'#1677ff', borderRadius:4 }} />
                </div>
                <span style={{ width:26, fontSize:11, fontWeight:700, color:'#555' }}>{a.tickets}</span>
              </div>
            ))}
            <div style={{ marginTop:12, paddingTop:10, borderTop:'1px solid #f0f0f0', fontSize:12, color:'#888' }}>
              Avg. resolution: <strong style={{ color:'#555' }}>3.2 days</strong>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
