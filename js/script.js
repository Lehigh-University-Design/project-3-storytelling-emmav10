// Start JS script code

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('menu-button');
  const overlay = document.getElementById('myNav');

  // If button exists, let clicks toggle the overlay and the visual state
  if (btn && overlay) {
    btn.addEventListener('click', () => {
      // If overlay is visible (width not 0), close it; otherwise open it
      const isOpen = overlay.style.width && overlay.style.width !== '0%' && overlay.style.width !== '0px' && overlay.style.width !== '';
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  // Close the overlay when any overlay link is clicked (so navigation also closes menu)
  const overlayLinks = document.querySelectorAll('.overlay-content a');
  overlayLinks.forEach(link => {
    link.addEventListener('click', () => {
      // close immediately so the overlay doesn't stay open after navigation
      closeNav();
    });
  });

  // Close the overlay when the user clicks on any main section of the page
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.addEventListener('click', () => {
      // only close if overlay is currently open
      const ov = document.getElementById('myNav');
      const isOpen = ov && ov.style.width && ov.style.width !== '0%' && ov.style.width !== '0px' && ov.style.width !== '';
      if (isOpen) closeNav();
    });
  });
});

/* Open the overlay navigation */
function openNav() {
  const overlay = document.getElementById("myNav");
  if (overlay) overlay.style.width = "100%";
  const btn = document.getElementById('menu-button');
  if (btn) btn.classList.add('open');
}

/* Close the overlay navigation */
function closeNav() {
  const overlay = document.getElementById("myNav");
  if (overlay) overlay.style.width = "0%";
  const btn = document.getElementById('menu-button');
  if (btn) btn.classList.remove('open');
}

