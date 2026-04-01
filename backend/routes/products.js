const express = require('express');
const router = express.Router();

const products = [
  {
    id: 1,
    name: 'Farway AntiVirus',
    category: 'antivirus',
    description: 'Real-time malware protection with AI-powered threat detection for Windows.',
    price: 29.99,
    yearlyPrice: 24.99,
    features: ['Real-Time Protection', 'Malware Scanner', 'Quarantine Manager', 'Auto Updates', '24/7 Support'],
    badge: 'Best Seller',
    icon: 'shield',
  },
  {
    id: 2,
    name: 'Farway Internet Security',
    category: 'internet-security',
    description: 'Complete online protection including firewall, VPN, and phishing defense.',
    price: 49.99,
    yearlyPrice: 39.99,
    features: ['Everything in AntiVirus', 'Firewall', 'VPN (10GB/mo)', 'Anti-Phishing', 'Password Manager'],
    badge: 'Popular',
    icon: 'globe',
  },
  {
    id: 3,
    name: 'Farway Total Security',
    category: 'total-security',
    description: 'Ultimate protection suite for all your devices — PC, Mac, Android & iOS.',
    price: 79.99,
    yearlyPrice: 59.99,
    features: ['Everything in Internet Security', 'Unlimited VPN', 'Up to 5 Devices', 'Parental Controls', 'Dark Web Monitor'],
    badge: 'Best Value',
    icon: 'lock',
  },
  {
    id: 4,
    name: 'Farway Business Suite',
    category: 'business',
    description: 'Enterprise-grade cybersecurity for teams and organizations.',
    price: 149.99,
    yearlyPrice: 119.99,
    features: ['Centralized Dashboard', 'Endpoint Protection', 'Threat Intelligence', 'Compliance Reports', 'Dedicated Support'],
    badge: 'Enterprise',
    icon: 'building',
  },
];

router.get('/', (req, res) => res.json(products));
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

module.exports = router;
