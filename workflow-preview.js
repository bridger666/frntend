/**
 * Vanilla JS Workflow Preview
 * Lightweight workflow visualization for Aivory AI Console
 * No React dependencies - works with existing vanilla JS setup
 */

class WorkflowPreview {
    constructor(blueprint) {
        this.blueprint = blueprint;
        this.modal = null;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.offset = { x: 0, y: 0 };
        this.scale = 1;
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    show() {
        if (!this.validateBlueprint()) {
            this.showError('Invalid workflow format: missing nodes or edges');
            return;
        }

        this.modal = this.createModal();
        document.body.appendChild(this.modal);
        
        // Animate in
        requestAnimationFrame(() => {
            this.modal.style.opacity = '1';
        });
    }

    close() {
        if (this.modal) {
            this.modal.style.opacity = '0';
            setTimeout(() => {
                this.modal.remove();
                this.modal = null;
            }, 200);
        }
    }

    // ========================================================================
    // VALIDATION
    // ========================================================================

    validateBlueprint() {
        return this.blueprint && 
               Array.isArray(this.blueprint.nodes) && 
               this.blueprint.nodes.length > 0;
    }

    // ========================================================================
    // MODAL CREATION
    // ========================================================================

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'workflow-preview-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 2rem;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;

        modal.onclick = (e) => {
            if (e.target === modal) this.close();
        };

        const container = this.createContainer();
        modal.appendChild(container);

        return modal;
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'workflow-preview-container';
        container.style.cssText = `
            background: #1a0b2e;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 100%;
            max-width: 1200px;
            height: 85vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        `;

        container.onclick = (e) => e.stopPropagation();

        // Header
        container.appendChild(this.createHeader());

        // Canvas area
        container.appendChild(this.createCanvas());

        // Controls
        container.appendChild(this.createControls());

        return container;
    }

    createHeader() {
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 1.5rem 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(0, 0, 0, 0.2);
        `;

        const nodeCount = this.blueprint.nodes.length;
        const edgeCount = (this.blueprint.edges || []).length;

        header.innerHTML = `
            <div>
                <h2 style="margin: 0; color: #ffffff; font-size: 1.5rem; font-weight: 300;">
                    Workflow Preview
                </h2>
                <p style="margin: 0.25rem 0 0 0; color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
                    ${nodeCount} node${nodeCount !== 1 ? 's' : ''} • ${edgeCount} connection${edgeCount !== 1 ? 's' : ''}
                </p>
            </div>
            <button class="close-btn" style="
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                color: #ffffff;
                padding: 0.5rem 1rem;
                cursor: pointer;
                font-size: 0.875rem;
                font-family: 'Inter Tight', sans-serif;
                transition: all 0.2s;
            ">Close</button>
        `;

        const closeBtn = header.querySelector('.close-btn');
        closeBtn.onmouseover = () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            closeBtn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.background = 'transparent';
            closeBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        };
        closeBtn.onclick = () => this.close();

        return header;
    }

    createCanvas() {
        const canvasWrapper = document.createElement('div');
        canvasWrapper.style.cssText = `
            flex: 1;
            position: relative;
            background: #0f0820;
            overflow: hidden;
        `;

        const canvas = document.createElement('div');
        canvas.className = 'workflow-canvas';
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            position: relative;
            cursor: grab;
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 20px 20px;
        `;

        // Add pan functionality
        canvas.onmousedown = (e) => this.startDrag(e, canvas);
        canvas.onmousemove = (e) => this.drag(e, canvas);
        canvas.onmouseup = () => this.endDrag(canvas);
        canvas.onmouseleave = () => this.endDrag(canvas);

        // Render workflow
        this.renderWorkflow(canvas);

        canvasWrapper.appendChild(canvas);
        return canvasWrapper;
    }

    createControls() {
        const controls = document.createElement('div');
        controls.style.cssText = `
            padding: 1rem 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            gap: 1rem;
            justify-content: center;
            background: rgba(0, 0, 0, 0.2);
        `;

        const buttons = [
            { label: '🔍 Zoom In', action: () => this.zoom(1.2) },
            { label: '🔍 Zoom Out', action: () => this.zoom(0.8) },
            { label: '↺ Reset View', action: () => this.resetView() },
        ];

        buttons.forEach(({ label, action }) => {
            const btn = document.createElement('button');
            btn.textContent = label;
            btn.style.cssText = `
                padding: 0.5rem 1rem;
                background: rgba(7, 209, 151, 0.1);
                border: 1px solid rgba(7, 209, 151, 0.3);
                border-radius: 8px;
                color: #07d197;
                cursor: pointer;
                font-size: 0.875rem;
                font-family: 'Inter Tight', sans-serif;
                font-weight: 500;
                transition: all 0.2s;
            `;
            btn.onmouseover = () => {
                btn.style.background = 'rgba(7, 209, 151, 0.2)';
                btn.style.borderColor = 'rgba(7, 209, 151, 0.5)';
            };
            btn.onmouseout = () => {
                btn.style.background = 'rgba(7, 209, 151, 0.1)';
                btn.style.borderColor = 'rgba(7, 209, 151, 0.3)';
            };
            btn.onclick = action;
            controls.appendChild(btn);
        });

        return controls;
    }

