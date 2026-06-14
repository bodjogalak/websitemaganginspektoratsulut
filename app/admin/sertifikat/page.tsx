'use client';

import React, { useState, useRef, useEffect, ChangeEvent, MouseEvent } from 'react';

export default function SertifikatPage() {
  // Mengambil data teks awal dari localStorage jika ada
  const [text, setText] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cached_text') || 'Halo React!';
    }
    return 'Halo React!';
  });

  // Mengambil data gambar awal dari localStorage jika ada
  const [imageSrc, setImageSrc] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cached_image') || null;
    }
    return null;
  });

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>(() => {
    if (typeof window !== 'undefined') {
      const cachedSize = localStorage.getItem('cached_size');
      return cachedSize ? JSON.parse(cachedSize) : { width: 500, height: 400 };
    }
    return { width: 500, height: 400 };
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Simpan teks ke localStorage setiap kali ada perubahan
  useEffect(() => {
    localStorage.setItem('cached_text', text);
    drawScene(); // Gambar ulang jika teks berubah
  }, [text]);

  // Handle upload gambar dan simpan ke localStorage
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
            
            // Simpan ke cache klien
            localStorage.setItem('cached_image', result);
            localStorage.setItem('cached_size', JSON.stringify(newSize));
          };
          img.src = result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const drawScene = (x?: number, y?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imageRef.current && imageRef.current.complete) {
      ctx.drawImage(imageRef.current, 0, 0);
    }

    if (x !== undefined && y !== undefined) {
      ctx.font = '24px sans-serif';
      ctx.fillStyle = 'blue';
      ctx.fillText(text, x, y);
    }
  };

  // Memuat gambar dari state cache saat inisialisasi
  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        imageRef.current = img;
        drawScene();
      };
    }
  }, [imageSrc]);

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    drawScene(x, y);
  };

  // Fungsi tambahan untuk menghapus cache jika dibutuhkan
  const handleClearCache = () => {
    localStorage.removeItem('cached_text');
    localStorage.removeItem('cached_image');
    localStorage.removeItem('cached_size');
    setText('Halo React!');
    setImageSrc(null);
    setCanvasSize({ width: 500, height: 400 });
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <input 
        type="text" 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="Masukkan teks"
        style={{ marginBottom: '10px', display: 'block' }}
        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1193b5] focus:border-transparent outline-none transition"
      />
      <label 
  className="w-full bg-[#1193b5] text-white text-lg font-bold py-4 rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 disabled:opacity-70 flex justify-center items-center gap-2 cursor-pointer"
>
  <span>Pilih Gambar Sertifikat</span>
  <input 
    type="file" 
    accept="image/*" 
    onChange={handleImageUpload} 
    className="hidden" // Menyembunyikan input asli bawaan browser
  />
</label>

      <button onClick={handleClearCache} style={{ marginBottom: '10px', display: 'block' }}>
        Hapus Cache
      </button>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
}



