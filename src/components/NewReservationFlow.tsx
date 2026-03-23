import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Banknote, QrCode, CheckCircle, Clock } from 'lucide-react';
import { api } from '../services/api';
import { BookingService } from '../services/BookingService';
import { Room } from '../core/domain';

export function NewReservationFlow({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(1);
  const [reservation, setReservation] = useState({
    room: null as Room | null,
    guest: { ci: '', name: '', phone: '', ciInDeposit: true },
    paymentMethod: '',
    eta: 0
  });

  const updateData = (newData: any) => setReservation(prev => ({ ...prev, ...newData }));
  const nextStep = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep(s => s + 1); };
  const prevStep = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep(s => s - 1); };

  const handleConfirm = async () => {
    if (!reservation.room) return;
    
    // USANDO EL NUEVO SERVICIO PARA PREVENCIÓN DE CHOQUES
    const availability = await BookingService.isRoomAvailable(
      reservation.room.id, 
      new Date(), 
      reservation.room.duration
    );
    
    if (!availability.available) {
      alert(`Lo sentimos: ${availability.reason || 'La habitación no está disponible.'}`);
      setStep(1); 
      return;
    }
    
    await api.createBooking({
      roomId: reservation.room.id,
      guest: reservation.guest,
      checkInDate: new Date().toISOString(),
      status: reservation.eta > 0 ? 'PENDING_ARRIVAL' : 'ACTIVE',
      eta: reservation.eta
    });

    nextStep();
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
    // Solo mostramos habitaciones que REALMENTE estén disponibles ahora (considerando limpieza y reservas agendadas pronto)
    const now = new Date();
    const allRooms = await api.getRooms();
    
    const availableRooms = await Promise.all(
      allRooms.map(async room => {
        const res = await BookingService.isRoomAvailable(room.id, now, room.duration);
        return res.available ? room : null;
      })
    );

    setRooms(availableRooms.filter((r): r is Room => r !== null));
  };

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 5000);
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
                  <img src={room.image.startsWith('http') ? room.image : `http://localhost:8085${room.image}`} alt={room.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full font-bold text-sm shadow-sm text-black">Bs. {room.price} / {room.duration}h</div>
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-black">Hab. {room.number}</h3>
                  {!room.image && <div className="bg-black text-white px-3 py-1.5 rounded-full font-bold text-sm">Bs. {room.price}</div>}
                </div>
                <p className="text-gray-500 font-medium mb-4">{room.name} • {room.duration} horas</p>
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
  const isValid = data.guest.ci.trim() && data.guest.name.trim() && data.guest.phone.trim();
  return (
    <div className="px-5 pt-6 pb-32 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-black mb-2">Tus Datos</h2>
        <p className="text-gray-500 font-medium">Ingresa la información del huésped principal.</p>
      </div>
      
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/10 space-y-5">
        <input type="text" placeholder="Carnet de Identidad" value={data.guest.ci} onChange={e => updateData({ guest: { ...data.guest, ci: e.target.value } })} className="w-full bg-[#f5f5f7] rounded-xl px-4 py-3.5 outline-none text-black font-medium" />
        <input type="text" placeholder="Nombre Completo" value={data.guest.name} onChange={e => updateData({ guest: { ...data.guest, name: e.target.value } })} className="w-full bg-[#f5f5f7] rounded-xl px-4 py-3.5 outline-none text-black font-medium" />
        <input type="tel" placeholder="Número de Celular" value={data.guest.phone || ''} onChange={e => updateData({ guest: { ...data.guest, phone: e.target.value } })} className="w-full bg-[#f5f5f7] rounded-xl px-4 py-3.5 outline-none text-black font-medium" />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#f5f5f7]/80 backdrop-blur-xl border-t border-black/5 z-10">
        <button disabled={!isValid} onClick={onNext} className="w-full bg-black disabled:bg-gray-200 text-white rounded-full py-4 font-semibold text-lg">Continuar</button>
      </div>
    </div>
  );
}

function ETASelection({ data, updateData, onNext }: any) {
  const options = [{ value: 0, label: 'Estoy en recepción', icon: '🏢' }, { value: 15, label: 'Llego en ~15 min', icon: '🚶' }, { value: 30, label: 'Llego en ~30 min', icon: '🚗' }, { value: 60, label: 'Llego en ~1 hora', icon: '🚌' }];
  return (
    <div className="px-5 pt-6 space-y-8 pb-32">
      <h2 className="text-3xl font-bold tracking-tight text-black mb-2">Tiempo de Llegada</h2>
      <div className="space-y-4">
        {options.map(opt => (
          <button key={opt.value} onClick={() => updateData({ eta: opt.value })} className={`w-full p-6 rounded-[2rem] border text-left flex items-center space-x-4 transition-all ${data.eta === opt.value ? 'bg-black text-white' : 'bg-white text-black border-black/10'}`}>
            <span className="text-3xl">{opt.icon}</span>
            <span className="font-semibold text-lg">{opt.label}</span>
          </button>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#f5f5f7]/80 backdrop-blur-xl border-t border-black/5 z-10">
        <button onClick={onNext} className="w-full bg-black text-white rounded-full py-4 font-semibold text-lg">Continuar</button>
      </div>
    </div>
  );
}

function PaymentSelection({ data, updateData, onNext }: any) {
  return (
    <div className="px-5 pt-6 pb-32 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight text-black">Pago</h2>
      <div className="space-y-4">
        {[{ id: 'EFECTIVO', label: 'Efectivo', icon: Banknote }, { id: 'QR', label: 'Transferencia QR', icon: QrCode }].map(method => (
          <div key={method.id} onClick={() => updateData({ paymentMethod: method.id })} className={`p-6 rounded-3xl border-2 cursor-pointer flex items-center space-x-5 ${data.paymentMethod === method.id ? 'border-black bg-black text-white' : 'border-transparent bg-white text-black shadow-sm'}`}>
            <method.icon size={28} />
            <h4 className="font-bold text-xl">{method.label}</h4>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#f5f5f7]/80 backdrop-blur-xl border-t border-black/5 z-10">
        <button disabled={!data.paymentMethod} onClick={onNext} className="w-full bg-black disabled:bg-gray-200 text-white rounded-full py-4 font-semibold text-lg">Confirmar Reserva</button>
      </div>
    </div>
  );
}

function Confirmation({ onFinish, eta }: { onFinish: () => void, eta: number }) {
  return (
    <div className="px-5 pt-20 pb-24 flex flex-col items-center text-center space-y-6">
      <div className="w-32 h-32 bg-black text-white rounded-full flex items-center justify-center shadow-xl"><CheckCircle size={64} /></div>
      <h2 className="text-4xl font-bold text-black">¡Reserva Confirmada!</h2>
      <button onClick={onFinish} className="w-full bg-black text-white rounded-full py-4 font-semibold text-lg">Ver mi Estancia</button>
    </div>
  );
}
