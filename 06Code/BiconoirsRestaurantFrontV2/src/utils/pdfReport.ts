import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ReportStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  totalCustomers: number
}

interface ReportOrder {
  order_id: string
  customer?: { name?: string; email?: string }
  total_amount: number
  status: string
  created_at?: string
  order_date?: string
}

interface ReportReservation {
  reservation_id: string
  customer?: { name?: string; email?: string }
  reservation_date?: string
  reservation_time?: string
  party_size: number
  status: string
  created_at?: string
}

export function generateDashboardPdf(
  stats: ReportStats,
  orders: ReportOrder[],
  reservations: ReportReservation[],
  inventory: any[],
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  const primaryColor: [number, number, number] = [52, 152, 219]
  const darkColor: [number, number, number] = [44, 62, 80]
  const grayColor: [number, number, number] = [127, 140, 141]

  doc.setFillColor(52, 152, 219)
  doc.rect(0, 0, pageWidth, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.text('Biconoirs Restaurant', pageWidth / 2, 18, { align: 'center' })
  doc.setFontSize(12)
  doc.text('Reporte del Dashboard', pageWidth / 2, 28, { align: 'center' })

  const now = new Date()
  const dateStr = now.toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  doc.setTextColor(...grayColor)
  doc.setFontSize(9)
  doc.text(`Generado: ${dateStr}`, pageWidth - 14, 42, { align: 'right' })

  let y = 50

  doc.setTextColor(...darkColor)
  doc.setFontSize(14)
  doc.text('Resumen de Estadisticas', 14, y)
  y += 8

  const statCards = [
    { label: 'Total Ordenes', value: String(stats.totalOrders ?? 0) },
    { label: 'Ingresos Totales', value: `$${(stats.totalRevenue ?? 0).toLocaleString('es-CO')}` },
    { label: 'Ordenes Pendientes', value: String(stats.pendingOrders ?? 0) },
    { label: 'Total Clientes', value: String(stats.totalCustomers ?? 0) },
  ]

  const cardW = (pageWidth - 28 - 12) / 4
  doc.setFontSize(10)
  statCards.forEach((card, i) => {
    const x = 14 + i * (cardW + 4)
    doc.setFillColor(245, 247, 250)
    doc.roundedRect(x, y, cardW, 28, 3, 3, 'F')
    doc.setTextColor(...grayColor)
    doc.text(card.label, x + cardW / 2, y + 10, { align: 'center' })
    doc.setFontSize(14)
    doc.setTextColor(...darkColor)
    doc.text(card.value, x + cardW / 2, y + 23, { align: 'center' })
    doc.setFontSize(10)
  })

  y += 40

  if (orders.length > 0) {
    doc.setTextColor(...darkColor)
    doc.setFontSize(14)
    doc.text('Ordenes Recientes', 14, y)
    y += 6

    const orderRows = orders.slice(0, 20).map((o) => [
      o.order_id?.slice(0, 8) ?? 'N/A',
      o.customer?.name ?? o.customer?.email ?? 'N/A',
      `$${(o.total_amount ?? 0).toLocaleString('es-CO')}`,
      o.status ?? 'N/A',
      o.created_at ? new Date(o.created_at).toLocaleDateString('es-CO') : o.order_date ? new Date(o.order_date).toLocaleDateString('es-CO') : 'N/A',
    ])

    autoTable(doc, {
      head: [['ID', 'Cliente', 'Total', 'Estado', 'Fecha']],
      body: orderRows,
      startY: y,
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
    y = (doc as any).lastAutoTable.finalY + 12
  }

  const lowStockItems = (inventory ?? []).filter(
    (i: any) => (i.current_stock ?? i.quantity ?? 0) <= (i.min_stock ?? 5)
  )

  if (lowStockItems.length > 0) {
    doc.setTextColor(...darkColor)
    doc.setFontSize(14)
    doc.text('Productos con Stock Bajo', 14, y)
    y += 6

    const stockRows = lowStockItems.map((item: any) => [
      item.name ?? item.ingredient_name ?? item.product_name ?? 'N/A',
      String(item.current_stock ?? item.quantity ?? 0),
      String(item.min_stock ?? 5),
      item.unit ?? '',
    ])

    autoTable(doc, {
      head: [['Producto', 'Stock Actual', 'Stock Minimo', 'Unidad']],
      body: stockRows,
      startY: y,
      headStyles: { fillColor: [231, 76, 60] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
    y = (doc as any).lastAutoTable.finalY + 12
  }

  if (reservations.length > 0) {
    doc.setTextColor(...darkColor)
    doc.setFontSize(14)
    doc.text('Reservaciones Recientes', 14, y)
    y += 6

    const toDate = (d: string | undefined) => d ? new Date(d).toLocaleDateString('es-CO') : ''
    const resRows = reservations.slice(0, 20).map((r) => [
      r.reservation_id?.slice(0, 8) ?? 'N/A',
      r.customer?.name ?? r.customer?.email ?? 'N/A',
      r.reservation_date ? new Date(r.reservation_date).toLocaleDateString('es-CO') : toDate(r.created_at),
      r.reservation_time ?? '',
      String(r.party_size ?? 0),
      r.status ?? 'N/A',
    ])

    autoTable(doc, {
      head: [['ID', 'Cliente', 'Fecha', 'Hora', 'Personas', 'Estado']],
      body: resRows,
      startY: y,
      headStyles: { fillColor: [46, 204, 113] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
  }

  y = doc.internal.pageSize.getHeight() - 20
  doc.setTextColor(...grayColor)
  doc.setFontSize(8)
  doc.text('Biconoirs Restaurant - Reporte generado automaticamente', pageWidth / 2, y, { align: 'center' })

  doc.save('reporte-dashboard-biconoirs.pdf')
}
