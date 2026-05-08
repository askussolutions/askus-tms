import React from 'react';
import { Card, Row, Col, Select, Empty } from 'antd';
import { useKPIs, useMonthlyData } from '../hooks';

export default function AnalyticsPage() {
  const { data: kpis } = useKPIs();
  const { data: monthly } = useMonthlyData();
  const maxT = Math.max(...(monthly?.map(m => m.tickets) ?? [1]));

  const totalTickets   = kpis?.totalTickets    ?? 0;
  const expiredCount   = kpis?.expiredPolicies ?? 0;
  const premiumL       = ((kpis?.premiumCollected ?? 0) / 100000).toFixed(1);
  const pendingL       = ((kpis?.pendingPayments  ?? 0) / 100000).toFixed(1);

  const now = new Date();
  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });

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
        <div>
          <h2 style={{ margin:0 }}>Analytics</h2>
          <p style={{ margin:0, color:'#888', fontSize:13 }}>{monthLabel} · All agents</p>
        </div>
        <Select defaultValue="month" style={{ width:140 }}>
          <Select.Option value="month">This month</Select.Option>
          <Select.Option value="q">Last 90 days</Select.Option>
          <Select.Option value="year">This year</Select.Option>
        </Select>
      </div>

      <Row gutter={12} style={{ marginBottom:16 }}>
        {[
          { label:'Total tickets',    value: totalTickets,  color: undefined },
          { label:'Completed',        value: 0,             color:'#389e0d' },
          { label:'Expired policies', value: expiredCount,  color:'#cf1322' },
          { label:'Premium collected',value:`₹${premiumL}L`,color: undefined },
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
            {totalTickets === 0 ? (
              <Empty description="No tickets yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <>
                {barRow('Open',        kpis?.openTickets ?? 0, totalTickets ? Math.round(((kpis?.openTickets ?? 0)/totalTickets)*100) : 0, '#1677ff')}
                {barRow('Completed',   0, 0, '#52c41a')}
                {barRow('Expired',     expiredCount, totalTickets ? Math.round((expiredCount/totalTickets)*100) : 0, '#cf1322')}
              </>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Insurer distribution" style={{ borderRadius:10 }}>
            <Empty description="No data yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Card>
        </Col>
      </Row>

      <Row gutter={14} style={{ marginBottom:14 }}>
        <Col span={12}>
          <Card title="Monthly ticket volume" style={{ borderRadius:10 }}>
            {(!monthly || monthly.length === 0) ? (
              <Empty description="No data yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:110, paddingTop:8 }}>
                {monthly.map((m, i) => (
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
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Insurance expiry buckets" style={{ borderRadius:10 }}>
            {totalTickets === 0 ? (
              <Empty description="No data yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <>
                {[
                  { label:'Expired',    count: expiredCount,                             color:'#cf1322', sub:'Immediate action' },
                  { label:'1–30 days',  count: kpis?.expiringIn30Days ?? 0,             color:'#d46b08', sub:'Follow up now' },
                  { label:'Active',     count: totalTickets - expiredCount - (kpis?.expiringIn30Days ?? 0), color:'#52c41a', sub:'Active' },
                ].map(e => (
                  <div key={e.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #f5f5f5' }}>
                    <span style={{ fontSize:12, fontWeight:500, color:e.color }}>{e.label}</span>
                    <span style={{ fontSize:11, color:'#888' }}>{e.sub}</span>
                    <span style={{ fontSize:14, fontWeight:700, color:e.color }}>{e.count}</span>
                  </div>
                ))}
              </>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={14}>
        <Col span={12}>
          <Card title="Payment collection" style={{ borderRadius:10 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:10 }}>
              <span style={{ fontSize:32, fontWeight:700, color:'#52c41a' }}>₹{premiumL}L</span>
              <span style={{ fontSize:13, color:'#888' }}>collected</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#888', marginBottom:14 }}>
              <span>Collected: ₹{premiumL}L</span><span>Pending: ₹{pendingL}L</span>
            </div>
            {parseFloat(premiumL) === 0 && parseFloat(pendingL) === 0 && (
              <Empty description="No payments yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Agent performance" style={{ borderRadius:10 }}>
            <Empty description="No ticket data yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
