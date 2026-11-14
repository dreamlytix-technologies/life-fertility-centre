import { ImageResponse } from 'next/og';

export const alt = 'Life Fertility Centre, Malda — Dr. Debchandan Roy, gynaecologist and fertility specialist';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Same palette as the site (see DESIGN.md). No photography: drawn rings only.
const C = { cream: '#FFFBF8', blush: '#F6E3E5', plum: '#4A2545', deep: '#2E1530', gold: '#C9A25E', goldPale: '#EDD9AE', rose: '#E7C3CB' };

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: C.cream, fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 70px', width: 720 }}>
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 6, color: '#7A5A22', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
            Malda · West Bengal
          </div>
          <div style={{ display: 'flex', fontSize: 76, lineHeight: 1.02, color: C.deep, marginTop: 26 }}>Life Fertility Centre</div>
          <div style={{ display: 'flex', width: 120, height: 2, background: C.gold, marginTop: 30 }} />
          <div style={{ display: 'flex', fontSize: 38, color: C.plum, marginTop: 30 }}>Dr. Debchandan Roy</div>
          <div style={{ display: 'flex', fontSize: 25, color: '#4A3947', marginTop: 14, fontFamily: 'sans-serif' }}>
            Gynaecology · Fertility &amp; IVF · Pregnancy care
          </div>
        </div>
        <div style={{ display: 'flex', position: 'relative', width: 480, height: 630, background: C.deep, borderRadius: '240px 240px 0 0', marginTop: 40 }}>
          {[170, 130, 90].map((r, i) => (
            <div
              key={r}
              style={{
                position: 'absolute',
                left: 240 - r,
                top: 260 - r,
                width: r * 2,
                height: r * 2,
                borderRadius: r,
                border: `2px solid ${i % 2 ? C.rose : C.goldPale}`,
                opacity: 0.35 + i * 0.2,
                display: 'flex',
              }}
            />
          ))}
          <div style={{ position: 'absolute', left: 222, top: 242, width: 36, height: 36, borderRadius: 18, background: C.gold, display: 'flex' }} />
        </div>
      </div>
    ),
    size,
  );
}
