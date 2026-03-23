import React, { useState, useEffect } from 'react';
import { Room, RoomType } from '../../core/domain';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, X, Check, Upload, Image as ImageIcon } from 'lucide-react';

export function ManageRooms({ onUpdate }: { onUpdate: () => void }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadRooms = async () => {
    const r = await api.getRooms();
    setRooms(r);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleSave = async () => {
    if (!editingRoom) return;
    try {
      if (editingRoom.id) {
        await api.updateRoom(editingRoom.id, editingRoom);
      } else {
        await api.createRoom(editingRoom);
      }
      setIsModalOpen(false);
      setEditingRoom(null);
      loadRooms();
      onUpdate();
    } catch (e) {
      alert('Error al guardar: ' + e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta habitación?')) {
      await api.deleteRoom(id);
      loadRooms();
      onUpdate();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const url = await api.uploadRoomImage(file);
      setEditingRoom(prev => ({ ...prev, image: url }));
    } catch (e) {
      alert('Error subiendo imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Gestionar Habitaciones</h2>
        <button 
          onClick={() => { setEditingRoom({ status: 'VACANT', type: 'ESTANDAR', price: 0, duration: 3, amenities: [] }); setIsModalOpen(true); }}
          className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-2xl font-bold transition-all hover:scale-105"
        >
          <Plus size={20} />
          <span>Nueva Habitación</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="bg-white rounded-[2rem] border border-black/10 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#f5f5f7] rounded-2xl overflow-hidden border border-black/5 flex items-center justify-center">
                {room.image ? <img src={room.image.startsWith('http') ? room.image : `http://localhost:8085${room.image}`} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" />}
              </div>
              <div>
                <h3 className="font-bold text-xl">Hab. {room.number}</h3>
                <p className="text-sm text-gray-500 font-medium">{room.type} • Bs. {room.price}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => { setEditingRoom(room); setIsModalOpen(true); }}
                className="p-3 bg-black/5 rounded-xl hover:bg-black hover:text-white transition-all"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => handleDelete(room.id)}
                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && editingRoom && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-black">{editingRoom.id ? 'Editar' : 'Nueva'} Habitación</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={24} /></button>
            </div>

            <div className="space-y-6">
              {/* Image Upload Area */}
              <div className="relative aspect-video bg-[#f5f5f7] rounded-[2rem] border-2 border-dashed border-black/10 flex flex-col items-center justify-center overflow-hidden group">
                {editingRoom.image ? (
                  <>
                    <img src={editingRoom.image.startsWith('http') ? editingRoom.image : `http://localhost:8085${editingRoom.image}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold flex items-center space-x-2">
                          <Upload size={18} /><span>Cambiar</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                       </label>
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer space-y-3">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <ImageIcon size={32} className={uploading ? 'animate-bounce text-gray-400' : 'text-black'} />
                    </div>
                    <span className="font-bold text-sm">{uploading ? 'Subiendo...' : 'Subir Imagen'}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Número" value={editingRoom.number || ''} onChange={v => setEditingRoom({...editingRoom, number: v})} />
                <Select label="Tipo" value={editingRoom.type || 'ESTANDAR'} options={['ESTANDAR', 'VIP', 'SUPERVIP']} onChange={v => setEditingRoom({...editingRoom, type: v as RoomType})} />
              </div>
              
              <Input label="Nombre/Descripción" value={editingRoom.name || ''} onChange={v => setEditingRoom({...editingRoom, name: v})} />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Precio (Bs.)" type="number" value={editingRoom.price?.toString() || ''} onChange={v => setEditingRoom({...editingRoom, price: parseFloat(v)})} />
                <Input label="Duración (Horas)" type="number" value={editingRoom.duration?.toString() || ''} onChange={v => setEditingRoom({...editingRoom, duration: parseInt(v)})} />
              </div>
            </div>

            <button onClick={handleSave} className="w-full py-5 bg-black text-white rounded-[1.5rem] font-bold text-lg hover:scale-[1.02] transition-all flex items-center justify-center space-x-3">
              <Check size={24} />
              <span>Guardar Habitación</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-[#f5f5f7] border-transparent focus:bg-white focus:border-black/10 rounded-2xl px-5 py-4 font-medium transition-all shadow-sm outline-none" />
    </div>
  );
}

function Select({ label, value, options, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-[#f5f5f7] border-transparent focus:bg-white focus:border-black/10 rounded-2xl px-5 py-4 font-bold transition-all shadow-sm outline-none appearance-none cursor-pointer">
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
