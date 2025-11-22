import React, { useState, useMemo } from 'react';
import { Network, Calculator } from 'lucide-react';

const IPSubnetCalculator = () => {
    const [ipAddress, setIpAddress] = useState('192.168.1.0');
    const [cidr, setCidr] = useState('24'); // Default to /24

    const subnetInfo = useMemo(() => {
        const calculate = (ip, cidrPrefix) => {
            try {
                const ipParts = ip.split('.').map(Number);
                if (ipParts.length !== 4 || ipParts.some(part => isNaN(part) || part < 0 || part > 255)) {
                    throw new Error("Invalid IP Address");
                }

                const prefix = parseInt(cidrPrefix, 10);
                if (isNaN(prefix) || prefix < 0 || prefix > 32) {
                    throw new Error("Invalid CIDR Prefix (0-32)");
                }

                let ipInt =
                    (ipParts[0] << 24) |
                    (ipParts[1] << 16) |
                    (ipParts[2] << 8) |
                    ipParts[3];

                const subnetMaskInt = prefix === 0 ? 0 : (~((1 << (32 - prefix)) - 1));
                
                const networkAddressInt = ipInt & subnetMaskInt;
                const broadcastAddressInt = networkAddressInt | (~subnetMaskInt);

                const firstHostInt = networkAddressInt === broadcastAddressInt ? 0 : networkAddressInt + 1;
                const lastHostInt = networkAddressInt === broadcastAddressInt ? 0 : broadcastAddressInt - 1;

                const numHosts = (subnetMaskInt === 0) ? (Math.pow(2, 32) - 2) : (Math.pow(2, (32 - prefix)) - 2); // -2 for network and broadcast

                const intToIp = (int) => {
                    return [
                        (int >>> 24) & 0xFF,
                        (int >>> 16) & 0xFF,
                        (int >>> 8) & 0xFF,
                        int & 0xFF,
                    ].join('.');
                };

                const intToSubnetMask = (int) => {
                    return [
                        (int >>> 24) & 0xFF,
                        (int >>> 16) & 0xFF,
                        (int >>> 8) & 0xFF,
                        int & 0xFF,
                    ].join('.');
                };

                return {
                    networkAddress: intToIp(networkAddressInt),
                    broadcastAddress: intToIp(broadcastAddressInt),
                    subnetMask: intToSubnetMask(subnetMaskInt),
                    cidrPrefix: prefix,
                    firstHost: intToIp(firstHostInt),
                    lastHost: intToIp(lastHostInt),
                    numUsableHosts: Math.max(0, numHosts), // ensure non-negative for /31 and /32
                    error: null
                };

            } catch (err) {
                return { error: err.message };
            }
        };

        return calculate(ipAddress, cidr);
    }, [ipAddress, cidr]);

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>IP Subnet Calculator</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Calculate network details based on IP address and CIDR prefix.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xl)' }}>

                    {/* IP Address Input */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            <Network size={20} /> IP Address
                        </label>
                        <input
                            type="text"
                            value={ipAddress}
                            onChange={(e) => setIpAddress(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            placeholder="e.g., 192.168.1.0"
                        />
                    </div>

                    {/* CIDR Input */}
                    <div>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                            <Calculator size={20} /> CIDR Prefix (/0 - /32)
                        </label>
                        <input
                            type="number"
                            value={cidr}
                            onChange={(e) => setCidr(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}
                            min="0"
                            max="32"
                            placeholder="e.g., 24"
                        />
                    </div>

                    {/* Results */}
                    {subnetInfo.error ? (
                        <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error-text)', backgroundColor: 'var(--color-error-bg)' }}>
                            <p style={{ color: 'var(--color-error-text)', fontWeight: 'bold' }}>Error: {subnetInfo.error}</p>
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-glow)' }}>
                            <p><strong>Network Address:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{subnetInfo.networkAddress}</span></p>
                            <p><strong>Broadcast Address:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{subnetInfo.broadcastAddress}</span></p>
                            <p><strong>Subnet Mask:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{subnetInfo.subnetMask}</span></p>
                            <p><strong>CIDR:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>/{subnetInfo.cidrPrefix}</span></p>
                            <p><strong>First Usable Host:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{subnetInfo.firstHost}</span></p>
                            <p><strong>Last Usable Host:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{subnetInfo.lastHost}</span></p>
                            <p><strong>Usable Hosts:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{subnetInfo.numUsableHosts}</span></p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IPSubnetCalculator;
