document.addEventListener('DOMContentLoaded', function() {
    // Elementos draggables
    const elements = document.querySelectorAll('.element');
    const dropzone = document.getElementById('dropzone');
    const previewContent = dropzone.querySelector('.preview-content');
    
    // Hacer elementos draggables
    elements.forEach(element => {
        element.addEventListener('dragstart', dragStart);
        element.addEventListener('dragend', dragEnd);
    });
    
    // Configurar dropzone
    dropzone.addEventListener('dragover', dragOver);
    dropzone.addEventListener('dragenter', dragEnter);
    dropzone.addEventListener('dragleave', dragLeave);
    dropzone.addEventListener('drop', drop);
    
    // Elemento actual siendo arrastrado
    let draggedElement = null;
    
    function dragStart(e) {
        draggedElement = this;
        e.dataTransfer.setData('text/plain', this.dataset.type);
        e.dataTransfer.effectAllowed = 'copy';
        
        // Efecto visual mientras se arrastra
        setTimeout(() => {
            this.style.opacity = '0.4';
        }, 0);
    }
    
    function dragEnd() {
        this.style.opacity = '1';
    }
    
    function dragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }
    
    function dragEnter(e) {
        e.preventDefault();
        dropzone.classList.add('drag-active');
    }
    
    function dragLeave() {
        dropzone.classList.remove('drag-active');
    }
    
    function drop(e) {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
        
        // Eliminar placeholder si existe
        const placeholder = previewContent.querySelector('.placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Obtener el tipo de elemento arrastrado
        const elementType = e.dataTransfer.getData('text/plain');
        
        // Crear el elemento correspondiente en el dropzone
        createElement(elementType, e.clientX, e.clientY);
    }
    
    function createElement(type, x, y) {
        const element = document.createElement('div');
        element.className = 'dropped-element';
        element.dataset.type = type;
        element.draggable = true;
        
        // Posicionar el elemento donde se soltó (relativo al dropzone)
        const dropzoneRect = dropzone.getBoundingClientRect();
        const xPos = x - dropzoneRect.left - 20; // 20px padding
        const yPos = y - dropzoneRect.top - 20;
        
        element.style.left = `${xPos}px`;
        element.style.top = `${yPos}px`;
        
        // Configurar el contenido según el tipo de elemento
        switch(type) {
            case 'heading':
                element.innerHTML = `
                    <div class="element-header">
                        <span>Título</span>
                        <button class="element-delete"><i class="fas fa-times"></i></button>
                    </div>
                    <h2 contenteditable="true">Edita este título</h2>
                `;
                break;
            case 'text':
                element.innerHTML = `
                    <div class="element-header">
                        <span>Texto</span>
                        <button class="element-delete"><i class="fas fa-times"></i></button>
                    </div>
                    <p contenteditable="true">Edita este párrafo de texto. Puedes escribir lo que necesites para tu página.</p>
                `;
                break;
            case 'image':
                element.innerHTML = `
                    <div class="element-header">
                        <span>Imagen</span>
                        <button class="element-delete"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="image-upload">
                        <i class="fas fa-image"></i>
                        <p>Haz clic para subir una imagen</p>
                        <input type="file" accept="image/*" style="display: none;">
                    </div>
                `;
                break;
            case 'services':
                element.innerHTML = `
                    <div class="element-header">
                        <span>Servicios</span>
                        <button class="element-delete"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="services-list">
                        <div class="service-item">
                            <h3 contenteditable="true">Servicio 1</h3>
                            <p contenteditable="true">Descripción del servicio</p>
                            <span contenteditable="true">$50.00</span>
                        </div>
                        <button class="add-service">+ Añadir servicio</button>
                    </div>
                `;
                break;
            case 'calendar':
                element.innerHTML = `
                    <div class="element-header">
                        <span>Agendamiento</span>
                        <button class="element-delete"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="calendar-widget">
                        <p>Widget de agendamiento de citas</p>
                    </div>
                `;
                break;
            case 'location':
                element.innerHTML = `
                    <div class="element-header">
                        <span>Ubicación</span>
                        <button class="element-delete"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="map-widget">
                        <i class="fas fa-map-marker-alt"></i>
                        <p contenteditable="true">Ingresa tu dirección aquí</p>
                    </div>
                `;
                break;
        }
        
        // Hacer el elemento arrastrable dentro del dropzone
        element.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', 'move');
            this.classList.add('dragging');
        });
        
        element.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
        
        // Permitir mover elementos dentro del dropzone
        dropzone.addEventListener('dragover', function(e) {
            e.preventDefault();
            const draggingElement = previewContent.querySelector('.dragging');
            if (draggingElement) {
                const afterElement = getDragAfterElement(previewContent, e.clientY);
                if (afterElement) {
                    previewContent.insertBefore(draggingElement, afterElement);
                } else {
                    previewContent.appendChild(draggingElement);
                }
            }
        });
        
        // Botón para eliminar elementos
        element.querySelector('.element-delete').addEventListener('click', function() {
            element.remove();
            
            // Mostrar placeholder si no hay elementos
            if (previewContent.children.length === 0) {
                showPlaceholder();
            }
        });
        
        // Eventos para subir imágenes
        if (type === 'image') {
            const uploadArea = element.querySelector('.image-upload');
            const fileInput = element.querySelector('input[type="file"]');
            
            uploadArea.addEventListener('click', function() {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        uploadArea.innerHTML = `<img src="${event.target.result}" alt="Imagen subida">`;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Evento para añadir servicios
        if (type === 'services') {
            element.querySelector('.add-service').addEventListener('click', function() {
                const serviceItem = document.createElement('div');
                serviceItem.className = 'service-item';
                serviceItem.innerHTML = `
                    <h3 contenteditable="true">Nuevo Servicio</h3>
                    <p contenteditable="true">Descripción del servicio</p>
                    <span contenteditable="true">$0.00</span>
                    <button class="remove-service"><i class="fas fa-times"></i></button>
                `;
                
                serviceItem.querySelector('.remove-service').addEventListener('click', function() {
                    serviceItem.remove();
                });
                
                this.parentNode.insertBefore(serviceItem, this);
            });
        }
        
        previewContent.appendChild(element);
    }
    
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.dropped-element:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    function showPlaceholder() {
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        placeholder.innerHTML = `
            <i class="fas fa-arrow-alt-circle-down"></i>
            <p>Arrastra elementos aquí para construir tu página</p>
        `;
        previewContent.appendChild(placeholder);
    }
    
    // Eventos para los botones de vista de dispositivo
    const deviceButtons = document.querySelectorAll('.device-options button');
    deviceButtons.forEach(button => {
        button.addEventListener('click', function() {
            deviceButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Cambiar el tamaño del preview según el dispositivo seleccionado
            const device = this.querySelector('i').className;
            if (device.includes('mobile')) {
                previewContent.style.maxWidth = '375px';
                previewContent.style.margin = '0 auto';
            } else if (device.includes('tablet')) {
                previewContent.style.maxWidth = '768px';
                previewContent.style.margin = '0 auto';
            } else {
                previewContent.style.maxWidth = '100%';
                previewContent.style.margin = '0';
            }
        });
    });
    
    // Botón Guardar Cambios
    const saveButton = document.querySelector('.btn-primary');
    saveButton.addEventListener('click', function() {
        // Aquí iría la lógica para guardar los cambios
        console.log('Guardando cambios...');
        
        // Simular guardado exitoso
        this.textContent = 'Guardado!';
        this.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            this.textContent = 'Guardar Cambios';
            this.style.backgroundColor = '#4f46e5';
        }, 2000);
    });

    // Auth Simulation
    let currentUser = {
        id: 'user123',
        plan: 'basic'
    };

    // Page Structure
    let pageStructure = JSON.parse(localStorage.getItem(`page_${currentUser.id}`)) || [];

    // Save Function
    function savePage() {
        const elements = Array.from(document.querySelectorAll('.dropped-element')).map(el => {
            return {
                type: el.dataset.type,
                content: el.innerHTML,
                position: {
                    x: el.style.left,
                    y: el.style.top
                }
            };
        });
  
        // Simulate API call
        fetch('/api/save-page', {
            method: 'POST',
            body: JSON.stringify({ userId: currentUser.id, elements })
        })
        .then(() => {
            localStorage.setItem(`page_${currentUser.id}`, JSON.stringify(elements));
            showNotification('Página guardada correctamente');
        });
    }

    // Load Function
    function loadPage() {
        if (pageStructure.length > 0) {
            document.querySelector('.placeholder').remove();
            pageStructure.forEach(item => {
                const element = document.createElement('div');
                element.className = 'dropped-element';
                element.dataset.type = item.type;
                element.style.left = item.position.x;
                element.style.top = item.position.y;
                element.innerHTML = item.content;
                document.querySelector('.preview-content').appendChild(element);
            });
        }
    }

        // Init
    document.addEventListener('DOMContentLoaded', () => {
        loadPage();
  
        // Save Button
        document.querySelector('.btn-primary').addEventListener('click', savePage);
  
        // Image Upload Handler
        document.body.addEventListener('change', e => {
            if (e.target.matches('input[type="file"]')) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = event => {
                        e.target.closest('.image-upload').innerHTML = `
                            <img src="${event.target.result}" alt="Uploaded">
                             <button class="replace-image">Cambiar</button>
                        `;
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    });
});