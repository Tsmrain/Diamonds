import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Banknote, QrCode, CheckCircle, Diamond, Clock, Calendar, LogOut } from 'lucide-react';
import { api } from '../../services/api';
import { Room, Booking } from '../../core/domain';
import { useTimer } from '../../hooks/useTimer';

export default function ClientApp() {
  const [view, setView] = useState<'home' | 'new' | 'manage' | 'schedule'>('home');

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] flex justify-center selection:bg-black/10">
      <div className="w-full max-w-md bg-[#f5f5f7] min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
        <header className="sticky top-0 z-50 bg-[#f5f5f7]/80 backdrop-blur-xl border-b border-black/5 px-4 py-4 flex items-center justify-between">
          {view !== 'home' ? (
            <button onClick={() => setView('home')} className="p-2 -ml-2 text-black hover:bg-black/5 rounded-full transition-colors">
              <ChevronLeft size={28} />
            </button>
          ) : <div className="w-11" />}
          <div className="flex items-center space-x-2">
            <Diamond className="text-black" size={24} fill="currentColor" />
            <h1 className="font-semibold text-lg tracking-tight">Diamonds</h1>
          </div>
          <div className="w-11" />
        </header>

        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
            {view === 'home' && <HomeView key="home" onNavigate={setView} />}
            {view === 'new' && <NewReservationFlow key="new" onFinish={() => setView('manage')} />}
            {view === 'manage' && <ManageReservations key="manage" />}
            {view === 'schedule' && <ScheduleReservationFlow key="schedule" onFinish={() => setView('home')} />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function HomeView({ onNavigate }: { onNavigate: (v: 'new' | 'manage' | 'schedule') => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-8 pt-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-black">Bienvenido</h2>
        <p className="text-gray-500 font-medium">¿Qué deseas hacer hoy?</p>
      </div>
      <div className="space-y-4">
        <button onClick={() => onNavigate('new')} className="w-full bg-black text-white p-6 rounded-[2rem] shadow-md hover:bg-gray-900 transition-all flex flex-col items-center space-y-3 active:scale-[0.98]">
          <Clock size={40} />
          <span className="font-semibold text-xl">Ingreso Inmediato</span>
        </button>
        <button onClick={() => onNavigate('schedule')} className="w-full bg-white text-black border border-black/10 p-6 rounded-[2rem] shadow-sm hover:border-black transition-all flex flex-col items-center space-y-3 active:scale-[0.98]">
          <Calendar size={40} />
          <span className="font-semibold text-xl">Agendar Reserva</span>
        </button>
        <button onClick={() => onNavigate('manage')} className="w-full bg-[#f5f5f7] text-black border border-black/10 p-6 rounded-[2rem] shadow-sm hover:border-black transition-all flex flex-col items-center space-y-3 active:scale-[0.98]">
          <LogOut size={40} />
          <span className="font-semibold text-xl">Mis Reservas</span>
        </button>
      </div>
    </motion.div>
  );
}

function ManageReservations() {
  const [loginCI, setLoginCI] = useState('');
  const [loggedInCI, setLoggedInCI] = useState('');
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const loadData = async () => {
    if (loggedInCI) {
      const b = await api.getBookingsByGuest(loggedInCI);
      const r = await api.getRooms();
      setMyBookings(b.sort((x, y) => new Date(y.checkInDate).getTime() - new Date(x.checkInDate).getTime()));
      setRooms(r);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loggedInCI]);

  if (!loggedInCI) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 pt-12 space-y-6">
        <h2 className="text-2xl font-bold text-black">Ingresa a tus reservas</h2>
        <p className="text-gray-500 font-medium">Ingresa tu Carnet de Identidad para ver tu estancia actual.</p>
        <input type="text" placeholder="Ej. 1234567" value={loginCI} onChange={e => setLoginCI(e.target.value)} className="w-full bg-white border border-black/10 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-lg shadow-sm" />
        <button disabled={!loginCI.trim()} onClick={() => setLoggedInCI(loginCI.trim())} className="w-full bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full py-4 font-semibold text-lg transition-colors shadow-sm">
          Ingresar
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Mis Reservas</h2>
        <button onClick={() => setLoggedInCI('')} className="p-2 text-black hover:bg-black/5 rounded-full transition-colors"><LogOut size={20} /></button>
      </div>

      {myBookings.length === 0 ? (
        <p className="text-gray-500 text-center py-12 font-medium">No tienes reservas registradas con este CI.</p>
      ) : (
        <div className="space-y-4">
          {myBookings.map(booking => {
            const room = rooms.find(r => r.id === booking.roomId);
            if (!room) return null;
            return <BookingCard key={booking.id} booking={booking} room={room} onUpdate={loadData} />;
          })}
        </div>
      )}
    </motion.div>
  );
}

