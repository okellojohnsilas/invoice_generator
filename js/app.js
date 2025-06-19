let yourlogoBase64 = "";

// Clear storage and bind events on load
window.addEventListener("DOMContentLoaded", () => {
    localStorage.clear();
    bindEvents();
});

function bindEvents() {
    document.getElementById("yourlogoInput").addEventListener("change", handleLogoUpload);
    document.getElementById("addItemBtn").addEventListener("click", addItem);
    document.getElementById("publishBtn").addEventListener("click", publish);
    document.getElementById("downloadBtn").addEventListener("click", downloadPDF);
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        yourlogoBase64 = e.target.result;
        document.getElementById("yourlogoPreview").src = yourlogoBase64;
    };
    reader.readAsDataURL(file);
}

function addItem() {
    const description = document.getElementById("itemDescription").value.trim();
    const qty = parseFloat(document.getElementById("itemQuantity").value);
    const price = parseFloat(document.getElementById("itemPrice").value);

    if (!description || isNaN(qty) || isNaN(price) || qty <= 0 || price < 0) {
        alert("Please enter valid item details.");
        return;
    }

    const subtotal = (qty * price).toFixed(2);

    const tbody = document.querySelector("#itemsTable tbody");
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${description}</td>
        <td>${qty}</td>
        <td>${price.toFixed(2)}</td>
        <td>${subtotal}</td>
        <td><button class="btn btn-danger btn-sm removeBtn"><i class="fas fa-trash"></i></button></td>
    `;

    tbody.appendChild(row);

    row.querySelector(".removeBtn").addEventListener("click", () => {
        row.remove();
        calculateTotal();
    });

    // Clear form inputs
    document.getElementById("itemDescription").value = "";
    document.getElementById("itemQuantity").value = "1";
    document.getElementById("itemPrice").value = "0";

    calculateTotal();
}

function calculateTotal() {
    let total = 0;
    document.querySelectorAll("#itemsTable tbody tr").forEach(row => {
        const qty = parseFloat(row.children[1].textContent) || 0;
        const price = parseFloat(row.children[2].textContent) || 0;
        const subtotal = qty * price;
        row.children[3].textContent = subtotal.toFixed(2);
        total += subtotal;
    });
    document.getElementById("totalAmount").textContent = total.toFixed(2);
}

function publish() {
    calculateTotal();

    const invoiceData = {
        companyName: document.getElementById("companyName").value,
        companyAddress: document.getElementById("companyAddress").value,
        companyPhone: document.getElementById("companyPhone")?.value,
        companyEmail: document.getElementById("companyEmail")?.value,
        clientName: document.getElementById("clientName").value,
        clientAddress: document.getElementById("clientAddress").value,
        clientPhone: document.getElementById("clientPhone")?.value,
        clientEmail: document.getElementById("clientEmail")?.value,
        yourlogo: yourlogoBase64,
        items: [],
        total: document.getElementById("totalAmount").textContent
    };

    document.querySelectorAll("#itemsTable tbody tr").forEach(row => {
        invoiceData.items.push({
            description: row.children[0].children[0].value,
            qty: row.children[1].children[0].value,
            price: row.children[2].children[0].value,
            subtotal: row.children[3].textContent
        });
    });

    localStorage.setItem("savedInvoice", JSON.stringify(invoiceData));
    renderCanvas(invoiceData);
}

function renderCanvas(data) {
    document.getElementById("formBox").style.display = "none";
    document.getElementById("canvasBox").style.display = "block";

    const canvas = document.getElementById("invoiceCanvas");
    canvas.innerHTML = "";

    const yourlogoImg = data.yourlogo
        ? `<div class="text-center"><img src="${data.yourlogo}" style="max-height:80px;"></div>`
        : "";

    const companyInfo = `
        <p><strong>Company:</strong> ${data.companyName}</p>
        <p><strong>Address:</strong> ${data.companyAddress}</p>
        ${data.companyPhone ? `<p><strong>Phone:</strong> ${data.companyPhone}</p>` : ""}
        ${data.companyEmail ? `<p><strong>Email:</strong> ${data.companyEmail}</p>` : ""}
    `;

    const clientInfo = `
        <p><strong>Client:</strong> ${data.clientName}</p>
        <p><strong>Address:</strong> ${data.clientAddress}</p>
        ${data.clientPhone ? `<p><strong>Phone:</strong> ${data.clientPhone}</p>` : ""}
        ${data.clientEmail ? `<p><strong>Email:</strong> ${data.clientEmail}</p>` : ""}
    `;

    const itemsTable = `
        <table class="table table-bordered mt-4">
            <thead class="bg-primary text-white">
                <tr>
                    <th>Description</th><th>Qty</th><th>Price</th><th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.qty}</td>
                        <td>${item.price}</td>
                        <td>${item.subtotal}</td>
                    </tr>
                `).join("")}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" class="text-center font-weight-bold h4">Total</td>
                    <td class="font-weight-bold text-primary h4" colspan="1">$${data.total}</td>
                </tr>
            </tfoot>
        </table>
    `;

    canvas.innerHTML = `
        ${yourlogoImg}
        <h2 class="text-center my-3">INVOICE</h2>
        ${companyInfo}
        <hr>
        ${clientInfo}
        ${itemsTable}
    `;
}

function downloadPDF() {
    html2pdf().from(document.getElementById("invoiceCanvas")).save("invoice.pdf");
}
