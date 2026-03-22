import { Room } from './domain';

export const INITIAL_ROOMS: Room[] = [
  { id: '1', number: '101', name: 'Habitación Estándar', type: 'ESTANDAR', price: 150, duration: 12, status: 'VACANT' },
  { id: '2', number: '102', name: 'Habitación VIP', type: 'VIP', price: 180, duration: 12, status: 'OCCUPIED' },
  { id: '3', number: '103', name: 'Suite Super VIP', type: 'SUPERVIP', price: 240, duration: 6, status: 'OVERTIME' },
  { id: '4', number: '104', name: 'Habitación Estándar', type: 'ESTANDAR', price: 150, duration: 12, status: 'DIRTY' },
  { id: '5', number: '105', name: 'Habitación VIP', type: 'VIP', price: 180, duration: 12, status: 'VACANT' },
  { id: '6', number: '106', name: 'Suite Super VIP', type: 'SUPERVIP', price: 240, duration: 6, status: 'VACANT' },
  { id: '7', number: '107', name: 'Habitación Estándar', type: 'ESTANDAR', price: 150, duration: 12, status: 'VACANT' },
  { id: '8', number: '108', name: 'Habitación VIP', type: 'VIP', price: 180, duration: 12, status: 'MAINTENANCE' },
];
