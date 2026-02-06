// frappe.ui.form.on("Patient Register", {
//     refresh(frm) {
//         if (!frm.is_new()) {
//             frm.add_custom_button(
//                 __("Receipt Preview"),
//                 () => show_receipt_preview(frm),
//                 __("Actions")
//             );
//         }

//         if (frm.timeline) {
//             frm.timeline.wrapper.hide();
//         }
//     },
//     dob:function(frm){    
//     const dob = frappe.datetime.str_to_obj(frm.doc.dob);
//     const today = frappe.datetime.now_date();
//     const today_date = frappe.datetime.str_to_obj(today);

//     let age = today_date.getFullYear() - dob.getFullYear();
//     const month_diff = today_date.getMonth() - dob.getMonth();
//     const day_diff = today_date.getDate() - dob.getDate();

//     if (month_diff < 0 || (month_diff === 0 && day_diff < 0)) {
//         age--;
//     }
//         frm.set_value("age", age);

// }

// });

// /* ======================================================
//    1. HELPERS
//    ====================================================== */

// // Compute full patient name
// function get_computed_patient_name(frm) {
//     let first = frm.doc.first_name || "";
//     let middle = frm.doc.middle_name || "";
//     let last = frm.doc.last_name || "";

//     return [first, middle, last]
//         .map(v => v.trim())
//         .filter(Boolean)
//         .join(" ");
// }

// // Get doctor name (from DocType JSON)
// function get_doctor_name(frm) {
//     return frm.doc.doctor_name || "—";
// }

// /* ======================================================
//    2. RECEIPT PREVIEW
//    ====================================================== */
// function show_receipt_preview(frm) {
//     let fee = parseFloat(frm.doc.fee_amount) || 0;
//     let currency = frm.doc.default_currency || "INR";

//     const patient_name = get_computed_patient_name(frm);
//     const phone = frm.doc.phone || "—";
//     const doctor = get_doctor_name(frm);

//     const html = `
//         <div id="registration-receipt-preview">
//             <h3 style="text-align:center;">Patient Registration Receipt</h3>
//             <hr>

//             <p>
//                 <b>Receipt No:</b> ${frm.doc.name}<br>
//                 <b>Date:</b> ${frm.doc.date || ""} ${frm.doc.time || ""}
//             </p>

//             <hr>

//             <h4>Patient Details</h4>
//             <p>
//                 <b>Name:</b> ${patient_name}<br>
//                 <b>Phone:</b> ${phone}<br>
//                 <b>Doctor:</b> ${doctor}<br>
//                 <b>Department:</b> ${frm.doc.department_name || "—"}<br>
//                 <b>UHIN:</b> ${frm.doc.uhin_id || "—"}
//             </p>

//             <hr>

//             <h4>Charges</h4>
//             <table style="width:100%;border-collapse:collapse;" border="1">
//                 <tr>
//                     <th>Description</th>
//                     <th style="text-align:right;">Amount</th>
//                 </tr>
//                 <tr>
//                     <td>Registration Fee (${frm.doc.registration_type || ""})</td>
//                     <td style="text-align:right;">
//                         ${currency} ${fee.toFixed(2)}
//                     </td>
//                 </tr>
//                 <tr>
//                     <th>Total</th>
//                     <th style="text-align:right;">
//                         ${currency} ${fee.toFixed(2)}
//                     </th>
//                 </tr>
//             </table>

//             <div style="text-align:center;margin-top:20px;">
//                 <button class="btn btn-primary" id="print-receipt-btn">
//                     Print Receipt
//                 </button>
//             </div>
//         </div>
//     `;

//     frappe.msgprint({
//         title: __("Receipt Preview"),
//         message: html,
//         wide: true
//     });

//     // Attach print handler
//     setTimeout(() => {
//         const btn = document.getElementById("print-receipt-btn");
//         if (btn) {
//             btn.addEventListener("click", () => {
//                 print_registration_receipt(frm);
//             });
//         }
//     }, 300);
// }

// /* ======================================================
//    3. PRINT RECEIPT (Browser Print / PDF)
//    ====================================================== */
// function print_registration_receipt(frm) {
//     let fee = parseFloat(frm.doc.fee_amount) || 0;
//     let currency = frm.doc.default_currency || "INR";

//     const patient_name = get_computed_patient_name(frm);
//     const phone = frm.doc.phone || "—";
//     const doctor = get_doctor_name(frm);

//     let printWindow = window.open("", "", "width=420,height=650");

