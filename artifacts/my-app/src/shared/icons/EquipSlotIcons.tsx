import React from 'react';
import type { EquipSlot } from '@/data/types';

interface SlotIconProps {
  className?: string;
  size?: number;
}

export function EquipSlotHelmIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <path d="M12 2C7.5 2 4 5.5 4 10v4c0 3 2.5 5.5 6 6h4c3.5-.5 6-3 6-6v-4c0-4.5-3.5-8-8-8z" />
      <path d="M4 11h16" />
      <path d="M9 11v4" />
      <path d="M12 11v5" />
      <path d="M15 11v4" />
      <path d="M12 2v3.5" />
    </svg>
  );
}

export function EquipSlotChestIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <path d="M8 3h8l3 3.5-1.5 5.5-2 1v8H8.5v-8l-2-1L5 6.5 8 3z" />
      <path d="M9 3c0 2 1.3 3.5 3 3.5s3-1.5 3-3.5" />
      <path d="M12 6.5V14" />
      <path d="M8 14h8" />
      <path d="M8.5 18h7" />
    </svg>
  );
}

export function EquipSlotLegsIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <path d="M6 3h12l-1 5h-2.5l-.5-1.5h-4L9.5 8H7L6 3z" />
      <path d="M6.5 8L5.5 21h4.5l1-7 1 7H17l-1-13" />
      <path d="M6.5 14h3.5" />
      <path d="M14 14h3.5" />
    </svg>
  );
}

export function EquipSlotBootsIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <path d="M5 4h4v7l2.5 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-4l2-2.5V4z" />
      <path d="M15 4h4v7l2.5 2v4c0 1.1-.9 2-2 2h-5.5c-1.1 0-2-.9-2-2v-4l2-2.5V4z" />
      <path d="M2 17h9.5" />
      <path d="M12.5 17H22" />
    </svg>
  );
}

export function EquipSlotGlovesIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <path d="M6 13V6.5a1.8 1.8 0 0 1 3.5 0V12" />
      <path d="M9.5 6.5a1.8 1.8 0 0 1 3.5 0V12" />
      <path d="M13 8a1.8 1.8 0 0 1 3.5 0v4.5c0 3-1.5 5.5-4 6.5H8a4 4 0 0 1-4-4v-3c0-1.2.8-2.2 2-2.5L6 11" />
      <path d="M4 17h10" />
    </svg>
  );
}

export function EquipSlotWeaponIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <path d="M12 2l2 2.5v9.5l-2 1.5-2-1.5V4.5L12 2z" />
      <path d="M7 14h10" />
      <path d="M12 14v6.5" />
      <circle cx="12" cy="21" r="1.2" fill="currentColor" />
      <path d="M12 4.5v8" />
    </svg>
  );
}

export function EquipSlotShieldIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <path d="M12 3L4.5 6v6c0 5.5 3.5 9.5 7.5 11 4-1.5 7.5-5.5 7.5-11V6L12 3z" />
      <path d="M12 3v17" />
      <path d="M6 10h12" />
    </svg>
  );
}

export function EquipSlotCapeIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <path d="M7 4h10l2.5 4-2 13-5.5-3-5.5 3-2-13L7 4z" />
      <path d="M9 4c0 1.5 1.3 2.5 3 2.5s3-1 3-2.5" />
      <path d="M12 6.5V18" />
      <path d="M8.5 11l3.5 3 3.5-3" />
    </svg>
  );
}

export function EquipSlotBeltIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <rect x="2" y="8" width="20" height="8" rx="2" />
      <rect x="8.5" y="6.5" width="7" height="11" rx="2" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      <line x1="4.5" y1="12" x2="6.5" y2="12" />
      <line x1="17.5" y1="12" x2="19.5" y2="12" />
    </svg>
  );
}

export function EquipSlotAmuletIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <path d="M6 3c0 5 2.5 9 6 9s6-4 6-9" />
      <path d="M12 12v3" />
      <polygon points="12,15 15,18 12,22 9,18" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

export function EquipSlotRingIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <circle cx="12" cy="14" r="6.5" />
      <polygon points="12,3 15,6 12,8.5 9,6" />
      <circle cx="12" cy="6" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function EquipSlotBraceletIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <ellipse cx="12" cy="12" rx="8" ry="6.5" />
      <ellipse cx="12" cy="12" rx="4.5" ry="3.5" />
      <path d="M12 5.5v3" />
      <path d="M12 15.5v3" />
      <path d="M4 12h3.5" />
      <path d="M16.5 12H20" />
    </svg>
  );
}

export function EquipSlotQuiverIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <path d="M8 9l8 13h4L12 9H8z" />
      <path d="M8 9L6 5l3-2 3 3" />
      <path d="M12 9l2-4 3 2-2 3" />
      <path d="M6.5 6.5l8 13" />
    </svg>
  );
}

export function EquipSlotPassiveIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function EquipSlotLockedIcon({ className = 'w-5 h-5', size }: SlotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function EquipSlotSilhouette({
  slot,
  className = 'hero-sq-slot__vector-icon',
}: {
  slot: EquipSlot | 'locked';
  className?: string;
}) {
  switch (slot) {
    case 'helm':
      return <EquipSlotHelmIcon className={className} />;
    case 'platebody':
      return <EquipSlotChestIcon className={className} />;
    case 'platelegs':
      return <EquipSlotLegsIcon className={className} />;
    case 'boots':
      return <EquipSlotBootsIcon className={className} />;
    case 'gloves':
      return <EquipSlotGlovesIcon className={className} />;
    case 'weapon':
      return <EquipSlotWeaponIcon className={className} />;
    case 'shield':
      return <EquipSlotShieldIcon className={className} />;
    case 'cape':
      return <EquipSlotCapeIcon className={className} />;
    case 'belt':
      return <EquipSlotBeltIcon className={className} />;
    case 'amulet':
      return <EquipSlotAmuletIcon className={className} />;
    case 'ring':
    case 'ring2':
      return <EquipSlotRingIcon className={className} />;
    case 'bracelet':
    case 'bracelet2':
      return <EquipSlotBraceletIcon className={className} />;
    case 'quiver':
      return <EquipSlotQuiverIcon className={className} />;
    case 'passive':
      return <EquipSlotPassiveIcon className={className} />;
    case 'locked':
    default:
      return <EquipSlotLockedIcon className={className} />;
  }
}
