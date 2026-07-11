export interface FoodBookingItem {
  id: number;
  sl: number;
  bookingDate: string;
  bookingNo: string;
  bookedBy: string;
  roomNo: string;
  guestName: string;
  phoneNo: string;
  orderedAmount: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  orderStatus?: 'Pending' | 'Completed' | 'Cancelled'; // Fallback for backward compatibility
  category?: string;
}
export interface BookedMenuItem {
  id: number;
  sl: number;
  date: string;
  room: string;
  category: string;
  menu: string;
  qty: number;
  total: number;
}

export interface TableReservationItem {
  id: number;
  sl: number;
  customerName: string;
  tableNo: string;
  numberOfPeople: number;
  startTime: string;
  endTime: string;
  date: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

export interface UnavailabilityItem {
  id?: number;
  sl: number;
  unavailableDate: string;
  availableTime: string;
}

export interface DiningTableReservation {
  sl: number;
  customerName: string;
  tableNo: string;
  numberOfPeople: number;
  startTime: string;
  endTime: string;
  date: string;
  status: 'Active' | 'Closed' | 'Cancelled';
}

export interface UnavailabilityRecord {
  sl: number;
  unavailableDate: string;
  startTime: string;
  endTime: string;
  status: 'Active' | 'Inactive';
}