//     printWindow.document.write(`
//         <html>
//         <head>
//             <title>Patient Registration Receipt</title>
//             <style>
//                 body {
//                     font-family: Arial, sans-serif;
//                     padding: 10px;
//                     font-size: 12px;
//                 }
//                 h2 {
//                     text-align: center;
//                     margin-bottom: 5px;
//                 }
//                 hr {
//                     border: none;
//                     border-top: 1px dashed #000;
//                 }
//                 table {
//                     width: 100%;
//                     border-collapse: collapse;
//                     margin-top: 10px;
//                 }
//                 th, td {
//                     border: 1px solid #000;
//                     padding: 4px;
//                 }
//                 th {
//                     background: #f0f0f0;
//                 }
//                 .right {
//                     text-align: right;
//                 }
//                 .center {
//                     text-align: center;
//                 }
//             </style>
//         </head>

//         <body>
//             <h2>Patient Registration Receipt</h2>

//             <p>
//                 <b>Receipt No:</b> ${frm.doc.name}<br>
//                 <b>Date:</b> ${frm.doc.date || ""} ${frm.doc.time || ""}
//             </p>

//             <hr>

//             <p>
//                 <b>Name:</b> ${patient_name}<br>
//                 <b>Phone:</b> ${phone}<br>
//                 <b>Doctor:</b> ${doctor}<br>
//                 <b>Department:</b> ${frm.doc.department_name || "—"}<br>
//                 <b>UHIN:</b> ${frm.doc.uhin_id || "—"}
//             </p>

//             <hr>

//             <table>
//                 <tr>
//                     <th>Description</th>
//                     <th class="right">Amount</th>
//                 </tr>
//                 <tr>
//                     <td>Registration Fee</td>
//                     <td class="right">
//                         ${currency} ${fee.toFixed(2)}
//                     </td>
//                 </tr>
//                 <tr>
//                     <th>Total</th>
//                     <th class="right">
//                         ${currency} ${fee.toFixed(2)}
//                     </th>
//                 </tr>
//             </table>

//             <p class="center" style="margin-top:15px;">
//                 Thank You
//             </p>
//         </body>
//         </html>
//     `);

//     printWindow.document.close();

//     printWindow.onload = function () {
//         printWindow.focus();
//         printWindow.print();
//     };
// }


frappe.ui.form.on("Patient Register", {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button(
                __("Receipt Preview"),
                () => show_receipt_preview(frm),
                
            );
        }

        if (frm.timeline) {
            frm.timeline.wrapper.hide();
        }
    },

    dob(frm) {
        if (!frm.doc.dob) return;

        const dob = frappe.datetime.str_to_obj(frm.doc.dob);
        const today = frappe.datetime.str_to_obj(frappe.datetime.now_date());

        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        frm.set_value("age", age);
    },

    discount_percent(frm) {
        frm.refresh();
    },

    adjustment_type(frm) {
        frm.refresh();
    }
});

/* ======================================================
   1. HELPERS
   ====================================================== */

function get_computed_patient_name(frm) {
    return [frm.doc.first_name, frm.doc.middle_name, frm.doc.last_name]
        .map(v => (v || "").trim())
        .filter(Boolean)
        .join(" ");
}

function get_doctor_name(frm) {
    return frm.doc.doctor_name || "—";
}

/* ======================================================
   2. BILLING CALCULATION
   ====================================================== */

function calculate_billing(frm) {
    const base_fee = flt(frm.doc.fee_amount);
    const percent = flt(frm.doc.discount_percent);
    const type = frm.doc.adjustment_type;

    let adjustment_amount = 0;
    let net_total = base_fee;

    if (percent > 0) {
        adjustment_amount = (base_fee * percent) / 100;

        if (type === "Discount") {
            net_total = base_fee - adjustment_amount;
        }

        if (type === "Increase") {
            net_total = base_fee + adjustment_amount;
        }
    }

    return {
        base_fee,
        percent,
        type,
        adjustment_amount,
        net_total
    };
}

/* ======================================================
   3. RECEIPT PREVIEW
   ====================================================== */

