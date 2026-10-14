/** When the "How it works" sequence pins and scrubs sideways: a wide screen, a mouse (not touch), and
 *  motion allowed. Everywhere else it is a plain vertical stack. The GSAP pin (WorkflowScroller) and the
 *  CSS layout (the `pinned:` variant in index.css) MUST use this exact condition — if the layout goes
 *  horizontal without the pin, cards 2–4 sit off-screen inside an overflow-hidden section. */
export const PIN_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
