/**
 * mockData.ts — Centralized mock data for Veridico demo mode.
 * All pages consume data from stores seeded with this file.
 */
import type { BackendInvoice, BackendInvoiceLine, BackendTaxLine } from '@/services/invoiceService'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function line(
  n: number,
  description: string,
  quantity: number,
  unitPrice: number,
  unit = 'ud',
  discountRate = 0,
): BackendInvoiceLine {
  const netAmount = +(quantity * unitPrice * (1 - discountRate / 100)).toFixed(2)
  return { lineNumber: n, description, quantity, unitPrice, unit, discountRate, netAmount }
}

function tax(taxableBase: number, taxRate: number): BackendTaxLine {
  return {
    taxType: 'IVA',
    taxableBase: +taxableBase.toFixed(2),
    taxRate,
    taxAmount: +(taxableBase * taxRate / 100).toFixed(2),
    isWithheld: false,
  }
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

const ISSUER = {
  issuerNif: 'B65432187',
  issuerName: 'Veridico Soluciones S.L.',
  issuerAddress: 'Calle Gran Vía 28, 28013 Madrid',
  issuerEmail: 'admin@veridico.es',
  issuerPhone: '+34 910 123 456',
  issuerIban: 'ES76 2100 0418 4012 3456 7891',
}

// ─────────────────────────────────────────────────────────────
// Mock Clients (exported for clientStore)
// ─────────────────────────────────────────────────────────────

export interface MockClient {
  id: string
  type: 'company' | 'individual'
  nif: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country: string
  totalInvoiced: number
  invoiceCount: number
  lastInvoiceDate?: string
  createdAt: string
}

export const MOCK_CLIENTS: MockClient[] = [
  {
    id: 'c1',
    type: 'company',
    nif: 'B12345678',
    name: 'Empresa Ejemplo S.L.',
    email: 'contacto@ejemplo.com',
    phone: '+34 912 345 678',
    address: 'Calle Mayor, 123',
    city: 'Madrid',
    postalCode: '28001',
    country: 'España',
    totalInvoiced: 45780.50,
    invoiceCount: 23,
    lastInvoiceDate: daysAgo(5),
    createdAt: daysAgo(400),
  },
  {
    id: 'c2',
    type: 'company',
    nif: 'A87654321',
    name: 'Cliente Demo S.A.',
    email: 'admin@clientedemo.es',
    phone: '+34 934 567 890',
    address: 'Av. Diagonal, 456',
    city: 'Barcelona',
    postalCode: '08006',
    country: 'España',
    totalInvoiced: 32100.00,
    invoiceCount: 15,
    lastInvoiceDate: daysAgo(12),
    createdAt: daysAgo(500),
  },
  {
    id: 'c3',
    type: 'company',
    nif: 'B11223344',
    name: 'Servicios Tech S.L.',
    email: 'info@serviciostech.com',
    phone: '+34 963 456 789',
    address: 'Polígono Industrial, Nave 5',
    city: 'Valencia',
    postalCode: '46001',
    country: 'España',
    totalInvoiced: 18500.00,
    invoiceCount: 8,
    lastInvoiceDate: daysAgo(18),
    createdAt: daysAgo(600),
  },
  {
    id: 'c4',
    type: 'individual',
    nif: '12345678A',
    name: 'Juan García López',
    email: 'juan.garcia@email.com',
    phone: '+34 655 123 456',
    city: 'Sevilla',
    country: 'España',
    totalInvoiced: 2400.00,
    invoiceCount: 3,
    lastInvoiceDate: daysAgo(25),
    createdAt: daysAgo(700),
  },
  {
    id: 'c5',
    type: 'company',
    nif: 'B23456789',
    name: 'Consulting Pro S.L.',
    email: 'contacto@consultingpro.es',
    phone: '+34 944 123 456',
    address: 'Plaza España, 10',
    city: 'Bilbao',
    postalCode: '48001',
    country: 'España',
    totalInvoiced: 67890.00,
    invoiceCount: 45,
    lastInvoiceDate: daysAgo(3),
    createdAt: daysAgo(900),
  },
  {
    id: 'c6',
    type: 'company',
    nif: 'B87654321',
    name: 'Global Services S.L.',
    email: 'info@globalservices.es',
    phone: '+34 915 678 901',
    address: 'Paseo de la Castellana, 200',
    city: 'Madrid',
    postalCode: '28046',
    country: 'España',
    totalInvoiced: 58400.00,
    invoiceCount: 24,
    lastInvoiceDate: daysAgo(7),
    createdAt: daysAgo(800),
  },
  {
    id: 'c7',
    type: 'company',
    nif: 'A12345678',
    name: 'Tech Solutions S.A.',
    email: 'contacto@techsolutions.es',
    phone: '+34 916 789 012',
    address: 'Calle Alcalá, 500',
    city: 'Madrid',
    postalCode: '28027',
    country: 'España',
    totalInvoiced: 43200.00,
    invoiceCount: 18,
    lastInvoiceDate: daysAgo(10),
    createdAt: daysAgo(750),
  },
]

// ─────────────────────────────────────────────────────────────
// Mock Invoices (exported for invoiceStore)
// ─────────────────────────────────────────────────────────────

export const MOCK_INVOICES: BackendInvoice[] = [
  // ── 1. FIRMADA ──────────────────────────────────────────────
  (() => {
    const lines = [
      line(1, 'Consultoría tecnológica', 2, 1000, 'día'),
      line(2, 'Desplazamiento y dietas', 1, 250, 'ud'),
    ]
    const taxableBase = lines.reduce((s, l) => s + l.netAmount, 0)
    return {
      ...ISSUER,
      id: 'inv-001',
      series: 'A',
      number: '0001',
      fullNumber: 'A-2024-0001',
      issueDate: daysAgo(45),
      dueDate: daysAgo(15),
      status: 'FIRMADA' as const,
      customerNif: 'B12345678',
      customerName: 'Empresa Ejemplo S.L.',
      customerAddress: 'Calle Mayor, 123, 28001 Madrid',
      customerEmail: 'contacto@ejemplo.com',
      lines,
      taxes: [tax(taxableBase, 21)],
      taxableBase: +taxableBase.toFixed(2),
      totalTax: +(taxableBase * 0.21).toFixed(2),
      totalAmount: +(taxableBase * 1.21).toFixed(2),
      invoiceType: 'ORDINARIA',
      digitalSignature: 'sha256:4f3e2d1c0b9a8f7e6d5c4b3a2190817263544f3e2d1c0b9a8f7e6d5c4b3a219081726354',
      paymentMethod: 'Transferencia bancaria',
      createdAt: daysAgo(45),
      updatedAt: daysAgo(44),
      createdBy: 'demo',
    }
  })(),

  // ── 2. ENVIADA ──────────────────────────────────────────────
  (() => {
    const lines = [
      line(1, 'Desarrollo de software backend', 60, 90, 'h'),
      line(2, 'Testing y QA', 20, 75, 'h'),
    ]
    const taxableBase = lines.reduce((s, l) => s + l.netAmount, 0)
    return {
      ...ISSUER,
      id: 'inv-002',
      series: 'A',
      number: '0002',
      fullNumber: 'A-2024-0002',
      issueDate: daysAgo(32),
      dueDate: daysAgo(2),
      status: 'ENVIADA' as const,
      customerNif: 'A87654321',
      customerName: 'Cliente Demo S.A.',
      customerAddress: 'Av. Diagonal, 456, 08006 Barcelona',
      customerEmail: 'admin@clientedemo.es',
      lines,
      taxes: [tax(taxableBase, 21)],
      taxableBase: +taxableBase.toFixed(2),
      totalTax: +(taxableBase * 0.21).toFixed(2),
      totalAmount: +(taxableBase * 1.21).toFixed(2),
      invoiceType: 'ORDINARIA',
      digitalSignature: 'sha256:9a8b7c6d5e4f3021a8b7c6d5e4f302190a8b7c6d5e4f30219081726354a8b7c6',
      paymentMethod: 'Transferencia bancaria',
      notes: 'Proyecto de integración API REST v2. Milestone completado.',
      createdAt: daysAgo(32),
      updatedAt: daysAgo(31),
      createdBy: 'demo',
    }
  })(),

  // ── 3. BORRADOR ─────────────────────────────────────────────
  (() => {
    const lines = [
      line(1, 'Diseño UI/UX — aplicación móvil', 1, 1200, 'servicio'),
    ]
    const taxableBase = lines.reduce((s, l) => s + l.netAmount, 0)
    return {
      ...ISSUER,
      id: 'inv-003',
      series: 'A',
      number: '0003',
      fullNumber: 'A-2024-0003',
      issueDate: daysAgo(5),
      dueDate: daysAgo(-25),
      status: 'BORRADOR' as const,
      customerNif: 'B11223344',
      customerName: 'Servicios Tech S.L.',
      customerAddress: 'Polígono Industrial, Nave 5, 46001 Valencia',
      customerEmail: 'info@serviciostech.com',
      lines,
      taxes: [tax(taxableBase, 21)],
      taxableBase: +taxableBase.toFixed(2),
      totalTax: +(taxableBase * 0.21).toFixed(2),
      totalAmount: +(taxableBase * 1.21).toFixed(2),
      invoiceType: 'ORDINARIA',
      paymentMethod: 'Transferencia bancaria',
      createdAt: daysAgo(5),
      createdBy: 'demo',
    }
  })(),

  // ── 4. FIRMADA ──────────────────────────────────────────────
  (() => {
    const lines = [
      line(1, 'Auditoría de sistemas de información', 5, 2000, 'día'),
      line(2, 'Informe ejecutivo y documentación', 1, 1500, 'ud'),
      line(3, 'Evaluación de seguridad', 1, 3000, 'ud'),
    ]
    const taxableBase = lines.reduce((s, l) => s + l.netAmount, 0)
    return {
      ...ISSUER,
      id: 'inv-004',
      series: 'A',
      number: '0004',
      fullNumber: 'A-2024-0004',
      issueDate: daysAgo(60),
      dueDate: daysAgo(30),
      status: 'FIRMADA' as const,
      customerNif: 'B87654321',
      customerName: 'Global Services S.L.',
      customerAddress: 'Paseo de la Castellana, 200, 28046 Madrid',
      customerEmail: 'info@globalservices.es',
      lines,
      taxes: [tax(taxableBase, 21)],
      taxableBase: +taxableBase.toFixed(2),
      totalTax: +(taxableBase * 0.21).toFixed(2),
      totalAmount: +(taxableBase * 1.21).toFixed(2),
      invoiceType: 'ORDINARIA',
      digitalSignature: 'sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
      paymentMethod: 'Transferencia bancaria',
      notes: 'Auditoría completa según ISO 27001.',
      createdAt: daysAgo(60),
      updatedAt: daysAgo(59),
      createdBy: 'demo',
    }
  })(),

  // ── 5. ANULADA ──────────────────────────────────────────────
  (() => {
    const lines = [
      line(1, 'Formación en transformación digital', 2, 400, 'jornada'),
    ]
    const taxableBase = lines.reduce((s, l) => s + l.netAmount, 0)
    return {
      ...ISSUER,
      id: 'inv-005',
      series: 'A',
      number: '0005',
      fullNumber: 'A-2024-0005',
      issueDate: daysAgo(90),
      status: 'ANULADA' as const,
      customerNif: 'A12345678',
      customerName: 'Tech Solutions S.A.',
      customerAddress: 'Calle Alcalá, 500, 28027 Madrid',
      customerEmail: 'contacto@techsolutions.es',
      lines,
      taxes: [tax(taxableBase, 21)],
      taxableBase: +taxableBase.toFixed(2),
      totalTax: +(taxableBase * 0.21).toFixed(2),
      totalAmount: +(taxableBase * 1.21).toFixed(2),
      invoiceType: 'ORDINARIA',
      notes: 'Anulada por cancelación del proyecto por parte del cliente.',
      createdAt: daysAgo(90),
      updatedAt: daysAgo(85),
      createdBy: 'demo',
    }
  })(),

  // ── 6. ENVIADA ──────────────────────────────────────────────
  (() => {
    const lines = [
      line(1, 'Mantenimiento TPV y software', 1, 300, 'mes'),
      line(2, 'Soporte técnico presencial', 2, 75, 'h'),
    ]
    const taxableBase = lines.reduce((s, l) => s + l.netAmount, 0)
    return {
      ...ISSUER,
      id: 'inv-006',
      series: 'A',
      number: '0006',
      fullNumber: 'A-2024-0006',
      issueDate: daysAgo(20),
      dueDate: daysAgo(-10),
      status: 'ENVIADA' as const,
      customerNif: '12345678A',
      customerName: 'Juan García López',
      customerEmail: 'juan.garcia@email.com',
      lines,
      taxes: [tax(taxableBase, 21)],
      taxableBase: +taxableBase.toFixed(2),
      totalTax: +(taxableBase * 0.21).toFixed(2),
      totalAmount: +(taxableBase * 1.21).toFixed(2),
      invoiceType: 'ORDINARIA',
      digitalSignature: 'sha256:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
      paymentMethod: 'Transferencia bancaria',
      createdAt: daysAgo(20),
      updatedAt: daysAgo(19),
      createdBy: 'demo',
    }
  })(),

  // ── 7. BORRADOR ─────────────────────────────────────────────
  (() => {
    const lines = [
      line(1, 'Licencia anual software ERP', 1, 3600, 'licencia'),
    ]
    const taxableBase = lines.reduce((s, l) => s + l.netAmount, 0)
    return {
      ...ISSUER,
      id: 'inv-007',
      series: 'A',
      number: '0007',
      fullNumber: 'A-2024-0007',
      issueDate: daysAgo(2),
      dueDate: daysAgo(-28),
      status: 'BORRADOR' as const,
      customerNif: 'B23456789',
      customerName: 'Consulting Pro S.L.',
      customerAddress: 'Plaza España, 10, 48001 Bilbao',
      customerEmail: 'contacto@consultingpro.es',
      lines,
      taxes: [tax(taxableBase, 21)],
      taxableBase: +taxableBase.toFixed(2),
      totalTax: +(taxableBase * 0.21).toFixed(2),
      totalAmount: +(taxableBase * 1.21).toFixed(2),
      invoiceType: 'ORDINARIA',
      paymentMethod: 'Domiciliación bancaria',
      createdAt: daysAgo(2),
      createdBy: 'demo',
    }
  })(),

  // ── 8. FIRMADA ──────────────────────────────────────────────
  (() => {
    const lines = [
      line(1, 'Servicio de distribución logística', 10, 65, 'envío'),
      line(2, 'Embalaje especial', 1, 80, 'ud'),
    ]
    const taxableBase = lines.reduce((s, l) => s + l.netAmount, 0)
    return {
      ...ISSUER,
      id: 'inv-008',
      series: 'A',
      number: '0008',
      fullNumber: 'A-2024-0008',
      issueDate: daysAgo(55),
      dueDate: daysAgo(25),
      status: 'FIRMADA' as const,
      customerNif: 'B11223344',
      customerName: 'Servicios Tech S.L.',
      customerAddress: 'Polígono Industrial, Nave 5, 46001 Valencia',
      customerEmail: 'info@serviciostech.com',
      lines,
      taxes: [tax(taxableBase, 21)],
      taxableBase: +taxableBase.toFixed(2),
      totalTax: +(taxableBase * 0.21).toFixed(2),
      totalAmount: +(taxableBase * 1.21).toFixed(2),
      invoiceType: 'ORDINARIA',
      digitalSignature: 'sha256:deadbeef1234567890abcdefdeadbeef1234567890abcdefdeadbeef12345678',
      paymentMethod: 'Transferencia bancaria',
      createdAt: daysAgo(55),
      updatedAt: daysAgo(54),
      createdBy: 'demo',
    }
  })(),

  // ── 9. RECTIFICADA ──────────────────────────────────────────
  (() => {
    const lines = [
      line(1, 'Corrección factura A-2024-0004 — descuento acordado', 1, 2100, 'ud'),
    ]
    const taxableBase = lines.reduce((s, l) => s + l.netAmount, 0)
    return {
      ...ISSUER,
      id: 'inv-009',
      series: 'R',
      number: '0001',
      fullNumber: 'R-2024-0001',
      issueDate: daysAgo(28),
      status: 'RECTIFICADA' as const,
      customerNif: 'B87654321',
      customerName: 'Global Services S.L.',
      customerAddress: 'Paseo de la Castellana, 200, 28046 Madrid',
      customerEmail: 'info@globalservices.es',
      lines,
      taxes: [tax(taxableBase, 21)],
      taxableBase: +taxableBase.toFixed(2),
      totalTax: +(taxableBase * 0.21).toFixed(2),
      totalAmount: +(taxableBase * 1.21).toFixed(2),
      invoiceType: 'RECTIFICATIVA',
      digitalSignature: 'sha256:cafe0123456789abcafecafe0123456789abcafecafe0123456789abcafe0123',
      paymentMethod: 'Transferencia bancaria',
      notes: 'Factura rectificativa de A-2024-0004. Descuento del 15% negociado.',
      createdAt: daysAgo(28),
      updatedAt: daysAgo(27),
      createdBy: 'demo',
    }
  })(),

  // ── 10. ENVIADA ─────────────────────────────────────────────
  (() => {
    const lines = [
      line(1, 'Gestión de proyecto — fase 2', 1, 5500, 'fase'),
      line(2, 'Consultoría estratégica', 10, 130, 'h'),
    ]
    const taxableBase = lines.reduce((s, l) => s + l.netAmount, 0)
    return {
      ...ISSUER,
      id: 'inv-010',
      series: 'A',
      number: '0010',
      fullNumber: 'A-2024-0010',
      issueDate: daysAgo(15),
      dueDate: daysAgo(-15),
      status: 'ENVIADA' as const,
      customerNif: 'B23456789',
      customerName: 'Consulting Pro S.L.',
      customerAddress: 'Plaza España, 10, 48001 Bilbao',
      customerEmail: 'contacto@consultingpro.es',
      lines,
      taxes: [tax(taxableBase, 21)],
      taxableBase: +taxableBase.toFixed(2),
      totalTax: +(taxableBase * 0.21).toFixed(2),
      totalAmount: +(taxableBase * 1.21).toFixed(2),
      invoiceType: 'ORDINARIA',
      digitalSignature: 'sha256:f00d1234567890f00df00d1234567890f00df00d1234567890f00df00d123456',
      paymentMethod: 'Transferencia bancaria',
      notes: 'Segunda fase del proyecto de transformación organizacional.',
      createdAt: daysAgo(15),
      updatedAt: daysAgo(14),
      createdBy: 'demo',
    }
  })(),
]

// ─────────────────────────────────────────────────────────────
// Mock notifications
// ─────────────────────────────────────────────────────────────

export interface MockNotification {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  time: string
  read: boolean
  invoiceId?: string
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'n1',
    type: 'success',
    title: 'Factura firmada',
    message: 'A-2024-0002 firmada correctamente.',
    time: daysAgo(0),
    read: false,
    invoiceId: 'inv-002',
  },
  {
    id: 'n2',
    type: 'warning',
    title: 'Factura vence pronto',
    message: 'A-2024-0003 vence en 3 días.',
    time: daysAgo(0),
    read: false,
    invoiceId: 'inv-003',
  },
  {
    id: 'n3',
    type: 'info',
    title: 'Nuevo cliente registrado',
    message: 'Tech Solutions S.A. ha sido añadido.',
    time: daysAgo(1),
    read: true,
  },
  {
    id: 'n4',
    type: 'error',
    title: 'Pago pendiente',
    message: 'A-2024-0006 lleva 15 días sin cobrar.',
    time: daysAgo(2),
    read: true,
    invoiceId: 'inv-006',
  },
]
