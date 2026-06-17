'use client';

import React, { useState, useRef, useEffect, ChangeEvent, MouseEvent } from 'react';
// 1. Impor jsPDF untuk penanganan konversi ke berkas PDF
import { jsPDF } from 'jspdf';

interface TextItem {
  id: string;
  content: string;
  x: number;
  y: number;
}

export default function SertifikatPage() {
  const [currentText, setCurrentText] = useState<string>('Halo React!');
  const [peran, setPeran] = useState('UNASSIGNED');
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>(() => {
    if (typeof window !== 'undefined') {
      const cachedSize = localStorage.getItem('cached_size');
      return cachedSize ? JSON.parse(cachedSize) : { width: 500, height: 400 };
    }
    return { width: 500, height: 400 };
  });

  const [currentPos, setCurrentPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('cached_current_pos');
      if (cached) return JSON.parse(cached);
    }
    return { x: canvasSize.width / 2 - 50, y: canvasSize.height / 2 };
  });

  const [textsList, setTextsList] = useState<TextItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('cached_texts_list');
      return cached ? JSON.parse(cached) : [];
    }
    return [];
  });

  const [imageSrc, setImageSrc] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cached_image') || null;
    }
    return null;
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imageRef.current && imageRef.current.complete) {
      ctx.drawImage(imageRef.current, 0, 0);
    }

    textsList.forEach((item) => {
      ctx.font = '24px sans-serif';
      ctx.fillStyle = 'blue';
      ctx.fillText(item.content, item.x, item.y);
    });

    // 2. Gambar teks yang sedang aktif diketik secara real-time (Warna Merah)
if (currentText.trim() && peran !== 'UNASSIGNED') {
  
  if (peran === 'sansserif') {
    ctx.font = '24px sans-serif';
    ctx.fillStyle = 'red'; 
    ctx.fillText(currentText, currentPos.x, currentPos.y);
  } 
  else if (peran === 'bold sans') {
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = 'red'; 
    ctx.fillText(currentText, currentPos.x, currentPos.y);
  }
}

  };

  useEffect(() => {
    localStorage.setItem('cached_text', currentText);
    drawScene();
  }, [currentText, peran]);

  useEffect(() => {
    localStorage.setItem('cached_current_pos', JSON.stringify(currentPos));
    drawScene();
  }, [currentPos]);

  useEffect(() => {
    localStorage.setItem('cached_texts_list', JSON.stringify(textsList));
    drawScene();
  }, [textsList]);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        imageRef.current = img;
        drawScene();
      };
    } else {
      imageRef.current = null;
      drawScene();
    }
  }, [imageSrc]);

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPos({ x, y });
  };

  const handleLockText = () => {
    if (!currentText.trim()) return;

    const lockedItem: TextItem = {
      id: Date.now().toString(),
      content: currentText,
      x: currentPos.x,
      y: currentPos.y
    };

    setTextsList([...textsList, lockedItem]);
    setCurrentText('masukan teksnya!');
    setCurrentPos({ x: canvasSize.width / 2 - 50, y: canvasSize.height / 2 });
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const img = new Image();
          img.onload = () => {
            const newSize = { width: img.width, height: img.height };
            setCanvasSize(newSize);
            setImageSrc(result);
            setCurrentPos({ x: img.width / 2 - 50, y: img.height / 2 });
            localStorage.setItem('cached_image', result);
            localStorage.setItem('cached_size', JSON.stringify(newSize));
          };
          img.src = result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem('cached_text');
    localStorage.removeItem('cached_image');
    localStorage.removeItem('cached_size');
    localStorage.removeItem('cached_current_pos');
    localStorage.removeItem('cached_texts_list');
    
    setCurrentText('Halo React!');
    setCanvasSize({ width: 500, height: 400 });
    setCurrentPos({ x: 200, y: 200 });
    setTextsList([]);
    setImageSrc(null);
  };

  // 2. FUNGSI UTAMA UNTUK MENGEKSPOR KANVAS MENJADI PDF
  const handleDownloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mengambil snapshot gambar dari kanvas (format dataURL PNG)
    const imgData = canvas.toDataURL('image/png');

    // Menentukan orientasi PDF otomatis berdasarkan dimensi kanvas (landscape / portrait)
    const orientation = canvas.width > canvas.height ? 'l' : 'p';

    // Membuat dokumen baru dengan satuan unit piksel ('px') sesuai ukuran asli kanvas
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    // Memasukkan gambar kanvas ke dalam berkas PDF tanpa merusak resolusi
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    
    // Mengunduh dokumen langsung di peramban pengguna
    pdf.save('sertifikat-digital.pdf');
  };

  return (
    <div style={{ padding: '20px' }}>
      <input 
        type="text" 
        value={currentText} 
        onChange={(e) => setCurrentText(e.target.value)} 
        placeholder="Masukkan teks"
        style={{ marginBottom: '10px', display: 'block' }}
        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1193b5] focus:border-transparent outline-none transition"
      />
    <select 
  value={peran}
  onChange={(e) => setPeran(e.target.value)}
  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1193b5] outline-none text-sm"
>
  <option value="UNASSIGNED" disabled>-- Pilih Opsi --</option>
  <option value="sansserif">24px sans-serif</option>
  <option value="bold sans">24px Sans Serif (Tebal)</option>
</select>
      <br></br>
      {/* Tombol Kunci Teks */}
      <br></br>
      <button 
        onClick={handleLockText}
        className="w-full bg-green-600 text-white text-lg font-bold py-4 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/30 flex justify-center items-center gap-2"
        style={{ marginBottom: '10px' }}
      >
        <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        <span>Selesai & Kunci Teks Ini</span>
        
      </button>
      
      {/* Tombol Pilih Gambar */}
      <label 
        className="w-full bg-[#1193b5] text-white text-lg font-bold py-4 rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 cursor-pointer"
        style={{ marginBottom: '10px' }}
      >
        <span>Pilih Gambar Sertifikat</span>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </label>

      {/* Container Tombol Kontrol Bawah */}
      <div className="flex gap-2" style={{ marginBottom: '15px' }}>
        {/* 3. TOMBOL UNDUH PDF */}
        <button 
          onClick={handleDownloadPDF} 
          className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 shadow-md shadow-indigo-500/20"
        >
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Unduh PDF
        </button>

        {/* Tombol Hapus Cache */}
        <button 
          onClick={handleClearCache} 
          className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
        >
          Hapus Cache
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        style={{ border: '1px solid black', display: 'block', cursor: 'move' }}
      />
    </div>
  );
}



