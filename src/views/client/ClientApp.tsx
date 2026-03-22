import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trash2, Plus, Banknote, QrCode, CheckCircle, MessageCircle, Diamond, Clock, Calendar, LogOut, AlertCircle } from 'lucide-react';

// --- Types & Constants ---
const ROOMS = [
  { id: '1', name: 'Habitación Estándar', description: 'Confortable y acogedora. Ideal para una estancia tranquila.', price: 150, duration: 12, image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=1000' },
  { id: '2', name: 'Habitación VIP', description: 'Mayor amplitud y comodidades exclusivas para una experiencia superior.', price: 180, duration: 12, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000' },
  { id: '3', name: 'Suite Super VIP', description: 'Nuestra habitación más exclusiva. Lujo y confort al máximo nivel.', price: 240, duration: 6, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000' }
];

interface Guest { ci: string; name: string; phone: string; }
interface Reservation {
  id: string;
  room: any;
  date: string;
  time: string;
  guests: Guest[];
  paymentMethod: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  totalPrice: number;
  debtApplied: number;
  createdAt: string;
  checkInTime?: string;
  checkOutTime?: string;
}
interface ClientData { ci: string; name: string; phone: string; debt: number; }
interface DBState { reservations: Reservation[]; clients: Record<string, ClientData>; }

const INITIAL_DB: DBState = { reservations: [], clients: {} };

// --- Main App Component ---
export default function App() {
  const [db, setDb] = useState<DBState>(() => {
    const saved = localStorage.getItem('diamonds_db');
    return saved ? JSON.parse(saved) : INITIAL_DB;
  });

  useEffect(() => {
    localStorage.setItem('diamonds_db', JSON.stringify(db));
  }, [db]);

  const [view, setView] = useState<'home' | 'new' | 'manage'>('home');

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] flex justify-center selection:bg-blue-200">
      <div className="w-full max-w-md bg-[#f5f5f7] min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
        <header className="sticky top-0 z-50 bg-[#f5f5f7]/80 backdrop-blur-xl border-b border-gray-200/50 px-4 py-4 flex items-center justify-between">
          {view !== 'home' ? (
            <button onClick={() => setView('home')} className="p-2 -ml-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
              <ChevronLeft size={28} />
            </button>
          ) : <div className="w-11" />}
          <div className="flex items-center space-x-2">
            <Diamond className="text-blue-600" size={24} fill="currentColor" />
            <h1 className="font-semibold text-lg tracking-tight">Diamonds</h1>
          </div>
          <div className="w-11" />
        </header>

        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
            {view === 'home' && <HomeView key="home" onNavigate={setView} />}
            {view === 'new' && <NewReservationFlow key="new" db={db} setDb={setDb} onFinish={() => setView('home')} />}
            {view === 'manage' && <ManageReservations key="manage" db={db} setDb={setDb} />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// --- Views ---
function HomeView({ onNavigate }: { onNavigate: (v: 'new' | 'manage') => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-8 pt-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Bienvenido</h2>
        <p className="text-gray-500">¿Qué deseas hacer hoy?</p>
      </div>
      <div className="space-y-4">
        <button onClick={() => onNavigate('new')} className="w-full bg-blue-600 text-white p-6 rounded-[2rem] shadow-md hover:bg-blue-700 transition-all flex flex-col items-center space-y-3 active:scale-[0.98]">
          <Calendar size={40} />
          <span className="font-semibold text-xl">Nueva Reserva</span>
        </button>
        <button onClick={() => onNavigate('manage')} className="w-full bg-white text-gray-800 border border-gray-200 p-6 rounded-[2rem] shadow-sm hover:bg-gray-50 transition-all flex flex-col items-center space-y-3 active:scale-[0.98]">
          <Clock size={40} className="text-blue-600" />
          <span className="font-semibold text-xl">Mis Reservas</span>
        </button>
      </div>
    </motion.div>
  );
}

function ManageReservations({ db, setDb }: { db: DBState, setDb: any }) {
  const [loginCI, setLoginCI] = useState('');
  const [loggedInCI, setLoggedInCI] = useState('');

  if (!loggedInCI) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 pt-12 space-y-6">
        <h2 className="text-2xl font-bold">Ingresa a tus reservas</h2>
        <p className="text-gray-500">Ingresa tu Carnet de Identidad para ver tus reservas activas y pasadas.</p>
        <input type="text" placeholder="Ej. 1234567" value={loginCI} onChange={e => setLoginCI(e.target.value)} className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg shadow-sm" />
        <button disabled={!loginCI.trim()} onClick={() => setLoggedInCI(loginCI.trim())} className="w-full bg-blue-600 disabled:bg-blue-300 text-white rounded-full py-4 font-semibold text-lg transition-colors shadow-sm">
          Ingresar
        </button>
      </motion.div>
    );
  }

  const userReservations = db.reservations.filter(r => r.guests[0]?.ci === loggedInCI).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const clientData = db.clients[loggedInCI];

  const handleCancel = (resId: string) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reserva? Se aplicará una penalidad del 20% del costo de la habitación a tu cuenta.')) return;
    
    setDb((prev: DBState) => {
      const res = prev.reservations.find(r => r.id === resId);
      if (!res) return prev;
      
      const penalty = res.room.price * 0.20;
      const mainGuestCI = res.guests[0].ci;
      
      return {
        ...prev,
        reservations: prev.reservations.map(r => r.id === resId ? { ...r, status: 'cancelled' } : r),
        clients: {
          ...prev.clients,
          [mainGuestCI]: {
            ...prev.clients[mainGuestCI],
            debt: (prev.clients[mainGuestCI]?.debt || 0) + penalty
          }
        }
      };
    });
  };

  const handleCheckout = (resId: string) => {
    if (!window.confirm('¿Deseas finalizar tu estadía ahora?')) return;
    setDb((prev: DBState) => ({
      ...prev,
      reservations: prev.reservations.map(r => r.id === resId ? { ...r, status: 'completed', checkOutTime: new Date().toISOString() } : r)
    }));
  };

  const handleSimulateCheckIn = (resId: string) => {
    setDb((prev: DBState) => ({
      ...prev,
      reservations: prev.reservations.map(r => r.id === resId ? { ...r, status: 'active', checkInTime: new Date().toISOString() } : r)
    }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mis Reservas</h2>
        <button onClick={() => setLoggedInCI('')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><LogOut size={20} /></button>
      </div>
      
      {clientData?.debt > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start space-x-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold">Tienes una deuda pendiente</p>
            <p className="text-sm">Por cancelaciones previas, debes Bs. {clientData.debt}. Se sumará a tu próxima reserva.</p>
          </div>
        </div>
      )}

      {userReservations.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No tienes reservas registradas.</p>
      ) : (
        <div className="space-y-4">
          {userReservations.map(res => (
            <div key={res.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{res.room.name}</h3>
                  <p className="text-sm text-gray-500">{res.date} • {res.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  res.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  res.status === 'active' ? 'bg-green-100 text-green-700' :
                  res.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {res.status === 'pending' ? 'Pendiente' : res.status === 'active' ? 'Activa' : res.status === 'completed' ? 'Completada' : 'Cancelada'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>Total: Bs. {res.totalPrice} {res.debtApplied > 0 && <span className="text-red-500">(Incluye Bs. {res.debtApplied} de deuda)</span>}</p>
                <p>Pago: {res.paymentMethod}</p>
              </div>

              {res.status === 'pending' && (
                <div className="flex space-x-2 pt-2">
                  <button onClick={() => handleCancel(res.id)} className="flex-1 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors">Cancelar</button>
                  <button onClick={() => handleSimulateCheckIn(res.id)} className="flex-1 py-2.5 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-colors">Simular Ingreso</button>
                </div>
              )}
              {res.status === 'active' && (
                <div className="pt-2">
                  <button onClick={() => handleCheckout(res.id)} className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-black transition-colors">Finalizar Estadía (Salida)</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// --- New Reservation Flow ---
function NewReservationFlow({ db, setDb, onFinish }: { db: DBState, setDb: any, onFinish: () => void }) {
  const [step, setStep] = useState(1);
  const [reservation, setReservation] = useState({
    room: null as any, date: '', time: '', guests: [{ ci: '', name: '', phone: '' }], paymentMethod: ''
  });

  const updateData = (newData: any) => setReservation(prev => ({ ...prev, ...newData }));
  const nextStep = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep(s => s + 1); };
  const prevStep = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep(s => s - 1); };

  const handleConfirm = () => {
    const mainGuest = reservation.guests[0];
    const clientDebt = db.clients[mainGuest.ci]?.debt || 0;
    const totalPrice = reservation.room.price + clientDebt;

    const newRes: Reservation = {
      id: Math.random().toString(36).substr(2, 9),
      ...reservation,
      status: 'pending',
      totalPrice,
      debtApplied: clientDebt,
      createdAt: new Date().toISOString()
    };

    setDb((prev: DBState) => {
      const newClients = { ...prev.clients };
      reservation.guests.forEach(g => {
        if (!newClients[g.ci]) {
          newClients[g.ci] = { ci: g.ci, name: g.name, phone: g.phone, debt: 0 };
        }
      });
      // Reset debt for main guest as it's applied to this reservation
      if (newClients[mainGuest.ci]) {
        newClients[mainGuest.ci].debt = 0;
      }
      return { reservations: [...prev.reservations, newRes], clients: newClients };
    });

    nextStep(); // Go to confirmation screen
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <RoomSelection onSelect={(room) => { updateData({ room }); nextStep(); }} />;
      case 2: return <DateTimeSelection data={reservation} updateData={updateData} onNext={nextStep} />;
      case 3: return <GuestDetails data={reservation} updateData={updateData} onNext={nextStep} db={db} />;
      case 4: return <PaymentSelection data={reservation} updateData={updateData} onNext={handleConfirm} db={db} />;
      case 5: return <Confirmation data={reservation} onFinish={onFinish} db={db} />;
      default: return null;
    }
  };

  return (
    <div className="relative">
      {step > 1 && step < 5 && (
        <div className="absolute top-[-60px] left-2 z-50">
          <button onClick={prevStep} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><ChevronLeft size={28} /></button>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function RoomSelection({ onSelect }: { onSelect: (room: any) => void }) {
  return (
    <div className="space-y-6 pb-12">
      <div className="px-5 pt-6">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Habitaciones</h2>
        <p className="text-gray-500">Selecciona la habitación ideal para tu estadía.</p>
      </div>
      <div className="px-5 space-y-6">
        {ROOMS.map(room => (
          <div key={room.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]" onClick={() => onSelect(room)}>
            <div className="aspect-[4/3] relative">
              <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full font-semibold text-sm shadow-sm">Bs. {room.price} / {room.duration}h</div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{room.description}</p>
              <button className="w-full bg-gray-900 text-white rounded-full py-3.5 font-medium hover:bg-black transition-colors">Seleccionar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DateTimeSelection({ data, updateData, onNext }: any) {
  const isValid = data.date && data.time;
  const duration = data.room?.duration || 12;

  let checkoutText = "";
  if (isValid) {
    const arrival = new Date(`${data.date}T${data.time}`);
    if (!isNaN(arrival.getTime())) {
      const checkout = new Date(arrival.getTime() + duration * 60 * 60 * 1000);
      checkoutText = checkout.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }) + ' del ' + checkout.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  }
  
  return (
    <div className="px-5 pt-6 pb-32 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Fecha y Hora</h2>
        <p className="text-gray-500">¿Cuándo nos visitarás?</p>
      </div>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 ml-1">Fecha de llegada</label>
        <input type="date" value={data.date} min={new Date().toISOString().split('T')[0]} onChange={e => updateData({ date: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg shadow-sm appearance-none" />
      </div>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 ml-1">Hora estimada de llegada</label>
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-5">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mb-3 block">Hora (24 hrs)</span>
            <div className="flex overflow-x-auto hide-scrollbar space-x-2 pb-2 -mx-2 px-2">
              {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(h => {
                const currentHour = data.time ? data.time.split(':')[0] : '';
                const isSelected = currentHour === h;
                return (
                  <button key={h} onClick={() => { const m = data.time ? data.time.split(':')[1] : '00'; updateData({ time: `${h}:${m}` }); }} className={`flex-shrink-0 w-14 h-14 rounded-2xl font-medium text-lg transition-all flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-gray-50 text-gray-700 border border-gray-100 hover:bg-gray-100'}`}>
                    {h}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mb-3 block">Minutos</span>
            <div className="flex overflow-x-auto hide-scrollbar space-x-2 pb-2 -mx-2 px-2">
              {['00', '15', '30', '45'].map(m => {
                const currentMinute = data.time ? data.time.split(':')[1] : '';
                const isSelected = currentMinute === m;
                return (
                  <button key={m} onClick={() => { const h = data.time ? data.time.split(':')[0] : '12'; updateData({ time: `${h}:${m}` }); }} className={`flex-shrink-0 px-6 h-14 rounded-2xl font-medium text-lg transition-all flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-gray-50 text-gray-700 border border-gray-100 hover:bg-gray-100'}`}>
                    :{m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isValid && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 border border-blue-100 text-blue-800 p-5 rounded-3xl flex items-start space-x-4 shadow-sm">
            <div className="bg-blue-500 text-white p-2.5 rounded-full shrink-0"><Clock size={24} /></div>
            <div>
              <h4 className="font-semibold text-lg mb-1">Estadía de {duration} horas</h4>
              <p className="text-blue-700/80 text-sm leading-relaxed">Si ingresas a las <strong>{data.time}</strong>, tu horario de salida será a las <strong>{checkoutText}</strong>.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#f5f5f7]/80 backdrop-blur-xl border-t border-gray-200/50 z-10">
        <div className="max-w-md mx-auto">
          <button disabled={!isValid} onClick={onNext} className="w-full bg-blue-600 disabled:bg-blue-300 text-white rounded-full py-4 font-semibold text-lg transition-colors shadow-sm">Continuar</button>
        </div>
      </div>
    </div>
  );
}

function GuestDetails({ data, updateData, onNext, db }: any) {
  const addGuest = () => updateData({ guests: [...data.guests, { ci: '', name: '', phone: '' }] });
  const updateGuest = (index: number, field: string, value: string) => {
    const newGuests = [...data.guests];
    newGuests[index][field] = value;
    updateData({ guests: newGuests });
  };
  const removeGuest = (index: number) => updateData({ guests: data.guests.filter((_: any, i: number) => i !== index) });
  const isValid = data.guests.every((g: any) => g.ci.trim() && g.name.trim());
  const mainGuestCI = data.guests[0]?.ci;
  const clientDebt = db.clients[mainGuestCI]?.debt || 0;

  return (
    <div className="px-5 pt-6 pb-32 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Huéspedes</h2>
        <p className="text-gray-500">Registra a todas las personas que ingresarán a la habitación.</p>
      </div>
      
      {clientDebt > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start space-x-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold">Deuda pendiente detectada</p>
            <p className="text-sm">El titular (CI: {mainGuestCI}) tiene una deuda de Bs. {clientDebt} por cancelaciones previas. Se sumará al total de esta reserva.</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {data.guests.map((guest: any, index: number) => (
          <div key={index} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-5 relative">
            {index > 0 && <button onClick={() => removeGuest(index)} className="absolute top-5 right-5 text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={20} /></button>}
            <h3 className="font-semibold text-lg border-b border-gray-50 pb-3">Huésped {index + 1} {index === 0 && '(Titular)'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Carnet de Identidad *</label>
                <input type="text" placeholder="Ej. 1234567" value={guest.ci} onChange={e => updateGuest(index, 'ci', e.target.value)} className="w-full bg-[#f5f5f7] border-transparent rounded-xl px-4 py-3.5 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Nombre Completo *</label>
                <input type="text" placeholder="Ej. Juan Pérez" value={guest.name} onChange={e => updateGuest(index, 'name', e.target.value)} className="w-full bg-[#f5f5f7] border-transparent rounded-xl px-4 py-3.5 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Celular {index === 0 ? '*' : '(Opcional)'}</label>
                <input type="tel" placeholder="Ej. 71234567" value={guest.phone} onChange={e => updateGuest(index, 'phone', e.target.value)} className="w-full bg-[#f5f5f7] border-transparent rounded-xl px-4 py-3.5 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addGuest} className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 text-blue-600 font-medium flex items-center justify-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors">
        <Plus size={20} /><span>Agregar otro huésped</span>
      </button>
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#f5f5f7]/80 backdrop-blur-xl border-t border-gray-200/50 z-10">
        <div className="max-w-md mx-auto">
          <button disabled={!isValid || (data.guests[0].phone.trim() === '')} onClick={onNext} className="w-full bg-blue-600 disabled:bg-blue-300 text-white rounded-full py-4 font-semibold text-lg transition-colors shadow-sm">Continuar</button>
        </div>
      </div>
    </div>
  );
}

function PaymentSelection({ data, updateData, onNext, db }: any) {
  const mainGuestCI = data.guests[0]?.ci;
  const clientDebt = db.clients[mainGuestCI]?.debt || 0;
  const totalPrice = data.room.price + clientDebt;

  return (
    <div className="px-5 pt-6 pb-32 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Método de Pago</h2>
        <p className="text-gray-500">¿Cómo prefieres pagar tu reserva?</p>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Habitación ({data.room.duration}h)</span>
          <span>Bs. {data.room.price}</span>
        </div>
        {clientDebt > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Deuda pendiente</span>
            <span>Bs. {clientDebt}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-xl pt-2 border-t border-gray-100">
          <span>Total a pagar</span>
          <span>Bs. {totalPrice}</span>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { id: 'EFECTIVO', label: 'Efectivo', desc: 'Paga al llegar a recepción', icon: Banknote },
          { id: 'QR', label: 'Transferencia QR', desc: 'Pago rápido y seguro', icon: QrCode }
        ].map(method => (
          <div key={method.id} className="space-y-4">
            <div onClick={() => updateData({ paymentMethod: method.id })} className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center space-x-5 ${data.paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white shadow-sm'}`}>
              <div className={`p-4 rounded-full ${data.paymentMethod === method.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}><method.icon size={28} /></div>
              <div>
                <h4 className="font-semibold text-xl mb-1">{method.label}</h4>
                <p className="text-gray-500 text-sm">{method.desc}</p>
              </div>
            </div>
            <AnimatePresence>
              {method.id === 'QR' && data.paymentMethod === 'QR' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-5 mt-2">
                    <div className="w-full max-w-[220px] aspect-square bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-center">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=Pago+Residencial+Diamonds+Santiago+Borda+1101350386" alt="QR de Pago" className="w-full h-full object-contain rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-2xl text-blue-600">Bs. {totalPrice}</p>
                      <p className="text-gray-900 font-medium">Pagar a: SANTIAGO BORDA ZAMBRANA</p>
                      <p className="text-gray-500 text-sm">Cuenta: 1101350386</p>
                    </div>
                    <div className="bg-blue-50 text-blue-700 text-sm px-4 py-3 rounded-xl w-full">Guarda tu comprobante de pago. Te lo pediremos por WhatsApp en el siguiente paso.</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#f5f5f7]/80 backdrop-blur-xl border-t border-gray-200/50 z-10">
        <div className="max-w-md mx-auto">
          <button disabled={!data.paymentMethod} onClick={onNext} className="w-full bg-blue-600 disabled:bg-blue-300 text-white rounded-full py-4 font-semibold text-lg transition-colors shadow-sm">Confirmar Reserva</button>
        </div>
      </div>
    </div>
  );
}

function Confirmation({ data, onFinish, db }: any) {
  const duration = data.room?.duration || 12;
  const mainGuestCI = data.guests[0]?.ci;
  const clientDebt = db.clients[mainGuestCI]?.debt || 0;
  const totalPrice = data.room.price + clientDebt;

  const handleWhatsApp = () => {
    const guestsText = data.guests.map((g: any, i: number) => `Huésped ${i + 1}: ${g.name} (CI: ${g.ci})`).join('%0A');
    const text = `¡Hola Diamonds Residencial! He registrado mi reserva en el sistema:%0A%0A` +
      `*Habitación:* ${data.room.name} (${duration} hrs)%0A` +
      `*Llegada:* ${data.date} a las ${data.time}%0A` +
      `*Pago:* ${data.paymentMethod} (Total: Bs. ${totalPrice})%0A%0A` +
      `*Huéspedes:*%0A${guestsText}`;
    window.open(`https://wa.me/59170000000?text=${text}`, '_blank');
    onFinish();
  };

  return (
    <div className="px-5 pt-12 pb-24 flex flex-col items-center text-center space-y-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-2">
        <CheckCircle size={48} />
      </motion.div>
      <h2 className="text-3xl font-bold tracking-tight">¡Reserva Registrada!</h2>
      <p className="text-gray-500 max-w-xs">Tu reserva ha sido guardada en el sistema. Envía los datos por WhatsApp para que recepción la valide.</p>

      <div className="w-full bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-left space-y-4 my-8">
        <div className="flex justify-between items-center border-b border-gray-50 pb-4">
          <span className="text-gray-500">Habitación</span>
          <span className="font-semibold text-right">{data.room.name}<br/><span className="text-xs text-gray-400 font-normal">({duration} horas)</span></span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-50 pb-4">
          <span className="text-gray-500">Llegada</span>
          <span className="font-semibold text-right">{data.date}<br/><span className="text-sm font-normal">{data.time}</span></span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-50 pb-4">
          <span className="text-gray-500">Método de pago</span>
          <span className="font-semibold">{data.paymentMethod}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-gray-500">Total a pagar</span>
          <span className="font-bold text-2xl text-blue-600">Bs. {totalPrice}</span>
        </div>
      </div>

      <button onClick={handleWhatsApp} className="w-full bg-[#25D366] text-white rounded-full py-4 font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg shadow-green-500/30 hover:bg-[#20bd5a] transition-colors">
        <MessageCircle size={24} /><span>Enviar a WhatsApp</span>
      </button>
      <button onClick={onFinish} className="w-full bg-white text-gray-600 border border-gray-200 rounded-full py-4 font-semibold text-lg transition-colors mt-4">
        Volver al Inicio
      </button>
    </div>
  );
}
