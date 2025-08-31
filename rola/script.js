import { SidebarManager } from './js/sidebar.js';
import { AnimationManager } from './js/animations.js';
import { InteractionManager } from './js/interactions.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize modules
    const sidebar = new SidebarManager();
    const animations = new AnimationManager();
    const interactions = new InteractionManager();
    
    // Initialize all components
    sidebar.init();
    animations.init();
    interactions.init();
});