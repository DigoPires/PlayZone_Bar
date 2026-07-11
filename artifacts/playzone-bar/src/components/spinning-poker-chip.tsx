import { cn } from '@/lib/utils';

interface SpinningPokerChipProps {
  className?: string;
  size?: number;
}

export function SpinningPokerChip({ className, size = 120 }: SpinningPokerChipProps) {
  return (
    <div
      className={cn("relative rounded-full", className)}
      style={{
        width: size,
        height: size,
        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
      }}
    >
      {/* Tudo dentro do mesmo elemento animado, pra girar junto */}
      <div
        className="absolute rounded-full"
        style={{
          inset: 0,
          animation: 'chipSpin 5s linear infinite',
        }}
      >
        {/* Aro externo: segmentos alternados preto/branco, como ficha real */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 0,
            background: `repeating-conic-gradient(
              #f5f5f5 0deg 15deg,
              #161616 15deg 30deg
            )`,
          }}
        />

        {/* Traços brancos (bumpers) por cima do aro, no padrão clássico */}
        <div
          className="absolute rounded-full"
          style={{
            inset: size * 0.03,
            background: `repeating-conic-gradient(
              #0a0a0a 0deg 30deg,
              #0a0a0a 30deg 34deg,
              transparent 34deg 38deg,
              #0a0a0a 38deg 60deg
            )`,
          }}
        />

        {/* Corpo preto da ficha */}
        <div
          className="absolute rounded-full"
          style={{
            inset: size * 0.1,
            background: 'radial-gradient(circle at 35% 30%, #2a2a2a 0%, #121212 60%, #050505 100%)',
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.08)',
          }}
        >
          {/* Anel branco fino, tipo linha decorativa das fichas de cassino */}
          <div
            className="absolute rounded-full"
            style={{
              inset: '18%',
              boxShadow: 'inset 0 0 0 2px rgba(245,245,245,0.6)',
            }}
          />

          {/* Centro */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              inset: '24%',
              background: 'radial-gradient(circle at 35% 30%, #1f1f1f 0%, #0a0a0a 70%)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.1)',
            }}
          >
            <span
              className="font-display font-bold"
              style={{ fontSize: size * 0.22, color: '#f5f5f5', letterSpacing: '-0.5px' }}
            >
              PZ
            </span>
          </div>

          {/* Brilho sutil */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 45%)',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes chipSpin {
          0%   { transform: scaleX(1); }
          25%  { transform: scaleX(0.05); }
          50%  { transform: scaleX(-1); }
          75%  { transform: scaleX(0.05); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}