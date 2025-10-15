export class Modal {
  constructor() {
    this.modal = document.createElement('div');
    this.setupModal();
  }

  setupModal() {
    this.modal.style.display = 'none';
    this.modal.style.position = 'fixed';
    this.modal.style.top = '0';
    this.modal.style.left = '0';
    this.modal.style.width = '100%';
    this.modal.style.height = '100%';
    this.modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
    this.modal.style.zIndex = '1000';
    this.modal.style.justifyContent = 'center';
    this.modal.style.alignItems = 'center';
    this.modal.style.flexDirection = 'column';
    this.modal.style.color = 'white';
    this.modal.style.cursor = 'zoom-out';
    this.modal.style.overflow = 'auto';
    
    this.modalImg = document.createElement('img');
    this.modalImg.style.maxWidth = '90%';
    this.modalImg.style.maxHeight = '80vh';
    this.modalImg.style.objectFit = 'contain';
    
    this.modalTitle = document.createElement('h2');
    this.modalTitle.style.margin = '20px 0';
    this.modalTitle.style.textAlign = 'center';
    
    this.modalDesc = document.createElement('p');
    this.modalDesc.style.maxWidth = '800px';
    this.modalDesc.style.textAlign = 'center';
    this.modalDesc.style.padding = '0 20px';
    
    this.modal.appendChild(this.modalImg);
    this.modal.appendChild(this.modalTitle);
    this.modal.appendChild(this.modalDesc);
    document.body.appendChild(this.modal);
  }

  show(artwork) {
    this.modalImg.src = artwork.imgSrc;
    this.modalTitle.textContent = artwork.titulo;
    this.modalDesc.textContent = artwork.descripcion;
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this.modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  onClick(callback) {
    this.modal.addEventListener('click', callback);
  }
}
