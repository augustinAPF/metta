/* ======================================================
   PATIENT BILLING – MAIN
   ====================================================== */

frappe.ui.form.on("Patient Billing", {
    refresh(frm) {
        calculate_totals(frm);

        if (!frm.is_new()) {
            frm.add_custom_button(
                __("Receipt Preview"),
                () => show_patient_billing_receipt(frm),
                __("Actions")
            );
        }
    },

    medicine_items_add(frm) {
        calculate_totals(frm);
    },

    medicine_items_remove(frm) {
        calculate_totals(frm);
    }
});

/* ======================================================
   MEDICINE CHILD TABLE
   ====================================================== */

frappe.ui.form.on("Patient Billing Medicine", {
    item(frm, cdt, cdn) {
        // Wait for fetch_from (rate) to complete
        setTimeout(() => {
            calculate_row_amount(cdt, cdn);
            calculate_totals(frm);
        }, 200);
    },

    quantity(frm, cdt, cdn) {
        calculate_row_amount(cdt, cdn);
        calculate_totals(frm);
    },

    rate(frm, cdt, cdn) {
        calculate_row_amount(cdt, cdn);
        calculate_totals(frm);
    }
});

/* ======================================================
   HELPERS – CALCULATIONS
   ====================================================== */

function calculate_row_amount(cdt, cdn) {
    const row = locals[cdt][cdn];

    const qty = flt(row.quantity);
    const rate = flt(row.rate);

    const amount = qty * rate;

    frappe.model.set_value(cdt, cdn, "amount", amount);
}

function calculate_totals(frm) {
    let total_medicine = 0;

    (frm.doc.medicine_items || []).forEach(row => {
        total_medicine += flt(row.amount);
    });

    frm.set_value("total_medicine_amount", total_medicine);
    frm.set_value("total_service_amount", 0);
    frm.set_value("grand_total", total_medicine);
    frm.set_value("net_amount", total_medicine);
}

/* ======================================================
   BILL DATA HELPER
   ====================================================== */

function get_bill_data(frm) {
    return {
        total_medicine: flt(frm.doc.total_medicine_amount),
        net_amount: flt(frm.doc.net_amount),
        currency: frm.doc.currency || "INR"
    };
}

/* ======================================================
   RECEIPT PREVIEW
   ====================================================== */

function show_patient_billing_receipt(frm) {
    const bill = get_bill_data(frm);
    let rows_html = "";

    (frm.doc.medicine_items || []).forEach(row => {
        rows_html += `
            <tr>
                <td>${row.item_name || row.item}</td>
                <td class="right">${row.quantity}</td>
                <td class="right">${bill.currency} ${flt(row.rate).toFixed(2)}</td>
                <td class="right">${bill.currency} ${flt(row.amount).toFixed(2)}</td>
            </tr>
        `;
    });

    const html = `
        <div id="patient-billing-preview">
            <h3 style="text-align:center;">Patient Billing Receipt</h3>
            <hr>

            <p>
                <b>Receipt No:</b> ${frm.doc.name}<br>
                <b>Date:</b> ${frm.doc.billing_date}<br>
                <b>Payment Mode:</b> ${frm.doc.payment_mode || "—"}
            </p>

            <hr>

            <p>
                <b>Patient:</b> ${frm.doc.patient_name}<br>
                <b>UHIN:</b> ${frm.doc.patient}
            </p>

            <hr>

            <table style="width:100%;border-collapse:collapse;" border="1">
                <tr>
                    <th>Item</th>
                    <th class="right">Qty</th>
                    <th class="right">Rate</th>
                    <th class="right">Amount</th>
                </tr>
                ${rows_html}
                <tr>
                    <th colspan="3" class="right">Total</th>
                    <th class="right">${bill.currency} ${bill.total_medicine.toFixed(2)}</th>
                </tr>
            </table>

            <h4 class="right" style="margin-top:10px;">
                Net Amount: ${bill.currency} ${bill.net_amount.toFixed(2)}
            </h4>

            <div style="text-align:center;margin-top:20px;">
                <button class="btn btn-primary" id="print-bill-btn">
                    Print Receipt
                </button>
            </div>
        </div>
    `;

    frappe.msgprint({
        title: __("Billing Receipt Preview"),
        message: html,
        wide: true
    });

    setTimeout(() => {
        const btn = document.getElementById("print-bill-btn");
        if (btn) {
            btn.onclick = () => print_patient_billing_receipt(frm);
        }
    }, 300);
}

/* ======================================================
   PRINT RECEIPT
   ====================================================== */

function print_patient_billing_receipt(frm) {
    const bill = get_bill_data(frm);
    let rows_html = "";

    (frm.doc.medicine_items || []).forEach(row => {
        rows_html += `
            <tr>
                <td>${row.item_name || row.item}</td>
                <td class="right">${row.quantity}</td>
                <td class="right">${bill.currency} ${flt(row.rate).toFixed(2)}</td>
                <td class="right">${bill.currency} ${flt(row.amount).toFixed(2)}</td>
            </tr>
        `;
    });

    const win = window.open("", "", "width=420,height=650");

    win.document.write(`
        <html>
        <head>
            <title>Patient Billing Receipt</title>
            <style>
                body { font-family: Arial; font-size: 12px; padding: 10px; }
                h2 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #000; padding: 4px; }
                th { background: #f0f0f0; }
                .right { text-align: right; }
                hr { border-top: 1px dashed #000; }
            </style>
        </head>

        <body>
            <h2>Patient Billing Receipt</h2>

            <p>
                <b>Receipt No:</b> ${frm.doc.name}<br>
                <b>Date:</b> ${frm.doc.billing_date}<br>
                <b>Payment Mode:</b> ${frm.doc.payment_mode || "—"}
            </p>

            <hr>

            <p>
                <b>Patient:</b> ${frm.doc.patient_name}<br>
                <b>UHIN:</b> ${frm.doc.patient}
            </p>

            <hr>

            <table>
                <tr>
                    <th>Item</th>
                    <th class="right">Qty</th>
                    <th class="right">Rate</th>
                    <th class="right">Amount</th>
                </tr>
                ${rows_html}
                <tr>
                    <th colspan="3" class="right">Total</th>
                    <th class="right">${bill.currency} ${bill.total_medicine.toFixed(2)}</th>
                </tr>
            </table>

            <h3 class="right" style="margin-top:10px;">
                Net Amount: ${bill.currency} ${bill.net_amount.toFixed(2)}
            </h3>

            <p style="text-align:center;margin-top:15px;">Thank You</p>
        </body>
        </html>
    `);

    win.document.close();
    win.onload = () => {
        win.focus();
        win.print();
    };
}
