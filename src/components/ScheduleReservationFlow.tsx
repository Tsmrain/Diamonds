import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, CheckCircle, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { BookingService } from '../services/BookingService';
import { Room } from '../core/domain';

export function ScheduleReservationFlow({ onFinish }: { onFinish: () => void }) {
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
    
    // VALIDACIÓN ROBUSTA DE CHOQUES
    const availability = await BookingService.isRoomAvailable(
        reservation.room.id,
        new Date(`${reservation.date}T${reservation.time}`),
        reservation.room.duration
    );

    if (!availability.available) {
      alert(`Horario no disponible: ${availability.reason}`);
      setStep(1); 
      return;
    }
    
    await api.createReservation({
      roomId: reservation.room.id,
      guestCIs: reservation.guestCIs.filter(ci => ci.trim() !== ''),
      date: reservation.date,
      time: reservation.time
    });

    nextStep();
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
      <h2 className="text-3xl font-bold text-black mb-2">Fecha y Hora</h2>
      <input type="date" value={data.date} min={new Date().toISOString().split('T')[0]} onChange={e => updateData({ date: e.target.value })} className="w-full bg-white border border-black/10 rounded-2xl px-4 py-4 text-lg shadow-sm" />
      <div className="grid grid-cols-6 gap-2">
        {hours.map(h => (
          <button key={h} onClick={() => setSelectedHour(h)} className={`py-3 rounded-xl font-medium text-sm transition-colors ${selectedHour === h ? 'bg-black text-white' : 'bg-white border border-black/10 text-black'}`}>{h}</button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {minutes.map(m => (
          <button key={m} onClick={() => setSelectedMinute(m)} className={`py-3 rounded-xl font-medium text-sm transition-colors ${selectedMinute === m ? 'bg-black text-white' : 'bg-white border border-black/10 text-black'}`}>{m}</button>
        ))}
      </div>
      <button disabled={!isValid} onClick={onNext} className="w-full bg-black disabled:bg-gray-200 text-white rounded-full py-4 font-semibold text-lg shadow-sm mt-8">Continuar</button>
    </div>
  );
}

function ScheduleRoomSelection({ data, onSelect }: { data: any, onSelect: (room: Room) => void }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAvailableRooms = async () => {
    setIsLoading(true);
    const available = await BookingService.getAvailableRoomsForPeriod(data.date, data.time);
    setRooms(available);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAvailableRooms();
  }, [data.date, data.time]);

  return (
    <div className="space-y-6 pb-12 px-5">
      <h2 className="text-3xl font-bold text-black mb-2 pt-6">Habitaciones</h2>
      {isLoading ? <p className="text-center text-gray-500 py-10">Buscando...</p> : rooms.length === 0 ? <p className="text-center text-gray-500 py-10">No hay disponibilidad para este horario.</p> : rooms.map(room => (
        <div key={room.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-black/10 cursor-pointer hover:border-black transition-all active:scale-[0.98]" onClick={() => onSelect(room)}>
          {room.image && (
            <div className="aspect-[4/3] relative">
              <img src={room.image.startsWith('http') ? room.image : `http://localhost:8085${room.image}`} alt={room.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full font-bold text-sm shadow-sm text-black">Bs. {room.price}</div>
            </div>
          )}
          <div className="p-6">
            <h3 className="text-2xl font-bold text-black">Hab. {room.number}</h3>
            <p className="text-gray-500 font-medium mb-4">{room.name} • {room.duration} horas</p>
            <button className="w-full bg-black text-white rounded-2xl py-3.5 font-medium hover:bg-gray-900 transition-colors">Seleccionar</button>
          </div>
        </div>
      ))}
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
  const isValid = data.guestCIs[0].trim().length > 0;

  return (
    <div className="px-5 pt-6 space-y-8 pb-12">
      <h2 className="text-3xl font-bold text-black mb-2">Huéspedes</h2>
      {data.guestCIs.map((ci: string, index: number) => (
        <input key={index} type="text" placeholder={`Carnet Huésped ${index + 1}`} value={ci} onChange={e => updateCI(index, e.target.value)} className="w-full bg-white border border-black/10 rounded-2xl px-4 py-4 text-lg shadow-sm" />
      ))}
      <button onClick={addCI} className="w-full bg-white text-black border border-black/10 rounded-2xl py-4 font-semibold text-lg hover:border-black transition-colors shadow-sm">+ Añadir otro huésped</button>
      <button disabled={!isValid} onClick={onNext} className="w-full bg-black disabled:bg-gray-200 text-white rounded-full py-4 font-semibold text-lg shadow-sm mt-8">Confirmar Agenda</button>
    </div>
  );
}

function ScheduleConfirmation({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="px-5 pt-20 pb-24 flex flex-col items-center text-center space-y-6">
      <div className="w-32 h-32 bg-black text-white rounded-full flex items-center justify-center shadow-xl"><CheckCircle size={64} /></div>
      <h2 className="text-4xl font-bold text-black">¡Agendado con éxito!</h2>
      <button onClick={onFinish} className="w-full bg-black text-white rounded-full py-4 font-semibold text-lg">Volver al Inicio</button>
    </div>
  );
}