    // ========================================================================
    // WORKFLOW RENDERING
    // ========================================================================

    renderWorkflow(canvas) {
        const nodes = this.blueprint.nodes;
        const edges = this.blueprint.edges || [];

        // Calculate layout
        const layout = this.calculateLayout(nodes, edges);

        // Render edges first (so they appear behind nodes)
        edges.forEach(edge => {
            const sourceNode = layout.find(n => n.id === (edge.source || edge.from));
            const targetNode = layout.find(n => n.id === (edge.target || edge.to));
            
            if (sourceNode && targetNode) {
                this.renderEdge(canvas, sourceNode, targetNode, edge);
            }
        });

        // Render nodes
        layout.forEach(node => {
            this.renderNode(canvas, node);
        });
    }

    calculateLayout(nodes, edges) {
        // Simple vertical layout with auto-spacing
        const nodeHeight = 80;
        const nodeWidth = 200;
        const verticalGap = 100;
        const horizontalGap = 250;

        // Group nodes by level (simple topological sort)
        const levels = this.calculateLevels(nodes, edges);
        const layout = [];

        levels.forEach((levelNodes, levelIndex) => {
            levelNodes.forEach((node, nodeIndex) => {
                const offsetX = (levelNodes.length - 1) * horizontalGap / 2;
                layout.push({
                    ...node,
                    x: 400 + (nodeIndex * horizontalGap) - offsetX,
                    y: 100 + (levelIndex * (nodeHeight + verticalGap)),
                    width: nodeWidth,
                    height: nodeHeight,
                });
            });
        });

        return layout;
    }

    calculateLevels(nodes, edges) {
        const levels = [];
        const visited = new Set();
        const nodeMap = new Map(nodes.map(n => [n.id, n]));

        // Find root nodes (no incoming edges)
        const hasIncoming = new Set(edges.map(e => e.target || e.to));
        const roots = nodes.filter(n => !hasIncoming.has(n.id));

        if (roots.length === 0 && nodes.length > 0) {
            // No clear roots, use first node
            levels.push([nodes[0]]);
            visited.add(nodes[0].id);
        } else {
            levels.push(roots);
            roots.forEach(n => visited.add(n.id));
        }

        // Build subsequent levels
        let currentLevel = 0;
        while (visited.size < nodes.length && currentLevel < 10) {
            const nextLevel = [];
            const currentNodes = levels[currentLevel] || [];

            currentNodes.forEach(node => {
                edges.forEach(edge => {
                    if ((edge.source || edge.from) === node.id) {
                        const targetId = edge.target || edge.to;
                        if (!visited.has(targetId) && nodeMap.has(targetId)) {
                            nextLevel.push(nodeMap.get(targetId));
                            visited.add(targetId);
                        }
                    }
                });
            });

            if (nextLevel.length > 0) {
                levels.push(nextLevel);
            }
            currentLevel++;
        }

        // Add any remaining unvisited nodes
        const remaining = nodes.filter(n => !visited.has(n.id));
        if (remaining.length > 0) {
            levels.push(remaining);
        }

        return levels;
    }

    renderNode(canvas, node) {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'workflow-node';
        nodeEl.style.cssText = `
            position: absolute;
            left: ${node.x}px;
            top: ${node.y}px;
            width: ${node.width}px;
            min-height: ${node.height}px;
            padding: 1rem;
            background: ${this.getNodeStyle(node.type).background};
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            color: ${this.getNodeStyle(node.type).color};
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transform-origin: center;
            transition: transform 0.2s;
        `;

        nodeEl.onmouseover = () => {
            nodeEl.style.transform = 'scale(1.05)';
            nodeEl.style.zIndex = '100';
        };
        nodeEl.onmouseout = () => {
            nodeEl.style.transform = 'scale(1)';
            nodeEl.style.zIndex = '1';
        };

        const icon = this.getNodeStyle(node.type).icon;
        const label = node.label || node.name || 'Unnamed';
        const description = node.description || '';

        nodeEl.innerHTML = `
            <div style="font-size: 1.5rem;">${icon}</div>
            <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 0.25rem;">${label}</div>
                ${description ? `<div style="font-size: 0.75rem; opacity: 0.8;">${description}</div>` : ''}
            </div>
        `;

        canvas.appendChild(nodeEl);
    }

