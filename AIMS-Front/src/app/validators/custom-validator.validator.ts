import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup, Validators, FormArray } from '@angular/forms';

/**
 * ========================================================================
 * Validator: TrimRequiredValidator
 *
 * Ensures a form control's value is NOT empty after trimming spaces.
 * This validator does NOT modify the control value — it only checks it.
 *
 * Useful when:
 * - You want to prevent users from submitting values like "   " (spaces only)
 * - You want to allow null/undefined initially but require trimmed input later
 *
 * Returns:
 * - { required: true } → if the trimmed string is empty
 * - null → if valid
 * ========================================================================
 */
export function TrimRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (typeof value === 'string') {
      // Only check — do not modify the control value here
      const trimmed = value.trim();
      return trimmed.length === 0 ? { required: true } : null;
    }

    return value ? null : { required: true };
  };
}

/**
 * ========================================================================
 * Custom Validator: TrimAndRemoveSpaces
 * ------------------------------------------------------------
 * This validator:
 *   1. Trims leading and trailing spaces
 *   2. Removes ALL spaces inside the string
 *   3. Updates the FormControl value without triggering events
 *   4. Ensures the resulting string is not empty
 *
 * Use Case:
 * - Fields where spaces are not allowed:
 *      • Asset Code
 *      • Username
 *      • Serial Number
 *      • Alphanumeric IDs
 *
 * Behavior:
 * - If value is a string:
 *      - Trim whitespace
 *      - Remove all inner spaces (replace spaces globally)
 *      - Update the control value (without emitting event)
 *      - If empty after cleaning → INVALID ({ required: true })
 * - If value is non-string:
 *      - Return valid only if value is truthy
 *
 * @returns ValidatorFn - Angular validator function
 * ========================================================================
 */
export function TrimAndRemoveSpaces(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value === 'string') {
      const newValue = value.trim().replace(/\s+/g, '');
      if (newValue !== value) {
        control.setValue(newValue, { emitEvent: false });
      }
      return newValue.length === 0 ? { required: true } : null;
    }
    return value ? null : { required: true };
  };
}

/**
 * ========================================================================
 * Custom Validator: atLeastOneCheckboxChecked
 * ------------------------------------------------------------
 * This validator ensures that a FormGroup containing multiple
 * checkbox controls has at least ONE checkbox selected (true).
 *
 * Typical Use Case:
 * - Checkbox groups like:
 *      - Permissions (read, write, edit, delete)
 *      - Notification options (email, SMS, WhatsApp)
 *      - Feature enable/disable checkboxes
 *
 * Behavior:
 *  - If the group has at least one control with value === true → VALID
 *  - If all checkboxes are unchecked (false) → INVALID
 *  - If the group or values are missing → skip validation
 *
 * @returns ValidatorFn - Angular validator function
 * ========================================================================
 */
export function atLeastOneCheckboxChecked(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    if (!(group instanceof Object) || !group.value) return null;
    const controls = group.value;
    const atLeastOne = Object.values(controls).some(value => value === true);
    return atLeastOne ? null : { atLeastOneRequired: true };
  };
}

/**
 * ========================================================================
 * Custom Validator: requiredIfNotNull
 * ------------------------------------------------------------
 * This validator is useful when a field is optional (nullable),
 * but if the user provides *any* value, it must NOT be empty.
 *
 * Behavior:
 *  - If value is null or undefined → VALID (no need to fill)
 *  - If value is a string:
 *        - Empty string ("") or spaces only -> INVALID
 *  - If value is an array:
 *        - Empty array [] -> INVALID
 *  - Any other non-null value → VALID
 *
 * Typical Use Case:
 *  - Optional fields that must contain valid input only if user enters something.
 *  - Examples: remarks, comments, tags, optional dropdown selections.
 *
 * @returns ValidatorFn - Angular validator function
 * ========================================================================
 */
export function requiredIfNotNull(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Allow null or undefined
    if (value === null || value === undefined) {
      return null;
    }

    // Reject empty string or whitespace-only
    if (typeof value === 'string' && value.trim() === '') {
      return { required: true };
    }

    // Reject empty arrays
    if (Array.isArray(value) && value.length === 0) {
      return { required: true };
    }

    return null; // Otherwise it's valid
  };
}

/**
 * ========================================================================
 * Custom Validator: Validates that "endDate" is greater than "startDate".
 *
 * This validator must be applied on the FormGroup level because it compares
 * values from two different FormControls.
 *
 * Rules:
 *  - If either date is missing → do not validate (return null).
 *  - Convert both values into Date objects.
 *  - If endDate is less than or equal to startDate → return validation error.
 *  - Otherwise → validation passes (return null).
 *
 * @param form - The FormGroup that contains startDate and endDate controls
 * @returns ValidationErrors | null
 * ========================================================================
 */
