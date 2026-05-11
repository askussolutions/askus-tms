import React, { useState } from 'react';
import { Form, Input, Button, Spin, message } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';

interface PolicyDetails {
  registrationNo: string;
  policyNumber: string;
  insurer: string;
  policyType: string;
  netPremium: number;
  gst: number;
  totalPremium: number;
  expiryDate: string;
  status: string;
}

export default function PolicyAmountChecker({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [policyDetails, setPolicyDetails] = useState<PolicyDetails | null>(null);

  const handleSearch = async (values: { registrationNo: string }) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock data - replace with actual API call
    const mockPolicy: PolicyDetails = {
      registrationNo: values.registrationNo.toUpperCase(),
      policyNumber: 'PB-2025-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      insurer: 'National Insurance Co.',
      policyType: 'Comprehensive',
      netPremium: 8500,
      gst: 1530,
      totalPremium: 10030,
      expiryDate: '2025-12-31',
      status: 'Active',
    };

    setPolicyDetails(mockPolicy);
    setLoading(false);
  };

  const handleReset = () => {
    form.resetFields();
    setPolicyDetails(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          maxWidth: 900,
          width: '90%',
          display: 'flex',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Spin spinning={loading}>
          {!policyDetails ? (
            // Search View - PolicyBazaar Style
            <div style={{ display: 'flex', width: '100%' }}>
              {/* Left Section - Illustration */}
              <div
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #e8f0fe 0%, #f3e5f5 100%)',
                  padding: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 450,
                }}
              >
                <svg
                  viewBox="0 0 300 300"
                  style={{ width: '100%', maxWidth: 280, height: 'auto' }}
                >
                  {/* Car */}
                  <g transform="translate(150, 160)">
                    {/* Car body */}
                    <ellipse cx="0" cy="0" rx="80" ry="35" fill="#9C5DE8" opacity="0.1" />
                    <rect x="-70" y="-25" width="140" height="40" rx="8" fill="#6B5B95" />
                    <rect x="-60" y="-35" width="50" height="20" rx="6" fill="#8B7BC3" />
                    <rect x="15" y="-35" width="50" height="20" rx="6" fill="#8B7BC3" />
                    {/* Wheels */}
                    <circle cx="-45" cy="25" r="12" fill="#333" />
                    <circle cx="45" cy="25" r="12" fill="#333" />
                    <circle cx="-45" cy="25" r="8" fill="#666" />
                    <circle cx="45" cy="25" r="8" fill="#666" />
                  </g>

                  {/* Insurance Document */}
                  <g transform="translate(80, 80)">
                    <rect x="0" y="0" width="50" height="70" rx="4" fill="#B3E5FC" />
                    <text x="25" y="25" fontSize="12" fontWeight="700" fill="#0277BD" textAnchor="middle">
                      INSURANCE
                    </text>
                    <circle cx="35" cy="45" r="6" fill="#4CAF50" />
                    <text x="38" y="47" fontSize="8" fill="#fff" textAnchor="middle">
                      ✓
                    </text>
                  </g>

                  {/* Shield */}
                  <g transform="translate(220, 90)">
                    <path
                      d="M 0 0 L 0 35 C 0 50 15 60 30 65 C 45 60 60 50 60 35 L 60 0 Z"
                      fill="#4CAF50"
                    />
                    <circle cx="30" cy="30" r="12" fill="#fff" />
                    <text x="30" y="35" fontSize="14" fontWeight="700" fill="#4CAF50" textAnchor="middle">
                      ✓
                    </text>
                  </g>

                  {/* Tree */}
                  <g transform="translate(250, 220)">
                    <rect x="-3" y="0" width="6" height="20" fill="#8B6F47" />
                    <path d="M 0 0 L -15 10 L -5 10 L -20 20 L -10 20 L -25 30 L 25 30 L 10 20 L 20 20 L 5 10 L 15 10 Z" fill="#66BB6A" />
                  </g>
                </svg>
              </div>

              {/* Right Section - Form */}
              <div style={{ flex: 1, padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1f1f1f', margin: 0, lineHeight: 1.2, marginBottom: 8 }}>
                    Compare & <span style={{ color: '#2e7d32', fontWeight: 800 }}>save upto 91%*</span>
                  </h2>
                  <p style={{ fontSize: 18, color: '#666', margin: 0, marginBottom: 16 }}>
                    on Car insurance
                  </p>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#f1f8e9',
                      color: '#2e7d32',
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 24,
                    }}
                  >
                    ⚡ Get policy in 10 minutes*
                  </div>
                </div>

                <Form form={form} layout="vertical" onFinish={handleSearch}>
                  <Form.Item name="registrationNo" noStyle>
                    <Input
                      placeholder="Enter car number (eg. DL-10-CB-1234)"
                      style={{
                        fontSize: 14,
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        marginBottom: 16,
                        height: 44,
                      }}
                      rules={[
                        { required: true, message: 'Please enter registration number' },
                      ]}
                    />
                  </Form.Item>

                  <Button
                    htmlType="submit"
                    block
                    style={{
                      background: '#FF6B5B',
                      color: '#fff',
                      border: 'none',
                      height: 44,
                      fontSize: 15,
                      fontWeight: 700,
                      borderRadius: 8,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    View Prices
                    <ArrowRightOutlined />
                  </Button>
                </Form>

                <div style={{ textAlign: 'center', color: '#666', fontSize: 13 }}>
                  Brand new car?{' '}
                  <a
                    href="#"
                    style={{ color: '#2e7d32', fontWeight: 600, textDecoration: 'none' }}
                    onClick={(e) => {
                      e.preventDefault();
                      message.info('Starting new policy request...');
                    }}
                  >
                    Click here {'>'}
                  </a>
                </div>
              </div>
            </div>
          ) : (
            // Results View
            <div style={{ padding: 40, maxWidth: 700, margin: '0 auto', width: '100%' }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2e7d32', marginBottom: 24, margin: 0 }}>
                ✓ Policy Found!
              </h2>

              {/* Premium Box */}
              <div
                style={{
                  background: '#FFF3E0',
                  borderLeft: '4px solid #FF6B5B',
                  padding: 24,
                  borderRadius: 8,
                  marginBottom: 24,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Registration</div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        background: '#fff',
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 6,
                        color: '#1565C0',
                      }}
                    >
                      {policyDetails?.registrationNo}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Premium</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#C8102E' }}>
                      ₹{policyDetails?.totalPremium.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy Details */}
              <div
                style={{
                  background: '#f9f9f9',
                  padding: 20,
                  borderRadius: 8,
                  marginBottom: 24,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Policy No.</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1f1f1f' }}>
                      {policyDetails?.policyNumber}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Insurer</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1f1f1f' }}>
                      {policyDetails?.insurer}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Policy Type</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1f1f1f' }}>
                      {policyDetails?.policyType}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Expiry Date</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1f1f1f' }}>
                      {policyDetails?.expiryDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Breakdown */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #e0e0e0' }}>
                  <span style={{ color: '#666' }}>Net Premium</span>
                  <span style={{ fontWeight: 600 }}>₹{policyDetails?.netPremium.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #e0e0e0' }}>
                  <span style={{ color: '#666' }}>GST (18%)</span>
                  <span style={{ fontWeight: 600 }}>₹{policyDetails?.gst.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontSize: 16, fontWeight: 700, color: '#C8102E' }}>
                  <span>Total Premium</span>
                  <span>₹{policyDetails?.totalPremium.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <Button
                  block
                  size="large"
                  onClick={handleReset}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  Check Another
                </Button>
                <Button
                  block
                  size="large"
                  type="primary"
                  style={{ background: '#C8102E', borderRadius: 8, fontWeight: 600 }}
                  onClick={handleClose}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
}
