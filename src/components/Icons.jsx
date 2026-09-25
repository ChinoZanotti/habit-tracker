const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const ChevronLeft = (p) => (<svg {...base} {...p}><path d="M15 5l-7 7 7 7" /></svg>);
export const ChevronRight = (p) => (<svg {...base} {...p}><path d="M9 5l7 7-7 7" /></svg>);
export const Plus = (p) => (<svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const Close = (p) => (<svg {...base} width={16} height={16} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const Check = (p) => (<svg {...base} strokeWidth={2} {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
export const Ring = (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="7" /></svg>);
