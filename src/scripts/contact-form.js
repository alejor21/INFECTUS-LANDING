// Sin servidor propio: el formulario valida en el navegador y abre el mensaje
// ya redactado en el correo o en WhatsApp del visitante. Ningún dato sale de
// la página hasta que la persona lo envía desde su propia aplicación.
const EMAIL = 'infectuspasto@gmail.com';
const WHATSAPP = '573216456132';

export function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const status = form.querySelector('#form-status');

  form.addEventListener('submit', event => {
    event.preventDefault();
    const invalid = [...form.elements].find(field => field.willValidate && !field.checkValidity());
    if (invalid) {
      invalid.setAttribute('aria-invalid', 'true');
      invalid.focus();
      if (status) status.textContent = 'Revisa los campos marcados: nombre y un correo válido son obligatorios.';
      return;
    }
    form.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));

    const data = new FormData(form);
    const value = key => String(data.get(key) || '').trim().slice(0, 1500);
    const lines = [
      `Nombre: ${value('nombre')}`,
      value('institucion') && `Institución: ${value('institucion')}`,
      `Correo: ${value('email')}`,
      value('servicio') && `Servicio de interés: ${value('servicio')}`,
      value('mensaje') && `\n${value('mensaje')}`,
    ].filter(Boolean).join('\n');
    const subject = `Solicitud desde la web${value('servicio') ? ` · ${value('servicio')}` : ''}`;

    const channel = event.submitter?.dataset.channel;
    const href = channel === 'whatsapp'
      ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`${subject}\n\n${lines}`)}`
      : `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
    if (channel === 'whatsapp') window.open(href, '_blank', 'noopener');
    else window.location.href = href;
    if (status) status.textContent = 'Listo: revisa la ventana que se abrió y envía el mensaje.';
  });
}
