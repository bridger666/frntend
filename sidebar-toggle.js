/**
 * Sidebar Toggle Functionality
 * Handles collapsible sidebar state management
 */

document.addEventListener('DOMContentLoaded', () => {
    const dashboardLayout = document.querySelector('.dashboard-layout');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    
    if (!dashboardLayout) return;
    
    // Load saved state from localStorage
    const isExpanded = localStorage.getItem('aivory-sidebar-expanded') === 'true';
    if (isExpanded) {
        dashboardLayout.classList.add('sidebar-expanded');
    }
    
    // Toggle on button click
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            dashboardLayout.classList.toggle('sidebar-expanded');
            const expanded = dashboardLayout.classList.contains('sidebar-expanded');
            localStorage.setItem('aivory-sidebar-expanded', expanded);
        });
    }
    
    // Add tooltips to sidebar items in collapsed state
    const sidebarItems = document.querySelectorAll('.sidebar-nav-item');
    sidebarItems.forEach(item => {
        const text = item.textContent.trim();
        if (text && !item.hasAttribute('data-tooltip')) {
            item.setAttribute('data-tooltip', text);
        }
    });
});
