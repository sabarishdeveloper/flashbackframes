export const FRAME_FINISHES = ['Mat Finish', 'Glossy Finish', 'Glitter Finish'];

export const FRAME_SIZES = [
    { size: '8x6', mat: 200, glossy: 200, glitter: 300 },
    { size: '10x8', mat: 300, glossy: 300, glitter: 400 },
    { size: '12x8', mat: 400, glossy: 400, glitter: 500 },
    { size: '12x10', mat: 500, glossy: 500, glitter: 600 },
    { size: '10x15', mat: 600, glossy: 600, glitter: 700 },
    { size: '12x15', mat: 700, glossy: 700, glitter: 800 },
    { size: '12x18', mat: 750, glossy: 750, glitter: 850 },
    { size: '12x24', mat: 1200, glossy: 1200, glitter: 1300 },
    { size: '12x30', mat: 1300, glossy: 1300, glitter: 1400 },
    { size: '12x36', mat: 1500, glossy: 1500, glitter: 1600 },
    { size: '15x20', mat: 1300, glossy: 1300, glitter: 1400 },
    { size: '16x20', mat: 1400, glossy: 1400, glitter: 1500 },
    { size: '16x24', mat: 1600, glossy: 1600, glitter: 1700 },
    { size: '18x24', mat: 1800, glossy: 1800, glitter: 1900 },
    { size: '20x24', mat: 2000, glossy: 2000, glitter: 2150 },
    { size: '20x30', mat: 2500, glossy: 2500, glitter: 2700 },
    { size: '24x36', mat: 3500, glossy: 3500, glitter: 3700 },
    { size: '30x40', mat: 5000, glossy: 5000, glitter: 5500 },
    { size: '40x60', mat: 9000, glossy: 9000, glitter: 10000 }
];

export const ART_STYLES = [
    { id: 'normal', name: 'Normal (Original)', description: 'No extra design' },
    { id: 'digital_art', name: 'Digital Art', description: 'Modern digital painting style' },
    { id: 'ghibli', name: 'Ghibli Style', description: 'Studio Ghibli inspired anime look' },
    { id: 'oil_paint', name: 'Oil Painting', description: 'Classic canvas texture' },
    { id: 'watercolor', name: 'Watercolor', description: 'Soft artistic strokes' }
];

export const getPriceForSize = (size, finish) => {
    const found = FRAME_SIZES.find(s => s.size === size);
    if (!found) return 0;

    if (finish === 'Glitter Finish') {
        return found.glitter;
    }
    if (finish === 'Glossy Finish') {
        return found.glossy;
    }
    return found.mat;
};