function show_receipt_preview(frm) {
    const bill = calculate_billing(frm);

    const currency = frm.doc.default_currency || "INR";
    const patient_name = get_computed_patient_name(frm);
    const phone = frm.doc.phone || "—";
    const doctor = get_doctor_name(frm);

    const html = `
        <div id="registration-receipt-preview">
            <h3 style="text-align:center;">Patient Registration Receipt</h3>
            <hr>

            <p>
                <b>Receipt No:</b> ${frm.doc.name}<br>
                <b>Date:</b> ${frm.doc.date || ""} ${frm.doc.time || ""}
            </p>

            <hr>

            <h4>Patient Details</h4>
            <p>
                <b>Name:</b> ${patient_name}<br>
                <b>Phone:</b> ${phone}<br>
                <b>Doctor:</b> ${doctor}<br>
                <b>Department:</b> ${frm.doc.department_name || "—"}<br>
                <b>UHIN:</b> ${frm.doc.uhin_id || "—"}
            </p>

            <hr>

            <h4>Charges</h4>
            <table style="width:100%;border-collapse:collapse;" border="1">
                <tr>
                    <th>Description</th>
                    <th style="text-align:right;">Amount</th>
                </tr>

                <tr>
                    <td>Registration Fee (${frm.doc.registration_type || ""})</td>
                    <td style="text-align:right;">
                        ${currency} ${bill.base_fee.toFixed(2)}
                    </td>
                </tr>

                ${
                    bill.percent > 0
                    ? `
                    <tr>
                        <td>${bill.type} (${bill.percent}%)</td>
                        <td style="text-align:right;">
                            ${bill.type === "Discount" ? "-" : "+"}
                            ${currency} ${bill.adjustment_amount.toFixed(2)}
                        </td>
                    </tr>
                    `
                    : ""
                }

                <tr>
                    <th>Total</th>
                    <th style="text-align:right;">
                        ${currency} ${bill.net_total.toFixed(2)}
                    </th>
                </tr>
            </table>

            <div style="text-align:center;margin-top:20px;">
                <button class="btn btn-primary" id="print-receipt-btn">
                    Print Receipt
                </button>
            </div>
        </div>
    `;

    frappe.msgprint({
        title: __("Receipt Preview"),
        message: html,
        wide: true
    });

    setTimeout(() => {
        const btn = document.getElementById("print-receipt-btn");
        if (btn) {
            btn.onclick = () => print_registration_receipt(frm);
        }
    }, 300);
}

/* ======================================================
   4. PRINT RECEIPT
   ====================================================== */

function print_registration_receipt(frm) {
    const bill = calculate_billing(frm);

    const currency = frm.doc.default_currency || "INR";
    const patient_name = get_computed_patient_name(frm);
    const phone = frm.doc.phone || "—";
    const doctor = get_doctor_name(frm);

    const win = window.open("", "", "width=420,height=650");

    win.document.write(`
        <html>
        <head>
            <title>Patient Registration Receipt</title>
            <style>
                body { font-family: Arial; font-size: 12px; padding: 10px; }
                h2 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #000; padding: 4px; }
                th { background: #f0f0f0; }
                .right { text-align: right; }
                .center { text-align: center; }
                hr { border-top: 1px dashed #000; }
            </style>
        </head>

        <body>
            <h2>Patient Registration Receipt</h2>

            <p>
                <b>Receipt No:</b> ${frm.doc.name}<br>
                <b>Date:</b> ${frm.doc.date || ""} ${frm.doc.time || ""}
            </p>

            <hr>

            <p>
                <b>Name:</b> ${patient_name}<br>
                <b>Phone:</b> ${phone}<br>
                <b>Doctor:</b> ${doctor}<br>
                <b>Department:</b> ${frm.doc.department_name || "—"}<br>
                <b>UHIN:</b> ${frm.doc.uhin_id || "—"}
            </p>

            <hr>

            <table>
                <tr>
                    <th>Description</th>
                    <th class="right">Amount</th>
                </tr>

                <tr>
                    <td>Registration Fee</td>
                    <td class="right">${currency} ${bill.base_fee.toFixed(2)}</td>
                </tr>

                ${
                    bill.percent > 0
                    ? `
                    <tr>
                        <td>${bill.type} (${bill.percent}%)</td>
                        <td class="right">
                            ${bill.type === "Discount" ? "-" : "+"}
                            ${currency} ${bill.adjustment_amount.toFixed(2)}
                        </td>
                    </tr>
                    `
                    : ""
                }

                <tr>
                    <th>Total</th>
                    <th class="right">${currency} ${bill.net_total.toFixed(2)}</th>
                </tr>
            </table>

            <p class="center" style="margin-top:15px;">Thank You</p>
        </body>
        </html>
    `);

    win.document.close();
    win.onload = () => {
        win.focus();
        win.print();
    };
}
