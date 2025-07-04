// Import planet array from main.js
import { planets } from './garima.js';

// Get control panel div
const controls = document.getElementById('controls');

// Create a slider for each planet
planets.forEach((p, i) => {
  const label = document.createElement('label');
  label.innerText = `${p.name}: `;

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0;
  slider.max = 3;
  slider.step = 0.1;
  slider.value = 1; // default

  // Change speedFactor on slider move
  slider.oninput = () => {
    planets[i].speedFactor = +slider.value;
  };

  label.appendChild(slider);
  controls.appendChild(label);
  controls.appendChild(document.createElement('br'));
});
