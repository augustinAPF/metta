# Copyright (c) 2026, Azim Premji Foundation
# License: license.txt

import frappe
from frappe.model.document import Document


class PatientRegister(Document):

    def after_insert(self):
        # Run only for NEW registration
        if self.registration_type != "New":
            return

        # Prevent duplicate Patient Details using UID or Phone
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

        if existing_patient:
            return  # Patient already exists

        # Create Patient Details
        patient = frappe.new_doc("Patient Details")

        patient.first_name = self.first_name
        patient.middle_name = self.middle_name
        patient.last_name = self.last_name
        patient.patient_name = self.patient_name
        patient.blood_group = self.blood_group
        patient.dob = self.dob
        patient.sex = self.sex
        patient.marital_status = self.marital_status
        patient.uid = self.uid
        patient.phone = self.phone
        patient.email = self.email
        patient.address = self.address
        patient.occupation = self.occupation

        # Medical history
        patient.allergies = self.allergies
        patient.medication = self.medication
        patient.medical_history = self.medical_history
        patient.surgical_history = self.surgical_history

        # Risk factors
        patient.tobacco_past_use = self.tobacco_past_use
        patient.tobacco_current_use = self.tobacco_current_use
        patient.alcohol_past_use = self.alcohol_past_use
        patient.alcohol_current_use = self.alcohol_current_use
        patient.surrounding_factors = self.surrounding_factors
        patient.other_risk_factors = self.other_risk_factors

        # Billing
        patient.default_currency = self.default_currency

        patient.insert(ignore_permissions=True)

        # Optional: link back to UHIN
        self.db_set("uhin_id", patient.name)
