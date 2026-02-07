# Copyright (c) 2026, Azim Premji Foundation
# License: license.txt

import frappe
from frappe.model.document import Document


class PatientRegister(Document):

    def after_insert(self):
        try:
            # --------------------------------------------------
            # 1. Ensure this code is running (debug safety)
            # --------------------------------------------------
            frappe.logger().info(f"Patient Register after_insert triggered: {self.name}")

            # --------------------------------------------------
            # 2. Skip if already linked
            # --------------------------------------------------
            if self.uhin_id:
                return

            # --------------------------------------------------
            # 3. Check Registration Type
            # Allow only: New, Emergency New
            # --------------------------------------------------
            if not self.registration_type:
                return

            registration_type_name = frappe.db.get_value(
                "Registration Type Master",
                self.registration_type,
                "name"
            )

            allowed_types = ("New", "Emergency New")

            if registration_type_name not in allowed_types:
                return

            # --------------------------------------------------
            # 4. Prevent duplicate Patient Details
            # --------------------------------------------------
            existing_patient = None

            if self.uid:
                existing_patient = frappe.db.exists(
                    "Patient Details",
                    {"uid": self.uid}
                )

            if not existing_patient and self.phone:
                existing_patient = frappe.db.exists(
                    "Patient Details",
                    {"phone": self.phone}
                )

            # If patient already exists → link and exit
            if existing_patient:
                frappe.db.set_value(
                    "Patient Register",
                    self.name,
                    "uhin_id",
                    existing_patient
                )
                return

            # --------------------------------------------------
            # 5. Create Patient Details
            # --------------------------------------------------
            patient = frappe.new_doc("Patient Details")

            # ---- Basic Info ----
            patient.first_name = self.first_name
            patient.middle_name = self.middle_name
            patient.last_name = self.last_name

            # Compute Full Name safely
            patient.patient_name = " ".join(
                filter(None, [self.first_name, self.middle_name, self.last_name])
            )

            patient.blood_group = self.blood_group
            patient.dob = self.dob
            patient.sex = self.sex
            patient.marital_status = self.marital_status
            patient.uid = self.uid
            patient.phone = self.phone
            patient.email = self.email
            patient.address = self.address
            patient.occupation = self.occupation

            # ---- Medical History ----
            patient.allergies = self.allergies
            patient.medication = self.medication
            patient.medical_history = self.medical_history
            patient.surgical_history = self.surgical_history

            # ---- Risk Factors ----
            patient.tobacco_past_use = self.tobacco_past_use
            patient.tobacco_current_use = self.tobacco_current_use
            patient.alcohol_past_use = self.alcohol_past_use
            patient.alcohol_current_use = self.alcohol_current_use
            patient.surrounding_factors = self.surrounding_factors
            patient.other_risk_factors = self.other_risk_factors

            # ---- Billing ----
            patient.billing_category = self.billing_category
            patient.discount_percent = self.discount_percent
            patient.default_currency = self.default_currency or "INR"

            # --------------------------------------------------
            # 6. Insert Patient Details
            # --------------------------------------------------
            patient.insert(ignore_permissions=True)

            # --------------------------------------------------
            # 7. Link UHIN back to Patient Register
            # --------------------------------------------------
            frappe.db.set_value(
                "Patient Register",
                self.name,
                "uhin_id",
                patient.name
            )

        except Exception:
            # --------------------------------------------------
            # 8. Log any failure (NO silent errors)
            # --------------------------------------------------
            frappe.log_error(
                frappe.get_traceback(),
                "Patient Details auto-creation failed from Patient Register"
            )