//So i'm just going to add what Leo showeed me for now and we can figure out the rest later
document.addEventListener('DOMContentLoaded', function () {
    // ----------------------------------------------------
    // SCROLL TRIGGER MODULE (SETUP & CALCULATIONS)
    // ----------------------------------------------------

    const elementsToAnimate = [];

    const parseRange = (dataAttrValue, defaultValue = 0) => {
        const values = dataAttrValue ? 
            dataAttrValue
                .split(',')
                .map(v => parseFloat(v.trim()))
                .filter(v => !isNaN(v))
            : [];

        let start = defaultValue;
        let center = defaultValue;
        let end = defaultValue;

        const count = values.length;
        switch (count) {
            case 1:
                start = values[0];
                break;
            case 2:
                start = values[0];
                end = values[1];
                break;
            case 3:
                start = values[0];
                center = values[1];
                end = values[2];
                break;
            default:
                if (count > 3) {
                    start = values[0];
                    center = values[1];
                    end = values[2];
                }
                break;
        }
        
        return { start, center, end };
    };

    const setupTriggers = () => {
        const targets = document.querySelectorAll('.intersection-element');
        if (targets.length === 0) return;

        targets.forEach(target => {
            const x = parseRange(target.dataset.x);
            const y = parseRange(target.dataset.y);
            const scale = parseRange(target.dataset.scale, 1);
            const opacity = parseRange(target.dataset.opacity, 1);
            const animationDistance = parseRange(target.dataset.speed, 200);
            const holdDistance = parseFloat(target.dataset.hold) || 0;
            const offset = parseFloat(target.dataset.offset) || 100;

            // find containing hold-section, if any
            const holdSection = target.closest('.hold-section');

            elementsToAnimate.push({
                domElement: target,
                // startScrollPosition will be computed after we set up container heights
                startScrollPosition: 0,
                
                x, y, scale, opacity,
                animationDistance, holdDistance, offset,
                holdSection,
                totalAnimationDistance: animationDistance.start + animationDistance.end + holdDistance,
            });
        });
    };

    /**
     * Calculates the current transformation and applies styles based on scroll position.
     * @param {number} currentScroll - The current native scroll position (window.scrollY).
     */
    const handleTriggerAnimations = (currentScroll) => {

        elementsToAnimate.forEach(item => {
            
            // Calculate how far we've scrolled past the element's top position, and clamp it.
            const distanceScrolledPast = currentScroll - item.startScrollPosition - item.offset;
            const clampedScroll = Math.min(item.totalAnimationDistance, Math.max(0, distanceScrolledPast));

            // Calculate the animation progress by distance (from begin 0-1, middle 1, and end 1-2)
            let progress = 0;
            if (clampedScroll <= item.animationDistance.start) {
                // PHASE 1: ANIMATION IN (0% to 100%)
                progress = clampedScroll / item.animationDistance.start;
            } 
            else if (clampedScroll <= item.animationDistance.start + item.holdDistance) {
                // PHASE 2: HOLD (100% Locked)
                progress = 1;
            } 
            else {
                // PHASE 3: ANIMATION OUT (100% to 200%)
                const outScroll = clampedScroll - (item.animationDistance.start + item.holdDistance);
                progress = 1 + (outScroll / item.animationDistance.end);
            }

            const interpolateValue = (range) => {
                if (progress <= 1) {
                    return range.start + (range.center - range.start) * progress;
                } else {
                    return range.center + (range.end - range.center) * (progress - 1);
                }
            };

            // Calculate the styles based on progress
            const translateX = interpolateValue(item.x);
            const translateY = interpolateValue(item.y);
            const scale = interpolateValue(item.scale);
            const opacity = interpolateValue(item.opacity);

            // Apply the styles
            item.domElement.style.transform = 
                `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
            
            item.domElement.style.opacity = opacity;

            // Add class override for css animations could be a better way to do all of this.
            // element.classList.add([]);
            // element.classList.remove([]);
        });
    };

    /**
     * Main initialization function
     */
    const init = () => {
        // 1. Setup the element positions and ranges for parallax
        setupTriggers();
        // Ensure each hold-section has enough height to allow sticky + horizontal scroll space
        const holdMap = new Map();
        elementsToAnimate.forEach(item => {
            if (!item.holdSection) return;
            const holdEl = item.holdSection;
            const needed = (item.offset || 0) + (item.totalAnimationDistance || 0);
            const prev = holdMap.get(holdEl) || 0;
            holdMap.set(holdEl, Math.max(prev, needed));
        });

        // Apply min-heights (viewport + needed) so sticky can operate
        holdMap.forEach((needed, holdEl) => {
            const minH = window.innerHeight + needed + 120;
            holdEl.style.minHeight = minH + 'px';
        });

        // Recalculate elements' start positions now that layout changed
        elementsToAnimate.forEach(item => {
            item.startScrollPosition = item.domElement.getBoundingClientRect().top + window.scrollY;
        });

        // Setup horizontal track controls for each hold-section
        const horizontalTracks = [];
        holdMap.forEach((_, holdEl) => {
            const track = holdEl.querySelector('.scrolling-images');
            if (!track) return;
            const trackWidth = track.scrollWidth;
            const viewportWidth = window.innerWidth;
            const scrollStart = holdEl.getBoundingClientRect().top + window.scrollY;
            const scrollEnd = scrollStart + holdEl.offsetHeight - window.innerHeight;
            const totalScroll = Math.max(1, scrollEnd - scrollStart);
            horizontalTracks.push({ holdEl, track, trackWidth, viewportWidth, scrollStart, scrollEnd, totalScroll });
        });
        
        // 2. Set up native scroll listener to execute the animation
        let rafId = null;
        const scrollHandler = () => {
            if (!rafId) {
                rafId = requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    handleTriggerAnimations(scrollY);

                    // update horizontal tracks
                    horizontalTracks.forEach(item => {
                        // recompute trackWidth in case images loaded later
                        item.trackWidth = item.track.scrollWidth;
                        item.viewportWidth = window.innerWidth;
                        if (scrollY < item.scrollStart) return;
                        if (scrollY > item.scrollEnd) return;
                        const progress = Math.min(1, Math.max(0, (scrollY - item.scrollStart) / item.totalScroll));
                        const maxOffset = Math.max(0, item.trackWidth - item.viewportWidth + 40);
                        const translateX = -progress * maxOffset;
                        item.track.style.transform = `translate3d(${translateX}px, 0, 0)`;
                    });

                    rafId = null;
                });
            }
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
        
        // Execute immediately on load to set the correct state for current scroll position
        handleTriggerAnimations(window.scrollY);
    }
    
    init(); 
});