    renderEdge(canvas, sourceNode, targetNode, edge) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        `;

        const startX = sourceNode.x + sourceNode.width / 2;
        const startY = sourceNode.y + sourceNode.height;
        const endX = targetNode.x + targetNode.width / 2;
        const endY = targetNode.y;

        // Create curved path
        const midY = (startY + endY) / 2;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${startX} ${startY} Q ${startX} ${midY}, ${(startX + endX) / 2} ${midY} T ${endX} ${endY}`);
        path.setAttribute('stroke', 'rgba(7, 209, 151, 0.6)');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');

        // Add arrow
        const arrowSize = 8;
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        arrow.setAttribute('points', `${endX},${endY} ${endX - arrowSize},${endY - arrowSize * 1.5} ${endX + arrowSize},${endY - arrowSize * 1.5}`);
        arrow.setAttribute('fill', 'rgba(7, 209, 151, 0.8)');

        svg.appendChild(path);
        svg.appendChild(arrow);

        // Add label if exists
        if (edge.label) {
            const labelX = (startX + endX) / 2;
            const labelY = midY;
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', labelX);
            text.setAttribute('y', labelY);
            text.setAttribute('fill', '#07d197');
            text.setAttribute('font-size', '12');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = edge.label;
            svg.appendChild(text);
        }

        canvas.appendChild(svg);
    }

    getNodeStyle(type) {
        const styles = {
            webhook: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🔗', color: '#ffffff' },
            ai_agent: { background: 'linear-gradient(135deg, #07d197 0%, #06b380 100%)', icon: '🤖', color: '#1a0b2e' },
            crm_push: { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: '📊', color: '#ffffff' },
            email: { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: '📧', color: '#1a0b2e' },
            database: { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: '💾', color: '#1a0b2e' },
        };

        const normalizedType = (type || '').toLowerCase().replace(/\s+/g, '_');
        return styles[normalizedType] || { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '⚙️', color: '#ffffff' };
    }

    // ========================================================================
    // INTERACTION HANDLERS
    // ========================================================================

    startDrag(e, canvas) {
        this.isDragging = true;
        this.dragStart = { x: e.clientX - this.offset.x, y: e.clientY - this.offset.y };
        canvas.style.cursor = 'grabbing';
    }

    drag(e, canvas) {
        if (!this.isDragging) return;
        
        this.offset.x = e.clientX - this.dragStart.x;
        this.offset.y = e.clientY - this.dragStart.y;
        
        canvas.style.transform = `translate(${this.offset.x}px, ${this.offset.y}px) scale(${this.scale})`;
    }

    endDrag(canvas) {
        this.isDragging = false;
        canvas.style.cursor = 'grab';
    }

    zoom(factor) {
        this.scale *= factor;
        this.scale = Math.max(0.5, Math.min(2, this.scale)); // Limit zoom range
        
        const canvas = this.modal.querySelector('.workflow-canvas');
        if (canvas) {
            canvas.style.transform = `translate(${this.offset.x}px, ${this.offset.y}px) scale(${this.scale})`;
        }
    }

    resetView() {
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        
        const canvas = this.modal.querySelector('.workflow-canvas');
        if (canvas) {
            canvas.style.transform = 'translate(0, 0) scale(1)';
        }
    }

    // ========================================================================
    // ERROR HANDLING
    // ========================================================================

    showError(message) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a0b2e;
            border: 1px solid rgba(255, 107, 107, 0.5);
            border-radius: 12px;
            padding: 2rem;
            z-index: 10001;
            text-align: center;
            max-width: 400px;
        `;

        modal.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
            <div style="color: #ff6b6b; font-weight: 600; margin-bottom: 0.5rem;">Error</div>
            <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 1.5rem;">${message}</div>
            <button style="
                padding: 0.5rem 1.5rem;
                background: #ff6b6b;
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                font-weight: 600;
            ">OK</button>
        `;

        modal.querySelector('button').onclick = () => modal.remove();
        document.body.appendChild(modal);

        setTimeout(() => modal.remove(), 5000);
    }
}

// ============================================================================
// GLOBAL API
// ============================================================================

window.showWorkflowPreview = function(blueprint) {
    const preview = new WorkflowPreview(blueprint);
    preview.show();
};
