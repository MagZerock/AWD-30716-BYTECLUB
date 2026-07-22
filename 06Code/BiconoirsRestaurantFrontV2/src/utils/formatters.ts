// src/utils/formatters.ts

export const formatPrice = (price: number | string): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(price));
};

export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  } catch (e) {
    return String(date);
  }
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  } catch (e) {
    return String(date);
  }
};

export const formatTime = (date: string | Date): string => {
  if (!date) return '';
  try {
    let d = date;
    if (typeof d === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(d)) {
      const parts = d.split(':');
      const tempDate = new Date();
      tempDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      d = tempDate;
    }
    return new Intl.DateTimeFormat('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(d));
  } catch (e) {
    return String(date);
  }
};

export const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    'pending': 'yellow',
    'confirmed': 'blue',
    'completed': 'green',
    'cancelled': 'red',
  };
  return colors[status.toLowerCase()] || 'gray';
};

export const getStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    'pending': 'Pendiente',
    'Pending': 'Pendiente',
    'Pendiente': 'Pendiente',
    'confirmed': 'Confirmada',
    'Confirmed': 'Confirmada',
    'Confirmada': 'Confirmada',
    'completed': 'Completada',
    'Completed': 'Completada',
    'Completada': 'Completada',
    'cancelled': 'Cancelada',
    'Cancelled': 'Cancelada',
    'Cancelada': 'Cancelada',
  };
  return labels[status.toLowerCase()] || status;
};