function BookingCard({ booking, room, onUpdate }: { booking: Booking, room: Room, onUpdate: () => void }) {
  const { isOvertime, remainingOrOvertimeFormatted } = useTimer(booking.checkInDate, room.duration);
  const isActive = booking.status === 'ACTIVE';
  const isPending = booking.status === 'PENDING_ARRIVAL';
  const [confirmAction, setConfirmAction] = useState<'CANCEL' | 'CHECKOUT' | null>(null);

  const handleAction = async () => {
    if (confirmAction === 'CANCEL') {
      await api.cancelBooking(booking.id, room.id);
    } else if (confirmAction === 'CHECKOUT') {
      await api.checkout(booking.id);
      await api.updateRoomStatus(room.id, 'DIRTY');
    }
    setConfirmAction(null);
    onUpdate();
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-sm space-y-4 relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-xl text-black">Habitación {room.number}</h3>
          <p className="text-sm font-medium text-gray-500">{room.type}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-black text-white' : isPending ? 'bg-yellow-100 text-yellow-800' : 'bg-black/5 text-black'}`}>
          {isActive ? 'Activa' : isPending ? 'En Camino' : 'Completada'}
        </span>
      </div>
      
      {isActive && (
        <div className={`p-4 rounded-2xl flex items-center justify-between ${isOvertime ? 'bg-black text-white' : 'bg-[#f5f5f7] text-black'}`}>
          <span className="font-semibold text-sm uppercase tracking-wider">{isOvertime ? 'Tiempo Excedido' : 'Tiempo Restante'}</span>
          <span className={`font-mono font-bold text-xl ${isOvertime ? 'animate-pulse' : ''}`}>
            {isOvertime ? '+' : '-'}{remainingOrOvertimeFormatted}
          </span>
        </div>
      )}

      {isPending && (
        <div className="p-4 rounded-2xl flex items-center justify-between bg-yellow-50 text-yellow-900 border border-yellow-200">
          <span className="font-semibold text-sm uppercase tracking-wider flex items-center space-x-2">
            <Clock size={16} />
            <span>Esperando Llegada</span>
          </span>
          <span className="font-bold text-sm">
            ~{booking.eta} min
          </span>
        </div>
      )}

      <div className="text-sm font-medium text-gray-500 space-y-1 border-t border-black/5 pt-4">
        <p>Reserva: {new Date(booking.checkInDate).toLocaleString('es-BO')}</p>
        <p>Huésped: {booking.guest.name}</p>
      </div>

      {!confirmAction && isActive && (
        <button onClick={() => setConfirmAction('CHECKOUT')} className="w-full mt-4 py-3 bg-black/5 text-black font-semibold rounded-xl hover:bg-black/10 transition-colors">
          Finalizar Estancia Anticipadamente
        </button>
      )}
      {!confirmAction && isPending && (
        <button onClick={() => setConfirmAction('CANCEL')} className="w-full mt-4 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors">
          Cancelar Reserva
        </button>
      )}

      {confirmAction && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
          <h4 className="text-lg font-bold text-black mb-2">
            {confirmAction === 'CANCEL' ? '¿Cancelar reserva?' : '¿Finalizar estancia?'}
          </h4>
          <p className="text-sm text-gray-500 mb-6">
            {confirmAction === 'CANCEL' 
              ? 'Esta acción liberará la habitación.' 
              : 'La habitación se marcará para limpieza y tu tiempo terminará.'}
          </p>
          <div className="flex space-x-3 w-full">
            <button onClick={() => setConfirmAction(null)} className="flex-1 py-3 bg-gray-100 text-black font-semibold rounded-xl">
              Volver
            </button>
            <button onClick={handleAction} className={`flex-1 py-3 text-white font-semibold rounded-xl ${confirmAction === 'CANCEL' ? 'bg-red-600' : 'bg-black'}`}>
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewReservationFlow({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(1);
  const [reservation, setReservation] = useState({
    room: null as Room | null,
    guest: { ci: '', name: '', ciInDeposit: true },
    paymentMethod: '',
    eta: 0
  });

  const updateData = (newData: any) => setReservation(prev => ({ ...prev, ...newData }));
  const nextStep = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep(s => s + 1); };
  const prevStep = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep(s => s - 1); };

  const handleConfirm = async () => {
    if (!reservation.room) return;
    
    // Validar disponibilidad antes de confirmar
    const currentRooms = await api.getRooms();
    const targetRoom = currentRooms.find(r => r.id === reservation.room?.id);
    
    if (!targetRoom || targetRoom.status !== 'VACANT') {
      alert('Lo sentimos, esta habitación acaba de ser ocupada o reservada por alguien más. Por favor, selecciona otra.');
      setStep(1); // Volver a la selección de habitación
      return;
    }
    
    await api.createBooking({
      roomId: reservation.room.id,
      guest: reservation.guest,
      checkInDate: new Date().toISOString(),
      status: reservation.eta > 0 ? 'PENDING_ARRIVAL' : 'ACTIVE',
      eta: reservation.eta
    });

    nextStep(); // Go to confirmation screen
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <RoomSelection onSelect={(room) => { updateData({ room }); nextStep(); }} />;
      case 2: return <GuestDetails data={reservation} updateData={updateData} onNext={nextStep} />;
      case 3: return <ETASelection data={reservation} updateData={updateData} onNext={nextStep} />;
      case 4: return <PaymentSelection data={reservation} updateData={updateData} onNext={handleConfirm} />;
      case 5: return <Confirmation onFinish={onFinish} eta={reservation.eta} />;
      default: return null;
    }
  };

  return (
    <div className="relative">
      {step > 1 && step < 5 && (
        <div className="absolute top-[-60px] left-2 z-50">
          <button onClick={prevStep} className="p-2 text-black hover:bg-black/5 rounded-full transition-colors"><ChevronLeft size={28} /></button>
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

function RoomSelection({ onSelect }: { onSelect: (room: Room) => void }) {
  const [rooms, setRooms] = useState<Room[]>([]);

  const loadRooms = async () => {
    const r = await api.getRooms();
    setRooms(r.filter(room => room.status === 'VACANT'));
  };

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="px-5 pt-6">
        <h2 className="text-3xl font-bold tracking-tight text-black mb-2">Habitaciones</h2>
        <p className="text-gray-500 font-medium">Selecciona una habitación disponible.</p>
      </div>
      <div className="px-5 space-y-6">
        {rooms.length === 0 ? (
          <p className="text-center text-gray-500 font-medium py-10">No hay habitaciones disponibles en este momento.</p>
        ) : (
          rooms.map(room => (
            <div key={room.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-black/10 cursor-pointer hover:border-black transition-all active:scale-[0.98]" onClick={() => onSelect(room)}>
              {room.image && (
                <div className="aspect-[4/3] relative">
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full font-bold text-sm shadow-sm text-black">Bs. {room.price} / {room.duration}h</div>
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-black">Hab. {room.number}</h3>
                  {!room.image && <div className="bg-black text-white px-3 py-1.5 rounded-full font-bold text-sm">Bs. {room.price}</div>}
                </div>
                <p className="text-gray-500 font-medium mb-4">{room.name} • {room.duration} horas</p>
                
                {room.amenities && room.amenities.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Incluye</h4>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-[#f5f5f7] text-gray-600 px-3 py-1 rounded-lg text-sm font-medium">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="w-full bg-black text-white rounded-2xl py-3.5 font-medium hover:bg-gray-900 transition-colors">Seleccionar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function GuestDetails({ data, updateData, onNext }: any) {
  const isValid = data.guest.ci.trim() && data.guest.name.trim();

  return (
    <div className="px-5 pt-6 pb-32 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-black mb-2">Tus Datos</h2>
        <p className="text-gray-500 font-medium">Ingresa la información del huésped principal.</p>
      </div>
      
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/10 space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Carnet de Identidad *</label>
          <input type="text" placeholder="Ej. 1234567" value={data.guest.ci} onChange={e => updateData({ guest: { ...data.guest, ci: e.target.value } })} className="w-full bg-[#f5f5f7] border-transparent rounded-xl px-4 py-3.5 focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all outline-none text-black font-medium" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Nombre Completo *</label>
          <input type="text" placeholder="Ej. Juan Pérez" value={data.guest.name} onChange={e => updateData({ guest: { ...data.guest, name: e.target.value } })} className="w-full bg-[#f5f5f7] border-transparent rounded-xl px-4 py-3.5 focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all outline-none text-black font-medium" />
        </div>
        <label className="flex items-center space-x-3 pt-2 cursor-pointer">
          <input type="checkbox" checked={data.guest.ciInDeposit} onChange={e => updateData({ guest: { ...data.guest, ciInDeposit: e.target.checked } })} className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
          <span className="text-sm font-medium text-gray-700">Dejaré mi CI en recepción (Depósito)</span>
        </label>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#f5f5f7]/80 backdrop-blur-xl border-t border-black/5 z-10">
        <div className="max-w-md mx-auto">
          <button disabled={!isValid} onClick={onNext} className="w-full bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full py-4 font-semibold text-lg transition-colors shadow-sm">Continuar</button>
        </div>
      </div>
    </div>
  );
}

function PaymentSelection({ data, updateData, onNext }: any) {
  const totalPrice = data.room.price;

  return (
    <div className="px-5 pt-6 pb-32 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-black mb-2">Pago</h2>
        <p className="text-gray-500 font-medium">Selecciona tu método de pago.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-sm space-y-2">
        <div className="flex justify-between text-gray-500 font-medium">
          <span>Habitación {data.room.number} ({data.room.duration}h)</span>
          <span>Bs. {data.room.price}</span>
        </div>
        <div className="flex justify-between font-bold text-2xl pt-4 border-t border-black/5 text-black">
          <span>Total</span>
          <span>Bs. {totalPrice}</span>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { id: 'EFECTIVO', label: 'Efectivo', desc: 'Paga al llegar a recepción', icon: Banknote },
          { id: 'QR', label: 'Transferencia QR', desc: 'Pago rápido y seguro', icon: QrCode }
        ].map(method => (
          <div key={method.id} className="space-y-4">
            <div onClick={() => updateData({ paymentMethod: method.id })} className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center space-x-5 ${data.paymentMethod === method.id ? 'border-black bg-black text-white' : 'border-transparent bg-white text-black shadow-sm hover:border-black/20'}`}>
              <div className={`p-4 rounded-full ${data.paymentMethod === method.id ? 'bg-white/20' : 'bg-[#f5f5f7]'}`}><method.icon size={28} /></div>
              <div>
                <h4 className="font-bold text-xl mb-1">{method.label}</h4>
                <p className={`text-sm font-medium ${data.paymentMethod === method.id ? 'text-white/80' : 'text-gray-500'}`}>{method.desc}</p>
              </div>
            </div>
            <AnimatePresence>
              {method.id === 'QR' && data.paymentMethod === 'QR' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-sm flex flex-col items-center text-center space-y-5 mt-2">
                    <div className="w-full max-w-[220px] aspect-square bg-[#f5f5f7] rounded-2xl p-4 border border-black/5 flex items-center justify-center">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=Pago+Residencial+Diamonds+Santiago+Borda+1101350386" alt="QR de Pago" className="w-full h-full object-contain rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-3xl text-black">Bs. {totalPrice}</p>
                      <p className="text-gray-900 font-bold">SANTIAGO BORDA ZAMBRANA</p>
                      <p className="text-gray-500 font-medium text-sm">Cuenta: 1101350386</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#f5f5f7]/80 backdrop-blur-xl border-t border-black/5 z-10">
        <div className="max-w-md mx-auto">
          <button disabled={!data.paymentMethod} onClick={onNext} className="w-full bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full py-4 font-semibold text-lg transition-colors shadow-sm">Confirmar Reserva</button>
        </div>
      </div>
    </div>
  );
}

function ETASelection({ data, updateData, onNext }: any) {
  const options = [
    { value: 0, label: 'Estoy en recepción', icon: '🏢' },
    { value: 15, label: 'Llego en ~15 min', icon: '🚶' },
    { value: 30, label: 'Llego en ~30 min', icon: '🚗' },
    { value: 60, label: 'Llego en ~1 hora', icon: '🚌' },
  ];

  return (
    <div className="px-5 pt-6 space-y-8 pb-32">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-black mb-2">Tiempo de Llegada</h2>
        <p className="text-gray-500 font-medium">¿En cuánto tiempo estarás en el motel?</p>
      </div>
      <div className="space-y-4">
        {options.map(opt => (
          <button 
            key={opt.value}
            onClick={() => updateData({ eta: opt.value })}
            className={`w-full p-6 rounded-[2rem] border text-left flex items-center space-x-4 transition-all ${data.eta === opt.value ? 'bg-black text-white border-black shadow-md' : 'bg-white text-black border-black/10 hover:border-black/30 shadow-sm'}`}
          >
            <span className="text-3xl">{opt.icon}</span>
            <span className="font-semibold text-lg">{opt.label}</span>
          </button>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#f5f5f7]/80 backdrop-blur-xl border-t border-black/5 z-10">
        <div className="max-w-md mx-auto">
          <button onClick={onNext} className="w-full bg-black text-white rounded-full py-4 font-semibold text-lg transition-colors shadow-sm">
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

function Confirmation({ onFinish, eta }: { onFinish: () => void, eta: number }) {
  return (
    <div className="px-5 pt-20 pb-24 flex flex-col items-center text-center space-y-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="w-32 h-32 bg-black text-white rounded-full flex items-center justify-center mb-4 shadow-xl">
        <CheckCircle size={64} />
      </motion.div>
      <h2 className="text-4xl font-bold tracking-tight text-black">¡Reserva Confirmada!</h2>
      <p className="text-gray-500 font-medium max-w-xs text-lg">
        {eta === 0 
          ? 'Tu habitación ya está lista y el cronómetro ha comenzado.'
          : `Hemos bloqueado tu habitación. El cronómetro iniciará cuando llegues a recepción (aprox. ${eta} min).`}
      </p>

      <div className="w-full pt-8 space-y-4">
        <button onClick={onFinish} className="w-full bg-black text-white rounded-full py-4 font-semibold text-lg transition-colors shadow-lg hover:bg-gray-900">
          Ver mi Estancia
        </button>
      </div>
    </div>
  );
}

function ScheduleReservationFlow({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(1);
  const [reservation, setReservation] = useState({
    room: null as Room | null,
    date: '',
    time: '',
    guestCIs: ['']
  });

  const updateData = (newData: any) => setReservation(prev => ({ ...prev, ...newData }));
  const nextStep = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep(s => s + 1); };
  const prevStep = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep(s => s - 1); };

  const handleConfirm = async () => {
    if (!reservation.room) return;
    
    // Validar disponibilidad antes de confirmar (anti-choques)
    const allReservations = await api.getReservations();
    const activeBookings = await api.getActiveBookings();
    
    const requestedStart = new Date(`${reservation.date}T${reservation.time}`);
    const requestedEnd = new Date(requestedStart.getTime() + reservation.room.duration * 60 * 60 * 1000);
    
    const hasReservationOverlap = allReservations.some(res => {
      if (res.roomId !== reservation.room!.id) return false;
      if (res.status === 'CANCELLED' || res.status === 'FULFILLED') return false;
      
      const resStart = new Date(`${res.date}T${res.time}`);
      const resEnd = new Date(resStart.getTime() + reservation.room!.duration * 60 * 60 * 1000);
      
      return requestedStart < resEnd && resStart < requestedEnd;
    });
    
    let hasActiveOverlap = false;
    const activeBooking = activeBookings.find(b => b.roomId === reservation.room!.id);
    if (activeBooking) {
      const bookingStart = new Date(activeBooking.checkInDate);
      const bookingEnd = new Date(bookingStart.getTime() + reservation.room!.duration * 60 * 60 * 1000);
      const bookingEndWithBuffer = new Date(bookingEnd.getTime() + 30 * 60 * 1000);
      
      if (requestedStart < bookingEndWithBuffer) hasActiveOverlap = true;
    }
    
    if (hasReservationOverlap || hasActiveOverlap) {
      alert('Lo sentimos, esta habitación acaba de ser reservada por alguien más para ese horario. Por favor, selecciona otra habitación u otro horario.');
      setStep(1); // Volver a la selección de fecha y hora
      return;
    }
    
    await api.createReservation({
      roomId: reservation.room.id,
      guestCIs: reservation.guestCIs.filter(ci => ci.trim() !== ''),
      date: reservation.date,
      time: reservation.time
    });

    nextStep(); // Go to confirmation screen
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <ScheduleDateTime data={reservation} updateData={updateData} onNext={nextStep} />;
      case 2: return <ScheduleRoomSelection data={reservation} onSelect={(room) => { updateData({ room }); nextStep(); }} />;
      case 3: return <ScheduleGuestDetails data={reservation} updateData={updateData} onNext={handleConfirm} />;
      case 4: return <ScheduleConfirmation onFinish={onFinish} />;
      default: return null;
    }
  };

  return (
    <div className="relative">
      {step > 1 && step < 4 && (
        <div className="absolute top-[-60px] left-2 z-50">
          <button onClick={prevStep} className="p-2 text-black hover:bg-black/5 rounded-full transition-colors"><ChevronLeft size={28} /></button>
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

function ScheduleRoomSelection({ data, onSelect }: { data: any, onSelect: (room: Room) => void }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAvailableRooms = async () => {
    const allRooms = await api.getRooms();
    const allReservations = await api.getReservations();
    const activeBookings = await api.getActiveBookings();
    
    const requestedStart = new Date(`${data.date}T${data.time}`);
    
    const availableRooms = allRooms.filter(room => {
      // 1. Descartar habitaciones en mantenimiento
      if (room.status === 'MAINTENANCE') return false;
      
      const requestedEnd = new Date(requestedStart.getTime() + room.duration * 60 * 60 * 1000);
      
      // 2. Verificar choques con otras reservas programadas
      const hasReservationOverlap = allReservations.some(res => {
        if (res.roomId !== room.id) return false;
        if (res.status === 'CANCELLED' || res.status === 'FULFILLED') return false;
        
        const resStart = new Date(`${res.date}T${res.time}`);
        const resEnd = new Date(resStart.getTime() + room.duration * 60 * 60 * 1000);
        
        return requestedStart < resEnd && resStart < requestedEnd;
      });
      
      if (hasReservationOverlap) return false;

      // 3. Verificar choques con ocupaciones actuales (si la reserva es para hoy/pronto)
      const activeBooking = activeBookings.find(b => b.roomId === room.id);
      if (activeBooking) {
        const bookingStart = new Date(activeBooking.checkInDate);
        const bookingEnd = new Date(bookingStart.getTime() + room.duration * 60 * 60 * 1000);
        
        // Añadimos 30 minutos de margen para limpieza
        const bookingEndWithBuffer = new Date(bookingEnd.getTime() + 30 * 60 * 1000);
        
        if (requestedStart < bookingEndWithBuffer) return false;
      }
      
      return true;
    });
    
    setRooms(availableRooms);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    loadAvailableRooms();
    const interval = setInterval(loadAvailableRooms, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, [data.date, data.time]);

  return (
    <div className="space-y-6 pb-12">
      <div className="px-5 pt-6">
        <h2 className="text-3xl font-bold tracking-tight text-black mb-2">Habitaciones</h2>
        <p className="text-gray-500 font-medium">Habitaciones disponibles para el {data.date} a las {data.time}.</p>
      </div>
      <div className="px-5 space-y-6">
        {isLoading ? (
          <p className="text-center text-gray-500 font-medium py-10">Buscando habitaciones disponibles...</p>
        ) : rooms.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-3xl text-center border border-black/5">
            <p className="text-gray-500 font-medium mb-2">No hay habitaciones disponibles para esta fecha y hora.</p>
            <p className="text-sm text-gray-400">Por favor, intenta con otro horario.</p>
          </div>
        ) : (
          rooms.map(room => (
            <div key={room.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-black/10 cursor-pointer hover:border-black transition-all active:scale-[0.98]" onClick={() => onSelect(room)}>
              {room.image && (
                <div className="aspect-[4/3] relative">
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full font-bold text-sm shadow-sm text-black">Bs. {room.price} / {room.duration}h</div>
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-black">Hab. {room.number}</h3>
                  {!room.image && <div className="bg-black text-white px-3 py-1.5 rounded-full font-bold text-sm">Bs. {room.price}</div>}
                </div>
                <p className="text-gray-500 font-medium mb-4">{room.name} • {room.duration} horas</p>
                
                {room.amenities && room.amenities.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Incluye</h4>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-[#f5f5f7] text-gray-600 px-3 py-1 rounded-lg text-sm font-medium">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="w-full bg-black text-white rounded-2xl py-3.5 font-medium hover:bg-gray-900 transition-colors">Seleccionar para Agendar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ScheduleDateTime({ data, updateData, onNext }: any) {
  const [selectedHour, setSelectedHour] = useState(data.time ? data.time.split(':')[0] : '');
  const [selectedMinute, setSelectedMinute] = useState(data.time ? data.time.split(':')[1] : '');

  const isValid = data.date && selectedHour !== '' && selectedMinute !== '';

  useEffect(() => {
    if (selectedHour !== '' && selectedMinute !== '') {
      updateData({ time: `${selectedHour}:${selectedMinute}` });
    }
  }, [selectedHour, selectedMinute]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className="px-5 pt-6 space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-black mb-2">Fecha y Hora</h2>
        <p className="text-gray-500 font-medium">¿Cuándo deseas ingresar?</p>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Fecha</label>
          <input type="date" value={data.date} min={new Date().toISOString().split('T')[0]} onChange={e => updateData({ date: e.target.value })} className="w-full bg-white border border-black/10 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-lg shadow-sm" />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Hora de Ingreso</label>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-500 mb-3 ml-1">Hora</p>
              <div className="grid grid-cols-6 gap-2">
                {hours.map(h => (
                  <button
                    key={h}
                    onClick={() => setSelectedHour(h)}
                    className={`py-3 rounded-xl font-medium text-sm transition-colors ${selectedHour === h ? 'bg-black text-white shadow-md' : 'bg-white border border-black/10 text-black hover:border-black/30'}`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 mb-3 ml-1">Minutos</p>
              <div className="grid grid-cols-4 gap-2">
                {minutes.map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMinute(m)}
                    className={`py-3 rounded-xl font-medium text-sm transition-colors ${selectedMinute === m ? 'bg-black text-white shadow-md' : 'bg-white border border-black/10 text-black hover:border-black/30'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button disabled={!isValid} onClick={onNext} className="w-full bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full py-4 font-semibold text-lg transition-colors shadow-sm mt-8">
        Continuar
      </button>
    </div>
  );
}

function ScheduleGuestDetails({ data, updateData, onNext }: any) {
  const addCI = () => updateData({ guestCIs: [...data.guestCIs, ''] });
  const updateCI = (index: number, value: string) => {
    const newCIs = [...data.guestCIs];
    newCIs[index] = value;
    updateData({ guestCIs: newCIs });
  };
  const removeCI = (index: number) => {
    if (data.guestCIs.length > 1) {
      const newCIs = data.guestCIs.filter((_: any, i: number) => i !== index);
      updateData({ guestCIs: newCIs });
    }
  };

  const isValid = data.guestCIs[0].trim().length > 0;

  return (
    <div className="px-5 pt-6 space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-black mb-2">Huéspedes</h2>
        <p className="text-gray-500 font-medium">Ingresa los Carnets de Identidad de las personas que estarán en la habitación.</p>
      </div>

      <div className="space-y-4">
        {data.guestCIs.map((ci: string, index: number) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Carnet {index + 1}</label>
              {index > 0 && (
                <button onClick={() => removeCI(index)} className="text-red-500 text-sm font-bold uppercase tracking-wider">Eliminar</button>
              )}
            </div>
            <input type="text" placeholder="Ej. 1234567" value={ci} onChange={e => updateCI(index, e.target.value)} className="w-full bg-white border border-black/10 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-lg shadow-sm" />
          </div>
        ))}

        <button onClick={addCI} className="w-full bg-white text-black border border-black/10 rounded-2xl py-4 font-semibold text-lg hover:border-black transition-colors shadow-sm mt-4">
          + Añadir otro huésped
        </button>
      </div>

      <div className="bg-[#f5f5f7] p-6 rounded-3xl border border-black/5 mt-8">
        <h3 className="font-bold text-lg mb-4">Resumen de Agenda</h3>
        <div className="space-y-2 text-sm font-medium text-gray-600">
          <div className="flex justify-between"><span className="text-gray-400">Habitación</span><span className="text-black">Hab. {data.room?.number} ({data.room?.type})</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Fecha</span><span className="text-black">{data.date}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Hora</span><span className="text-black">{data.time}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Huéspedes</span><span className="text-black">{data.guestCIs.filter((c: string) => c.trim()).length} persona(s)</span></div>
        </div>
      </div>

      <button disabled={!isValid} onClick={onNext} className="w-full bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full py-4 font-semibold text-lg transition-colors shadow-sm">
        Confirmar Agenda
      </button>
    </div>
  );
}

function ScheduleConfirmation({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="px-5 pt-12 pb-12 flex flex-col items-center text-center space-y-6">
      <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-4 shadow-xl">
        <CheckCircle size={48} className="text-white" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-black">¡Reserva Agendada!</h2>
      <p className="text-gray-500 font-medium text-lg">Tu reserva ha sido guardada exitosamente. Te esperamos en la fecha y hora indicadas.</p>
      
      <button onClick={onFinish} className="w-full bg-[#f5f5f7] text-black border border-black/10 rounded-full py-4 font-semibold text-lg hover:border-black transition-colors shadow-sm mt-8">
        Volver al inicio
      </button>
    </div>
  );
}
