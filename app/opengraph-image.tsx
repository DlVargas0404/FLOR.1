import { ImageResponse } from 'next/og';

export const alt = 'STOP BURGER ERIK | Hamburguesas y Comidas Rápidas en Cúcuta';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg,#D90000,#8B0000)',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ width: 200, height: 70, background: '#FFC400', borderRadius: '100px 100px 20px 20px' }} />
          <div style={{ width: 230, height: 18, background: '#3fa535', borderRadius: 9, marginTop: 6 }} />
          <div style={{ width: 220, height: 28, background: '#5a2a14', borderRadius: 14, marginTop: 6 }} />
          <div style={{ width: 200, height: 40, background: '#FFC400', borderRadius: '10px 10px 60px 60px', marginTop: 6 }} />
        </div>
        <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: 4 }}>STOP BURGER ERIK</div>
        <div style={{ fontSize: 40, color: '#FFC400', marginTop: 12 }}>Hamburguesas y comidas rápidas en Cúcuta</div>
      </div>
    ),
    size,
  );
}