export function dateRangeValidator(form: AbstractControl): ValidationErrors | null {
  const start = form.get('startDate')?.value;
  const end = form.get('endDate')?.value;

  if (!start || !end) return null; // don't validate until both are filled

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (endDate <= startDate) {
    return { dateRangeInvalid: true };
  }

  return null;
}

/**
  * ============================================================================
 * Custom Cross-Field Validator: Bill / Challan / Items Dependency
 *
 * PURPOSE
 * --------
 * This is a **FormGroup-level validator (ValidatorFn)** that enforces
 * conditional validation rules between:
 *
 *   - hasChallan
 *   - hasAddItems
 *   - challanIds
 *   - supplier
 *   - companyName
 *   - billItems (FormArray)
 *
 * It validates the form **as a whole**, not individual controls.
 *
 * IMPORTANT
 * ---------
 * ❗ This function DOES NOT dynamically add/remove validators using
 *    setValidators().
 * ❗ Instead, it **manually sets validation errors** using setErrors()
 *    based on current form state.
 *
 * Angular will re-run this validator whenever:
 *  - hasChallan changes
 *  - hasAddItems changes
 *  - any dependent control value changes
 *
 * ============================================================================
 *
 * VALIDATION RULES
 * ----------------
 *
 * CASE 1️⃣ : hasChallan === 'yes'
 *
 *   ✔ challanIds is REQUIRED
 *
 *   ── Sub-case 1.1 ──
 *   hasAddItems === 'yes'
 *     ✔ supplier is REQUIRED
 *     ✔ companyName is REQUIRED
 *     ✔ at least one bill item must exist
 *
 *   ── Sub-case 1.2 ──
 *   hasAddItems === 'no'
 *     ✖ supplier is NOT required
 *     ✖ companyName is NOT required
 *     ✖ billItems are NOT required
 *
 *
 * CASE 2️⃣ : hasChallan === 'no'
 *
 *   ✔ supplier is REQUIRED
 *   ✔ companyName is REQUIRED
 *   ✔ at least one bill item must exist
 *   ✖ challanIds is NOT required
 *
 * ============================================================================
 *
 * UX BEHAVIOUR
 * ------------
 * - Required fields are **marked as touched** to ensure
 *   validation messages appear immediately.
 * - Only relevant fields receive validation errors.
 *
 * ============================================================================
 *
 * @param control - The FormGroup instance for the Bill form
 * @returns ValidationErrors | null
 * ============================================================================
 */
export function billChallanValidator(control: AbstractControl): ValidationErrors | null {

  const hasChallan = control.get('hasChallan')?.value;
  const hasAddItems = control.get('hasAddItems')?.value;

  const challanIds = control.get('challanIds');
  const supplier = control.get('supplier');
  const company = control.get('companyName');
  const billItems = control.get('billItems') as FormArray;

  // helper
  const touch = (c: AbstractControl | null) => {
    if (c) c.markAsTouched();
  };

  // reset errors
  challanIds?.setErrors(null);
  supplier?.setErrors(null);
  company?.setErrors(null);

  // ---------- CASE 1 ----------
  if (hasChallan === 'yes') {

    if (!challanIds?.value || challanIds.value.length === 0) {
      challanIds?.setErrors({ required: true });
      touch(challanIds);
    }

    if (hasAddItems === 'yes') {

      if (!supplier?.value) {
        supplier?.setErrors({ required: true });
        touch(supplier);
      }

      if (!company?.value) {
        company?.setErrors({ required: true });
        touch(company);
      }

      if (!billItems || billItems.length === 0) {
        return { itemsRequired: true };
      }
    }
  }

  // ---------- CASE 2 ----------
  if (hasChallan === 'no') {

    if (!supplier?.value) {
      supplier?.setErrors({ required: true });
      touch(supplier);
    }

    if (!company?.value) {
      company?.setErrors({ required: true });
      touch(company);
    }

    if (!billItems || billItems.length === 0) {
      return { itemsRequired: true };
    }
  }

  return null;
}


export function minArrayLengthValidator(min: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (Array.isArray(value) && value.length >= min) {
      return null;
    }
    return { minArrayLength: true };
  };
}

export function nonZeroPositiveIntegerValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === null || value === undefined || value === '') {
    return null; // let required handle empty case
  }
  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return { nonZeroPositiveInteger: true };
  }
  return null;
}



export function integerRangeValidator(min: number, getMax: () => number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Let required validator handle empty
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numericValue = Number(value);
    const max = getMax();

    // Reject non-numeric & decimal values
    if (isNaN(numericValue) || !Number.isInteger(numericValue)) {
      return { notInteger: true };
    }

    console.log('number value min', numericValue, min, max)

    // Range validation
    if (numericValue < min || numericValue > max) {
      return { range: true };
    }

    return null;
  };
}