// Modal functionality
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('welcomeModal');
  const closeButton = document.getElementById('closeModal');
  const infoIcon = document.getElementById('infoIcon');
  
  // Close modal when clicking the button
  closeButton.addEventListener('click', function() {
    modal.classList.add('hidden');
  });
  
  // Toggle modal when clicking the info icon
  infoIcon.addEventListener('click', function() {
    modal.classList.toggle('hidden');
  });
  
  // Close modal when clicking outside the modal content
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      modal.classList.add('hidden');
    }
  });
});
