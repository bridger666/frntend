/**
 * LED Panel Background - SVG-based
 * Uses the existing aivory_new_animation_background.svg file
 * Properly sized to match hero section dimensions
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('LED Panel: Initializing SVG background...');
    
    const hero = document.querySelector('.hero');
    if (!hero) {
        console.error('LED Panel: Hero section not found');
        return;
    }
    
    // Create img element for SVG
    const svgImg = document.createElement('img');
    svgImg.id = 'led-bg';
    svgImg.src = 'aivory_new_animation_background.svg';
    svgImg.alt = '';
    
    // Insert at the beginning of hero section
    hero.insertBefore(svgImg, hero.firstChild);
    
    console.log('LED Panel: SVG background loaded successfully ✓');
});
