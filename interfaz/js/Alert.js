function showCustomAlert(options) {
  // options: { type, title, message, onConfirm, onCancel }
  const overlay = document.getElementById("customAlert");
  const alertBox = document.getElementById("customAlertBox");
  const titleEl = document.getElementById("customAlertTitle");
  const messageEl = document.getElementById("customAlertMessage");
  const buttonsContainer = document.getElementById("customAlertButtons");


  // Detener que los clics en el cuadro se propaguen al overlay
  alertBox.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Si quieres que hacer clic fuera del cuadro cierre la alerta, agrega esto:
  overlay.addEventListener("click", function () {
    overlay.style.display = "none";
  });

  // Limpiar botones anteriores
  buttonsContainer.innerHTML = "";

  // Establecer título y mensaje
  titleEl.textContent = options.title || "Alerta";
  messageEl.textContent = options.message || "";

  if (options.type === "confirm") {
    // Para confirmaciones, creamos dos botones: "Sí" y "No"
    const yesBtn = document.createElement("button");
    yesBtn.textContent = "Sí";
    yesBtn.classList.add("btn-confirm");
    yesBtn.addEventListener("click", () => {
      overlay.style.display = "none";
      if (typeof options.onConfirm === "function") {
        options.onConfirm();
      }
    });

    const noBtn = document.createElement("button");
    noBtn.textContent = "No";
    noBtn.classList.add("btn-cancel");
    noBtn.addEventListener("click", () => {
      overlay.style.display = "none";
      if (typeof options.onCancel === "function") {
        options.onCancel();
      }
    });

    buttonsContainer.appendChild(yesBtn);
    buttonsContainer.appendChild(noBtn);

  } else if (options.type === "error") {
    // Para errores, un botón "Ok" con estilo de peligro
    const okBtn = document.createElement("button");
    okBtn.textContent = "Ok";
    okBtn.classList.add("btn-danger");
    okBtn.addEventListener("click", () => {
      overlay.style.display = "none";
    });
    buttonsContainer.appendChild(okBtn);
  } else if (options.type === "success") {
    // Para éxito, un botón "Ok" con estilo de éxito
    const okBtn = document.createElement("button");
    okBtn.textContent = "Ok";
    okBtn.classList.add("btn-success");
    okBtn.addEventListener("click", () => {
      overlay.style.display = "none";
      if (typeof options.onOk === "function") {
        options.onOk();
      }
    });
    buttonsContainer.appendChild(okBtn);
  } else {
    // Valor por defecto: botón "Ok" sin clases especiales
    const okBtn = document.createElement("button");
    okBtn.textContent = "Ok";
    okBtn.addEventListener("click", () => {
      overlay.style.display = "none";
    });
    buttonsContainer.appendChild(okBtn);
  }

  overlay.style.display = "flex";
}
