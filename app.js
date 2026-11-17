
// MOBILE NAVIGATION

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');

  menuButton.setAttribute(
    'aria-expanded',
    String(isOpen)
  );
});

// Close mobile menu when a link is clicked

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');

    menuButton.setAttribute(
      'aria-expanded',
      'false'
    );
  });
});

// AUTOMATIC COPYRIGHT YEAR

document.getElementById('year').textContent =
  new Date().getFullYear();


// BOOKING FORM

const bookingForm = document.getElementById('bookingForm');
const formMessage = document.getElementById('formMessage');

bookingForm.addEventListener('submit', async (event) => {

  event.preventDefault();

  formMessage.className = 'form-message';
  formMessage.textContent = 'Sending your request...';

  const formData = new FormData(bookingForm);

  const booking = Object.fromEntries(
    formData.entries()
  );

  try {

    const response = await fetch('/api/bookings', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(booking)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || 'Could not send your request.'
      );
    }

    formMessage.className =
      'form-message success';

    formMessage.textContent =
      `${result.message} Reference: ${result.bookingId}`;

    bookingForm.reset();

  } catch (error) {

    formMessage.className =
      'form-message error';

    formMessage.textContent =
      error.message || 'Something went wrong. Please try again.';

  }

});
