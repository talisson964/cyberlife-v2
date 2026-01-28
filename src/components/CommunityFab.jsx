import React, { useState } from 'react';

// Animação de entrada para os ícones
const style = `
@keyframes community-fab-in {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.5) rotate(-20deg);
    filter: blur(8px);
  }
  60% {
    opacity: 1;
    transform: translateY(-8px) scale(1.08) rotate(6deg);
    filter: blur(0.5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
    filter: blur(0);
  }
}
`;
if (typeof document !== 'undefined' && !document.getElementById('community-fab-anim')) {
  const s = document.createElement('style');
  s.id = 'community-fab-anim';
  s.innerHTML = style;
  document.head.appendChild(s);
}
import { Instagram } from 'lucide-react';
import CommunityMainIcon from './CommunityMainIcon';
import WhatsappIcon from './WhatsappIcon';
import DiscordIcon from './DiscordIcon';

const icons = [
  {
    name: 'whatsapp',
    color: '#25D366',
    url: 'https://wa.me/5517992212246',
    Icon: WhatsappIcon,
  },
  {
    name: 'instagram',
    color: '#E1306C',
    url: 'https://www.instagram.com/cyberlife_technology/',
    Icon: Instagram,
  },
  {
    name: 'discord',
    color: '#5865F2',
    url: 'https://discord.gg/DDVCkA3SW7',
    Icon: DiscordIcon,
  },
];

export default function CommunityFab() {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        position: 'fixed',
        right: window.innerWidth < 600 ? 16 : 64,
        bottom: 24,
        zIndex: 12000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      <div style={{ position: 'relative', pointerEvents: 'auto' }}>
        {open && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginBottom: 12,
            alignItems: 'flex-end',
            transition: 'all 0.3s',
          }}>
            {icons.map(({ name, color, url, Icon }, i) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#181a22',
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2.5px solid ${color}`,
                  pointerEvents: 'auto',
                  opacity: open ? 1 : 0,
                  animation: open
                    ? `community-fab-in 0.48s cubic-bezier(.68,-0.55,.27,1.55) forwards ${0.09 * i + 0.09}s`
                    : 'none',
                  filter: open ? 'none' : 'blur(6px)',
                  transition: !open ?
                    `opacity 0.28s, filter 0.28s, transform 0.28s` : undefined,
                }}
                aria-label={name}
              >
                <Icon color={color} size={28} />
              </a>
            ))}
          </div>
        )}
        <button
          aria-label="Abrir comunidade"
          onClick={() => setOpen((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            borderRadius: '50%',
            width: 62,
            height: 62,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Removido boxShadow e brilho
            cursor: 'pointer',
            zIndex: 12001,
            pointerEvents: 'auto',
            transition: 'outline 0.25s',
            outline: open ? '2.5px solid #e322bc' : 'none',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              transition: 'transform 0.5s cubic-bezier(.68,-0.55,.27,1.55)',
              transform: open ? 'rotate(315deg) scale(1.13)' : 'rotate(0deg) scale(1)',
            }}
          >
            <CommunityMainIcon size={44} />
          </span>
        </button>
      </div>
    </div>
  );
}
